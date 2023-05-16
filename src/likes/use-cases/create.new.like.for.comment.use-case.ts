import { CommandHandler } from '@nestjs/cqrs';
import { CommentLikeDb, LikeStatus } from '../types/likes.types';
import { LikesForCommentsRepository } from '../likes-for-comments.repository';
import { v4 as uuidv4 } from 'uuid';

export class CreateNewLikeForCommentCommand {
  constructor(
    public commentId: string,
    public userId: string,
    public likeStatus: LikeStatus,
  ) {}
}

@CommandHandler(CreateNewLikeForCommentCommand)
export class CreateNewLikeForCommentUseCase {
  constructor(protected likesForCommentsRepo: LikesForCommentsRepository) {}
  async execute(command: CreateNewLikeForCommentCommand): Promise<void> {
    const newLike = new CommentLikeDb(
      uuidv4(),
      command.commentId,
      command.userId,
      false,
      command.likeStatus,
    );
    await this.likesForCommentsRepo.createNewLike(newLike);
    return;
  }
}
