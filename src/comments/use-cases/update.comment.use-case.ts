import { CommandHandler } from '@nestjs/cqrs';
import { CommentsRepository } from '../comments.repository';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

export class UpdateCommentCommand {
  constructor(
    public commentId: string,
    public content: string,
    public userId: string,
  ) {}
}

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentUseCase {
  constructor(protected commentsRepo: CommentsRepository) {}
  async execute(command: UpdateCommentCommand): Promise<boolean> {
    const foundComment = await this.commentsRepo.getCommentById(
      command.commentId,
    );
    if (!foundComment) throw new NotFoundException();
    if (foundComment.userId === command.userId) {
      await this.commentsRepo.updateComment(command.commentId, command.content);
      return true;
    } else
      throw new ForbiddenException([
        "User is not allowed to edit other user's comment",
      ]);
  }
}
