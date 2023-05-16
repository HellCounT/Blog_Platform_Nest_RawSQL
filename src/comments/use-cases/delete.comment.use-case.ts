import { CommandHandler } from '@nestjs/cqrs';
import { CommentsRepository } from '../comments.repository';
import { LikesForCommentsService } from '../../likes/likes-for-comments.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

export class DeleteCommentCommand {
  constructor(public commentId: string, public userId: string) {}
}

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentUseCase {
  constructor(
    protected commentsRepo: CommentsRepository,
    protected likesForCommentsService: LikesForCommentsService,
  ) {}
  async execute(command: DeleteCommentCommand): Promise<boolean> {
    const foundComment = await this.commentsRepo.getCommentById(
      command.commentId,
    );
    if (!foundComment) throw new NotFoundException();
    if (foundComment.userId === command.userId) {
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
