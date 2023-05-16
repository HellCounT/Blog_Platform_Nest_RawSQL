import { Injectable } from '@nestjs/common';
import mongoose from 'mongoose';
import { Comment, CommentJoinedType } from './types/comments.types';
import { LikeStatus } from '../likes/types/likes.types';
import { CommentViewDto } from './dto/output.comment.view.dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class CommentsRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}
  async getCommentById(id: string): Promise<CommentJoinedType> {
    try {
      const commentResult = await this.dataSource.query(
        `
        SELECT
        c."id", c."content", c."userId", u."id" as "userLogin", c."postId", c."createdAt", c."likesCount", c."dislikesCount"
        FROM "COMMENTS" AS c
        LEFT JOIN "USERS" AS u
        ON c."userId" = u."id"
        WHERE c."id" = $1
        `,
        [id],
      );
      return commentResult[0];
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async createComment(newComment: Comment): Promise<CommentViewDto | null> {
    try {
      await this.dataSource.query(
        `
      INSERT INTO "COMMENTS"
      ("id", "content", "userId", "postId", "createdAt", "likesCount", "dislikesCount")
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      `,
        [
          newComment.id,
          newComment.content,
          newComment.userId,
          newComment.postId,
          newComment.createdAt,
          newComment.likesCount,
          newComment.dislikesCount,
        ],
      );
      const createdComment: CommentJoinedType = await this.getCommentById(
        newComment.id,
      );
      return {
        id: createdComment.id,
        content: createdComment.content,
        commentatorInfo: {
          userId: createdComment.userId,
          userLogin: createdComment.userLogin,
        },
        createdAt: createdComment.createdAt,
        likesInfo: {
          likesCount: createdComment.likesCount,
          dislikesCount: createdComment.dislikesCount,
          myStatus: LikeStatus.none,
        },
      };
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async updateComment(
    commentId: string,
    content: string,
  ): Promise<boolean | null> {
    try {
      await this.dataSource.query(
        `
        UPDATE "COMMENTS"
        SET "content" = $1
        WHERE "id" = $2
        `,
        [content, commentId],
      );
      return true;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async deleteComment(commentId: string): Promise<boolean | null> {
    try {
      await this.dataSource.query(
        `
        DELETE FROM "COMMENTS"
        WHERE "id" = $1
        `[commentId],
      );
      return true;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async updateLikesCounters(
    newLikesCount: number,
    newDislikesCount: number,
    commentId: string,
  ) {
    const commentInstance = await this.commentModel.findOne({
      _id: new mongoose.Types.ObjectId(commentId),
    });
    if (commentInstance) {
      commentInstance.likesInfo.likesCount = newLikesCount;
      commentInstance.likesInfo.dislikesCount = newDislikesCount;
      await commentInstance.save();
      return;
    }
    return;
  }

  async banByUserId(userId: string, isBanned: boolean): Promise<void> {
    await this.commentModel.updateMany(
      { 'commentatorInfo.userId': userId },
      { 'commentatorInfo.isBanned': isBanned },
    );
    return;
  }
}
