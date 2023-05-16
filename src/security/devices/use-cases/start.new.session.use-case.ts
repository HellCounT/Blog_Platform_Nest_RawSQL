import { CommandHandler } from '@nestjs/cqrs';
import { DevicesRepository } from '../devices.repository';
import { Device } from '../types/devices.types';
import { TokenBanService } from '../../tokens/token.ban.service';

export class StartNewSessionCommand {
  constructor(
    public refreshToken: string,
    public userId: string,
    public deviceId: string,
    public deviceName: string,
    public ip: string,
    public issueDate: Date,
    public expDate: Date,
  ) {}
}
@CommandHandler(StartNewSessionCommand)
export class StartNewSessionUseCase {
  constructor(
    protected devicesRepo: DevicesRepository,
    protected tokenBanService: TokenBanService,
  ) {}
  async execute(command: StartNewSessionCommand): Promise<void> {
    const refreshTokenMeta = this.tokenBanService.createMeta(
      command.refreshToken,
    );
    const newSession = new Device(
      command.deviceId,
      command.userId,
      command.ip,
      command.deviceName,
      command.issueDate,
      command.expDate,
      refreshTokenMeta,
    );
    await this.devicesRepo.addSessionToDb(newSession);
  }
}
