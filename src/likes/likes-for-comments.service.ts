import { Injectable } from '@nestjs/common';
import { LikesForCommentsRepository } from './likes-for-comments.repository';
import { LikeStatus } from './types/likes.types';

@Injectable()
export class LikesForCommentsService {
  constructor(protected likesForCommentsRepo: LikesForCommentsRepository) {}
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
