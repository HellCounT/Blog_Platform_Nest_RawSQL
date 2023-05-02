import { Injectable, NotFoundException } from '@nestjs/common';
import { PostsRepository } from './posts.repository';
import { LikeStatus } from '../likes/types/likes.types';
import { PostsQuery } from './posts.query';
import { LikesForPostsService } from '../likes/likes-for-posts.service';

@Injectable()
export class PostsService {
  constructor(
    protected postsRepo: PostsRepository,
    protected likesForPostsService: LikesForPostsService,
    protected readonly postsQueryRepo: PostsQuery,
  ) {}
  async updateLikeStatus(
    postId: string,
    activeUserId: string,
    activeUserLogin: string,
    inputLikeStatus: LikeStatus,
  ): Promise<boolean> {
    const foundPost = await this.postsQueryRepo.findPostById(
      postId,
      activeUserId,
    );
    if (!foundPost) {
      throw new NotFoundException();
    } else {
      const foundUserLike = await this.postsQueryRepo.getUserLikeForPost(
        activeUserId,
        postId,
      );
      let currentLikesCount = foundPost.extendedLikesInfo.likesCount;
      let currentDislikesCount = foundPost.extendedLikesInfo.dislikesCount;
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
        await this.likesForPostsService.createNewLike(
          postId,
          activeUserId,
          activeUserLogin,
          inputLikeStatus,
        );
        await this.postsRepo.updateLikesCounters(
          currentLikesCount,
          currentDislikesCount,
          postId,
        );
        return true;
      } else {
        await this.likesForPostsService.updateLikeStatus(
          postId,
          activeUserId,
          inputLikeStatus,
        );
        await this.postsRepo.updateLikesCounters(
          currentLikesCount,
          currentDislikesCount,
          postId,
        );
        return true;
      }
    }
  }
}
