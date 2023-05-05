import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsQuery } from './posts.query';
import {
  parseQueryPagination,
  QueryParser,
} from '../application-helpers/query.parser';
import { CommentsQuery } from '../comments/comments.query';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InputCommentDto } from '../comments/dto/input-comment.dto';
import { CommentsService } from '../comments/comments.service';
import { CommentPaginatorDto } from '../comments/dto/output.comment-paginator.dto';
import { InputLikeStatusDto } from '../likes/dto/input.like-status.dto';
import { GuestGuard } from '../auth/guards/guest.guard';
import { UsersRepository } from '../users/users.repository';

@Controller('posts')
export class PostsController {
  constructor(
    protected postsService: PostsService,
    protected readonly postsQueryRepo: PostsQuery,
    protected commentsService: CommentsService,
    protected readonly commentsQueryRepo: CommentsQuery,
    protected readonly usersRepo: UsersRepository,
  ) {}
  @UseGuards(GuestGuard)
  @Get()
  async getAllPosts(@Query() query: QueryParser, @Req() req) {
    const queryParams = parseQueryPagination(query);
    return await this.postsQueryRepo.viewAllPosts(queryParams, req.user.userId);
  }
  @UseGuards(GuestGuard)
  @Get(':id')
  async getPostById(@Param('id') id: string, @Req() req) {
    return await this.postsQueryRepo.findPostById(id, req.user.userId);
  }
  @UseGuards(GuestGuard)
  @Get(':postId/comments')
  async getCommentsByPostId(
    @Param('postId') postId: string,
    @Query() query: QueryParser,
    @Req() req,
  ): Promise<CommentPaginatorDto> {
    const queryParams = parseQueryPagination(query);
    await this.postsQueryRepo.findPostById(postId, req.user.userId);
    return await this.commentsQueryRepo.findCommentsByPostId(
      postId,
      queryParams,
      req.user.userId,
    );
  }
  @UseGuards(JwtAuthGuard)
  @Post(':postId/comments')
  @HttpCode(201)
  async createComment(
    @Body() createCommentDto: InputCommentDto,
    @Req() req,
    @Param('postId') postId: string,
  ) {
    return await this.commentsService.createComment(
      createCommentDto.content,
      req.user.userId,
      postId,
    );
  }
  @UseGuards(JwtAuthGuard)
  @Put(':postId/like-status')
  @HttpCode(204)
  async updateLikeStatus(
    @Req() req,
    @Body() likeStatusDto: InputLikeStatusDto,
    @Param('postId') postId: string,
  ) {
    const foundUser = await this.usersRepo.getUserById(req.user.userId);
    if (foundUser.globalBanInfo.isBanned) throw new UnauthorizedException();
    return await this.postsService.updateLikeStatus(
      postId,
      req.user.userId,
      foundUser.accountData.login,
      likeStatusDto.likeStatus,
    );
  }
}
