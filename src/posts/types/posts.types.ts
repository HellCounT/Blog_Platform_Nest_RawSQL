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
    public id: string,
    public title: string,
    public shortDescription: string,
    public content: string,
    public blogId: string,
    public createdAt: Date,
    public ownerId: string,
    public ownerIsBanned: boolean,
    public likesCount: number,
    public dislikesCount: number,
    public parentBlogIsBanned: boolean,
  ) {}
}

export type PostDbWithBlogNameType = {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: Date;
  ownerId: string;
  ownerIsBanned: boolean;
  likesCount: number;
  dislikesCount: number;
  parentBlogIsBanned: boolean;
};

export type PostPaginatorType = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: PostViewModelType[];
};
