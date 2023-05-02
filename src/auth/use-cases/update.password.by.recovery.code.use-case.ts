import { CommandHandler } from '@nestjs/cqrs';
import { InputNewPasswordDto } from '../dto/input.newpassword.dto';
import { UsersRepository } from '../../users/users.repository';
import { BadRequestException } from '@nestjs/common';
import { generateHash } from '../../application-helpers/generate.hash';

export class UpdatePasswordByRecoveryCodeCommand {
  constructor(public newPasswordDto: InputNewPasswordDto) {}
}
@CommandHandler(UpdatePasswordByRecoveryCodeCommand)
export class UpdatePasswordByRecoveryCodeUseCase {
  constructor(protected usersRepo: UsersRepository) {}
  async execute(
    command: UpdatePasswordByRecoveryCodeCommand,
  ): Promise<boolean> {
    const foundUser = await this.usersRepo.findByRecoveryCode(
      command.newPasswordDto.recoveryCode,
    );
    if (!foundUser)
      throw new BadRequestException({
        errorsMessages: [
          {
            message: 'Incorrect recovery code',
            field: 'recoveryCode',
          },
        ],
      });
    else {
      const newPasswordHash = await generateHash(
        command.newPasswordDto.newPassword,
      );
      await this.usersRepo.updateHashByRecoveryCode(
        foundUser._id,
        newPasswordHash,
      );
      return true;
    }
  }
}
