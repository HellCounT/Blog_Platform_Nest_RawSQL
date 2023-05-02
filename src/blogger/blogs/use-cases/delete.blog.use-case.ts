import { CommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../../blogs/blogs.repository';

export class DeleteBlogCommand {
  constructor(public blogId: string, public userId: string) {}
}
@CommandHandler(DeleteBlogCommand)
export class DeleteBlogUseCase {
  constructor(protected blogsRepo: BlogsRepository) {}
  async execute(command: DeleteBlogCommand): Promise<boolean> {
    await this.blogsRepo.deleteBlog(command.blogId, command.userId);
    return true;
  }
}
