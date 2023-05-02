import { Injectable } from '@nestjs/common';
import { QueryParser } from '../../application-helpers/query.parser';
import { BlogPaginatorType } from '../../blogs/types/blogs.types';
import { BlogsQuery } from '../../blogs/blogs.query';
import {
  CommentsForBloggerViewType,
  OutputCommentsPaginatorBloggerDto,
} from './dto/output.comments.paginator.blogger.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from '../../posts/entity/posts.schema';
import {
  Comment,
  CommentDocument,
} from '../../comments/entity/comments.schema';
import mongoose, { Model } from 'mongoose';
import { Blog, BlogDocument } from '../../blogs/entity/blogs.schema';
import { CommentLikeDb, LikeStatus } from '../../likes/types/likes.types';
import { LikeForComment } from '../../likes/entity/likes-for-comments.schema';

@Injectable()
export class BloggerBlogsQuery extends BlogsQuery {
  constructor(
    @InjectModel(Post.name) protected postModel: Model<PostDocument>,
    @InjectModel(Comment.name) protected commentModel: Model<CommentDocument>,
    @InjectModel(Blog.name) protected blogModel: Model<BlogDocument>,
    @InjectModel(LikeForComment.name)
    protected likeForCommentModel: Model<LikeForComment>,
  ) {
    super(blogModel);
  }
  async getAllBlogsForBlogger(
    q: QueryParser,
    userId,
  ): Promise<BlogPaginatorType> {
    let filter = '';
    if (q.searchNameTerm) filter = '.*' + q.searchNameTerm + '.*';
    const allBlogsCount = await this.blogModel.countDocuments({
      name: { $regex: filter, $options: 'i' },
      'blogOwnerInfo.userId': userId,
    });
    const reqPageDbBlogs = await this.blogModel
      .find({
        name: { $regex: filter, $options: 'i' },
        'blogOwnerInfo.userId': userId,
      })
      .sort({ [q.sortBy]: q.sortDirection })
      .skip((q.pageNumber - 1) * q.pageSize)
      .limit(q.pageSize)
      .lean();
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
    comment: CommentDocument,
    userId: string,
  ): Promise<CommentsForBloggerViewType> {
    const post = await this.postModel.findOne({
      _id: new mongoose.Types.ObjectId(comment.postId),
    });
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
  ): Promise<CommentLikeDb | null> {
    return this.likeForCommentModel.findOne({
      commentId: commentId,
      userId: userId,
      isBanned: false,
    });
  }
}
