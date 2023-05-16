import { Controller, Delete, Get, HttpCode } from '@nestjs/common';
import { AppService } from './app.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment, CommentDocument } from './comments/entity/comments.schema';
import {
  LikeForPost,
  LikeForPostDocument,
} from './likes/entity/likes-for-post.schema';
import {
  LikeForComment,
  LikeForCommentDocument,
} from './likes/entity/likes-for-comments.schema';
import {
  UserBannedByBlogger,
  UserBannedByBloggerDocument,
} from './blogger/users/users-banned-by-blogger/entity/user-banned-by-blogger.schema';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    @InjectModel(LikeForPost.name)
    private likesForPostsModel: Model<LikeForPostDocument>,
    @InjectModel(LikeForComment.name)
    private likesForCommentsModel: Model<LikeForCommentDocument>,
    @InjectModel(UserBannedByBlogger.name)
    private userBannedByBloggerModel: Model<UserBannedByBloggerDocument>,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
  @Delete('testing/all-data')
  @HttpCode(204)
  async deleteAllData() {
    await Promise.allSettled([
      this.dataSource.query(`DELETE FROM "USERS"`),
      // this.dataSource.query(`DELETE FROM "USERS_CONFIRMATIONS"`),
      // this.dataSource.query(`DELETE FROM "USERS_RECOVERY"`),
      // this.dataSource.query(`DELETE FROM "USERS_GLOBAL_BAN"`),
      // this.dataSource.query(`DELETE FROM "EXPIRED_TOKENS"`),
      // this.dataSource.query(`DELETE FROM "DEVICES"`),
      this.dataSource.query(`DELETE FROM "POSTS"`),
      this.dataSource.query(`DELETE FROM "BLOGS"`),
      this.commentModel.deleteMany({}),
      this.likesForPostsModel.deleteMany({}),
      this.likesForCommentsModel.deleteMany({}),
      this.userBannedByBloggerModel.deleteMany({}),
    ]);

    return;
  }
}
