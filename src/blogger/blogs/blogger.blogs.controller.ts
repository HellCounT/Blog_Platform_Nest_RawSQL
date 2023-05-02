import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { InputBlogCreateDto } from './dto/input.create-blog.dto';
import { CommandBus } from '@nestjs/cqrs';
import { CreateBlogCommand } from './use-cases/create.blog.use-case';
import { InputUpdateBlogDto } from './dto/input.update-blog.dto';
import { UpdateBlogCommand } from './use-cases/update.blog.use-case';
import { DeleteBlogCommand } from './use-cases/delete.blog.use-case';
import {
  parseQueryPagination,
  QueryParser,
} from '../../application-helpers/query.parser';
import { BloggerBlogsQuery } from './blogger.blogs.query';
import { InputCreatePostForBlogDto } from './dto/input.create-post-for-blog.dto';
import { CreatePostForBlogCommand } from './use-cases/create.post.for.blog.use-case';
import { InputUpdatePostDto } from './dto/input.update-post.dto';
import { UpdatePostForBlogCommand } from './use-cases/update.post.for.blog.use-case';
import { DeletePostCommand } from './use-cases/delete.post.use-case';

@UseGuards(JwtAuthGuard)
@Controller('blogger/blogs')
export class BloggerBlogsController {
  constructor(
    protected readonly bloggerBlogsQueryRepo: BloggerBlogsQuery,
    protected commandBus: CommandBus,
  ) {}
  @Get()
  @HttpCode(200)
  async getAllBlogsForBlogger(@Query() query: QueryParser, @Req() req) {
    const queryParams = parseQueryPagination(query);
    return await this.bloggerBlogsQueryRepo.getAllBlogsForBlogger(
      queryParams,
      req.user.userId,
    );
  }
  @Post()
  @HttpCode(201)
  async createBlog(@Body() blogCreateDto: InputBlogCreateDto, @Req() req) {
    return await this.commandBus.execute(
      new CreateBlogCommand(blogCreateDto, req.user.userId),
    );
  }
  @Put(':id')
  @HttpCode(204)
  async updateBlog(
    @Body() blogDataDto: InputUpdateBlogDto,
    @Param('id') blogId: string,
    @Req() req,
  ) {
    await this.commandBus.execute(
      new UpdateBlogCommand(blogDataDto, blogId, req.user.userId),
    );
    return;
  }
  @Delete(':id')
  @HttpCode(204)
  async deleteBlog(@Param('id') blogId: string, @Req() req) {
    await this.commandBus.execute(
      new DeleteBlogCommand(blogId, req.user.userId),
    );
    return;
  }
  @Post(':blogId/posts')
  @HttpCode(201)
  async createPostForBlog(
    @Param('blogId') blogId: string,
    @Body() createPostDto: InputCreatePostForBlogDto,
    @Req() req,
  ) {
    return await this.commandBus.execute(
      new CreatePostForBlogCommand(createPostDto, blogId, req.user.userId),
    );
  }
  @Put(':blogId/posts/:id')
  @HttpCode(204)
  async updatePost(
    @Param('blogId') blogId: string,
    @Param('id') postId: string,
    @Body() updatePostDto: InputUpdatePostDto,
    @Req() req,
  ) {
    await this.commandBus.execute(
      new UpdatePostForBlogCommand(
        updatePostDto,
        blogId,
        postId,
        req.user.userId,
      ),
    );
    return;
  }
  @Delete(':blogId/posts/:id')
  @HttpCode(204)
  async deletePost(
    @Param('blogId') blogId: string,
    @Param('id') postId: string,
    @Req() req,
  ) {
    await this.commandBus.execute(
      new DeletePostCommand(blogId, postId, req.user.userId),
    );
    return;
  }
  @Get('comments')
  @HttpCode(200)
  async getAllCommentsForBloggerPosts(@Req() req, @Query() query: QueryParser) {
    const queryParams = parseQueryPagination(query);
    return await this.bloggerBlogsQueryRepo.getAllCommentsForBloggerPosts(
      queryParams,
      req.user.userId,
    );
  }
}
