import { Injectable } from '@nestjs/common';
import {
  pickOrderForUsersQuery,
  QueryParser,
} from '../../application-helpers/query.parser';
import { BlogSAPaginatorType } from './types/super-admin.blogs.types';
import { OutputSuperAdminBlogDto } from './dto/output.super-admin.blog.dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BlogDbJoinedType } from '../../blogs/types/blogs.types';

@Injectable()
export class SuperAdminBlogsQuery {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}
  async viewAllBlogs(q: QueryParser): Promise<BlogSAPaginatorType> {
    const allBlogsCountResult = await this.dataSource.query(
      `
      SELECT COUNT(*)
      FROM "BLOGS"
      WHERE "name" ILIKE '%' || COALESCE($1, '') || '%'
      `,
      [q.searchNameTerm],
    );
    const allBlogsCount: number = parseInt(allBlogsCountResult[0].count, 10);
    const offsetSize = (q.pageNumber - 1) * q.pageSize;
    const reqPageDbBlogs: BlogDbJoinedType[] = await this.dataSource.query(
      `
      SELECT b."id", b."name", b."description", b."websiteUrl", b."createdAt",
      b."isMembership", b."ownerId", u."login" as "ownerLogin",
      ub."isBanned" as "ownerIsBanned", b."isBanned", b."banDate"
      FROM "BLOGS" AS b
      JOIN "USERS" AS u
      ON b."ownerId" = u."id"
      JOIN "USERS_GLOBAL_BAN" AS ub
      ON b."ownerId" = ub."userId"
      WHERE "name" ILIKE '%' || COALESCE($1, '') || '%'
      ${pickOrderForUsersQuery(q.sortBy, q.sortDirection)}
      LIMIT $2 OFFSET $3
      `,
      [q.searchNameTerm, q.pageSize, offsetSize],
    );
    const pageBlogs = reqPageDbBlogs.map((b) =>
      this._mapBlogToSuperAdminViewType(b),
    );
    return {
      pagesCount: Math.ceil(allBlogsCount / q.pageSize),
      page: q.pageNumber,
      pageSize: q.pageSize,
      totalCount: allBlogsCount,
      items: pageBlogs,
    };
  }
  private _mapBlogToSuperAdminViewType(
    blog: BlogDbJoinedType,
  ): OutputSuperAdminBlogDto {
    let banDateString;
    if (blog.banDate === null) banDateString = null;
    else banDateString = blog.banDate.toISOString();
    return {
      id: blog.id,
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: blog.createdAt,
      isMembership: blog.isMembership,
      blogOwnerInfo: {
        userId: blog.ownerId,
        userLogin: blog.ownerLogin,
      },
      banInfo: {
        isBanned: blog.isBanned,
        banDate: banDateString,
      },
    };
  }
}
