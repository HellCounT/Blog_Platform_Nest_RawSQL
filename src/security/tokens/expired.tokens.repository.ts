import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  ExpiredToken,
  ExpiredTokenDocument,
} from './entity/expiredTokenSchema';
import { Model } from 'mongoose';

@Injectable()
export class ExpiredTokensRepository {
  constructor(
    @InjectModel(ExpiredToken.name)
    private expiredTokenModel: Model<ExpiredTokenDocument>,
  ) {}
  async addTokenToDb(refreshTokenMeta: string, userId: string) {
    const expiredToken: ExpiredToken = {
      userId: userId,
      refreshTokenMeta: refreshTokenMeta,
    };
    const expiredTokenInstance = new this.expiredTokenModel(expiredToken);
    await expiredTokenInstance.save();
    return;
  }
  async findToken(tokenMeta: string): Promise<ExpiredToken | null> {
    return this.expiredTokenModel.findOne({ refreshTokenMeta: tokenMeta });
  }
}
