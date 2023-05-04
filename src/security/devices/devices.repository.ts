import { InjectModel } from '@nestjs/mongoose';
import { Device, DeviceDocument } from './entity/devices.schema';
import mongoose, { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { DeviceDb } from './types/devices.types';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class DevicesRepository {
  constructor(
    @InjectModel(Device.name) private deviceModel: Model<DeviceDocument>,
    @InjectDataSource() protected dataSource: DataSource,
  ) {}
  async findSessionByDeviceId(deviceId: string): Promise<DeviceDb> {
    try {
      const result = await this.dataSource.query(
        `
      SELECT * FROM "DEVICES"
      WHERE "deviceId" = $1
      `,
        [deviceId],
      );
      if (result.length < 1) return null;
      return result[0];
    } catch (e) {
      console.log(e);
      return null;
    }
  }
  async getAllSessionsForUser(userId: string): Promise<DeviceDb[]> {
    try {
      return await this.dataSource.query(
        `
      SELECT * FROM "DEVICES"
      WHERE "userId" = $1
      `,
        [userId],
      );
    } catch (e) {
      console.log(e);
      return null;
    }
  }
  async addSessionToDb(newSession: DeviceDb): Promise<void> {
    await this.dataSource.query(
      `
INSERT INTO "DEVICES"
("id", "userId", "ip", "deviceName", "issuedAt", "expirationDate", "refreshTokenMeta")
VALUES($1, $2, $3, $4, $5, $6, $7)
      `,
      [
        newSession.id,
        newSession.userId,
        newSession.ip,
        newSession.deviceName,
        newSession.issuedAt,
        newSession.expirationDate,
        newSession.refreshTokenMeta,
      ],
    );
    return;
  }
  async updateSessionWithDeviceId(
    newRefreshTokenMeta: string,
    deviceId: string,
    issueDate: Date,
    expDate: Date,
  ): Promise<boolean> {
    try {
      const activeSessionResult = await this.dataSource.query(
        `
SELECT * FROM "DEVICES"
WHERE "id" = $1
      `,
        [deviceId],
      );
      if (activeSessionResult.length > 0) {
        await this.dataSource.query(
          `
UPDATE "DEVICES"
SET "issuedAt" = $1 AND "expirationDate" = $2 AND "refreshTokenMeta" = $3
          `,
          [issueDate, expDate, newRefreshTokenMeta],
        );
        return true;
      } else return false;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
  async deleteSessionById(deviceId: mongoose.Types.ObjectId): Promise<boolean> {
    const activeSessionInstance = await this.deviceModel.findOne({
      _id: new mongoose.Types.ObjectId(deviceId),
    });
    if (!activeSessionInstance) return false;
    await activeSessionInstance.deleteOne();
    return true;
  }
  async deleteAllOtherSessions(
    userId: mongoose.Types.ObjectId,
    deviceId: mongoose.Types.ObjectId,
  ): Promise<boolean> {
    const result = await this.deviceModel.deleteMany({
      userId: userId,
      _id: { $ne: deviceId },
    });
    return result.deletedCount >= 1;
  }
  async killAllSessionsForUser(userId: string): Promise<void> {
    await this.deviceModel.deleteMany({
      userId: new mongoose.Types.ObjectId(userId),
    });
    return;
  }
}
