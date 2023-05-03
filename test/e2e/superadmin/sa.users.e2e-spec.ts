import { INestApplication } from '@nestjs/common';
import { setConfigNestApp } from '../../configuration.test';
import request from 'supertest';
import { superAdminUsersPath } from '../../helpers/paths';
import { usersFactory } from '../../helpers/factory';
import { superAdminLogin, superAdminPassword } from '../../helpers/auth';
import { PaginatorType } from '../../../src/application-helpers/paginator.type';
import { OutputSuperAdminUserDto } from '../../../src/superadmin/users/dto/output.super-admin.user.dto';
import { InputCreateUserDto } from '../../../src/superadmin/users/dto/input.create-user.dto';

describe('Super Admin Users Controller (e2e)', () => {
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
  describe(`1. POST ${superAdminUsersPath}:`, () => {
    it('1.1. Should return 401 if Super Admin credentials are not entered:', async () => {
      await request(app).post(superAdminUsersPath).expect(401);
    });
    it('1.2. Should return 201 if user created:', async () => {
      const user = usersFactory.createUser();

      const response = await request(app)
        .post(superAdminUsersPath)
        .auth(superAdminLogin, superAdminPassword)
        .send(user)
        .expect(201);
      expect(response.body).toEqual<OutputSuperAdminUserDto>({
        id: expect.any(String),
        login: user.login,
        email: user.email,
        createdAt: expect.any(String),
        banInfo: {
          banDate: null,
          banReason: null,
          isBanned: false,
        },
      });
    });
    it('1.3. Should return 400 if user login already exists:', async () => {
      const user = usersFactory.createUser();
      await usersFactory.insertUser(app, user);
      const existingUser: InputCreateUserDto = {
        login: user.login,
        email: 'test@test.com',
        password: 'test_password',
      };
      await request(app)
        .post(superAdminUsersPath)
        .auth(superAdminLogin, superAdminPassword)
        .send(existingUser)
        .expect(400);
    });
  });

  describe(`1. GET ${superAdminUsersPath}:`, () => {
    it('2.1 Should return 401 if Super Admin credentials are not entered:', async () => {
      await request(app).get(superAdminUsersPath).expect(401);
    });
    it('2.2. Should return 200 and paginated created user if correct credentials are entered:', async () => {
      const user = usersFactory.createUser();
      const userId = await usersFactory.insertUser(app, user);

      const response = await request(app)
        .get(superAdminUsersPath)
        .auth(superAdminLogin, superAdminPassword)
        .expect(200);
      expect(response.body).toEqual<PaginatorType<OutputSuperAdminUserDto>>({
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
            banInfo: {
              banDate: null,
              banReason: null,
              isBanned: false,
            },
          },
        ],
      });
    });
  });
});
