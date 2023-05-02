import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtAdapter } from '../jwt.adapter';
import { UsersQuery } from '../../users/users.query';

@Injectable()
export class GuestGuard implements CanActivate {
  constructor(
    private readonly usersQueryRepo: UsersQuery,
    private readonly jwtAdapter: JwtAdapter,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeaders = request.headers.authorization;
    if (!authHeaders) {
      request.user = {
        userId: '',
      };
      return true;
    }
    const authorization = authHeaders.split(' ');
    if (authorization[0] !== 'Bearer') {
      request.user = {
        userId: '',
      };
      return true;
    }
    const payload = this.jwtAdapter.parseTokenPayload(authorization[1]);
    if (!payload) {
      request.user = {
        userId: '',
      };
      return true;
    }
    const user = await this.usersQueryRepo.findUserById(
      payload.userId.toString(),
    );
    request.user = { userId: user._id.toString() };
    return true;
  }
}
