import { InputCreateUserDto } from '../../src/superadmin/users/dto/input.create-user.dto';
import request from 'supertest';
import { authLoginPath, bloggerBlogsPath, superAdminUsersPath } from './paths';
import {
  authHeader,
  getBearerAccessToken,
  superAdminLogin,
  superAdminPassword,
} from './auth';
import { v4 as uuidv4 } from 'uuid';
import { correctBlog } from '../test-entities/blog.test-entities';
import { correctPost } from '../test-entities/post.test-entities';
import { correctComment } from '../test-entities/comment.test-entities';

export const blogsFactory = {
  async insertBlog(app: any, accessToken: string): Promise<string> {
    const response = await request(app)
      .post(bloggerBlogsPath)
      .set(authHeader, getBearerAccessToken(accessToken))
      .send(correctBlog);
    return response.body.id;
  },
};

export const postsFactory = {
  async insertPost(
    app: any,
    accessToken: string,
    blogId: string,
  ): Promise<string> {
    const response = await request(app)
      .post(bloggerBlogsPath + '/' + blogId + '/posts')
      .set(authHeader, getBearerAccessToken(accessToken))
      .send(correctPost);
    return response.body.id;
  },
};

export const commentsFactory = {
  async insertComment(app: any, accessToken: string, postId: string) {
    const response = await request(app)
      .post('/posts' + '/' + postId + '/comments')
      .set(authHeader, getBearerAccessToken(accessToken))
      .send(correctComment);
    return response.body.id;
  },
};

export const usersFactory = {
  createUser(): InputCreateUserDto {
    const key = uuidv4().slice(0, 4);
    return {
      login: `login` + key,
      email: 'email' + key + '@email.com',
      password: `password` + key,
    };
  },
  async insertUser(app: any, user: InputCreateUserDto): Promise<string> {
    const response = await request(app)
      .post(superAdminUsersPath)
      .auth(superAdminLogin, superAdminPassword)
      .send(user);
    return response.body.id;
  },
  async loginAndGetTokenPair(app: any, user: InputCreateUserDto) {
    const response = await request(app)
      .post(authLoginPath)
      .set('user-agent', 'test')
      .send({
        loginOrEmail: user.login,
        password: user.password,
      });
    const accessToken = response.body.accessToken;
    const cookies = response.get('Set-Cookie');
    const refreshToken = cookies[0].split(';')[0];
    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  },
};
