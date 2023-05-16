import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CommentsRepository } from './comments.repository';
import { LikeStatus } from '../likes/types/likes.types';
import { CommentsQuery } from './comments.query';
import { LikesForCommentsService } from '../likes/likes-for-comments.service';

@Injectable()
export class CommentsService {
  constructor(
    protected commentsRepo: CommentsRepository,
    protected commentsQueryRepo: CommentsQuery,
    protected likesForCommentsService: LikesForCommentsService,
  ) {}
  async updateComment(
    commentId: string,
    userId: string,
    content: string,
  ): Promise<boolean> {
    const foundComment = await this.commentsQueryRepo.findCommentById(
      commentId,
      userId,
    );
    if (!foundComment) throw new NotFoundException();
    if (foundComment.commentatorInfo.userId === userId) {
      await this.commentsRepo.updateComment(commentId, content);
      return true;
    } else
      throw new ForbiddenException([
        "User is not allowed to edit other user's comment",
      ]);
  }
  async deleteComment(commentId: string, userId: string): Promise<boolean> {
    const foundComment = await this.commentsQueryRepo.findCommentById(
      commentId,
      userId,
    );
    if (!foundComment) throw new NotFoundException();
    if (foundComment.commentatorInfo.userId === userId) {
      await this.commentsRepo.deleteComment(commentId);
      await this.likesForCommentsService.deleteAllLikesWhenCommentIsDeleted(
        commentId,
      );
      return true;
    } else
      throw new ForbiddenException([
        "User is not allowed to delete other user's comment",
      ]);
  }
  async updateLikeStatus(
    commentId: string,
    activeUserId: string,
    inputLikeStatus: LikeStatus,
  ): Promise<boolean> {
    const foundComment = await this.commentsQueryRepo.findCommentById(
      commentId,
      activeUserId,
    );
    if (!foundComment) {
      throw new NotFoundException();
    } else {
      const foundUserLike = await this.commentsQueryRepo.getUserLikeForComment(
        activeUserId,
        commentId,
      );
      let currentLikesCount = foundComment.likesInfo.likesCount;
      let currentDislikesCount = foundComment.likesInfo.dislikesCount;
      switch (inputLikeStatus) {
        case LikeStatus.like:
          if (!foundUserLike || foundUserLike.likeStatus === LikeStatus.none) {
            currentLikesCount++;
            break;
          }
          if (foundUserLike.likeStatus === LikeStatus.dislike) {
            currentLikesCount++;
            currentDislikesCount--;
            break;
          }
          break;
        case LikeStatus.dislike:
          if (!foundUserLike || foundUserLike.likeStatus === LikeStatus.none) {
            currentDislikesCount++;
            break;
          }
          if (foundUserLike.likeStatus === LikeStatus.like) {
            currentLikesCount--;
            currentDislikesCount++;
            break;
          }
          break;
        case LikeStatus.none:
          if (foundUserLike?.likeStatus === LikeStatus.like) {
            currentLikesCount--;
            break;
          }
          if (foundUserLike?.likeStatus === LikeStatus.dislike) {
            currentDislikesCount--;
            break;
          }
          break;
      }
      if (!foundUserLike) {
        await this.likesForCommentsService.createNewLike(
          commentId,
          activeUserId,
          inputLikeStatus,
        );
        await this.commentsRepo.updateLikesCounters(
          currentLikesCount,
          currentDislikesCount,
          commentId,
        );
        return true;
      } else {
        await this.likesForCommentsService.updateLikeStatus(
          commentId,
          activeUserId,
          inputLikeStatus,
        );
        await this.commentsRepo.updateLikesCounters(
          currentLikesCount,
          currentDislikesCount,
          commentId,
        );
        return true;
      }
    }
  }
}
