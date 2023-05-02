import { Injectable } from '@nestjs/common';

import { ExpiredTokensRepository } from './expired.tokens.repository';

@Injectable()
export class TokenBanService {
  constructor(protected expiredTokensRepo: ExpiredTokensRepository) {}
  async banRefreshToken(refreshToken: string, userId: string): Promise<void> {
    const refreshTokenMeta = this.createMeta(refreshToken);
    await this.expiredTokensRepo.addTokenToDb(refreshTokenMeta, userId);
  }
  async refreshTokenIsBanned(refreshToken: string): Promise<boolean> {
    const refreshTokenMeta = this.createMeta(refreshToken);
    return !!(await this.expiredTokensRepo.findToken(refreshTokenMeta));
  }
  createMeta(refreshToken: string): string {
    const header = refreshToken.split('.')[0];
    const payload = refreshToken.split('.')[1];
    return header + '.' + payload;
  }
}
