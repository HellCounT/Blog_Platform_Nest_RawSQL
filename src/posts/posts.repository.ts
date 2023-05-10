import {
  PostDb,
  PostDbWithBlogNameType,
  PostViewModelType,
} from './types/posts.types';
import mongoose, { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from './entity/posts.schema';
import { Blog, BlogDocument } from '../blogs/entity/blogs.schema';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(Blog.name) private blogModel: Model<BlogDocument>,
    @InjectDataSource() protected dataSource: DataSource,
  ) {}
  async getPostById(postId: string): Promise<PostDb> {
    try {
      const result: PostDb[] = await this.dataSource.query(
        `
        SELECT * FROM "POSTS" as p
        WHERE p."id" = $1
        `,
        [postId],
      );
      if (result.length < 1) return null;
      return result[0];
    } catch (e) {
      console.log(e);
      return null;
    }
  }
  async createPost(newPost: PostDb): Promise<PostViewModelType | null> {
    try {
      await this.dataSource.query(
        `
        INSERT INTO "POSTS"
        ("id", "title", "shortDescription", 
        "content", "blogId", "createdAt", 
        "ownerId", "ownerIsBanned", "likesCount", 
        "dislikesCount", "parentBlogIsBanned")
        VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `,
        [
          newPost.id,
          newPost.title,
          newPost.shortDescription,
          newPost.content,
          newPost.blogId,
          newPost.createdAt,
          newPost.ownerId,
          newPost.ownerIsBanned,
          newPost.likesCount,
          newPost.dislikesCount,
          newPost.parentBlogIsBanned,
        ],
      );
      const postQuery: PostDbWithBlogNameType[] = await this.dataSource.query(
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
        [newPost.id],
      );
      const result = postQuery[0];
      return {
        id: result.id,
        title: result.title,
        shortDescription: result.shortDescription,
        content: result.content,
        blogId: result.blogId,
        blogName: result.blogName,
        createdAt: result.createdAt.toISOString(),
        extendedLikesInfo: {
          likesCount: result.likesCount,
          dislikesCount: result.dislikesCount,
          myStatus: 'None',
          newestLikes: [],
        },
      };
    } catch (e) {
      console.log(e);
      return null;
    }
  }
  async updatePost(
    inputId: string,
    postTitle: string,
    short: string,
    text: string,
    blogId: string,
    blogName: string,
  ): Promise<boolean | null> {
    const postInstance = await this.postModel.findOne({
      _id: new mongoose.Types.ObjectId(inputId),
    });
    // postInstance.title = postTitle;
    // postInstance.shortDescription = short;
    // postInstance.content = text;
    // postInstance.blogId = blogId;
    // postInstance.blogName = blogName;
    // await postInstance.save();
    return true;
  }
  async deletePost(inputId: string): Promise<boolean> {
    const deleteResult = await this.postModel.deleteOne({
      _id: new mongoose.Types.ObjectId(inputId),
    });
    return deleteResult.deletedCount === 1;
  }
  async updateLikesCounters(
    newLikesCount: number,
    newDislikesCount: number,
    postId: string,
  ) {
    const postInstance = await this.postModel.findOne({
      _id: new mongoose.Types.ObjectId(postId),
    });
    if (postInstance) {
      postInstance.likesInfo.likesCount = newLikesCount;
      postInstance.likesInfo.dislikesCount = newDislikesCount;
      await postInstance.save();
      return;
    } else return;
  }
  async banByUserId(userId: string, isBanned: boolean): Promise<void> {
    await this.postModel.updateMany(
      { 'postOwnerInfo.userId': userId },
      { 'postOwnerInfo.isBanned': isBanned },
    );
    return;
  }
  async banByBlogId(blogId: string, isBanned: boolean): Promise<void> {
    await this.postModel.updateMany(
      { blogId: blogId },
      { parentBlogIsBanned: isBanned },
    );
    return;
  }
}
