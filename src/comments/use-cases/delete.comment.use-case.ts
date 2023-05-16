import { CommandHandler } from '@nestjs/cqrs';
import { CommentsRepository } from '../comments.repository';
import { CommentsQuery } from '../comments.query';
import { LikesForCommentsService } from '../../likes/likes-for-comments.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

export class DeleteCommentCommand {
  constructor(public commentId: string, public userId: string) {}
}

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentUseCase {
  constructor(
    protected commentsRepo: CommentsRepository,
    protected commentsQueryRepo: CommentsQuery,
    protected likesForCommentsService: LikesForCommentsService,
  ) {}
  async execute(command: DeleteCommentCommand): Promise<boolean> {
    const foundComment = await this.commentsQueryRepo.findCommentById(
      command.commentId,
      command.userId,
    );
    if (!foundComment) throw new NotFoundException();
    if (foundComment.commentatorInfo.userId === command.userId) {
      await this.commentsRepo.deleteComment(command.commentId);
      await this.likesForCommentsService.deleteAllLikesWhenCommentIsDeleted(
        command.commentId,
      );
      return true;
    } else
      throw new ForbiddenException([
        "User is not allowed to delete other user's comment",
      ]);
  }
}
