import { Injectable } from '@nestjs/common';
import { UserDb, UserSqlJoinedType } from './types/users.types';
import mongoose, { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './entity/users.schema';
import { OutputSuperAdminUserDto } from '../superadmin/users/dto/output.super-admin.user.dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { sqlUserJoinQuery } from '../application-helpers/sql.user.join.query';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectDataSource() protected dataSource: DataSource,
  ) {}
  async getUserById(id: string): Promise<UserDb> {
    try {
      const result = await this.dataSource.query(
        sqlUserJoinQuery +
          `
        WHERE u."id" = $1
    `,
        [id],
      );
      if (result.length < 1) return null;
      const foundUser: UserSqlJoinedType = result[0];
      return this._mapUserSqlJoinedTypeToDbType(foundUser);
    } catch (e) {
      console.log(e);
      return null;
    }
  }
  async createUser(newUser: UserDb): Promise<OutputSuperAdminUserDto> {
    await this.dataSource.query(
      `
INSERT INTO "USERS" 
("id", "login", "email", "createdAt", "hash")
VALUES($1, $2, $3, $4, $5)
    `,
      [
        newUser.id,
        newUser.accountData.login,
        newUser.accountData.email,
        newUser.accountData.createdAt,
        newUser.accountData.hash,
      ],
    );
    await this.dataSource.query(
      `
INSERT INTO "USERS_GLOBAL_BAN"
("userId", "isBanned", "banReason")
VALUES($1, $2, $3)
      `,
      [
        newUser.id,
        newUser.globalBanInfo.isBanned,
        newUser.globalBanInfo.banReason,
      ],
    );
    await this.dataSource.query(
      `
INSERT INTO "USERS_CONFIRMATIONS"
("userId", "confirmationCode", "confirmationExpirationDate", "isConfirmed")
VALUES($1, $2, $3, $4)
      `,
      [
        newUser.id,
        newUser.emailConfirmationData.confirmationCode,
        newUser.emailConfirmationData.expirationDate,
        newUser.emailConfirmationData.isConfirmed,
      ],
    );
    await this.dataSource.query(
      `
INSERT INTO "USERS_RECOVERY"
("userId", "recoveryCode", "recoveryExpirationDate")
VALUES($1, $2, $3)
      `,
      [
        newUser.id,
        newUser.recoveryCodeData.recoveryCode,
        newUser.recoveryCodeData.expirationDate,
      ],
    );
    const user = await this.getUserById(newUser.id);
    return {
      id: user.id,
      login: user.accountData.login,
      email: user.accountData.email,
      createdAt: user.accountData.createdAt,
      banInfo: {
        isBanned: user.globalBanInfo.isBanned,
        banDate: null,
        banReason: user.globalBanInfo.banReason,
      },
    };
  }
  async deleteUser(id: string): Promise<boolean> {
    try {
      await this.dataSource.query(
        `
DELETE FROM "USERS" AS u
WHERE u."id" = $1;
DELETE FROM "USERS_CONFIRMATIONS" AS c
WHERE u."id" = c."userId"
DELETE FROM "USERS_RECOVERY" AS r
WHERE u."id" = r."userId"
DELETE FROM "USERS_GLOBAL_BAN" AS b
WHERE u."id" = b."userId"
        `,
        [id],
      );
    } catch (e) {
      console.log(e);
      return false;
    }
  }
  async findByLoginOrEmail(loginOrEmail: string): Promise<UserDb> {
    try {
      const result = await this.dataSource.query(
        sqlUserJoinQuery +
          `
        WHERE u."login" = $1 OR u."email" = $1
      `,
        [loginOrEmail],
      );
      const foundUser: UserSqlJoinedType = result[0];
      return this._mapUserSqlJoinedTypeToDbType(foundUser);
    } catch (e) {
      console.log(e);
      return;
    }
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
  private _mapUserSqlJoinedTypeToDbType(user: UserSqlJoinedType): UserDb {
    return {
      id: user.id,
      accountData: {
        login: user.login,
        email: user.email,
        hash: user.hash,
        createdAt: user.createdAt,
      },
      emailConfirmationData: {
        confirmationCode: user.confirmationCode,
        expirationDate: user.confirmationExpirationDate,
        isConfirmed: user.isConfirmed,
      },
      recoveryCodeData: {
        recoveryCode: user.recoveryCode,
        expirationDate: user.recoveryExpirationDate,
      },
      globalBanInfo: {
        isBanned: user.isBanned,
        banDate: user.banDate,
        banReason: user.banReason,
      },
    };
  }
}
