import { CommandHandler } from '@nestjs/cqrs';
import { InputUpdateBlogDto } from '../dto/input.update-blog.dto';
import { BlogsRepository } from '../../../blogs/blogs.repository';

export class UpdateBlogCommand {
  constructor(
    public blogUpdateDto: InputUpdateBlogDto,
    public blogId: string,
    public userId: string,
  ) {}
}
@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase {
  constructor(protected blogsRepo: BlogsRepository) {}
  async execute(command: UpdateBlogCommand): Promise<boolean> {
    return await this.blogsRepo.updateBlog(
      command.blogId,
      command.blogUpdateDto.name,
      command.blogUpdateDto.description,
      command.blogUpdateDto.websiteUrl,
      command.userId,
    );
  }
}
