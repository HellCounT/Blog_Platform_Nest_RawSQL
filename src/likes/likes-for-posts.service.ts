import { LikesForPostsRepository } from './likes-for-posts.repository';
import { LikeStatus, PostLike } from './types/likes.types';
import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LikesForPostsService {
  constructor(protected likesForPostsRepo: LikesForPostsRepository) {}
  async createNewLike(
    postId: string,
    userId: string,
    userLogin: string,
    likeStatus: LikeStatus,
  ): Promise<void> {
    const newLike = new PostLike(
      uuidv4(),
      postId,
      userId,
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
