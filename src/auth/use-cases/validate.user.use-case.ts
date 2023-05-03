import { CommandHandler } from '@nestjs/cqrs';
import { InputLoginUserDto } from '../dto/input.login.dto';
import { UsersRepository } from '../../users/users.repository';
import bcrypt from 'bcrypt';
import { UserDb } from '../../users/types/users.types';

export class ValidateUserCommand {
  constructor(public userLoginDto: InputLoginUserDto) {}
}
@CommandHandler(ValidateUserCommand)
export class ValidateUserUseCase {
  constructor(private readonly usersRepo: UsersRepository) {}
  async execute(command: ValidateUserCommand): Promise<UserDb | null> {
    const foundUser = await this.usersRepo.findByLoginOrEmail(
      command.userLoginDto.loginOrEmail,
    );
    if (!foundUser || foundUser.globalBanInfo.isBanned) return null;
    if (!foundUser.emailConfirmationData.isConfirmed) return null;
    else {
      if (
        await bcrypt.compare(
          command.userLoginDto.password,
          foundUser.accountData.hash,
        )
      )
        return foundUser;
      else return null;
    }
  }
}
