import { Injectable } from '@nestjs/common';
import { LikeStatus, PostLike } from './types/likes.types';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class LikesForPostsRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}
  async createNewLike(newLike: PostLike): Promise<void> {
    try {
      await this.dataSource.query(
        `
        INSERT INTO "LIKES_FOR_POSTS"
        ("id", "postId", "userId", "addedAt", "likeStatus")
        VALUES($1, $2, $3, $4, $5)
        `,
        [
          newLike.id,
          newLike.postId,
          newLike.userId,
          newLike.addedAt,
          newLike.likeStatus,
        ],
      );
      return;
    } catch (e) {
      console.log(e);
      return;
    }
  }
  async updateLikeStatus(
    postId: string,
    userId: string,
    likeStatus: LikeStatus,
  ): Promise<void> {
    try {
      await this.dataSource.query(
        `
        UPDATE "LIKES_FOR_POSTS"
        SET "likeStatus" = $1
        WHERE "postId" = $2 AND "userId" = $3
        `,
        [likeStatus, postId, userId],
      );
      return;
    } catch (e) {
      console.log(e);
      return;
    }
  }
  async deleteAllLikesWhenPostIsDeleted(postId: string): Promise<void> {
    try {
      await this.dataSource.query(
        `
        DELETE FROM "LIKES_FOR_POSTS"
        WHERE "postId" = $1
        `,
        [postId],
      );
      return;
    } catch (e) {
      console.log(e);
      return;
    }
  }
  async getByUserId(userId: string): Promise<PostLike[]> {
    try {
      return await this.dataSource.query(
        `
        SELECT * FROM "LIKES_FOR_POSTS"
        WHERE "userId" = $1
        `,
        [userId],
      );
    } catch (e) {
      console.log(e);
      return;
    }
  }
  async getNewLikesCounter(postId: string): Promise<number> {
    try {
      const counterResult = await this.dataSource.query(
        `
        SELECT COUNT(*)
        FROM "LIKES_FOR_POSTS" as l
        LEFT JOIN "USERS_GLOBAL_BAN" as b
        ON l."userId" = b."userId"
        WHERE (l."postId" = $1 AND l."likeStatus" = $2) AND b."isBanned" = false
        `,
        [postId, LikeStatus.like],
      );
      return parseInt(counterResult[0].count, 10);
    } catch (e) {
      console.log(e);
      return null;
    }
  }
  async getNewDislikesCounter(postId: string): Promise<number> {
    try {
      const counterResult = await this.dataSource.query(
        `
        SELECT COUNT(*)
        FROM "LIKES_FOR_POSTS" as l
        LEFT JOIN "USERS_GLOBAL_BAN" as b
        ON l."userId" = b."userId"
        WHERE (l."postId" = $1 AND l."likeStatus" = $2) AND b."isBanned" = false
        `,
        [postId, LikeStatus.dislike],
      );
      return parseInt(counterResult[0].count, 10);
    } catch (e) {
      console.log(e);
      return null;
    }
  }
}
