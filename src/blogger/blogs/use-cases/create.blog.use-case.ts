import { CommandHandler } from '@nestjs/cqrs';
import { InputBlogCreateDto } from '../dto/input.create-blog.dto';
import { BlogsRepository } from '../../../blogs/blogs.repository';
import { Blog, BlogViewModelType } from '../../../blogs/types/blogs.types';
import { v4 as uuidv4 } from 'uuid';
import { UsersRepository } from '../../../users/users.repository';
import { UnauthorizedException } from '@nestjs/common';

export class CreateBlogCommand {
  constructor(
    public blogCreateDto: InputBlogCreateDto,
    public userId: string,
  ) {}
}
@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase {
  constructor(
    protected blogsRepo: BlogsRepository,
    protected usersRepo: UsersRepository,
  ) {}
  async execute(command: CreateBlogCommand): Promise<BlogViewModelType> {
    const user = await this.usersRepo.getUserById(command.userId);
    if (!user) throw new UnauthorizedException(['wrong user id']);
    const newBlog = new Blog(
      uuidv4(),
      command.blogCreateDto.name,
      command.blogCreateDto.description,
      command.blogCreateDto.websiteUrl,
      new Date().toISOString(),
      false,
      command.userId,
      false,
      null,
    );
    const result = await this.blogsRepo.createBlog(newBlog);
    return {
      id: result.id,
      name: result.name,
      description: result.description,
      websiteUrl: result.websiteUrl,
      createdAt: result.createdAt,
      isMembership: result.isMembership,
    };
  }
}
