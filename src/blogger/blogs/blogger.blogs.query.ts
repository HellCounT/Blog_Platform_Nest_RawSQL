import { Injectable } from '@nestjs/common';
import {
  pickOrderForBlogsQuery,
  QueryParser,
} from '../../application-helpers/query.parser';
import { Blog, BlogPaginatorType } from '../../blogs/types/blogs.types';
import { BlogsQuery } from '../../blogs/blogs.query';
import {
  CommentsForBloggerViewType,
  OutputCommentsPaginatorBloggerDto,
} from './dto/output.comments.paginator.blogger.dto';
import { CommentLike, LikeStatus } from '../../likes/types/likes.types';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { PostDbJoinedType } from '../../posts/types/posts.types';
import { Comment } from '../../comments/types/comments.types';

@Injectable()
export class BloggerBlogsQuery extends BlogsQuery {
  constructor(@InjectDataSource() protected dataSource: DataSource) {
    super(dataSource);
  }
  async getAllBlogsForBlogger(
    q: QueryParser,
    userId,
  ): Promise<BlogPaginatorType> {
    const allBlogsCountResult = await this.dataSource.query(
      `
      SELECT COUNT(*)
      FROM "BLOGS" AS b
      WHERE b."ownerId" = $1
      AND "name" ILIKE '%' || COALESCE($2, '') || '%'
      `,
      [userId, q.searchNameTerm],
    );
    const allBlogsCount: number = parseInt(allBlogsCountResult[0].count, 10);
    const offsetSize = (q.pageNumber - 1) * q.pageSize;
    const reqPageDbBlogs: Blog[] = await this.dataSource.query(
      `
      SELECT * FROM "BLOGS" AS b
      WHERE b."ownerId" = $1
      AND "name" ILIKE '%' || COALESCE($2, '') || '%'
      ${pickOrderForBlogsQuery(q.sortBy, q.sortDirection)}
      LIMIT $3 OFFSET $4
      `,
      [userId, q.searchNameTerm, q.pageSize, offsetSize],
    );
    const pageBlogs = reqPageDbBlogs.map((b) => this._mapBlogToViewType(b));
    return {
      pagesCount: Math.ceil(allBlogsCount / q.pageSize),
      page: q.pageNumber,
      pageSize: q.pageSize,
      totalCount: allBlogsCount,
      items: pageBlogs,
    };
  }
  async getAllCommentsForBloggerPosts(
    q: QueryParser,
    userId: string,
  ): Promise<OutputCommentsPaginatorBloggerDto> {
    const allCommentsCount = await this.commentModel.countDocuments({
      bloggerId: userId,
    });
    const reqPageDbComments = await this.commentModel
      .find({
        bloggerId: userId,
      })
      .sort({ [q.sortBy]: q.sortDirection })
      .skip((q.pageNumber - 1) * q.pageSize)
      .limit(q.pageSize)
      .lean();
    const items = [];
    for await (const c of reqPageDbComments) {
      const comment = await this._mapCommentToBloggerViewType(c, userId);
      items.push(comment);
    }
    return {
      pagesCount: Math.ceil(allCommentsCount / q.pageSize),
      page: q.pageNumber,
      pageSize: q.pageSize,
      totalCount: allCommentsCount,
      items: items,
    };
  }
  private async _mapCommentToBloggerViewType(
    comment: Comment,
    userId: string,
  ): Promise<CommentsForBloggerViewType> {
    const postSearchResult: PostDbJoinedType[] = await this.dataSource.query(
      `
        SELECT p."id", p."title", p."shortDescription", 
        p."content", p."blogId", b."name" as "blogName", p."createdAt", 
        p."ownerId", u."login" as "ownerLogin", ub."isBanned" as "ownerIsBanned", 
        p."likesCount", p."dislikesCount", p."parentBlogIsBanned"
        FROM "POSTS" as p
        JOIN "BLOGS" as b
        ON p."blogId" = b."id"
        JOIN "USERS_GLOBAL_BAN" as ub
        ON p."ownerId" = ub."userId"
        JOIN "USERS" as u
        ON p."ownerId" = u."id"
        WHERE p."id" = $1
        `,
      [comment.postId],
    );
    if (postSearchResult.length < 1) return null;
    const post = postSearchResult[0];
    const like = await this.getUserLikeForComment(
      userId,
      comment._id.toString(),
    );
    return {
      id: comment._id.toString(),
      content: comment.content,
      commentatorInfo: {
        userId: comment.commentatorInfo.userId,
        userLogin: comment.commentatorInfo.userLogin,
      },
      createdAt: comment.createdAt,
      postInfo: {
        id: comment.postId,
        title: post.title,
        blogId: post.blogId,
        blogName: post.blogName,
      },
      likesInfo: {
        likesCount: comment.likesInfo.likesCount,
        dislikesCount: comment.likesInfo.dislikesCount,
        myStatus: like?.likeStatus || LikeStatus.none,
      },
    };
  }
  async getUserLikeForComment(
    userId: string,
    commentId: string,
  ): Promise<CommentLike | null> {
    return this.likeForCommentModel.findOne({
      commentId: commentId,
      userId: userId,
      isBanned: false,
    });
  }
}
