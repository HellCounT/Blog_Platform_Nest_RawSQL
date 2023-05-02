import mongoose from 'mongoose';

export enum LikeStatus {
  none = 'None',
  like = 'Like',
  dislike = 'Dislike',
}

export class CommentLikeDb {
  constructor(
    public _id: mongoose.Types.ObjectId,
    public commentId: string,
    public userId: string,
    public isBanned: boolean,
    public likeStatus: LikeStatus,
  ) {}
}

export class PostLikeDb {
  constructor(
    public _id: mongoose.Types.ObjectId,
    public postId: string,
    public userId: string,
    public userLogin: string,
    public isBanned: boolean,
    public addedAt: Date,
    public likeStatus: LikeStatus,
  ) {}
}
