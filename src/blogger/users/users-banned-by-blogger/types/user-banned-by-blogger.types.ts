export class UserBannedByBloggerDb {
  constructor(
    public blogId: string,
    public bannedUserId: string,
    public banReason: string,
    public banDate: Date,
  ) {}
}

export type UserBannedByBloggerDbJoinedType = {
  blogId: string;
  blogOwnerId: string;
  bannedUserId: string;
  bannedUserLogin: string;
  banReason: string;
  banDate: Date;
};
