export class Comment {
  constructor(
    public id: string,
    public content: string,
    public userId: string,
    public postId: string,
    public createdAt: string,
    public likesCount: number,
    public dislikesCount: number,
  ) {}
}

export type CommentJoinedType = {
  id: string;
  content: string;
  userId: string;
  userLogin: string;
  postId: string;
  createdAt: string;
  likesCount: number;
  dislikesCount: number;
};
