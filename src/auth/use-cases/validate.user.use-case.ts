import { CommandHandler } from '@nestjs/cqrs';
import { InputLoginUserDto } from '../dto/input.login.dto';
import { UsersRepository } from '../../users/users.repository';
import { UserDocument } from '../../users/entity/users.schema';
import bcrypt from 'bcrypt';

export class ValidateUserCommand {
  constructor(public userLoginDto: InputLoginUserDto) {}
}
@CommandHandler(ValidateUserCommand)
export class ValidateUserUseCase {
  constructor(private readonly usersRepo: UsersRepository) {}
  async execute(command: ValidateUserCommand): Promise<UserDocument | null> {
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
