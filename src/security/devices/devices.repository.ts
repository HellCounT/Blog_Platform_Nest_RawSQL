import { InjectModel } from '@nestjs/mongoose';
import { Device, DeviceDocument } from './entity/devices.schema';
import mongoose, { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { DeviceDb } from './types/devices.types';

@Injectable()
export class DevicesRepository {
  constructor(
    @InjectModel(Device.name) private deviceModel: Model<DeviceDocument>,
  ) {}
  async findSessionByDeviceId(
    deviceId: mongoose.Types.ObjectId,
  ): Promise<DeviceDocument> {
    return this.deviceModel.findOne({ _id: deviceId });
  }
  async getAllSessionsForUser(userId: string): Promise<DeviceDocument[]> {
    return this.deviceModel.find({
      userId: new mongoose.Types.ObjectId(userId),
    });
  }
  async addSessionToDb(newSession: DeviceDb): Promise<void> {
    const newSessionInstance = new this.deviceModel(newSession);
    await newSessionInstance.save();
  }
  async updateSessionWithDeviceId(
    newRefreshTokenMeta: string,
    deviceId: string,
    issueDate: Date,
    expDate: Date,
  ): Promise<boolean> {
    const activeSessionInstance = await this.deviceModel.findOne({
      _id: new mongoose.Types.ObjectId(deviceId),
    });
    if (activeSessionInstance) {
      activeSessionInstance.issuedAt = issueDate;
      activeSessionInstance.expirationDate = expDate;
      activeSessionInstance.refreshTokenMeta = newRefreshTokenMeta;
      await activeSessionInstance.save();
      return true;
    } else return false;
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
