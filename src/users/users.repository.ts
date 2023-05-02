import { Injectable } from '@nestjs/common';
import { UserDb, UserSqlJoinedType } from './types/users.types';
import mongoose, { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './entity/users.schema';
import { OutputSuperAdminUserDto } from '../superadmin/users/dto/output.super-admin.user.dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectDataSource() protected dataSource: DataSource,
  ) {}
  async getUserById(id: string): Promise<UserDb> {
    try {
      const result = await this.dataSource.query(
        `
SELECT
u."id", u."login", u."email", u."createdAt", u."hash", 
c."confirmationCode", c."confirmationExpirationDate", c."isConfirmed",
r."recoveryCode", r."recoveryExpirationDate",
b."isBanned", b."banDate", b."banReason"
FROM "USERS" AS u
JOIN "USERS_CONFIRMATIONS" AS c
ON u."id" = c."userId"
JOIN "USERS_RECOVERY" AS r
ON u."id" = r."userId"
JOIN "USERS_GLOBAL_BAN" AS b
ON u."id" = b."userId"
WHERE u."id" = $1
    `,
        [id],
      );
      if (result.length < 1) return null;
      const foundUser: UserSqlJoinedType = result[0];
      return {
        id: foundUser.id,
        accountData: {
          login: foundUser.login,
          email: foundUser.email,
          hash: foundUser.hash,
          createdAt: foundUser.createdAt,
        },
        emailConfirmationData: {
          confirmationCode: foundUser.confirmationCode,
          expirationDate: foundUser.confirmationExpirationDate,
          isConfirmed: foundUser.isConfirmed,
        },
        recoveryCodeData: {
          recoveryCode: foundUser.recoveryCode,
          expirationDate: foundUser.recoveryExpirationDate,
        },
        globalBanInfo: {
          isBanned: foundUser.isBanned,
          banDate: foundUser.banDate,
          banReason: foundUser.banReason,
        },
      };
    } catch (e) {
      console.log(e);
      return null;
    }
  }
  async createUser(newUser: UserDb): Promise<OutputSuperAdminUserDto> {
    return {
      id: result._id.toString(),
      login: result.accountData.login,
      email: result.accountData.email,
      createdAt: result.accountData.createdAt,
      banInfo: {
        isBanned: result.globalBanInfo.isBanned,
        banDate: null,
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
