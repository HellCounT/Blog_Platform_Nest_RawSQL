import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersQuery } from '../users/users.query';
import mongoose from 'mongoose';
import { CommentDb } from './types/comments.types';
import { CommentsRepository } from './comments.repository';
import { CommentViewDto } from './dto/output.comment.view.dto';
import { LikeStatus } from '../likes/types/likes.types';
import { CommentsQuery } from './comments.query';
import { LikesForCommentsService } from '../likes/likes-for-comments.service';
import { UsersBannedByBloggerRepository } from '../blogger/users/users-banned-by-blogger/users-banned-by-blogger.repository';
import { PostsRepository } from '../posts/posts.repository';

@Injectable()
export class CommentsService {
  constructor(
    protected commentsRepo: CommentsRepository,
    protected readonly postsRepo: PostsRepository,
    protected commentsQueryRepo: CommentsQuery,
    protected readonly usersQueryRepo: UsersQuery,
    protected likesForCommentsService: LikesForCommentsService,
    protected readonly usersBannedByBloggerRepo: UsersBannedByBloggerRepository,
  ) {}
  async createComment(
    content: string,
    userId: string,
    postId: string,
  ): Promise<CommentViewDto | null> {
    const foundUser = await this.usersQueryRepo.findUserById(userId);
    const foundPost = await this.postsRepo.getPostById(postId);
    if (!foundUser || !foundPost) throw new NotFoundException();
    const bannedByBlogger = await this.usersBannedByBloggerRepo.findUserBan(
      foundPost.blogId,
      userId,
    );
    if (bannedByBlogger) throw new ForbiddenException();
    const newComment = new CommentDb(
      new mongoose.Types.ObjectId(),
      content,
      {
        userId: userId,
        userLogin: foundUser.login,
        isBanned: false,
      },
      postId,
      foundPost.ownerId,
      new Date().toISOString(),
      {
        likesCount: 0,
        dislikesCount: 0,
      },
    );
    return await this.commentsRepo.createComment(newComment);
  }
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
