import { CommandHandler } from '@nestjs/cqrs';
import { InputConfirmationCodeDto } from '../dto/input.confirmationcode.dto';
import { UsersRepository } from '../../users/users.repository';
import { BadRequestException } from '@nestjs/common';

export class ConfirmUserEmailCommand {
  constructor(public confirmationCodeDto: InputConfirmationCodeDto) {}
}
@CommandHandler(ConfirmUserEmailCommand)
export class ConfirmUserEmailUseCase {
  constructor(protected usersRepo: UsersRepository) {}
  async execute(command: ConfirmUserEmailCommand): Promise<boolean> {
    const foundUser = await this.usersRepo.findByConfirmationCode(
      command.confirmationCodeDto.code,
    );
    if (!foundUser) new BadRequestException();
    if (
      foundUser.emailConfirmationData.isConfirmed ||
      foundUser.emailConfirmationData.confirmationCode !==
        command.confirmationCodeDto.code ||
      new Date(foundUser.emailConfirmationData.expirationDate) < new Date()
    )
      throw new BadRequestException();
    return await this.usersRepo.confirmationSetUser(foundUser._id.toString());
  }
}
