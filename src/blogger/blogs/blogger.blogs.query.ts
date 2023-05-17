import { Injectable } from '@nestjs/common';
import {
  pickOrderForBlogsQuery,
  pickOrderForCommentsQuery,
  QueryParser,
} from '../../application-helpers/query.parser';
import { Blog, BlogPaginatorType } from '../../blogs/types/blogs.types';
import { BlogsQuery } from '../../blogs/blogs.query';
import {
  CommentsForBloggerViewType,
  OutputCommentsPaginatorBloggerDto,
} from './dto/output.comments.paginator.blogger.dto';
import {
  CommentLikeJoinedType,
  LikeStatus,
} from '../../likes/types/likes.types';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { PostJoinedType } from '../../posts/types/posts.types';
import { CommentJoinedType } from '../../comments/types/comments.types';

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
    const allCommentsCountResult = await this.dataSource.query(
      `
      SELECT COUNT(*)
      FROM "COMMENTS" AS c
      LEFT JOIN "POSTS" AS p
      ON c."postId" = p."id"
      LEFT JOIN "USERS" AS u
      ON p."ownerId" = u."id"
      WHERE u."id" = $1
      `,
      [userId],
    );
    const allCommentsCount = parseInt(allCommentsCountResult[0].count, 10);
    const offsetSize = (q.pageNumber - 1) * q.pageSize;
    const reqPageDbComments: CommentJoinedType[] = await this.dataSource.query(
      `
      SELECT
      c."id", c."content", c."userId", u."id" as "userLogin", c."postId", c."createdAt", c."likesCount", c."dislikesCount"
      FROM "COMMENTS" AS c
      LEFT JOIN "POSTS" AS p
      ON c."postId" = p."id"
      LEFT JOIN "USERS" AS u
      ON p."ownerId" = u."id"
      WHERE u."id" = $1
      ${pickOrderForCommentsQuery(q.sortBy, q.sortDirection)}
      LIMIT $2 OFFSET $3
      `,
      [userId, q.pageSize, offsetSize],
    );
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
    comment: CommentJoinedType,
    userId: string,
  ): Promise<CommentsForBloggerViewType> {
    const postSearchResult: PostJoinedType[] = await this.dataSource.query(
      `
        SELECT p."id", p."title", p."shortDescription", 
        p."content", p."blogId", b."name" as "blogName", p."createdAt", 
        p."ownerId", u."login" as "ownerLogin", ub."isBanned" as "ownerIsBanned", 
        p."likesCount", p."dislikesCount", b."isBanned" as "parentBlogIsBanned"
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
    const like = await this.getUserLikeForComment(userId, comment.id);
    return {
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      commentatorInfo: {
        userId: comment.userId,
        userLogin: comment.userLogin,
      },
      likesInfo: {
        likesCount: comment.likesCount,
        dislikesCount: comment.dislikesCount,
        myStatus: like?.likeStatus || LikeStatus.none,
      },
      postInfo: {
        blogId: post.blogId,
        blogName: post.blogName,
        title: post.title,
        id: comment.postId,
      },
    };
  }
  async getUserLikeForComment(
    userId: string,
    commentId: string,
  ): Promise<CommentLikeJoinedType | null> {
    try {
      const foundLikeResult: CommentLikeJoinedType[] =
        await this.dataSource.query(
          `
      SELECT lc."id", lc."commentId", lc."userId", u."login" as "userLogin",
      lc."addedAt", lc."likeStatus"
      FROM "LIKES_FOR_COMMENTS" AS lc
      LEFT JOIN "USERS" AS u
      ON lc."userId" = u."id"
      LEFT JOIN "USERS_GLOBAL_BAN" AS ub
      ON lc."userId" = ub."userId"
      WHERE (lc."commentId" = $1 AND lc."userId" = $2) AND ub."isBanned" = false
      `,
          [commentId, userId],
        );
      return foundLikeResult[0];
    } catch (e) {
      console.log(e);
      return null;
    }
  }
}
