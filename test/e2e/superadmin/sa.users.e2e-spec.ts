import { INestApplication } from '@nestjs/common';
import { setConfigNestApp } from '../../configuration.test';
import request from 'supertest';
import { superAdminUsersPath } from '../../helpers/paths';
import { usersFactory } from '../../helpers/factory';
import { superAdminLogin, superAdminPassword } from '../../helpers/auth';
import { UserPaginatorType } from '../../../src/users/types/users.types';

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

  describe(`1. GET ${superAdminUsersPath}:`, () => {
    it('1.1 Should return 401 if Super Admin credentials are not entered:', async () => {
      await request(app).get(superAdminUsersPath).expect(401);
    });
    it('1.2. Should return 200 and paginated created user if correct credentials are entered:', async () => {
      const user = usersFactory.createUser();
      const userId = await usersFactory.insertUser(app, user);

      const response = await request(app)
        .get(superAdminUsersPath)
        .auth(superAdminLogin, superAdminPassword)
        .expect(200);
      expect(response.body).toEqual<UserPaginatorType>({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [
          {
            id: userId,
            login: user.login,
            email: user.email,
            createdAt: expect.any(String),
          },
        ],
      });
    });
  });
});
