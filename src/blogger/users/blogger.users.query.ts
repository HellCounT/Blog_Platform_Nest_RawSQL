import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import {
  UserBannedByBlogger,
  UserBannedByBloggerDocument,
} from './users-banned-by-blogger/entity/user-banned-by-blogger.schema';
import { Blog, BlogDocument } from '../../blogs/entity/blogs.schema';
import { PaginatorType } from '../../application-helpers/paginator.type';
import { OutputBannedUserByBloggerDto } from './dto/output.user-banned-by-blogger.dto';
import { UserQueryParser } from '../../application-helpers/query.parser';

@Injectable()
export class BloggerUsersQuery {
  constructor(
    @InjectModel(UserBannedByBlogger.name)
    private userBannedByBloggerModel: Model<UserBannedByBloggerDocument>,
    @InjectModel(Blog.name) private readonly blogModel: Model<BlogDocument>,
  ) {}
  async getAllBannedUsersForBlog(
    blogId: string,
    userId: string,
    q: UserQueryParser,
  ): Promise<PaginatorType<OutputBannedUserByBloggerDto>> {
    let sortField: string;
    if (q.sortBy === 'login') sortField = 'bannedUserLogin';
    if (q.sortBy === 'id') sortField = 'bannedUserId';
    if (q.sortBy === 'banDate') sortField = 'banDate';
    const foundBlog = await this.blogModel.findOne({
      _id: new mongoose.Types.ObjectId(blogId),
    });
    if (!foundBlog) throw new NotFoundException();
    if (foundBlog.blogOwnerInfo.userId !== userId)
      throw new ForbiddenException();
    let loginFilter = '';
    if (q.searchLoginTerm) loginFilter = '.*' + q.searchLoginTerm + '.*';
    const bansCount: number =
      await this.userBannedByBloggerModel.countDocuments({
        bannedUserLogin: { $regex: loginFilter, $options: 'i' },
        blogId: blogId,
      });
    const reqPageDbBans: Array<UserBannedByBloggerDocument> =
      await this.userBannedByBloggerModel
        .find({
          bannedUserLogin: { $regex: loginFilter, $options: 'i' },
          blogId: blogId,
        })
        .sort({ [sortField]: q.sortDirection })
        .skip((q.pageNumber - 1) * q.pageSize)
        .limit(q.pageSize)
        .lean();
    const pageBannedUsers: Array<OutputBannedUserByBloggerDto> =
      reqPageDbBans.map((b) => this._mapBanToBannedUserViewType(b));
    return {
      pagesCount: Math.ceil(bansCount / q.pageSize),
      page: q.pageNumber,
      pageSize: q.pageSize,
      totalCount: bansCount,
      items: pageBannedUsers,
    };
  }
  private _mapBanToBannedUserViewType(
    bannedUserByBloggerInfo: UserBannedByBloggerDocument,
  ): OutputBannedUserByBloggerDto {
    return {
      id: bannedUserByBloggerInfo.bannedUserId,
      login: bannedUserByBloggerInfo.bannedUserLogin,
      banInfo: {
        isBanned: true,
        banDate: bannedUserByBloggerInfo.banDate.toISOString(),
        banReason: bannedUserByBloggerInfo.banReason,
      },
    };
  }
}
