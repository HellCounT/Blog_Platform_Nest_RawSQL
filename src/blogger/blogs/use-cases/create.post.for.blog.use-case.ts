import { InputCreatePostForBlogDto } from '../dto/input.create-post-for-blog.dto';
import { CommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../../blogs/blogs.repository';
import { PostsRepository } from '../../../posts/posts.repository';
import { PostDb, PostViewModelType } from '../../../posts/types/posts.types';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import mongoose from 'mongoose';

export class CreatePostForBlogCommand {
  constructor(
    public createPostDto: InputCreatePostForBlogDto,
    public blogId: string,
    public userId: string,
  ) {}
}
@CommandHandler(CreatePostForBlogCommand)
export class CreatePostForBlogUseCase {
  constructor(
    protected blogsRepo: BlogsRepository,
    protected postsRepo: PostsRepository,
  ) {}
  async execute(
    command: CreatePostForBlogCommand,
  ): Promise<PostViewModelType | null> {
    const foundBlog = await this.blogsRepo.getBlogById(command.blogId);
    if (!foundBlog) throw new NotFoundException(['wrong blog id']);
    if (foundBlog.blogOwnerInfo.userId !== command.userId)
      throw new ForbiddenException();
    const newPost = new PostDb(
      new mongoose.Types.ObjectId(),
      command.createPostDto.title,
      command.createPostDto.shortDescription,
      command.createPostDto.content,
      command.blogId,
      foundBlog.name,
      new Date(),
      {
        isBanned: false,
        userId: foundBlog.blogOwnerInfo.userId,
      },
      {
        likesCount: 0,
        dislikesCount: 0,
      },
      false,
    );
    return await this.postsRepo.createPost(newPost);
  }
}
