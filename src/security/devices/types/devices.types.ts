import mongoose from 'mongoose';

export class DeviceDb {
  constructor(
    public id: string, //Session Device ID
    public userId: mongoose.Types.ObjectId,
    public ip: string,
    public deviceName: string,
    public issuedAt: Date,
    public expirationDate: Date,
    public refreshTokenMeta: string,
  ) {}
}
