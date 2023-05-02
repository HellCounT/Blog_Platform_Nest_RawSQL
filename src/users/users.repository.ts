import { Injectable } from '@nestjs/common';
import { UserDb } from './types/users.types';
import mongoose, { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './entity/users.schema';
import { OutputSuperAdminUserDto } from '../superadmin/users/dto/output.super-admin.user.dto';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}
  async getUserById(id: string): Promise<UserDocument> {
    return this.userModel.findOne({
      _id: new mongoose.Types.ObjectId(id),
    });
  }
  async createUser(newUser: UserDb): Promise<OutputSuperAdminUserDto> {
    const userInstance = new this.userModel(newUser);
    const result = await userInstance.save();
    let banDateString;
    if (result.globalBanInfo.banDate === null) banDateString = null;
    else banDateString = result.globalBanInfo.banDate.toISOString();
    return {
      id: result._id.toString(),
      login: result.accountData.login,
      email: result.accountData.email,
      createdAt: result.accountData.createdAt,
      banInfo: {
        isBanned: result.globalBanInfo.isBanned,
        banDate: banDateString,
        banReason: result.globalBanInfo.banReason,
      },
    };
  }
  async deleteUser(id: string): Promise<boolean> {
    const deleteResult = await this.userModel.deleteOne({
      _id: new mongoose.Types.ObjectId(id),
    });
    return deleteResult.deletedCount === 1;
  }
  async findByLoginOrEmail(loginOrEmail: string): Promise<UserDocument> {
    return this.userModel
      .findOne({
        $or: [
          { 'accountData.email': loginOrEmail },
          { 'accountData.login': loginOrEmail },
        ],
      })
      .lean();
  }
  async findByConfirmationCode(emailConfirmationCode: string): Promise<UserDb> {
    return this.userModel.findOne({
      'emailConfirmationData.confirmationCode': emailConfirmationCode,
    });
  }
  async findByRecoveryCode(recoveryCode: string): Promise<UserDb> {
    return this.userModel.findOne({
      'recoveryCodeData.recoveryCode': recoveryCode,
    });
  }
  async confirmationSetUser(id: string): Promise<boolean> {
    const userInstance = await this.userModel.findOne({ _id: id });
    if (!userInstance) return false;
    userInstance.emailConfirmationData.isConfirmed = true;
    userInstance.save();
    return true;
  }
  async updateConfirmationCode(
    id: mongoose.Types.ObjectId,
    newCode: string,
  ): Promise<void> {
    const userInstance = await this.userModel.findOne({ _id: id });
    if (!userInstance) {
      return;
    } else {
      userInstance.emailConfirmationData.confirmationCode = newCode;
      await userInstance.save();
      return;
    }
  }
  async updateRecoveryCode(
    id: mongoose.Types.ObjectId,
    newRecoveryCode: string,
  ): Promise<void> {
    const userInstance = await this.userModel.findOne({ _id: id });
    if (!userInstance) {
      return;
    } else {
      userInstance.recoveryCodeData.recoveryCode = newRecoveryCode;
      userInstance.recoveryCodeData.expirationDate = new Date();
      await userInstance.save();
      return;
    }
  }
  async updateHashByRecoveryCode(
    id: mongoose.Types.ObjectId,
    newHash: string,
  ): Promise<void> {
    const userInstance = await this.userModel.findOne({ _id: id });
    if (!userInstance) {
      return;
    } else {
      userInstance.accountData.hash = newHash;
      await userInstance.save();
      return;
    }
  }
  async banUserById(
    userId: string,
    isBanned: boolean,
    banReason: string,
  ): Promise<void> {
    const userInstance = await this.userModel.findOne({
      _id: new mongoose.Types.ObjectId(userId),
    });
    if (isBanned) {
      userInstance.globalBanInfo.isBanned = isBanned;
      userInstance.globalBanInfo.banDate = new Date();
      userInstance.globalBanInfo.banReason = banReason;
    } else {
      userInstance.globalBanInfo.isBanned = isBanned;
      userInstance.globalBanInfo.banDate = null;
      userInstance.globalBanInfo.banReason = null;
    }
    userInstance.save();
    return;
  }
}
