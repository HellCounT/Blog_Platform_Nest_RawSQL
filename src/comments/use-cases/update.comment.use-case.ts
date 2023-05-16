import { CommandHandler } from '@nestjs/cqrs';
import { CommentsRepository } from '../comments.repository';
import { CommentsQuery } from '../comments.query';
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
  constructor(
    protected commentsRepo: CommentsRepository,
    protected commentsQueryRepo: CommentsQuery,
  ) {}
  async execute(command: UpdateCommentCommand): Promise<boolean> {
    const foundComment = await this.commentsQueryRepo.findCommentById(
      command.commentId,
      command.userId,
    );
    if (!foundComment) throw new NotFoundException();
    if (foundComment.commentatorInfo.userId === command.userId) {
      await this.commentsRepo.updateComment(command.commentId, command.content);
      return true;
    } else
      throw new ForbiddenException([
        "User is not allowed to edit other user's comment",
      ]);
  }
}
