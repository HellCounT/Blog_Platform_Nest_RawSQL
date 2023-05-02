import { LikesInfoViewModelType } from '../../posts/types/posts.types';

export class CommentViewDto {
  id: string;
  content: string;
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
  createdAt: string;
  likesInfo: LikesInfoViewModelType;
}
