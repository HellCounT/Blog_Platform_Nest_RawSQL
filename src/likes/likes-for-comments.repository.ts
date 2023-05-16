import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  LikeForComment,
  LikeForCommentDocument,
} from './entity/likes-for-comments.schema';
import { Model } from 'mongoose';
import { CommentLikeDb, LikeStatus } from './types/likes.types';

@Injectable()
export class LikesForCommentsRepository {
  constructor(
    @InjectModel(LikeForComment.name)
    private likesForCommentsModel: Model<LikeForComment>,
  ) {}
  async createNewLike(newLike: CommentLikeDb): Promise<void> {
    const likeInCommentInstance = new this.likesForCommentsModel(newLike);
    await likeInCommentInstance.save();
    return;
  }
  async updateLikeStatus(
    commentId: string,
    userId: string,
    likeStatus: LikeStatus,
  ): Promise<void> {
    const likeInCommentInstance = await this.likesForCommentsModel.findOne({
      commentId: commentId,
      userId: userId,
    });
    if (likeInCommentInstance) {
      likeInCommentInstance.likeStatus = likeStatus;
      await likeInCommentInstance.save();
      return;
    } else return;
  }
  async deleteAllLikesWhenCommentIsDeleted(commentId: string): Promise<void> {
    await this.likesForCommentsModel.deleteMany({ commentId: commentId });
    return;
  }
  async getByUserId(userId: string): Promise<LikeForCommentDocument[]> {
    return this.likesForCommentsModel.find({ userId: userId });
  }
  async banByUserId(userId: string, isBanned: boolean): Promise<void> {
    await this.likesForCommentsModel.updateMany(
      { userId: userId },
      { isBanned: isBanned },
    );
    return;
  }
  async getNewLikesCounter(commentId: string): Promise<number> {
    return this.likesForCommentsModel.countDocuments({
      commentId: commentId,
      likeStatus: LikeStatus.like,
      isBanned: false,
    });
  }
  async getNewDislikesCounter(commentId: string): Promise<number> {
    return this.likesForCommentsModel.countDocuments({
      commentId: commentId,
      likeStatus: LikeStatus.dislike,
      isBanned: false,
    });
  }
}
