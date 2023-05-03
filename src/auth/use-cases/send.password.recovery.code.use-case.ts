import { CommandHandler } from '@nestjs/cqrs';
import { InputEmailPasswordRecoveryDto } from '../dto/input.email.passwordrecovery.dto';
import { UsersRepository } from '../../users/users.repository';
import { EmailManager } from '../../email/email-manager';
import {
  BadRequestException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export class SendPasswordRecoveryCodeCommand {
  constructor(public passwordRecoveryDto: InputEmailPasswordRecoveryDto) {}
}
@CommandHandler(SendPasswordRecoveryCodeCommand)
export class SendPasswordRecoveryCodeUseCase {
  constructor(
    protected usersRepo: UsersRepository,
    protected emailManager: EmailManager,
  ) {}
  async execute(command: SendPasswordRecoveryCodeCommand): Promise<boolean> {
    const newCode = uuidv4();
    const foundUser = await this.usersRepo.findByLoginOrEmail(
      command.passwordRecoveryDto.email,
    );
    if (!foundUser) throw new BadRequestException();
    await this.usersRepo.updateRecoveryCode(foundUser.id, newCode);
    try {
      await this.emailManager.sendRecoveryCode(
        command.passwordRecoveryDto.email,
        newCode,
      );
      return true;
    } catch (error) {
      console.error(error);
      throw new ServiceUnavailableException();
    }
  }
}
