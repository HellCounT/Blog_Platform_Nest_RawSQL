export enum LikeStatus {
  none = 'None',
  like = 'Like',
  dislike = 'Dislike',
}

export class CommentLike {
  constructor(
    public id: string,
    public commentId: string,
    public userId: string,
    public addedAt: Date,
    public likeStatus: LikeStatus,
  ) {}
}

export type CommentLikeJoinedType = {
  id: string;
  commentId: string;
  userId: string;
  userLogin: string;
  addedAt: Date;
  likeStatus: LikeStatus;
};

export class PostLike {
  constructor(
    public id: string,
    public postId: string,
    public userId: string,
    public addedAt: Date,
    public likeStatus: LikeStatus,
  ) {}
}

export type PostLikeJoinedType = {
  id: string;
  postId: string;
  userId: string;
  userLogin: string;
  addedAt: Date;
  likeStatus: LikeStatus;
};
