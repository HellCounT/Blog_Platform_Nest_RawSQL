import { CommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../../blogs/blogs.repository';
import { PostsRepository } from '../../../posts/posts.repository';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { LikesForPostsService } from '../../../likes/likes-for-posts.service';

export class DeletePostCommand {
  constructor(
    public blogId: string,
    public postId: string,
    public userId: string,
  ) {}
}
@CommandHandler(DeletePostCommand)
export class DeletePostUseCase {
  constructor(
    protected blogsRepo: BlogsRepository,
    protected postsRepo: PostsRepository,
    protected likesForPostsService: LikesForPostsService,
  ) {}
  async execute(command: DeletePostCommand): Promise<boolean> {
    const blog = await this.blogsRepo.getBlogById(command.blogId);
    const post = await this.postsRepo.getPostById(command.postId);
    if (!post || !blog) throw new NotFoundException();
    if (blog.ownerId !== command.userId || post.ownerId !== command.userId)
      throw new ForbiddenException();
    await this.likesForPostsService.deleteAllLikesWhenPostIsDeleted(
      command.postId,
    );
    return await this.postsRepo.deletePost(command.postId);
  }
}
