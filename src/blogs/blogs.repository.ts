import { BlogDb } from './types/blogs.types';
import mongoose, { Model } from 'mongoose';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument } from './entity/blogs.schema';
import { Post, PostDocument } from '../posts/entity/posts.schema';

@Injectable()
export class BlogsRepository {
  constructor(
    @InjectModel(Blog.name) private blogModel: Model<BlogDocument>,
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
  ) {}
  async getBlogById(id: string): Promise<BlogDocument> {
    return this.blogModel.findOne({
      _id: new mongoose.Types.ObjectId(id),
    });
  }
  async createBlog(newBlog: BlogDb): Promise<BlogDb> {
    const blogInstance = new this.blogModel(newBlog);
    await blogInstance.save();
    return newBlog;
  }
  async updateBlog(
    id: string,
    name: string,
    description: string,
    websiteUrl: string,
    userId: string,
  ): Promise<boolean> {
    const blogInstance = await this.blogModel.findOne({
      _id: new mongoose.Types.ObjectId(id),
    });
    if (!blogInstance) throw new NotFoundException();
    if (blogInstance.blogOwnerInfo.userId !== userId)
      throw new ForbiddenException();
    if (name) {
      blogInstance.name = name;
      await this.postModel.updateMany(
        { blogId: id },
        {
          $set: {
            blogName: name,
          },
        },
      );
    }
    if (description) blogInstance.description = description;
    if (websiteUrl) blogInstance.websiteUrl = websiteUrl;
    await blogInstance.save();
    return true;
  }
  async deleteBlog(blogId: string, userId: string): Promise<void> {
    const blog = await this.getBlogById(blogId);
    if (!blog) throw new NotFoundException();
    if (blog.blogOwnerInfo.userId !== userId) throw new ForbiddenException();
    await this.blogModel.deleteOne({
      _id: new mongoose.Types.ObjectId(blogId),
    });
    return;
  }
  async getByUserId(userId: string): Promise<BlogDocument[]> {
    return this.blogModel.find({ 'blogOwnerInfo.userId': userId });
  }
  async banByUserId(userId: string, isBanned: boolean): Promise<void> {
    await this.blogModel.updateMany(
      { 'blogOwnerInfo.userId': userId },
      { 'blogOwnerInfo.isBanned': isBanned },
    );
    return;
  }
  async banBlogById(blogId: string, isBanned: boolean): Promise<void> {
    const blogInstance = await this.getBlogById(blogId);
    blogInstance.isBanned = isBanned;
    if (isBanned) {
      blogInstance.banDate = new Date();
    } else {
      blogInstance.banDate = null;
    }
    await blogInstance.save();
    return;
  }
  async save(blog: BlogDocument): Promise<BlogDocument> {
    return await blog.save();
  }
}
