import { CommandHandler } from '@nestjs/cqrs';
import mongoose from 'mongoose';
import { DevicesRepository } from '../devices.repository';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

export class LogoutSessionCommand {
  constructor(public deviceId: string, public userId: string) {}
}
@CommandHandler(LogoutSessionCommand)
export class LogoutSessionUseCase {
  constructor(protected devicesRepo: DevicesRepository) {}
  async execute(command: LogoutSessionCommand): Promise<void> {
    const session = await this.devicesRepo.findSessionByDeviceId(
      new mongoose.Types.ObjectId(command.deviceId),
    );
    if (!session) throw new NotFoundException();
    if (session.userId !== new mongoose.Types.ObjectId(command.userId))
      throw new ForbiddenException();
    await this.devicesRepo.deleteSessionById(
      new mongoose.Types.ObjectId(command.deviceId),
    );
    return;
  }
}
