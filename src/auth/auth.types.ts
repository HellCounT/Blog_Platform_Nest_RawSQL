export type TokenPairType = {
  accessToken: string;
  refreshTokenMeta: RefreshTokenResult;
};

export type RefreshTokenResult = {
  refreshToken: string;
  userId: string;
  deviceId: string;
  issueDate: Date;
  expDate: Date;
};

export type TokenPayloadType = {
  userId: string;
  deviceId?: string;
  exp?: number;
};
