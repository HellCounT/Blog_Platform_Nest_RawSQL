import { PostDb, PostViewModelType } from './types/posts.types';
import mongoose, { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from './entity/posts.schema';
import { Blog, BlogDocument } from '../blogs/entity/blogs.schema';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(Blog.name) private blogModel: Model<BlogDocument>,
  ) {}
  async getPostById(postId: string): Promise<PostDocument> {
    return this.postModel.findOne({ _id: new mongoose.Types.ObjectId(postId) });
  }
  async createPost(newPost: PostDb): Promise<PostViewModelType | null> {
    const postInstance = new this.postModel(newPost);
    const saveResult = await postInstance.save();
    return {
      id: saveResult._id.toString(),
      title: saveResult.title,
      shortDescription: saveResult.shortDescription,
      content: saveResult.content,
      blogId: saveResult.blogId,
      blogName: saveResult.blogName,
      createdAt: saveResult.createdAt.toISOString(),
      extendedLikesInfo: {
        likesCount: saveResult.likesInfo.likesCount,
        dislikesCount: saveResult.likesInfo.dislikesCount,
        myStatus: 'None',
        newestLikes: [],
      },
    };
  }
  async updatePost(
    inputId: string,
    postTitle: string,
    short: string,
    text: string,
    blogId: string,
    blogName: string,
  ): Promise<boolean | null> {
    const postInstance = await this.postModel.findOne({
      _id: new mongoose.Types.ObjectId(inputId),
    });
    postInstance.title = postTitle;
    postInstance.shortDescription = short;
    postInstance.content = text;
    postInstance.blogId = blogId;
    postInstance.blogName = blogName;
    await postInstance.save();
    return true;
  }
  async deletePost(inputId: string): Promise<boolean> {
    const deleteResult = await this.postModel.deleteOne({
      _id: new mongoose.Types.ObjectId(inputId),
    });
    return deleteResult.deletedCount === 1;
  }
  async updateLikesCounters(
    newLikesCount: number,
    newDislikesCount: number,
    postId: string,
  ) {
    const postInstance = await this.postModel.findOne({
      _id: new mongoose.Types.ObjectId(postId),
    });
    if (postInstance) {
      postInstance.likesInfo.likesCount = newLikesCount;
      postInstance.likesInfo.dislikesCount = newDislikesCount;
      await postInstance.save();
      return;
    } else return;
  }
  async getByUserId(userId: string): Promise<PostDocument[]> {
    return this.postModel.find({ 'postOwnerInfo.userId': userId });
  }
  async banByUserId(userId: string, isBanned: boolean): Promise<void> {
    await this.postModel.updateMany(
      { 'postOwnerInfo.userId': userId },
      { 'postOwnerInfo.isBanned': isBanned },
    );
    return;
  }
  async banByBlogId(blogId: string, isBanned: boolean): Promise<void> {
    await this.postModel.updateMany(
      { blogId: blogId },
      { parentBlogIsBanned: isBanned },
    );
    return;
  }
}
