import mongoose from 'mongoose';
import { QueryParser } from '../application-helpers/query.parser';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CommentViewDto } from './dto/output.comment.view.dto';
import { CommentPaginatorDto } from './dto/output.comment-paginator.dto';
import { CommentLike, LikeStatus } from '../likes/types/likes.types';
import { DataSource } from 'typeorm';
import { Comment } from './types/comments.types';

@Injectable()
export class CommentsQuery {
  constructor(protected dataSource: DataSource) {}
  async findCommentById(
    id: string,
    activeUserId: string,
  ): Promise<CommentViewDto | null> {
    const foundCommentInstance = await this.commentModel.findOne({
      _id: new mongoose.Types.ObjectId(id),
      'commentatorInfo.isBanned': false,
    });
    if (foundCommentInstance)
      return this._mapCommentToViewType(foundCommentInstance, activeUserId);
    else throw new NotFoundException();
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
  ): Promise<CommentLike | null> {
    return this.likeForCommentModel.findOne({
      commentId: commentId,
      userId: userId,
      isBanned: false,
    });
  }
  async _mapCommentToViewType(
    comment: Comment,
    activeUserId: string,
  ): Promise<CommentViewDto> {
    const like = await this.getUserLikeForComment(
      activeUserId,
      comment._id.toString(),
    );
    return {
      id: comment._id.toString(),
      content: comment.content,
      commentatorInfo: {
        userId: comment.commentatorInfo.userId,
        userLogin: comment.commentatorInfo.userLogin,
      },
      createdAt: comment.createdAt,
      likesInfo: {
        likesCount: comment.likesInfo.likesCount,
        dislikesCount: comment.likesInfo.dislikesCount,
        myStatus: like?.likeStatus || LikeStatus.none,
      },
    };
  }
}
