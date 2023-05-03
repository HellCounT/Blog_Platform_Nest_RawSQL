import { CommandHandler } from '@nestjs/cqrs';
import mongoose from 'mongoose';
import { UnauthorizedException } from '@nestjs/common';
import { DevicesRepository } from '../devices.repository';

export class DeleteAllOtherSessionsCommand {
  constructor(public userId: string, public deviceId: string) {}
}
@CommandHandler(DeleteAllOtherSessionsCommand)
export class DeleteAllOtherSessionsUseCase {
  constructor(protected devicesRepo: DevicesRepository) {}
  async execute(command: DeleteAllOtherSessionsCommand): Promise<boolean> {
    if (command.deviceId) {
      await this.devicesRepo.deleteAllOtherSessions(
        new mongoose.Types.ObjectId(command.userId),
        new mongoose.Types.ObjectId(command.deviceId),
      );
      return true;
    } else throw new UnauthorizedException();
  }
}
