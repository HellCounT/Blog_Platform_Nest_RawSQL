import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  UserBannedByBlogger,
  UserBannedByBloggerDocument,
} from './entity/user-banned-by-blogger.schema';
import { Model } from 'mongoose';
import { UserBannedByBloggerDb } from './types/user-banned-by-blogger.types';

@Injectable()
export class UsersBannedByBloggerRepository {
  constructor(
    @InjectModel(UserBannedByBlogger.name)
    private userBannedByBloggerModel: Model<UserBannedByBloggerDocument>,
  ) {}
  async findUserBan(
    blogId: string,
    bannedUserId: string,
  ): Promise<UserBannedByBloggerDocument> {
    return this.userBannedByBloggerModel.findOne({
      blogId: blogId,
      bannedUserId: bannedUserId,
    });
  }
  async banUser(banUserByBloggerInfo: UserBannedByBloggerDb): Promise<void> {
    const banUserByBloggerInstance = new this.userBannedByBloggerModel(
      banUserByBloggerInfo,
    );
    await banUserByBloggerInstance.save();
    return;
  }
  async unbanUser(blogId: string, bannedUserId: string): Promise<boolean> {
    const result = await this.userBannedByBloggerModel.deleteOne({
      blogId: blogId,
      bannedUserId: bannedUserId,
    });
    return result.deletedCount === 1;
  }
}
