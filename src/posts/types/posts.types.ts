import { Types } from 'mongoose';

export type PostViewModelType = {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
  extendedLikesInfo: ExtendedLikesInfoViewModelType;
};

export type LikesInfoViewModelType = {
  likesCount: number;
  dislikesCount: number;
  myStatus: string;
};

export type newestLike = {
  addedAt: string;
  userId: string;
  login: string;
};

export type ExtendedLikesInfoViewModelType = LikesInfoViewModelType & {
  newestLikes: newestLike[];
};

export class PostDb {
  constructor(
    public _id: Types.ObjectId,
    public title: string,
    public shortDescription: string,
    public content: string,
    public blogId: string,
    public blogName: string,
    public createdAt: Date,
    public postOwnerInfo: {
      userId: string;
      isBanned: boolean;
    },
    public likesInfo: {
      likesCount: number;
      dislikesCount: number;
    },
    public parentBlogIsBanned: boolean,
  ) {}
}

export type PostPaginatorType = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: PostViewModelType[];
};
