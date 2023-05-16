import { Injectable } from '@nestjs/common';
import { LikeStatus, PostLike } from './types/likes.types';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class LikesForPostsRepository {
  constructor(@InjectDataSource protected dataSource: DataSource) {}
  async createNewLike(newLike: PostLike): Promise<void> {
    const likeInPostInstance = new this.likesForPostsModel(newLike);
    await likeInPostInstance.save();
    return;
  }
  async updateLikeStatus(
    postId: string,
    userId: string,
    likeStatus: LikeStatus,
  ): Promise<void> {
    const likeInPostInstance = await this.likesForPostsModel.findOne({
      postId: postId,
      userId: userId,
    });
    if (likeInPostInstance) {
      likeInPostInstance.likeStatus = likeStatus;
      await likeInPostInstance.save();
      return;
    } else return;
  }
  async deleteAllLikesWhenPostIsDeleted(postId: string): Promise<void> {
    await this.likesForPostsModel.deleteMany({ postId: postId });
    return;
  }
  async getByUserId(userId: string): Promise<PostLike[]> {
    return this.likesForPostsModel.find({ userId: userId });
  }
  async banByUserId(userId: string, isBanned: boolean): Promise<void> {
    await this.likesForPostsModel.updateMany(
      { userId: userId },
      { isBanned: isBanned },
    );
    return;
  }
  async getNewLikesCounter(postId: string): Promise<number> {
    return this.likesForPostsModel.countDocuments({
      postId: postId,
      likeStatus: LikeStatus.like,
      isBanned: false,
    });
  }
  async getNewDislikesCounter(postId: string): Promise<number> {
    return this.likesForPostsModel.countDocuments({
      postId: postId,
      likeStatus: LikeStatus.dislike,
      isBanned: false,
    });
  }
}
