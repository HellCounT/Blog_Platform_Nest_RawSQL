import { CommandHandler } from '@nestjs/cqrs';
import { InputSABanBlogDto } from '../dto/input.super-admin.ban.blog.dto';
import { BlogsRepository } from '../../../blogs/blogs.repository';
import { NotFoundException } from '@nestjs/common';

export class BanBlogCommand {
  constructor(public banBlogDto: InputSABanBlogDto, public blogId: string) {}
}

@CommandHandler(BanBlogCommand)
export class BanBlogUseCase {
  constructor(protected blogsRepo: BlogsRepository) {}
  async execute(command: BanBlogCommand): Promise<boolean> {
    const blog = await this.blogsRepo.getBlogById(command.blogId);
    if (!blog) throw new NotFoundException();
    if (blog.isBanned === command.banBlogDto.isBanned) return true;
    await this.blogsRepo.banBlogById(
      command.blogId,
      command.banBlogDto.isBanned,
    );
    return true;
  }
}
