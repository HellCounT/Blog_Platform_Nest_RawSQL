import { Controller, Delete, Get, HttpCode } from '@nestjs/common';
import { AppService } from './app.service';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument } from './blogs/entity/blogs.schema';
import { Model } from 'mongoose';
import { Post, PostDocument } from './posts/entity/posts.schema';
import { User, UserDocument } from './users/entity/users.schema';
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
  ExpiredToken,
  ExpiredTokenDocument,
} from './security/tokens/entity/expiredTokenSchema';
import {
  UserBannedByBlogger,
  UserBannedByBloggerDocument,
} from './blogger/users/users-banned-by-blogger/entity/user-banned-by-blogger.schema';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @InjectModel(Blog.name) private blogModel: Model<BlogDocument>,
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    @InjectModel(LikeForPost.name)
    private likesForPostsModel: Model<LikeForPostDocument>,
    @InjectModel(LikeForComment.name)
    private likesForCommentsModel: Model<LikeForCommentDocument>,
    @InjectModel(ExpiredToken.name)
    private expiredTokensModel: Model<ExpiredTokenDocument>,
    @InjectModel(UserBannedByBlogger.name)
    private userBannedByBloggerModel: Model<UserBannedByBloggerDocument>,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
  @Delete('testing/all-data')
  @HttpCode(204)
  async deleteAllData() {
    await this.blogModel.deleteMany({});
    await this.postModel.deleteMany({});
    await this.commentModel.deleteMany({});
    await this.userModel.deleteMany({});
    await this.likesForPostsModel.deleteMany({});
    await this.likesForCommentsModel.deleteMany({});
    await this.expiredTokensModel.deleteMany({});
    await this.userBannedByBloggerModel.deleteMany({});
    return;
  }
}
