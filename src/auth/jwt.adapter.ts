import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserDb } from '../users/types/users.types';
import {
  RefreshTokenResult,
  TokenPairType,
  TokenPayloadType,
} from './auth.types';
import { ConfigService } from '@nestjs/config';
import { ConfigurationType } from '../configuration/configuration';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class JwtAdapter {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<ConfigurationType>,
  ) {}
  getTokenPair(user: UserDb): TokenPairType {
    return {
      accessToken: this.createJwt(user),
      refreshTokenMeta: this.createNewRefreshJwt(user),
    };
  }
  getRefreshedTokenPair(user: UserDb, deviceId: string) {
    return {
      accessToken: this.createJwt(user),
      refreshTokenMeta: this.updateRefreshJwt(user, deviceId),
    };
  }
  createJwt(user: UserDb): string {
    return this.jwtService.sign(
      { userId: user.id },
      {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: this.configService.get('JWT_LIFETIME') + 's',
      },
    );
  }
  createNewRefreshJwt(user: UserDb): RefreshTokenResult {
    const deviceId = uuidv4;
    const issueDate = new Date();
    const expDateSec =
      Math.floor(issueDate.getTime() / 1000) +
      this.configService.get('JWT_REFRESH_LIFETIME');
    const expDate = new Date(expDateSec * 1000);
    const refreshToken = this.jwtService.sign(
      {
        userId: user.id,
        deviceId: deviceId.toString(),
        exp: expDateSec,
      },
      {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      },
    );
    return {
      refreshToken: refreshToken,
      userId: user.id,
      deviceId: deviceId,
      issueDate: issueDate,
      expDate: expDate,
    };
  }
  updateRefreshJwt(user: UserDb, deviceId: string) {
    const issueDate = new Date();
    const expDateSec =
      Math.floor(issueDate.getTime() / 1000) +
      this.configService.get('JWT_REFRESH_LIFETIME');
    const expDate = new Date(expDateSec * 1000);
    const refreshToken = this.jwtService.sign(
      {
        userId: user.id,
        deviceId: deviceId.toString(),
        exp: expDateSec,
      },
      {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      },
    );
    return {
      refreshToken: refreshToken,
      userId: user.id,
      deviceId: deviceId,
      issueDate: issueDate,
      expDate: expDate,
    };
  }
  checkRefreshTokenExpiration(token: string): boolean {
    try {
      this.jwtService.verify(token, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });
      return true;
    } catch {
      return false;
    }
  }
  parseTokenPayload(token: string): TokenPayloadType {
    return this.jwtService.decode(token) as TokenPayloadType;
  }
}
