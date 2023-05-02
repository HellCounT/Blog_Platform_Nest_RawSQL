import { InputCreateUserDto } from '../dto/input.create-user.dto';
import { UsersRepository } from '../../../users/users.repository';
import { UserDb, UserViewModelType } from '../../../users/types/users.types';
import mongoose from 'mongoose';
import { CommandHandler } from '@nestjs/cqrs';
import { generateHash } from '../../../application-helpers/generate.hash';

export class CreateUserCommand {
  constructor(public userCreateDto: InputCreateUserDto) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase {
  constructor(protected usersRepo: UsersRepository) {}

  async execute(command: CreateUserCommand): Promise<UserViewModelType | null> {
    const passwordHash = await generateHash(command.userCreateDto.password);
    const currentDate = new Date();
    const newUser = new UserDb(
      new mongoose.Types.ObjectId(),
      {
        login: command.userCreateDto.login,
        email: command.userCreateDto.email,
        hash: passwordHash,
        createdAt: currentDate.toISOString(),
      },
      {
        confirmationCode: 'User Created by SuperAdmin',
        expirationDate: 'User Created by SuperAdmin',
        isConfirmed: true,
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
    return await this.usersRepo.createUser(newUser);
  }
}
