import { Injectable } from '@nestjs/common';
import { CommentLike, LikeStatus } from './types/likes.types';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class LikesForCommentsRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}
  async createNewLike(newLike: CommentLike): Promise<void> {
    try {
      await this.dataSource.query(
        `
        INSERT INTO "LIKES_FOR_COMMENTS"
        ("id", "commentId", "userId", "addedAt", "likeStatus")
        VALUES($1, $2, $3, $4, $5)
        `,
        [
          newLike.id,
          newLike.commentId,
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
    commentId: string,
    userId: string,
    likeStatus: LikeStatus,
  ): Promise<void> {
    try {
      await this.dataSource.query(
        `
        UPDATE "LIKES_FOR_COMMENTS"
        SET "likeStatus" = $1
        WHERE "commentId" = $2 AND "userId" = $3
        `,
        [likeStatus, commentId, userId],
      );
      return;
    } catch (e) {
      console.log(e);
      return;
    }
  }
  async deleteAllLikesWhenCommentIsDeleted(commentId: string): Promise<void> {
    try {
      await this.dataSource.query(
        `
        DELETE FROM "LIKES_FOR_COMMENTS"
        WHERE "commentId" = $1
        `,
        [commentId],
      );
      return;
    } catch (e) {
      console.log(e);
      return;
    }
  }
  async getByUserId(userId: string): Promise<CommentLike[]> {
    try {
      return await this.dataSource.query(
        `
        SELECT * FROM "LIKES_FOR_COMMENTS"
        WHERE "userId" = $1
        `,
        [userId],
      );
    } catch (e) {
      console.log(e);
      return;
    }
  }
  async getNewLikesCounter(commentId: string): Promise<number> {
    try {
      const counterResult = await this.dataSource.query(
        `
        SELECT COUNT(*)
        FROM "LIKES_FOR_COMMENTS" as l
        LEFT JOIN "USERS_GLOBAL_BAN" as b
        ON l."userId" = b."userId"
        WHERE (l."commentId" = $1 AND l."likeStatus" = $2) AND (b."isBanned" = false or b."isBanned" = null)
        `,
        [commentId, LikeStatus.like],
      );
      return parseInt(counterResult[0].count, 10);
    } catch (e) {
      console.log(e);
      return null;
    }
  }
  async getNewDislikesCounter(commentId: string): Promise<number> {
    try {
      const counterResult = await this.dataSource.query(
        `
        SELECT COUNT(*)
        FROM "LIKES_FOR_COMMENTS" as l
        LEFT JOIN "USERS_GLOBAL_BAN" as b
        ON l."userId" = b."userId"
        WHERE (l."commentId" = $1 AND l."likeStatus" = $2) AND b."isBanned" = false
        `,
        [commentId, LikeStatus.dislike],
      );
      return parseInt(counterResult[0].count, 10);
    } catch (e) {
      console.log(e);
      return null;
    }
  }
}
