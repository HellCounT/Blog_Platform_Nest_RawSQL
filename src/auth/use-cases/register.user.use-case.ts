import { InputRegistrationUserDto } from '../dto/input.registration.user.dto';
import { CommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../users/users.repository';
import { EmailManager } from '../../email/email-manager';
import { User, UserViewModelType } from '../../users/types/users.types';
import add from 'date-fns/add';
import { ServiceUnavailableException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { generateHash } from '../../application-helpers/generate.hash';

export class RegisterUserCommand {
  constructor(public registrationUserDto: InputRegistrationUserDto) {}
}

@CommandHandler(RegisterUserCommand)
export class RegisterUserUseCase {
  constructor(
    protected usersRepo: UsersRepository,
    protected emailManager: EmailManager,
  ) {}
  async execute(
    command: RegisterUserCommand,
  ): Promise<UserViewModelType | null> {
    const passwordHash = await generateHash(
      command.registrationUserDto.password,
    );
    const currentDate = new Date();
    const newUser = new User(
      uuidv4(),
      {
        login: command.registrationUserDto.login,
        email: command.registrationUserDto.email,
        hash: passwordHash,
        createdAt: currentDate.toISOString(),
      },
      {
        confirmationCode: uuidv4(),
        expirationDate: add(currentDate, { hours: 1 }).toISOString(),
        isConfirmed: false,
      },
      {
        recoveryCode: undefined,
        expirationDate: undefined,
      },
      {
        isBanned: false,
        banDate: null,
        banReason: null,
      },
    );
    const createUserResult = await this.usersRepo.createUser(newUser);
    try {
      await this.emailManager.sendEmailRegistrationCode(
        newUser.accountData.email,
        newUser.emailConfirmationData.confirmationCode,
      );
    } catch (error) {
      console.error(error);
      await this.usersRepo.deleteUser(createUserResult.id);
      throw new ServiceUnavailableException();
    }
    return createUserResult;
  }
}
