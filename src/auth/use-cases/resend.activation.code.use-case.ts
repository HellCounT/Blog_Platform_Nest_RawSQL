import { CommandHandler } from '@nestjs/cqrs';
import { InputEmailDto } from '../dto/input.email.dto';
import { UsersRepository } from '../../users/users.repository';
import { EmailManager } from '../../email/email-manager';
import {
  BadRequestException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export class ResendActivationCodeCommand {
  constructor(public emailDto: InputEmailDto) {}
}

@CommandHandler(ResendActivationCodeCommand)
export class ResendActivationCodeUseCase {
  constructor(
    protected usersRepo: UsersRepository,
    protected emailManager: EmailManager,
  ) {}
  async execute(command: ResendActivationCodeCommand): Promise<boolean> {
    const foundUser = await this.usersRepo.findByLoginOrEmail(
      command.emailDto.email,
    );
    if (!foundUser || foundUser.emailConfirmationData.isConfirmed)
      throw new BadRequestException('eMail is already confirmed');
    const newCode = uuidv4();
    await this.usersRepo.updateConfirmationCode(foundUser._id, newCode);
    try {
      await this.emailManager.resendEmailRegistrationCode(
        foundUser.accountData.email,
        newCode,
      );
      return true;
    } catch (error) {
      console.error(error);
      throw new ServiceUnavailableException();
    }
  }
}
