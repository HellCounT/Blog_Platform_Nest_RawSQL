import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentDocument } from './entity/comments.schema';
import mongoose, { Model } from 'mongoose';
import { CommentDb } from './types/comments.types';
import { LikeStatus } from '../likes/types/likes.types';
import { CommentViewDto } from './dto/output.comment.view.dto';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
  ) {}
  async createComment(newComment: CommentDb): Promise<CommentViewDto | null> {
    const commentInstance = new this.commentModel(newComment);
    const result = await commentInstance.save();
    return {
      id: result._id.toString(),
      content: result.content,
      commentatorInfo: {
        userId: result.commentatorInfo.userId,
        userLogin: result.commentatorInfo.userLogin,
      },
      createdAt: result.createdAt,
      likesInfo: {
        likesCount: result.likesInfo.likesCount,
        dislikesCount: result.likesInfo.dislikesCount,
        myStatus: LikeStatus.none,
      },
    };
  }

  async updateComment(
    commentId: string,
    content: string,
  ): Promise<boolean | null> {
    const commentInstance = await this.commentModel.findOne({
      _id: new mongoose.Types.ObjectId(commentId),
    });
    if (!commentInstance) return null;
    else {
      commentInstance.content = content;
      await commentInstance.save();
      return true;
    }
  }

  async deleteComment(commentId: string): Promise<boolean | null> {
    const commentInstance = await this.commentModel.findOne({
      _id: new mongoose.Types.ObjectId(commentId),
    });
    if (commentInstance) {
      await commentInstance.deleteOne();
      return true;
    } else return false;
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

  async getByUserId(userId: string): Promise<CommentDocument[]> {
    return this.commentModel.find({ 'commentatorInfo.userId': userId });
  }

  async banByUserId(userId: string, isBanned: boolean): Promise<void> {
    await this.commentModel.updateMany(
      { 'commentatorInfo.userId': userId },
      { 'commentatorInfo.isBanned': isBanned },
    );
    return;
  }
}
