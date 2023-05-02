import { CommandHandler } from '@nestjs/cqrs';
import { DevicesRepository } from '../devices.repository';
import mongoose from 'mongoose';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

export class DeleteSessionCommand {
  constructor(
    public userId: mongoose.Types.ObjectId,
    public deviceId: string,
  ) {}
}
@CommandHandler(DeleteSessionCommand)
export class DeleteSessionUseCase {
  constructor(protected devicesRepo: DevicesRepository) {}
  async execute(command: DeleteSessionCommand): Promise<boolean> {
    const foundSession = await this.devicesRepo.findSessionByDeviceId(
      new mongoose.Types.ObjectId(command.deviceId),
    );
    if (!foundSession) throw new NotFoundException();
    if (foundSession.userId.toString() === command.userId.toString()) {
      await this.devicesRepo.deleteSessionById(
        new mongoose.Types.ObjectId(command.deviceId),
      );
      return true;
    } else {
      throw new ForbiddenException();
    }
  }
}
