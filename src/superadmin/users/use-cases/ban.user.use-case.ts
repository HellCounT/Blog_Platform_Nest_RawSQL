import { CommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../users/users.repository';
import { PostsRepository } from '../../../posts/posts.repository';
import { CommentsRepository } from '../../../comments/comments.repository';
import { LikesForPostsRepository } from '../../../likes/likes-for-posts.repository';
import { LikesForCommentsRepository } from '../../../likes/likes-for-comments.repository';
import { DevicesRepository } from '../../../security/devices/devices.repository';
import { InputBanUserDto } from '../dto/input.ban-user.dto';
import { NotFoundException } from '@nestjs/common';
import { ExpiredTokensRepository } from '../../../security/tokens/expired.tokens.repository';
import { CommentLike, PostLike } from '../../../likes/types/likes.types';

export class BanUserCommand {
  constructor(public banUserDto: InputBanUserDto, public userId: string) {}
}

@CommandHandler(BanUserCommand)
export class BanUserUseCase {
  constructor(
    protected usersRepo: UsersRepository,
    protected postsRepo: PostsRepository,
    protected commentsRepo: CommentsRepository,
    protected likesForPostsRepo: LikesForPostsRepository,
    protected likesForCommentsRepo: LikesForCommentsRepository,
    protected devicesRepo: DevicesRepository,
    protected expiredTokensRepo: ExpiredTokensRepository,
  ) {}
  async execute(command: BanUserCommand): Promise<boolean> {
    const user = await this.usersRepo.getUserById(command.userId);
    if (!user) throw new NotFoundException();
    if (user.globalBanInfo.isBanned === command.banUserDto.isBanned)
      return true;
    const likesInPosts = await this.likesForPostsRepo.getByUserId(
      command.userId,
    );
    const likesInComments = await this.likesForCommentsRepo.getByUserId(
      command.userId,
    );
    await this.usersRepo.banUserById(
      command.userId,
      command.banUserDto.isBanned,
      command.banUserDto.banReason,
    );
    await this._recalculateLikesCountersOnEntities(
      likesInPosts,
      likesInComments,
    );
    if (command.banUserDto.isBanned === true)
      await this._killAllSessions(command.userId);
    return true;
  }

  private async _recalculateLikesCountersOnEntities(
    likesInPosts: PostLike[],
    likesInComments: CommentLike[],
  ): Promise<void> {
    for (let i = 0; i < likesInPosts.length; i++) {
      const postLikesCounter = await this.likesForPostsRepo.getNewLikesCounter(
        likesInPosts[i].postId,
      );
      const postDislikesCounter =
        await this.likesForPostsRepo.getNewDislikesCounter(
          likesInPosts[i].postId,
        );
      await this.postsRepo.updateLikesCounters(
        postLikesCounter,
        postDislikesCounter,
        likesInPosts[i].postId,
      );
    }
    for (let i = 0; i < likesInComments.length; i++) {
      const commentLikesCounter =
        await this.likesForCommentsRepo.getNewLikesCounter(
          likesInComments[i].commentId,
        );
      const commentDislikesCounter =
        await this.likesForCommentsRepo.getNewDislikesCounter(
          likesInComments[i].commentId,
        );
      await this.commentsRepo.updateLikesCounters(
        commentLikesCounter,
        commentDislikesCounter,
        likesInComments[i].commentId,
      );
    }
    return;
  }
  private async _killAllSessions(userId: string): Promise<void> {
    const sessions = await this.devicesRepo.getAllSessionsForUser(userId);
    for (let i = 0; i < sessions.length; i++) {
      await this.expiredTokensRepo.addTokenToDb(
        sessions[i].refreshTokenMeta,
        userId,
      );
    }
    await this.devicesRepo.killAllSessionsForUser(userId);
    return;
  }
}
