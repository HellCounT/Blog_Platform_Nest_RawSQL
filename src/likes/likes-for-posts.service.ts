import { LikesForPostsRepository } from './likes-for-posts.repository';
import { LikeStatus, PostLikeDb } from './types/likes.types';
import mongoose from 'mongoose';
import { Injectable } from '@nestjs/common';

@Injectable()
export class LikesForPostsService {
  constructor(protected likesForPostsRepo: LikesForPostsRepository) {}
  async createNewLike(
    postId: string,
    userId: string,
    userLogin: string,
    likeStatus: LikeStatus,
  ): Promise<void> {
    const newLike = new PostLikeDb(
      new mongoose.Types.ObjectId(),
      postId,
      userId,
      userLogin,
      false,
      new Date(),
      likeStatus,
    );
    await this.likesForPostsRepo.createNewLike(newLike);
    return;
  }
  async updateLikeStatus(
    postId: string,
    userId: string,
    likeStatus: LikeStatus,
  ): Promise<void> {
    await this.likesForPostsRepo.updateLikeStatus(postId, userId, likeStatus);
    return;
  }
  async deleteAllLikesWhenPostIsDeleted(postId: string): Promise<void> {
    await this.likesForPostsRepo.deleteAllLikesWhenPostIsDeleted(postId);
    return;
  }
}
