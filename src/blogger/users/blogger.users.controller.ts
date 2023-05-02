import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CommandBus } from '@nestjs/cqrs';
import { InputBanUserForBlogDto } from './dto/input.ban-user-for-blog.dto';
import { BanUserForBlogCommand } from './use-cases/ban.user.for.blog.use-case';
import { BloggerUsersQuery } from './blogger.users.query';
import {
  parseUserQueryPagination,
  UserQueryParser,
} from '../../application-helpers/query.parser';

@UseGuards(JwtAuthGuard)
@Controller('blogger/users')
export class BloggerUsersController {
  constructor(
    protected readonly bloggerUsersQueryRepo: BloggerUsersQuery,
    protected commandBus: CommandBus,
  ) {}
  @Put(':id/ban')
  @HttpCode(204)
  async banUser(
    @Param('id') userId: string,
    @Body() banUserForBlogDto: InputBanUserForBlogDto,
    @Req() req,
  ) {
    await this.commandBus.execute(
      new BanUserForBlogCommand(banUserForBlogDto, userId, req.user.userId),
    );
    return;
  }
  @Get('blog/:id')
  @HttpCode(200)
  async getAllBannedUsersForBlog(
    @Param('id') blogId: string,
    @Query() query: UserQueryParser,
    @Req() req,
  ) {
    const queryParams: UserQueryParser = parseUserQueryPagination(query);
    return this.bloggerUsersQueryRepo.getAllBannedUsersForBlog(
      blogId,
      req.user.userId,
      queryParams,
    );
  }
}
