import { CommandHandler } from '@nestjs/cqrs';
import { DevicesRepository } from '../devices.repository';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

export class DeleteSessionCommand {
  constructor(public userId: string, public deviceId: string) {}
}
@CommandHandler(DeleteSessionCommand)
export class DeleteSessionUseCase {
  constructor(protected devicesRepo: DevicesRepository) {}
  async execute(command: DeleteSessionCommand): Promise<boolean> {
    const foundSession = await this.devicesRepo.findSessionByDeviceId(
      command.deviceId,
    );
    if (!foundSession) throw new NotFoundException();
    if (foundSession.userId === command.userId) {
      await this.devicesRepo.deleteSessionById(command.deviceId);
      return true;
    } else {
      throw new ForbiddenException();
    }
  }
}
