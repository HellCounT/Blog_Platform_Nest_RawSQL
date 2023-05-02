export class UserBannedByBloggerDb {
  constructor(
    public blogId: string,

    public blogOwnerId: string,

    public bannedUserId: string,
    public bannedUserLogin: string,

    public banReason: string,

    public banDate: Date,
  ) {}
}
