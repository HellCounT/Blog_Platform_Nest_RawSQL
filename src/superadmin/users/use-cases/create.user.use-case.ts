import { InputCreateUserDto } from '../dto/input.create-user.dto';
import { UsersRepository } from '../../../users/users.repository';
import { User, UserViewModelType } from '../../../users/types/users.types';
import { CommandHandler } from '@nestjs/cqrs';
import { generateHash } from '../../../application-helpers/generate.hash';
import { v4 as uuidv4 } from 'uuid';

export class CreateUserCommand {
  constructor(public userCreateDto: InputCreateUserDto) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase {
  constructor(protected usersRepo: UsersRepository) {}

  async execute(command: CreateUserCommand): Promise<UserViewModelType | null> {
    const passwordHash = await generateHash(command.userCreateDto.password);
    const currentDate = new Date();
    const newUser = new User(
      uuidv4(),
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
