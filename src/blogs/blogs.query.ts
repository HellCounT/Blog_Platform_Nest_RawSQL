import { QueryParser } from '../application-helpers/query.parser';
import { BlogPaginatorType, BlogViewModelType } from './types/blogs.types';
import mongoose, { Model } from 'mongoose';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument } from './entity/blogs.schema';

@Injectable()
export class BlogsQuery {
  constructor(
    @InjectModel(Blog.name) protected blogModel: Model<BlogDocument>,
  ) {}
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
  async findBlogById(id: string): Promise<BlogViewModelType> {
    const foundBlogInstance = await this.blogModel
      .findOne({
        _id: new mongoose.Types.ObjectId(id),
        isBanned: false,
      })
      .lean();
    if (foundBlogInstance) return this._mapBlogToViewType(foundBlogInstance);
    else throw new NotFoundException();
  }
  _mapBlogToViewType(blog: BlogDocument): BlogViewModelType {
    return {
      id: blog._id.toString(),
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: blog.createdAt,
      isMembership: blog.isMembership,
    };
  }
}
