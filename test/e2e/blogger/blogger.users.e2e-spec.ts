import { INestApplication } from '@nestjs/common';
import { setConfigNestApp } from '../../configuration.test';
import request from 'supertest';
import { bloggerUsersPath } from '../../helpers/paths';
import { blogsFactory, usersFactory } from '../../helpers/factory';
import { InputBanUserForBlogDto } from '../../../src/blogger/users/dto/input.ban-user-for-blog.dto';
import {
  correctUserBanByBlogger,
  correctUserUnbanByBlogger,
} from '../../test-entities/blogger.user.test-entities';
import { authHeader, getBearerAccessToken } from '../../helpers/auth';
import { PaginatorType } from '../../../src/application-helpers/paginator.type';
import { OutputBannedUserByBloggerDto } from '../../../src/blogger/users/dto/output.user-banned-by-blogger.dto';

describe('Blogger Users Controller (e2e)', () => {
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

  describe(`1. GET ${bloggerUsersPath}:`, () => {
    it('1.1. Should return 401 if blogger is not authorized', async () => {
      await request(app)
        .get(bloggerUsersPath + '/blog/5bf142459b72e12b2b1b2cd')
        .expect(401);
    });
    it('1.2. Should ban user2 for blog by user and return 204, then return 200 and one banned user, then unban and return no banned users', async () => {
      const user = usersFactory.createUser();
      await usersFactory.insertUser(app, user);
      const tokenPair = await usersFactory.loginAndGetTokenPair(app, user);
      const blogId = await blogsFactory.insertBlog(app, tokenPair.accessToken);
      const user2 = usersFactory.createUser();
      const user2Id = await usersFactory.insertUser(app, user2);
      const banUserForBlogDto: InputBanUserForBlogDto = {
        ...correctUserBanByBlogger,
        blogId: blogId,
      };
      const unbanUserForBlogDto: InputBanUserForBlogDto = {
        ...correctUserUnbanByBlogger,
        blogId: blogId,
      };

      await request(app)
        .put(bloggerUsersPath + '/' + user2Id + '/ban')
        .set(authHeader, getBearerAccessToken(tokenPair.accessToken))
        .send(banUserForBlogDto)
        .expect(204);
      const response = await request(app)
        .get(bloggerUsersPath + '/blog' + '/' + blogId)
        .set(authHeader, getBearerAccessToken(tokenPair.accessToken))
        .expect(200);
      expect(response.body).toEqual<
        PaginatorType<OutputBannedUserByBloggerDto>
      >({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [
          {
            id: user2Id,
            login: user2.login,
            banInfo: {
              isBanned: banUserForBlogDto.isBanned,
              banDate: expect.any(String),
              banReason: banUserForBlogDto.banReason,
            },
          },
        ],
      });
      await request(app)
        .put(bloggerUsersPath + '/' + user2Id + '/ban')
        .set(authHeader, getBearerAccessToken(tokenPair.accessToken))
        .send(unbanUserForBlogDto)
        .expect(204);
      const response2 = await request(app)
        .get(bloggerUsersPath + '/blog' + '/' + blogId)
        .set(authHeader, getBearerAccessToken(tokenPair.accessToken))
        .expect(200);
      expect(response2.body).toEqual<
        PaginatorType<OutputBannedUserByBloggerDto>
      >({
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: [],
      });
    });
    it('1.3. Should return 404 if id from uri param not found', async () => {
      const user = usersFactory.createUser();
      const incorrectUserId = '5bf142459b72e12b2b1b2cd';
      await usersFactory.insertUser(app, user);
      const tokenPair = await usersFactory.loginAndGetTokenPair(app, user);
      const blogId = await blogsFactory.insertBlog(app, tokenPair.accessToken);
      const banUserForBlogDto: InputBanUserForBlogDto = {
        ...correctUserBanByBlogger,
        blogId: blogId,
      };
      await request(app)
        .put(bloggerUsersPath + '/' + incorrectUserId + '/ban')
        .set(authHeader, getBearerAccessToken(tokenPair.accessToken))
        .send(banUserForBlogDto)
        .expect(404);
    });
  });
});
