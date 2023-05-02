import { UsersRepository } from '../../../users/users.repository';
import { CommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';

export class DeleteUserCommand {
  constructor(public id: string) {}
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserUseCase {
  constructor(protected usersRepo: UsersRepository) {}

  async execute(command: DeleteUserCommand): Promise<void> {
    const deleteResult = await this.usersRepo.deleteUser(command.id);
    if (!deleteResult) {
      throw new NotFoundException();
    } else return;
  }
}
