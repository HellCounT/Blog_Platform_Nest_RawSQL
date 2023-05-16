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

export class PostLike {
  constructor(
    public id: string,
    public postId: string,
    public userId: string,
    public addedAt: Date,
    public likeStatus: LikeStatus,
  ) {}
}
