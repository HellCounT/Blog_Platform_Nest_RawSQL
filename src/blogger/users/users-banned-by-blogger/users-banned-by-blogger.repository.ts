import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  UserBannedByBlogger,
  UserBannedByBloggerDocument,
} from './entity/user-banned-by-blogger.schema';
import { Model } from 'mongoose';
import { UserBannedByBloggerDb } from './types/user-banned-by-blogger.types';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class UsersBannedByBloggerRepository {
  constructor(
    @InjectModel(UserBannedByBlogger.name)
    private userBannedByBloggerModel: Model<UserBannedByBloggerDocument>,
    @InjectDataSource() protected dataSource: DataSource,
  ) {}
  async findUserBan(
    blogId: string,
    bannedUserId: string,
  ): Promise<UserBannedByBloggerDb> {
    try {
      const findUserBanResult: UserBannedByBloggerDb[] =
        await this.dataSource.query(
          `
      SELECT * FROM "BANNED_USERS_BY_BLOGGERS" as bu
      WHERE bu."blogId" = $1 AND bu."bannedUserId" = $2
      `,
          [blogId, bannedUserId],
        );
      return findUserBanResult[0];
    } catch (e) {
      console.log(e);
      return null;
    }
  }
  async banUser(banUserByBloggerInfo: UserBannedByBloggerDb): Promise<void> {
    try {
      await this.dataSource.query(
        `
        INSERT INTO "BANNED_USERS_BY_BLOGGERS"
        ("blogId", "bannedUserId", "banReason", "banDate")
        VALUES ($1, $2, $3, $4)
        `,
        [
          banUserByBloggerInfo.blogId,
          banUserByBloggerInfo.bannedUserId,
          banUserByBloggerInfo.banReason,
          banUserByBloggerInfo.banDate,
        ],
      );
    } catch (e) {
      console.log(e);
      return;
    }
  }
  async unbanUser(blogId: string, bannedUserId: string): Promise<boolean> {
    try {
      const result = await this.dataSource.query(
        `
DELETE FROM "BANNED_USERS_BY_BLOGGERS" AS bu
WHERE bu."blogId" = $1 AND bu."bannedUserId" = $2
        `,
        [blogId, bannedUserId],
      );
      return result[1] > 0;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
}
