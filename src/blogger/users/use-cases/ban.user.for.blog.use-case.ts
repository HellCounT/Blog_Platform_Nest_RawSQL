import { InputBanUserForBlogDto } from '../dto/input.ban-user-for-blog.dto';
import { CommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../users/users.repository';
import { BlogsRepository } from '../../../blogs/blogs.repository';
import { UsersBannedByBloggerRepository } from '../users-banned-by-blogger/users-banned-by-blogger.repository';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { UserBannedByBloggerDb } from '../users-banned-by-blogger/types/user-banned-by-blogger.types';
import mongoose from 'mongoose';

export class BanUserForBlogCommand {
  constructor(
    public banUserForBlogDto: InputBanUserForBlogDto,
    public userIdToBan: string,
    public blogOwnerId: string,
  ) {}
}

@CommandHandler(BanUserForBlogCommand)
export class BanUserForBlogUseCase {
  constructor(
    protected usersRepo: UsersRepository,
    protected blogsRepo: BlogsRepository,
    protected usersBannedByBloggerRepo: UsersBannedByBloggerRepository,
  ) {}
  async execute(command: BanUserForBlogCommand): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(command.userIdToBan))
      throw new NotFoundException();
    const userToBan = await this.usersRepo.getUserById(command.userIdToBan);
    const foundBlog = await this.blogsRepo.getBlogById(
      command.banUserForBlogDto.blogId,
    );
    if (command.blogOwnerId !== foundBlog.ownerId)
      throw new ForbiddenException();
    if (!userToBan || !foundBlog) throw new NotFoundException();
    const foundBan = await this.usersBannedByBloggerRepo.findUserBan(
      command.banUserForBlogDto.blogId,
      command.userIdToBan,
    );
    if (command.banUserForBlogDto.isBanned === true) {
      if (foundBan) return true;
      else {
        const banUserByBloggerInfo = new UserBannedByBloggerDb(
          command.banUserForBlogDto.blogId,
          command.userIdToBan,
          command.banUserForBlogDto.banReason,
          new Date(),
        );
        await this.usersBannedByBloggerRepo.banUser(banUserByBloggerInfo);
        return true;
      }
    }
    if (command.banUserForBlogDto.isBanned === false) {
      if (!foundBan) return true;
      else {
        await this.usersBannedByBloggerRepo.unbanUser(
          command.banUserForBlogDto.blogId,
          command.userIdToBan,
        );
        return true;
      }
    }
  }
}
