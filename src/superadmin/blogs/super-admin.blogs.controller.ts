import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BasicAuthGuard } from '../../auth/guards/basic-auth.guard';
import { CommandBus } from '@nestjs/cqrs';
import mongoose from 'mongoose';
import { BindBlogToUserCommand } from './use-cases/bind.blog.to.user.use-case';
import { SuperAdminBlogsQuery } from './super-admin.blogs.query';
import {
  parseQueryPagination,
  QueryParser,
} from '../../application-helpers/query.parser';
import { BanBlogCommand } from './use-cases/ban.blog.use-case';
import { InputSABanBlogDto } from './dto/input.super-admin.ban.blog.dto';

@UseGuards(BasicAuthGuard)
@Controller('sa/blogs')
export class SuperAdminBlogsController {
  constructor(
    protected commandBus: CommandBus,
    protected readonly superAdminBlogsQueryRepo: SuperAdminBlogsQuery,
  ) {}

  @Get()
  @HttpCode(200)
  async getAllBlogs(@Query() query: QueryParser) {
    const queryParams = parseQueryPagination(query);
    return await this.superAdminBlogsQueryRepo.viewAllBlogs(queryParams);
  }

  @Put(':blogId/bind-with-user/:userId')
  @HttpCode(204)
  async bindBlogToUser(
    @Param('blogId') blogId: string,
    @Param('userId') userId: string,
  ) {
    if (
      !mongoose.Types.ObjectId.isValid(blogId) ||
      !mongoose.Types.ObjectId.isValid(userId)
    )
      throw new BadRequestException(['wrong id']);
    await this.commandBus.execute(new BindBlogToUserCommand(blogId, userId));
  }
  @Put(':id/ban')
  @HttpCode(204)
  async banBlog(
    @Param('id') blogId: string,
    @Body() banBlogDto: InputSABanBlogDto,
  ) {
    await this.commandBus.execute(new BanBlogCommand(banBlogDto, blogId));
    return;
  }
}
