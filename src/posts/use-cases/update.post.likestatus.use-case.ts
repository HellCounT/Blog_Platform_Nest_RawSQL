import { CommandHandler } from '@nestjs/cqrs';
import { LikeStatus } from '../../likes/types/likes.types';
import { PostsRepository } from '../posts.repository';
import { LikesForPostsService } from '../../likes/likes-for-posts.service';
import { PostsQuery } from '../posts.query';
import { NotFoundException } from '@nestjs/common';

export class UpdatePostLikeStatusCommand {
  constructor(
    public postId: string,
    public activeUserId: string,
    public activeUserLogin: string,
    public inputLikeStatus: LikeStatus,
  ) {}
}

@CommandHandler(UpdatePostLikeStatusCommand)
export class UpdatePostLikeStatusUseCase {
  constructor(
    protected postsRepo: PostsRepository,
    protected likesForPostsService: LikesForPostsService,
    protected readonly postsQueryRepo: PostsQuery,
  ) {}
  async execute(command: UpdatePostLikeStatusCommand): Promise<boolean> {
    const foundPost = await this.postsQueryRepo.findPostById(
      command.postId,
      command.activeUserId,
    );
    if (!foundPost) {
      throw new NotFoundException();
    } else {
      const foundUserLike = await this.postsQueryRepo.getUserLikeForPost(
        command.activeUserId,
        command.postId,
      );
      let currentLikesCount = foundPost.extendedLikesInfo.likesCount;
      let currentDislikesCount = foundPost.extendedLikesInfo.dislikesCount;
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
        await this.likesForPostsService.createNewLike(
          command.postId,
          command.activeUserId,
          command.activeUserLogin,
          command.inputLikeStatus,
        );
        await this.postsRepo.updateLikesCounters(
          currentLikesCount,
          currentDislikesCount,
          command.postId,
        );
        return true;
      } else {
        await this.likesForPostsService.updateLikeStatus(
          command.postId,
          command.activeUserId,
          command.inputLikeStatus,
        );
        await this.postsRepo.updateLikesCounters(
          currentLikesCount,
          currentDislikesCount,
          command.postId,
        );
        return true;
      }
    }
  }
}
