import { Injectable, NotFoundException } from '@nestjs/common';
import mongoose, { Model } from 'mongoose';
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
    const allPostsCount: number = parseInt(allPostsCountResult[0], 10);
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
        WHERE p."ownerIsBanned" = false
        ${pickOrderForQuery(q.sortBy, q.sortDirection)}
        LIMIT $1 OFFSET $4
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
    if (
      await this.blogModel
        .findOne({
          _id: new mongoose.Types.ObjectId(blogId),
        })
        .lean()
    ) {
      const foundPostsCount = await this.postModel.countDocuments({
        blogId: { $eq: blogId },
        'postOwnerInfo.isBanned': false,
        parentBlogIsBanned: false,
      });
      const reqPageDbPosts = await this.postModel
        .find({
          blogId: { $eq: blogId },
          'postOwnerInfo.isBanned': false,
          parentBlogIsBanned: false,
        })
        .sort({ [q.sortBy]: q.sortDirection })
        .skip((q.pageNumber - 1) * q.pageSize)
        .limit(q.pageSize)
        .lean();
      if (!reqPageDbPosts) return null;
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
