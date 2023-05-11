import {
  PostDb,
  PostDbJoinedType,
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
        "ownerId", "likesCount", 
        "dislikesCount")
        VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `,
        [
          newPost.id,
          newPost.title,
          newPost.shortDescription,
          newPost.content,
          newPost.blogId,
          newPost.createdAt,
          newPost.ownerId,
          newPost.likesCount,
          newPost.dislikesCount,
        ],
      );
      const postQuery: PostDbJoinedType[] = await this.dataSource.query(
        `
        SELECT p."id", p."title", p."shortDescription", 
        p."content", p."blogId", b."name" as "blogName", p."createdAt", 
        p."ownerId", ub."isBanned" as "ownerIsBanned", p."likesCount", 
        p."dislikesCount", b."isBanned" as "parentBlogIsBanned"
        FROM "POSTS" AS p
        JOIN "BLOGS" AS b
        ON p."blogId" = b."id"
        JOIN "USERS_GLOBAL_BAN" as ub
        ON p."ownerId" = ub."userId"
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
}
