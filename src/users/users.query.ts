import { Injectable } from '@nestjs/common';
import { UserQueryType } from './types/users.types';
import { OutputDeviceDto } from '../security/devices/dto/output.device.dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { DeviceDb } from '../security/devices/types/devices.types';

@Injectable()
export class UsersQuery {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async findUserById(userId: string): Promise<UserQueryType> {
    try {
      const result = await this.dataSource.query(
        `
SELECT * FROM "USERS"
WHERE u."id" = $1
        `,
        [userId],
      );
      if (result.length < 1) return null;
      return result[0];
    } catch (e) {
      console.log(e);
      return null;
    }
  }
  async getAllSessionsForCurrentUser(
    userId: string,
  ): Promise<Array<OutputDeviceDto>> {
    const sessions: Array<DeviceDb> = await this.dataSource.query(
      `
      SELECT * FROM "DEVICES"
      WHERE "userId" = $1
      `,
      [userId],
    );
    return sessions.map((e) => this._mapDevicesToViewType(e));
  }
  private _mapDevicesToViewType(device: DeviceDb): OutputDeviceDto {
    return {
      deviceId: device.id,
      ip: device.ip,
      title: device.deviceName,
      lastActiveDate: device.issuedAt.toISOString(),
    };
  }
}
