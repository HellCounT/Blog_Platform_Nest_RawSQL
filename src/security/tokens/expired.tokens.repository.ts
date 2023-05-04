import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  ExpiredToken,
  ExpiredTokenDocument,
} from './entity/expiredTokenSchema';
import { Model } from 'mongoose';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ExpiredTokenType } from './types/expired.token.type';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ExpiredTokensRepository {
  constructor(
    @InjectModel(ExpiredToken.name)
    private expiredTokenModel: Model<ExpiredTokenDocument>,
    @InjectDataSource() protected dataSource: DataSource,
  ) {}
  async addTokenToDb(refreshTokenMeta: string, userId: string) {
    const id: string = uuidv4();
    await this.dataSource.query(
      `
INSERT INTO "EXPIRED_TOKENS"
("id", "userId", "refreshTokenMeta")
VALUES($1, $2, $3)
      `,
      [id, userId, refreshTokenMeta],
    );
    return;
  }
  async findToken(tokenMeta: string): Promise<ExpiredTokenType | null> {
    try {
      const result = await this.dataSource.query(
        `
      SELECT * FROM "EXPIRED_TOKENS"
      WHERE "refreshTokenMeta" = $1
      `,
        [tokenMeta],
      );
      if (result.length < 1) return null;
      return result[0];
    } catch (e) {
      console.log(e);
      return null;
    }
  }
}
