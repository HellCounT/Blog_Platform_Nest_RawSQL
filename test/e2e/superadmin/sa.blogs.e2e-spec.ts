import { INestApplication } from '@nestjs/common';
import { setConfigNestApp } from '../../configuration.test';
import request from 'supertest';
import { blogsPath, superAdminBlogsPath } from '../../helpers/paths';
import { blogsFactory, usersFactory } from '../../helpers/factory';
import { superAdminLogin, superAdminPassword } from '../../helpers/auth';
import { PaginatorType } from '../../../src/application-helpers/paginator.type';
import { OutputSuperAdminBlogDto } from '../../../src/superadmin/blogs/dto/output.super-admin.blog.dto';
import { correctBlog } from '../../test-entities/blog.test-entities';
import { errorsMessageForBanBlog } from '../../test-entities/errors.test-entities';
import { BlogViewModelType } from '../../../src/blogs/types/blogs.types';

describe('Super Admin Blogs Controller (e2e)', () => {
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

  describe(`1. GET ${superAdminBlogsPath}:`, () => {
    it('1.1 Should return 401 if Super Admin credentials are not entered:', async () => {
      await request(app).get(superAdminBlogsPath).expect(401);
    });
    it('1.2. Should return 200 and paginated inserted blog if correct credentials are entered:', async () => {
      const user = usersFactory.createUser();
      const userId = await usersFactory.insertUser(app, user);
      const tokenPair = await usersFactory.loginAndGetTokenPair(app, user);
      const blogId = await blogsFactory.insertBlog(app, tokenPair.accessToken);

      const response = await request(app)
        .get(superAdminBlogsPath)
        .auth(superAdminLogin, superAdminPassword)
        .expect(200);
      expect(response.body).toEqual<PaginatorType<OutputSuperAdminBlogDto>>({
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
            blogOwnerInfo: {
              userId: userId,
              userLogin: user.login,
            },
            banInfo: {
              isBanned: false,
              banDate: null,
            },
          },
        ],
      });
    });
  });
  describe(`2. PUT ${superAdminBlogsPath}/id/bind-with-user/userId:`, () => {
    it('2.1. Should return 401 if Super Admin is not authorized', async () => {
      await request(app)
        .put(
          superAdminBlogsPath +
            '/5bf142459b72e12b2b1b2cd/bind-with-user/5bf142459b72e12b2b1b2cd',
        )
        .expect(401);
    });
    it('2.2. Should return 400 if id does not exist', async () => {
      await request(app)
        .put(
          superAdminBlogsPath +
            '/5bf142459b72e12b2b1b2cd/bind-with-user/5bf142459b72e12b2b1b2cd',
        )
        .auth(superAdminLogin, superAdminPassword)
        .expect(400);
    });
  });
  describe(`3 PUT ${superAdminBlogsPath}/id/ban:`, () => {
    it('3.1. Should return 401 if Super Admin is not authorized', async () => {
      await request(app)
        .put(superAdminBlogsPath + '/5bf142459b72e12b2b1b2cd/ban')
        .expect(401);
    });
    it('3.2. Should return 400 if input data is incorrect', async () => {
      const user = usersFactory.createUser();
      await usersFactory.insertUser(app, user);
      const tokenPair = await usersFactory.loginAndGetTokenPair(app, user);
      const blogId = await blogsFactory.insertBlog(app, tokenPair.accessToken);
      const errorMessage = await request(app)
        .put(superAdminBlogsPath + '/' + blogId + '/ban')
        .auth(superAdminLogin, superAdminPassword)
        .send({ isBanned: '' })
        .expect(400);
      expect(errorMessage.body).toEqual(errorsMessageForBanBlog);
    });
    it('3.3. Should return 204 if input data is correct', async () => {
      const user = usersFactory.createUser();
      await usersFactory.insertUser(app, user);
      const tokenPair = await usersFactory.loginAndGetTokenPair(app, user);
      const blogId = await blogsFactory.insertBlog(app, tokenPair.accessToken);

      await request(app)
        .put(superAdminBlogsPath + '/' + blogId + '/ban')
        .auth(superAdminLogin, superAdminPassword)
        .send({ isBanned: true })
        .expect(204);

      const response = await request(app).get(blogsPath).expect(200);
      expect(response.body).toEqual<PaginatorType<BlogViewModelType>>({
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: [],
      });
    });
  });
});
