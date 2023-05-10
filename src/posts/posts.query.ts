import { Injectable, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import {
  pickOrderForQuery,
  QueryParser,
} from '../application-helpers/query.parser';
import {
  PostDbWithBlogNameType,
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
      FROM "POSTS"
      WHERE "ownerIsBanned" = false
      `,
    );
    const allPostsCount: number = parseInt(allPostsCountResult[0].count, 10);
    const offsetSize = (q.pageNumber - 1) * q.pageSize;
    const reqPageDbPosts: PostDbWithBlogNameType[] =
      await this.dataSource.query(
        `
        SELECT p."id", p."title", p."shortDescription", 
        p."content", p."blogId", b."blogName", p."createdAt", 
        p."ownerId", p."ownerIsBanned", p."likesCount", 
        p."dislikesCount", p."parentBlogIsBanned",
        FROM "POSTS" as p
        JOIN "BLOGS" as b
        ON p."blogId" = b."id"
        WHERE p."ownerIsBanned" = false AND p."parentBlogIsBanned" = false
        ${pickOrderForQuery(q.sortBy, q.sortDirection)}
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
    const foundPostResult: PostDbWithBlogNameType[] =
      await this.dataSource.query(
        `
        SELECT p."id", p."title", p."shortDescription", 
        p."content", p."blogId", b."blogName", p."createdAt", 
        p."ownerId", p."ownerIsBanned", p."likesCount", 
        p."dislikesCount", p."parentBlogIsBanned",
        FROM "POSTS" as p
        JOIN "BLOGS" as b
        ON p."blogId" = b."id"
        WHERE p."id" = $1
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
        FROM "POSTS"
        WHERE "blogId" = $1 AND ("ownerIsBanned" = false AND "parentBlogIsBanned" = false)
        `,
        [blogId],
      );
      const foundPostsCount: number = parseInt(
        foundPostsCountResult[0].count,
        10,
      );
      const offsetSize = (q.pageNumber - 1) * q.pageSize;
      const reqPageDbPosts: PostDbWithBlogNameType[] =
        await this.dataSource.query(
          `
        SELECT p."id", p."title", p."shortDescription", 
        p."content", p."blogId", b."blogName", p."createdAt", 
        p."ownerId", p."ownerIsBanned", p."likesCount", 
        p."dislikesCount", p."parentBlogIsBanned",
        FROM "POSTS" as p
        JOIN "BLOGS" as b
        ON p."blogId" = b."id"
        WHERE WHERE "blogId" = $1 AND (p."ownerIsBanned" = false AND p."parentBlogIsBanned" = false)
        ${pickOrderForQuery(q.sortBy, q.sortDirection)}
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
    post: PostDbWithBlogNameType,
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
