import mongoose from 'mongoose';

export type TokenPairType = {
  accessToken: string;
  refreshTokenMeta: RefreshTokenResult;
};

export type RefreshTokenResult = {
  refreshToken: string;
  userId: string;
  deviceId: mongoose.Types.ObjectId;
  issueDate: Date;
  expDate: Date;
};

export type TokenPayloadType = {
  userId: string;
  deviceId?: string;
  exp?: number;
};
