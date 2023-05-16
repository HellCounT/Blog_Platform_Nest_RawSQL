import { Injectable } from '@nestjs/common';
import { LikesForCommentsRepository } from './likes-for-comments.repository';
import { CommentLike, LikeStatus } from './types/likes.types';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LikesForCommentsService {
  constructor(protected likesForCommentsRepo: LikesForCommentsRepository) {}
  async createNewLike(
    commentId: string,
    userId: string,
    likeStatus: LikeStatus,
  ): Promise<void> {
    const newLike = new CommentLike(
      uuidv4(),
      commentId,
      userId,
      new Date(),
      likeStatus,
    );
    await this.likesForCommentsRepo.createNewLike(newLike);
    return;
  }
  async updateLikeStatus(
    commentId: string,
    userId: string,
    likeStatus: LikeStatus,
  ): Promise<void> {
    await this.likesForCommentsRepo.updateLikeStatus(
      commentId,
      userId,
      likeStatus,
    );
    return;
  }
  async deleteAllLikesWhenCommentIsDeleted(commentId: string): Promise<void> {
    await this.likesForCommentsRepo.deleteAllLikesWhenCommentIsDeleted(
      commentId,
    );
    return;
  }
}
