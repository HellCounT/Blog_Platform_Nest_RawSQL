import { HttpStatus, INestApplication } from '@nestjs/common';
import { setConfigNestApp } from '../../configuration.test';
import request from 'supertest';
import { authLoginPath } from '../../helpers/paths';
import { usersFactory } from '../../helpers/factory';
import { OutputAccessTokenDto } from '../../../src/auth/dto/output.token.dto';

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
  describe(`1. POST ${authLoginPath}:`, () => {
    it(`1.1. Should return 401 if user's credentials are incorrect`, async () => {
      const user = usersFactory.createUser();
      await usersFactory.insertUser(app, user);

      await request(app)
        .post(authLoginPath)
        .send({
          loginOrEmail: user.login,
          password: 'bad_password',
        })
        .expect(HttpStatus.UNAUTHORIZED);
    });
    it(`1.2. Should return 200 with correct credentials`, async () => {
      const user = usersFactory.createUser();
      await usersFactory.insertUser(app, user);
      const response = await request(app)
        .post(authLoginPath)
        .send({
          loginOrEmail: user.login,
          password: user.password,
        })
        .expect(HttpStatus.OK);
      expect(response.body).toEqual<OutputAccessTokenDto>({
        accessToken: expect.any(String),
      });
      expect(response.headers['set-cookie'][0].split(';')[0]).toEqual(
        expect.any(String),
      );
    });
  });
});
