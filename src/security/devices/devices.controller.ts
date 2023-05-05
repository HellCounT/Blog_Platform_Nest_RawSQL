import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  UseGuards,
} from '@nestjs/common';
import { UsersQuery } from '../../users/users.query';
import { RefreshJwtGuard } from '../../auth/guards/refresh-jwt.guard';
import { GetRefreshTokenPayload } from '../../auth/decorators/get-decorators/get-refresh-token-payload.decorator';
import { TokenPayloadType } from '../../auth/auth.types';
import { OutputDeviceDto } from './dto/output.device.dto';
import { CommandBus } from '@nestjs/cqrs';
import { DeleteSessionCommand } from './use-cases/delete.session.use-case';
import { DeleteAllOtherSessionsCommand } from './use-cases/delete.all.other.sessions.use-case';

@Controller('security/devices')
export class DevicesController {
  constructor(
    protected usersQueryRepo: UsersQuery,
    protected commandBus: CommandBus,
  ) {}
  @UseGuards(RefreshJwtGuard)
  @Get()
  @HttpCode(200)
  async getAllSessions(
    @GetRefreshTokenPayload() payload: TokenPayloadType,
  ): Promise<Array<OutputDeviceDto>> {
    return await this.usersQueryRepo.getAllSessionsForCurrentUser(
      payload.userId,
    );
  }
  @UseGuards(RefreshJwtGuard)
  @Delete()
  @HttpCode(204)
  async deleteAllOtherSessions(
    @GetRefreshTokenPayload() payload: TokenPayloadType,
  ) {
    return await this.commandBus.execute(
      new DeleteAllOtherSessionsCommand(payload.userId, payload.deviceId),
    );
  }
  @UseGuards(RefreshJwtGuard)
  @Delete(':deviceId')
  @HttpCode(204)
  async deleteSession(
    @Param('deviceId') deviceId: string,
    @GetRefreshTokenPayload() payload: TokenPayloadType,
  ) {
    return await this.commandBus.execute(
      new DeleteSessionCommand(payload.userId, deviceId),
    );
  }
}
