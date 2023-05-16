import { CommandHandler } from '@nestjs/cqrs';
import { CommentsRepository } from '../comments.repository';
import { CommentsQuery } from '../comments.query';
import { LikesForCommentsService } from '../../likes/likes-for-comments.service';
import { NotFoundException } from '@nestjs/common';
import { LikeStatus } from '../../likes/types/likes.types';

export class UpdateCommentLikeStatusCommand {
  constructor(
    public commentId: string,
    public activeUserId: string,
    public inputLikeStatus: LikeStatus,
  ) {}
}

@CommandHandler(UpdateCommentLikeStatusCommand)
export class UpdateCommentLikeStatusUseCase {
  constructor(
    protected commentsRepo: CommentsRepository,
    protected commentsQueryRepo: CommentsQuery,
    protected likesForCommentsService: LikesForCommentsService,
  ) {}
  async execute(command: UpdateCommentLikeStatusCommand): Promise<boolean> {
    const foundComment = await this.commentsQueryRepo.findCommentById(
      command.commentId,
      command.activeUserId,
    );
    if (!foundComment) {
      throw new NotFoundException();
    } else {
      const foundUserLike = await this.commentsQueryRepo.getUserLikeForComment(
        command.activeUserId,
        command.commentId,
      );
      let currentLikesCount = foundComment.likesInfo.likesCount;
      let currentDislikesCount = foundComment.likesInfo.dislikesCount;
      switch (command.inputLikeStatus) {
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
          command.commentId,
          command.activeUserId,
          command.inputLikeStatus,
        );
        await this.commentsRepo.updateLikesCounters(
          currentLikesCount,
          currentDislikesCount,
          command.commentId,
        );
        return true;
      } else {
        await this.likesForCommentsService.updateLikeStatus(
          command.commentId,
          command.activeUserId,
          command.inputLikeStatus,
        );
        await this.commentsRepo.updateLikesCounters(
          currentLikesCount,
          currentDislikesCount,
          command.commentId,
        );
        return true;
      }
    }
  }
}
