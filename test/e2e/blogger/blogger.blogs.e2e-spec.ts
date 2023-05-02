import { INestApplication } from '@nestjs/common';
import { setConfigNestApp } from '../../configuration.test';
import request from 'supertest';
import { bloggerBlogsPath } from '../../helpers/paths';
import {
  blogsFactory,
  commentsFactory,
  postsFactory,
  usersFactory,
} from '../../helpers/factory';
import { authHeader, getBearerAccessToken } from '../../helpers/auth';
import { PaginatorType } from '../../../src/application-helpers/paginator.type';
import { OutputSuperAdminBlogDto } from '../../../src/superadmin/blogs/dto/output.super-admin.blog.dto';
import {
  correctBlog,
  incorrectBlog,
} from '../../test-entities/blog.test-entities';
import { BlogViewModelType } from '../../../src/blogs/types/blogs.types';
import { errorsMessageForIncorrectBlog } from '../../test-entities/errors.test-entities';
import { correctComment } from '../../test-entities/comment.test-entities';
import { correctPost } from '../../test-entities/post.test-entities';
import { LikeStatus } from '../../../src/likes/types/likes.types';
import { CommentsForBloggerViewType } from '../../../src/blogger/blogs/dto/output.comments.paginator.blogger.dto';

describe('Blogger Blogs Controller (e2e)', () => {
  jest.setTimeout(10000);
  let nestApp: INestApplication;
  let app: any;

  beforeAll(async () => {
    nestApp = await setConfigNestApp();
    await nestApp.init();
    app = nestApp.getHttpServer();
  });

  afterAll(async () => {
    await nestApp.close();
  });

  beforeEach(async () => {
    await request(app).delete('/testing/all-data');
  });

  describe(`1. GET ${bloggerBlogsPath}:`, () => {
    it('1.1. Should return 401 if blogger is not authorized', async () => {
      await request(app).get(bloggerBlogsPath).expect(401);
    });
    it('1.2. Should return 200 and empty array if blogger is authorized', async () => {
      const user = usersFactory.createUser();
      await usersFactory.insertUser(app, user);
      const tokenPair = await usersFactory.loginAndGetTokenPair(app, user);
      const response = await request(app)
        .get(bloggerBlogsPath)
        .set(authHeader, getBearerAccessToken(tokenPair.accessToken))
        .expect(200);
      expect(response.body).toEqual<PaginatorType<OutputSuperAdminBlogDto>>({
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: [],
      });
    });
    it('1.3. Should return 200 and created blog by user', async () => {
      const user = usersFactory.createUser();
      await usersFactory.insertUser(app, user);
      const tokenPair = await usersFactory.loginAndGetTokenPair(app, user);
      const blogId = await blogsFactory.insertBlog(app, tokenPair.accessToken);

      const response = await request(app)
        .get(bloggerBlogsPath)
        .set(authHeader, getBearerAccessToken(tokenPair.accessToken))
        .expect(200);
      expect(response.body).toEqual<PaginatorType<BlogViewModelType>>({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [
          {
            id: blogId,
            ...correctBlog,
            isMembership: false,
            createdAt: expect.any(String),
          },
        ],
      });
    });
  });
  describe(`2. POST ${bloggerBlogsPath}:`, () => {
    it('2.1. Should return 401 if blogger is authorized', async () => {
      await request(app).post(bloggerBlogsPath).send(correctBlog).expect(401);
    });
    it('2.2. Should return 400 if input blog data is incorrect', async () => {
      const user = usersFactory.createUser();
      await usersFactory.insertUser(app, user);
      const tokenPair = await usersFactory.loginAndGetTokenPair(app, user);

      const errorsMessages = await request(app)
        .post(bloggerBlogsPath)
        .set(authHeader, getBearerAccessToken(tokenPair.accessToken))
        .send(incorrectBlog)
        .expect(400);
      expect(errorsMessages.body).toEqual(errorsMessageForIncorrectBlog);
    });
    it('2.3. Should return created blog and 201', async () => {
      const user = usersFactory.createUser();
      await usersFactory.insertUser(app, user);
      const tokenPair = await usersFactory.loginAndGetTokenPair(app, user);

      const response = await request(app)
        .post(bloggerBlogsPath)
        .set(authHeader, getBearerAccessToken(tokenPair.accessToken))
        .send(correctBlog)
        .expect(201);
      expect(response.body).toEqual<BlogViewModelType>({
        id: expect.any(String),
        ...correctBlog,
        isMembership: false,
        createdAt: expect.any(String),
      });
    });
  });
  describe(`3. GET ${bloggerBlogsPath}/comments:`, () => {
    it('3.1. Should return 401 if blogger is not authorized', async () => {
      await request(app)
        .get(bloggerBlogsPath + '/comments')
        .expect(401);
    });
    it('3.2. Should return 200 and 2 comments for blog (by user1 and user2)', async () => {
      const user = usersFactory.createUser();
      const user2 = usersFactory.createUser();
      const userId = await usersFactory.insertUser(app, user);
      const user2Id = await usersFactory.insertUser(app, user2);

      const tokenPair = await usersFactory.loginAndGetTokenPair(app, user);
      const tokenPair2 = await usersFactory.loginAndGetTokenPair(app, user2);

      const blogId = await blogsFactory.insertBlog(app, tokenPair.accessToken);
      const postId = await postsFactory.insertPost(
        app,
        tokenPair.accessToken,
        blogId,
      );
      const commentId = await commentsFactory.insertComment(
        app,
        tokenPair.accessToken,
        postId,
      );
      const comment2Id = await commentsFactory.insertComment(
        app,
        tokenPair2.accessToken,
        postId,
      );
      const response = await request(app)
        .get(bloggerBlogsPath + '/comments')
        .set(authHeader, getBearerAccessToken(tokenPair.accessToken))
        .expect(200);
      expect(response.body).toEqual<PaginatorType<CommentsForBloggerViewType>>({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 2,
        items: [
          {
            id: comment2Id,
            content: correctComment.content,
            commentatorInfo: {
              userId: user2Id,
              userLogin: user2.login,
            },
            createdAt: expect.any(String),
            postInfo: {
              id: postId,
              title: correctPost.title,
              blogId: blogId,
              blogName: correctBlog.name,
            },
            likesInfo: {
              likesCount: 0,
              dislikesCount: 0,
              myStatus: LikeStatus.none,
            },
          },
          {
            id: commentId,
            content: correctComment.content,
            commentatorInfo: {
              userId: userId,
              userLogin: user.login,
            },
            createdAt: expect.any(String),
            postInfo: {
              id: postId,
              title: correctPost.title,
              blogId: blogId,
              blogName: correctBlog.name,
            },
            likesInfo: {
              likesCount: 0,
              dislikesCount: 0,
              myStatus: LikeStatus.none,
            },
          },
        ],
      });
    });
  });
});
