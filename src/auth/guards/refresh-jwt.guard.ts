import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { DevicesRepository } from '../../security/devices/devices.repository';
import { JwtAdapter } from '../jwt.adapter';
import { TokenPayloadType } from '../auth.types';
import { TokenBanService } from '../../security/tokens/token.ban.service';

@Injectable()
export class RefreshJwtGuard implements CanActivate {
  constructor(
    private readonly devicesRepo: DevicesRepository,
    private readonly tokenBanService: TokenBanService,
    private readonly jwtAdapter: JwtAdapter,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const refreshToken = request.cookies.refreshToken;
    const payload: TokenPayloadType = await this._authCheckerPayloadParser(
      refreshToken,
    );
    if (!payload) throw new UnauthorizedException();
    if (await this.tokenBanService.refreshTokenIsBanned(refreshToken))
      throw new UnauthorizedException();
    request.payload = payload;
    return true;
  }
  private async _authCheckerPayloadParser(
    refreshToken: string,
  ): Promise<TokenPayloadType> {
    if (!this.jwtAdapter.checkRefreshTokenExpiration(refreshToken)) return null;
    const payload = this.jwtAdapter.parseTokenPayload(refreshToken);
    if (!(await this.devicesRepo.findSessionByDeviceId(payload.deviceId)))
      return null;
    return payload;
  }
}
