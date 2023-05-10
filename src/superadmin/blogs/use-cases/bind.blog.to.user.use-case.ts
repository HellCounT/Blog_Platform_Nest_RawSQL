import { UsersRepository } from '../../../users/users.repository';
import { BlogsRepository } from '../../../blogs/blogs.repository';
import { BadRequestException } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';

export class BindBlogToUserCommand {
  constructor(public blogId: string, public userId: string) {}
}

@CommandHandler(BindBlogToUserCommand)
export class BindBlogToUserUseCase {
  constructor(
    protected usersRepo: UsersRepository,
    protected blogsRepo: BlogsRepository,
  ) {}

  async execute(command: BindBlogToUserCommand): Promise<boolean> {
    const blog = await this.blogsRepo.getBlogById(command.blogId);
    const user = await this.usersRepo.getUserById(command.userId);
    if (!blog || !user) throw new BadRequestException(['wrong id']);
    if (blog.ownerId !== null) throw new BadRequestException(['wrong id']);
    await this.blogsRepo.bindUser(blog.id, user.id);
    return true;
  }
}
