import { Injectable } from '@nestjs/common';
import { DeviceDb } from './types/devices.types';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class DevicesRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}
  async findSessionByDeviceId(deviceId: string): Promise<DeviceDb> {
    try {
      const result = await this.dataSource.query(
        `
      SELECT * FROM "DEVICES"
      WHERE "id" = $1
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
VALUES ($1, $2, $3, $4, $5, $6, $7)
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
SET "issuedAt" = $1, "expirationDate" = $2, "refreshTokenMeta" = $3
WHERE "id" = $4
          `,
          [issueDate, expDate, newRefreshTokenMeta, deviceId],
        );
        return true;
      } else return false;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
  async deleteSessionById(deviceId: string): Promise<boolean> {
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
DELETE FROM "DEVICES"
WHERE "id" = $1
          `,
          [deviceId],
        );
        return true;
      } else return false;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
  async deleteAllOtherSessions(
    userId: string,
    deviceId: string,
  ): Promise<void> {
    await this.dataSource.query(
      `
DELETE FROM "DEVICES"
WHERE "userId" = $1 AND "id" != $2
          `,
      [userId, deviceId],
    );
    return;
  }
  async killAllSessionsForUser(userId: string): Promise<void> {
    await this.dataSource.query(
      `
DELETE FROM "DEVICES"
WHERE "userId" = $1
          `,
      [userId],
    );
    return;
  }
}
