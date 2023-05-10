import {
  PostDb,
  PostDbWithBlogNameType,
  PostViewModelType,
} from './types/posts.types';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class PostsRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}
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
    postId: string,
    postTitle: string,
    shortDescription: string,
    content: string,
    blogId: string,
    blogName: string,
  ): Promise<boolean | null> {
    try {
      await this.dataSource.query(
        `
        UPDATE "POSTS"
        SET "title" = $1, "shortDescription" = $2, "content" = $3, "blogId" = $4, "blogName" = $5
        WHERE "id" = $6
        `,
        [postTitle, shortDescription, content, blogId, blogName, postTitle],
      );
      return true;
    } catch (e) {
      console.log(e);
      return null;
    }
  }
  async deletePost(postId: string): Promise<boolean> {
    try {
      await this.dataSource.query(
        `
        DELETE FROM "POSTS"
        WHERE "id" = $1;
        `,
        [postId],
      );
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
  async updateLikesCounters(
    newLikesCount: number,
    newDislikesCount: number,
    postId: string,
  ): Promise<void> {
    try {
      await this.dataSource.query(
        `
        UPDATE "POSTS"
        SET "likesCount" = $1, "dislikesCount" = $2
        WHERE "id" = $3
        `,
        [newLikesCount, newDislikesCount, postId],
      );
      return;
    } catch (e) {
      console.log(e);
      return;
    }
  }
  async banByUserId(userId: string, isBanned: boolean): Promise<void> {
    try {
      await this.dataSource.query(
        `
        UPDATE "POSTS"
        SET "ownerIsBanned" = $1
        WHERE "ownerId" = $2
        `,
        [isBanned, userId],
      );
      return;
    } catch (e) {
      console.log(e);
      return;
    }
  }
  async banByBlogId(blogId: string, isBanned: boolean): Promise<void> {
    try {
      await this.dataSource.query(
        `
        UPDATE "POSTS"
        SET "parentBlogIsBanned" = $1
        WHERE "blogId" = $2
        `,
        [isBanned, blogId],
      );
      return;
    } catch (e) {
      console.log(e);
      return;
    }
  }
}
