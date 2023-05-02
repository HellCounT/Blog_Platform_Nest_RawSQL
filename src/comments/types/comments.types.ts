import mongoose from 'mongoose';

export class CommentDb {
  constructor(
    public _id: mongoose.Types.ObjectId,
    public content: string,
    public commentatorInfo: {
      userId: string;
      userLogin: string;
      isBanned: boolean;
    },
    public postId: string,
    public bloggerId: string,
    public createdAt: string,
    public likesInfo: {
      likesCount: number;
      dislikesCount: number;
    },
  ) {}
}
