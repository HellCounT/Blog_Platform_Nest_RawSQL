import { LikeStatus } from '../../../likes/types/likes.types';

export class OutputCommentsPaginatorBloggerDto {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: CommentsForBloggerViewType[];
}

export type CommentsForBloggerViewType = {
  id: string;
  content: string;
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
  createdAt: string;
  postInfo: {
    id: string;
    title: string;
    blogId: string;
    blogName: string;
  };
  likesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: LikeStatus;
  };
};
