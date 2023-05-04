import { CommandHandler } from '@nestjs/cqrs';
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
      command.deviceId,
    );
    if (!session) throw new NotFoundException();
    if (session.userId !== command.userId) throw new ForbiddenException();
    await this.devicesRepo.deleteSessionById(command.deviceId);
    return;
  }
}
