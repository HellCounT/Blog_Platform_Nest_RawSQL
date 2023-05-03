import { Injectable } from '@nestjs/common';
import { UserDb } from './types/users.types';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './entity/users.schema';
import mongoose, { Model } from 'mongoose';
import {
  Device,
  DeviceDocument,
} from '../security/devices/entity/devices.schema';
import { OutputDeviceDto } from '../security/devices/dto/output.device.dto';

@Injectable()
export class UsersQuery {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Device.name) private deviceModel: Model<DeviceDocument>,
  ) {}

  async findUserById(userId: string): Promise<UserDb> {
    return this.userModel.findOne({
      _id: new mongoose.Types.ObjectId(userId),
    });
  }
  async getAllSessionsForCurrentUser(
    userId: string,
  ): Promise<Array<OutputDeviceDto>> {
    const sessions: Array<DeviceDocument> = await this.deviceModel
      .find({ userId: new mongoose.Types.ObjectId(userId) })
      .lean();
    return sessions.map((e) => this._mapDevicesToViewType(e));
  }
  async findSessionByDeviceId(
    deviceId: mongoose.Types.ObjectId,
  ): Promise<DeviceDocument> {
    return this.deviceModel.findOne({ _id: deviceId });
  }
  private _mapDevicesToViewType(device: DeviceDocument): OutputDeviceDto {
    return {
      deviceId: device._id.toString(),
      ip: device.ip,
      title: device.deviceName,
      lastActiveDate: device.issuedAt.toISOString(),
    };
  }
}
