import { Injectable, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import {
  pickOrderForPostsQuery,
  pickOrderForUsersQuery,
  QueryParser,
} from '../application-helpers/query.parser';
import {
  PostDbJoinedType,
  PostPaginatorType,
  PostViewModelType,
} from './types/posts.types';
import { InjectModel } from '@nestjs/mongoose';
import { LikeStatus } from '../likes/types/likes.types';
import {
  LikeForPostDocument,
  LikeForPost,
} from '../likes/entity/likes-for-post.schema';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BlogDb } from '../blogs/types/blogs.types';

@Injectable()
export class PostsQuery {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectModel(LikeForPost.name)
    private likeForPostModel: Model<LikeForPostDocument>,
  ) {}
  async viewAllPosts(
    q: QueryParser,
    activeUserId: string,
  ): Promise<PostPaginatorType> {
    const allPostsCountResult = await this.dataSource.query(
      `
      SELECT COUNT(*)
      FROM "POSTS" AS p
      JOIN "USERS_GLOBAL_BAN" AS ub
      ON p."ownerId" = ub."userId"
      JOIN "BLOGS" as b
      ON p."blogId" = b."id"
      WHERE ub."isBanned" = false AND b."isBanned" = false
      `,
    );
    const allPostsCount: number = parseInt(allPostsCountResult[0].count, 10);
    const offsetSize = (q.pageNumber - 1) * q.pageSize;
    const reqPageDbPosts: PostDbJoinedType[] = await this.dataSource.query(
      `
        SELECT p."id", p."title", p."shortDescription", 
        p."content", p."blogId", b."name" as "blogName", p."createdAt", 
        p."ownerId", ub."isBanned" as "ownerIsBanned", p."likesCount", 
        p."dislikesCount", b."isBanned" as "parentBlogIsBanned"
        FROM "POSTS" as p
        JOIN "BLOGS" as b
        ON p."blogId" = b."id"
        JOIN "USERS_GLOBAL_BAN" as ub
        ON p."ownerId" = ub."userId"
        WHERE ub."isBanned" = false AND b."isBanned" = false
        ${pickOrderForPostsQuery(q.sortBy, q.sortDirection)}
        LIMIT $1 OFFSET $2
      `,
      [q.pageSize, offsetSize],
    );
    const items = [];
    for await (const p of reqPageDbPosts) {
      const post = await this._mapPostToViewType(p, activeUserId);
      items.push(post);
    }
    return {
      pagesCount: Math.ceil(allPostsCount / q.pageSize),
      page: q.pageNumber,
      pageSize: q.pageSize,
      totalCount: allPostsCount,
      items: items,
    };
  }
  async findPostById(
    postId: string,
    activeUserId: string,
  ): Promise<PostViewModelType | null> {
    const foundPostResult: PostDbJoinedType[] = await this.dataSource.query(
      `
        SELECT p."id", p."title", p."shortDescription", 
        p."content", p."blogId", b."name" as "blogName", p."createdAt", 
        p."ownerId", ub."isBanned" as "ownerIsBanned", p."likesCount", 
        p."dislikesCount", b."isBanned" as "parentBlogIsBanned"
        FROM "POSTS" as p
        JOIN "BLOGS" as b
        ON p."blogId" = b."id"
        JOIN "USERS_GLOBAL_BAN" as ub
        ON p."ownerId" = ub."userId"
        WHERE p."id" = $1 AND (ub."isBanned" = false AND b."isBanned" = false)
        `,
      [postId],
    );
    if (foundPostResult.length === 1)
      return this._mapPostToViewType(foundPostResult[0], activeUserId);
    else throw new NotFoundException();
  }
  async findPostsByBlogId(
    blogId: string,
    q: QueryParser,
    activeUserId: string,
  ): Promise<PostPaginatorType | null> {
    const foundBlogResult: BlogDb[] = await this.dataSource.query(
      `
        SELECT * FROM "BLOGS"
        WHERE "id" = $1
        `,
      [blogId],
    );
    if (foundBlogResult.length === 1) {
      const foundPostsCountResult = await this.dataSource.query(
        `
        SELECT COUNT(*)
        FROM "POSTS" AS p
        JOIN "BLOGS" as b
        ON p."blogId" = b."id"
        JOIN "USERS_GLOBAL_BAN" as ub
        ON p."ownerId" = ub."userId"
        WHERE "blogId" = $1 AND (ub."isBanned" = false AND b."isBanned" = false)
        `,
        [blogId],
      );
      const foundPostsCount: number = parseInt(
        foundPostsCountResult[0].count,
        10,
      );
      const offsetSize = (q.pageNumber - 1) * q.pageSize;
      const reqPageDbPosts: PostDbJoinedType[] = await this.dataSource.query(
        `
        SELECT p."id", p."title", p."shortDescription", 
        p."content", p."blogId", b."name" as "blogName", p."createdAt", 
        p."ownerId", ub."isBanned" as "ownerIsBanned", p."likesCount", 
        p."dislikesCount", b."isBanned" as "parentBlogIsBanned"
        FROM "POSTS" as p
        JOIN "BLOGS" as b
        ON p."blogId" = b."id"
        JOIN "USERS_GLOBAL_BAN" as ub
        ON p."ownerId" = ub."userId"
        WHERE WHERE "blogId" = $1 AND (ub."isBanned" = false AND b."isBanned" = false)
        ${pickOrderForUsersQuery(q.sortBy, q.sortDirection)}
        LIMIT $1 OFFSET $2
        `,
        [q.pageSize, offsetSize],
      );
      if (reqPageDbPosts.length === 0) return null;
      else {
        const items = [];
        for await (const p of reqPageDbPosts) {
          const post = await this._mapPostToViewType(p, activeUserId);
          items.push(post);
        }
        return {
          pagesCount: Math.ceil(foundPostsCount / q.pageSize),
          page: q.pageNumber,
          pageSize: q.pageSize,
          totalCount: foundPostsCount,
          items: items,
        };
      }
    } else throw new NotFoundException();
  }
  async getUserLikeForPost(userId: string, postId: string) {
    return this.likeForPostModel.findOne({
      postId: postId,
      userId: userId,
      isBanned: false,
    });
  }
  private async _getNewestLikes(
    postId: string,
  ): Promise<Array<LikeForPostDocument>> {
    return this.likeForPostModel
      .find({
        postId: postId,
        likeStatus: LikeStatus.like,
        isBanned: false,
      })
      .sort({ addedAt: -1 })
      .limit(3)
      .lean();
  }
  async _mapPostToViewType(
    post: PostDbJoinedType,
    userId: string,
  ): Promise<PostViewModelType> {
    const userLike = await this.getUserLikeForPost(userId, post.id);
    const newestLikes = await this._getNewestLikes(post.id);
    const mappedLikes = newestLikes.map((e) => {
      return {
        addedAt: new Date(e.addedAt).toISOString(),
        userId: e.userId,
        login: e.userLogin,
      };
    });
    return {
      id: post.id,
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: new Date(post.createdAt).toISOString(),
      extendedLikesInfo: {
        likesCount: post.likesCount,
        dislikesCount: post.dislikesCount,
        myStatus: userLike?.likeStatus || LikeStatus.none,
        newestLikes: mappedLikes,
      },
    };
  }
}
