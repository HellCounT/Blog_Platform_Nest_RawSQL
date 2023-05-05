import { CommandHandler } from '@nestjs/cqrs';
import { DevicesRepository } from '../devices.repository';
import { TokenBanService } from '../../tokens/token.ban.service';
import { NotFoundException } from '@nestjs/common';

export class UpdateSessionWithDeviceIdCommand {
  constructor(
    public newRefreshToken: string,
    public deviceId: string,
    public issueDate: Date,
    public expDate: Date,
  ) {}
}
@CommandHandler(UpdateSessionWithDeviceIdCommand)
export class UpdateSessionWithDeviceIdUseCase {
  constructor(
    protected devicesRepo: DevicesRepository,
    protected tokenBanService: TokenBanService,
  ) {}
  async execute(command: UpdateSessionWithDeviceIdCommand) {
    const foundSession = await this.devicesRepo.findSessionByDeviceId(
      command.deviceId,
    );
    if (!foundSession) throw new NotFoundException();
    const newRefreshTokenMeta = this.tokenBanService.createMeta(
      command.newRefreshToken,
    );
    return await this.devicesRepo.updateSessionWithDeviceId(
      newRefreshTokenMeta,
      command.deviceId,
      command.issueDate,
      command.expDate,
    );
  }
}
