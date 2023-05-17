import { INestApplication } from '@nestjs/common';
import { setConfigNestApp } from '../../configuration.test';
import request from 'supertest';
import { commentsPath } from '../../helpers/paths';
import {
  blogsFactory,
  commentsFactory,
  postsFactory,
  usersFactory,
} from '../../helpers/factory';
import { authHeader, getBearerAccessToken } from '../../helpers/auth';

describe('Auth Controller (e2e)', () => {
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
  describe(`4. DELETE ${commentsPath}:`, () => {
    it(`4.1. Should delete comment by id, 404 on GET`, async () => {
      const user = await usersFactory.createUser();
      await usersFactory.insertUser(app, user);
      const tokenPair = await usersFactory.loginAndGetTokenPair(app, user);
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
      await request(app)
        .delete(commentsPath + '/' + commentId)
        .set(authHeader, getBearerAccessToken(tokenPair.accessToken))
        .expect(204);
    });
  });
});
