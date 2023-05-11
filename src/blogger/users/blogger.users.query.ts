import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PaginatorType } from '../../application-helpers/paginator.type';
import { OutputBannedUserByBloggerDto } from './dto/output.user-banned-by-blogger.dto';
import {
  pickOrderForBannedByBloggerUsersQuery,
  UserQueryParser,
} from '../../application-helpers/query.parser';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BlogDb } from '../../blogs/types/blogs.types';
import { UserBannedByBloggerDbJoinedType } from './users-banned-by-blogger/types/user-banned-by-blogger.types';

@Injectable()
export class BloggerUsersQuery {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}
  async getAllBannedUsersForBlog(
    blogId: string,
    userId: string,
    q: UserQueryParser,
  ): Promise<PaginatorType<OutputBannedUserByBloggerDto>> {
    const foundBlogResult: BlogDb[] = await this.dataSource.query(
      `
      SELECT * FROM "BLOGS"
      WHERE "id" = $1
      `,
      [blogId],
    );
    if (foundBlogResult.length === 0) throw new NotFoundException();
    if (foundBlogResult[0].ownerId !== userId) throw new ForbiddenException();
    const bansCountResult = await this.dataSource.query(
      `
      SELECT COUNT(*)
      FROM "BANNED_USERS_BY_BLOGGERS" AS bu
      LEFT JOIN "USERS" AS u
      ON bu."bannedUserId" = u."id"
      WHERE u."login" ILIKE '%' || COALESCE($1, '') || '%'
      AND bu."blogId" = $2
      `,
      [q.searchLoginTerm, blogId],
    );
    const bansCount: number = parseInt(bansCountResult[0].count, 10);
    const offsetSize = (q.pageNumber - 1) * q.pageSize;
    const reqPageDbBans: UserBannedByBloggerDbJoinedType[] =
      await this.dataSource.query(
        `
      SELECT bu."blogId", bu."bannedUserId", u."login" as "bannedUserLogin",
      bu."banReason", bu."banDate"
      FROM "BANNED_USERS_BY_BLOGGERS" AS bu
      LEFT JOIN "USERS" AS u
      ON bu."bannedUserId" = u."id"
      WHERE u."login" ILIKE '%' || COALESCE($1, '') || '%'
      AND bu."blogId" = $2
      ${pickOrderForBannedByBloggerUsersQuery(q.sortBy, q.sortDirection)}
      LIMIT $3 OFFSET $4
      `,
        [q.searchLoginTerm, blogId, q.pageSize, offsetSize],
      );
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
    bannedUserByBloggerInfo: UserBannedByBloggerDbJoinedType,
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
