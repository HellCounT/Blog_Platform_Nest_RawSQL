import { InputCreatePostForBlogDto } from '../dto/input.create-post-for-blog.dto';
import { CommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../../blogs/blogs.repository';
import { PostsRepository } from '../../../posts/posts.repository';
import { PostDb, PostViewModelType } from '../../../posts/types/posts.types';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

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
    if (foundBlog.ownerId !== command.userId) throw new ForbiddenException();
    const newPost = new PostDb(
      uuidv4(),
      command.createPostDto.title,
      command.createPostDto.shortDescription,
      command.createPostDto.content,
      command.blogId,
      new Date(),
      foundBlog.ownerId,
      false,
      0,
      0,
      false,
    );
    return await this.postsRepo.createPost(newPost);
  }
}
