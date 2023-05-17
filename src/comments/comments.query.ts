import { QueryParser } from '../application-helpers/query.parser';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CommentViewDto } from './dto/output.comment.view.dto';
import { CommentPaginatorDto } from './dto/output.comment-paginator.dto';
import { CommentLikeJoinedType, LikeStatus } from '../likes/types/likes.types';
import { DataSource } from 'typeorm';
import { CommentJoinedType } from './types/comments.types';
import { InjectDataSource } from '@nestjs/typeorm';

@Injectable()
export class CommentsQuery {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}
  async findCommentById(
    id: string,
    activeUserId: string,
  ): Promise<CommentViewDto | null> {
    const commentResult: CommentJoinedType[] = await this.dataSource.query(
      `
        SELECT
        c."id", c."content", c."userId", u."id" as "userLogin", c."postId", c."createdAt", c."likesCount", c."dislikesCount"
        FROM "COMMENTS" AS c
        LEFT JOIN "USERS" AS u
        ON c."userId" = u."id"
        LEFT JOIN "USERS_GLOBAL_BAN" AS ub
        ON c."userId" = ub."userId"
        WHERE c."id" = $1 AND ub."isBanned" = false
        `,
      [id],
    );
    if (commentResult.length === 0) throw new NotFoundException();
    return this._mapCommentToViewType(commentResult[0], activeUserId);
  }
  async findCommentsByPostId(
    postId: string,
    q: QueryParser,
    activeUserId = '',
  ): Promise<CommentPaginatorDto | null> {
    const foundCommentsCount = await this.commentModel.countDocuments({
      'commentatorInfo.isBanned': false,
      postId: { $eq: postId },
    });
    const reqPageDbComments = await this.commentModel
      .find({
        'commentatorInfo.isBanned': false,
        postId: { $eq: postId },
      })
      .sort({ [q.sortBy]: q.sortDirection })
      .skip((q.pageNumber - 1) * q.pageSize)
      .limit(q.pageSize)
      .lean();
    const items = [];
    for await (const c of reqPageDbComments) {
      const comment = await this._mapCommentToViewType(c, activeUserId);
      items.push(comment);
    }
    return {
      pagesCount: Math.ceil(foundCommentsCount / q.pageSize),
      page: q.pageNumber,
      pageSize: q.pageSize,
      totalCount: foundCommentsCount,
      items: items,
    };
  }
  async getUserLikeForComment(
    userId: string,
    commentId: string,
  ): Promise<CommentLikeJoinedType | null> {
    try {
      const foundLikeResult: CommentLikeJoinedType[] =
        await this.dataSource.query(
          `
      SELECT lc."id", lc."commentId", lc."userId", u."login" as "userLogin",
      lc."addedAt", lc."likeStatus"
      FROM "LIKES_FOR_COMMENTS" AS lc
      LEFT JOIN "USERS" AS u
      ON lc."userId" = u."id"
      LEFT JOIN "USERS_GLOBAL_BAN" AS ub
      ON lc."userId" = ub."userId"
      WHERE (lc."commentId" = $1 AND lc."userId" = $2) AND ub."isBanned" = false
      `,
          [commentId, userId],
        );
      return foundLikeResult[0];
    } catch (e) {
      console.log(e);
      return null;
    }
  }
  async _mapCommentToViewType(
    comment: CommentJoinedType,
    activeUserId: string,
  ): Promise<CommentViewDto> {
    const like = await this.getUserLikeForComment(activeUserId, comment.id);
    return {
      id: comment.id,
      content: comment.content,
      commentatorInfo: {
        userId: comment.userId,
        userLogin: comment.userLogin,
      },
      createdAt: comment.createdAt,
      likesInfo: {
        likesCount: comment.likesCount,
        dislikesCount: comment.dislikesCount,
        myStatus: like?.likeStatus || LikeStatus.none,
      },
    };
  }
}
