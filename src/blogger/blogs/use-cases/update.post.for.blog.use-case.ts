import { CommandHandler } from '@nestjs/cqrs';
import { InputUpdatePostDto } from '../dto/input.update-post.dto';
import { BlogsRepository } from '../../../blogs/blogs.repository';
import { PostsRepository } from '../../../posts/posts.repository';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

export class UpdatePostForBlogCommand {
  constructor(
    public updatePostDto: InputUpdatePostDto,
    public blogId: string,
    public postId: string,
    public userId: string,
  ) {}
}
@CommandHandler(UpdatePostForBlogCommand)
export class UpdatePostForBlogUseCase {
  constructor(
    protected blogsRepo: BlogsRepository,
    protected postsRepo: PostsRepository,
  ) {}
  async execute(command: UpdatePostForBlogCommand): Promise<boolean> {
    const blog = await this.blogsRepo.getBlogById(command.blogId);
    const post = await this.postsRepo.getPostById(command.postId);
    if (!post || !blog) throw new NotFoundException();
    if (blog.ownerId !== command.userId || post.ownerId !== command.userId)
      throw new ForbiddenException();
    await this.postsRepo.updatePost(
      command.postId,
      command.updatePostDto.title,
      command.updatePostDto.shortDescription,
      command.updatePostDto.content,
      command.blogId,
      blog.name,
    );
    return true;
  }
}
