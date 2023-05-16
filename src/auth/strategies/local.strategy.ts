import { PassportStrategy } from '@nestjs/passport';
import { UnauthorizedException } from '@nestjs/common';
import { Strategy } from 'passport-local';
import { User } from '../../users/types/users.types';
import { CommandBus } from '@nestjs/cqrs';
import { ValidateUserCommand } from '../use-cases/validate.user.use-case';

export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly commandBus: CommandBus) {
    super({ usernameField: 'loginOrEmail' });
  }

  async validate(loginOrEmail: string, password: string): Promise<User> {
    const user = await this.commandBus.execute(
      new ValidateUserCommand({ loginOrEmail, password }),
    );
    if (!user) throw new UnauthorizedException();
    return user;
  }
}
