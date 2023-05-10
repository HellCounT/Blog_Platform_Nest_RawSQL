import { QueryParser } from '../application-helpers/query.parser';
import {
  BlogDb,
  BlogPaginatorType,
  BlogViewModelType,
} from './types/blogs.types';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class BlogsQuery {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}
  async viewAllBlogs(q: QueryParser): Promise<BlogPaginatorType> {
    let filter = '';
    if (q.searchNameTerm) filter = '.*' + q.searchNameTerm + '.*';
    const allBlogsCount = await this.blogModel.countDocuments({
      name: { $regex: filter, $options: 'i' },
      isBanned: false,
    });
    const reqPageDbBlogs = await this.blogModel
      .find({
        name: { $regex: filter, $options: 'i' },
        isBanned: false,
      })
      .sort({ [q.sortBy]: q.sortDirection })
      .skip((q.pageNumber - 1) * q.pageSize)
      .limit(q.pageSize)
      .lean();
    const pageBlogs = reqPageDbBlogs.map((b) => this._mapBlogToViewType(b));
    return {
      pagesCount: Math.ceil(allBlogsCount / q.pageSize),
      page: q.pageNumber,
      pageSize: q.pageSize,
      totalCount: allBlogsCount,
      items: pageBlogs,
    };
  }
  async findBlogById(blogId: string): Promise<BlogViewModelType> {
    const foundBlogResult: BlogDb[] = await this.dataSource.query(
      `
      SELECT * FROM "BLOGS"
      WHERE "id" = $1
      `,
      [blogId],
    );
    if (foundBlogResult.length === 1)
      return this._mapBlogToViewType(foundBlogResult[0]);
    else throw new NotFoundException();
  }
  _mapBlogToViewType(blog: BlogDb): BlogViewModelType {
    return {
      id: blog.id,
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: blog.createdAt,
      isMembership: blog.isMembership,
    };
  }
}
