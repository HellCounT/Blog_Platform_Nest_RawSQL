import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtAdapter } from '../jwt.adapter';
import { UsersRepository } from '../../users/users.repository';

@Injectable()
export class GuestGuard implements CanActivate {
  constructor(
    private readonly jwtAdapter: JwtAdapter,
    private readonly usersRepo: UsersRepository,
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
    const user = await this.usersRepo.getUserById(payload.userId);
    request.user = { userId: user.id };
    return true;
  }
}
