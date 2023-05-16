import {
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  parseQueryPagination,
  QueryParser,
} from '../application-helpers/query.parser';
import { BlogsQuery } from './blogs.query';
import { PostsQuery } from '../posts/posts.query';
import { GuestGuard } from '../auth/guards/guest.guard';

@Controller('blogs')
export class BlogsController {
  constructor(
    protected readonly blogsQueryRepo: BlogsQuery,
    protected readonly postsQueryRepo: PostsQuery,
  ) {}
  @Get()
  @HttpCode(200)
  async getAllBlogs(@Query() query: QueryParser) {
    const queryParams = parseQueryPagination(query);
    return await this.blogsQueryRepo.viewAllBlogs(queryParams);
  }
  @Get(':id')
  @HttpCode(200)
  async getBlogById(@Param('id') id: string) {
    const result = await this.blogsQueryRepo.findBlogById(id);
    if (!result) throw new NotFoundException();
    return result;
  }
  @UseGuards(GuestGuard)
  @Get(':id/posts')
  @HttpCode(200)
  async getPostsForBlogId(
    @Param('id') id: string,
    @Query() query: QueryParser,
    @Req() req,
  ) {
    const queryParams = parseQueryPagination(query);
    return this.postsQueryRepo.findPostsByBlogId(
      id,
      queryParams,
      req.user.userId,
    );
  }
}
