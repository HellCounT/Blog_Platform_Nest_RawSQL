import mongoose from 'mongoose';

export type TokenPairType = {
  accessToken: string;
  refreshTokenMeta: RefreshTokenResult;
};

export type RefreshTokenResult = {
  refreshToken: string;
  userId: mongoose.Types.ObjectId;
  deviceId: mongoose.Types.ObjectId;
  issueDate: Date;
  expDate: Date;
};

export type TokenPayloadType = {
  userId: mongoose.Types.ObjectId;
  deviceId?: string;
  exp?: number;
};
