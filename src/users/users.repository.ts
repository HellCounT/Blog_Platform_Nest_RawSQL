import { Injectable } from '@nestjs/common';
import { User, UserSqlJoinedType } from './types/users.types';
import { OutputSuperAdminUserDto } from '../superadmin/users/dto/output.super-admin.user.dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { sqlUserJoinQuery } from '../application-helpers/sql.user.join.query';

@Injectable()
export class UsersRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}
  async getUserById(id: string): Promise<User> {
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
      return this._mapUserSqlJoinedTypeToUserType(foundUser);
    } catch (e) {
      console.log(e);
      return null;
    }
  }
  async createUser(newUser: User): Promise<OutputSuperAdminUserDto> {
    const insertedIdResult = await this.dataSource.query(
      `
        INSERT INTO "USERS"
        ("id", "login", "email", "createdAt", "hash")
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
            `,
      [
        newUser.id,
        newUser.accountData.login,
        newUser.accountData.email,
        newUser.accountData.createdAt,
        newUser.accountData.hash,
      ],
    );
    const insertedId = insertedIdResult[0].id;
    await this.dataSource.query(
      `
      INSERT INTO "USERS_GLOBAL_BAN"
      ("userId", "isBanned", "banReason")
      VALUES ($1, $2, $3)
            `,
      [
        insertedId,
        newUser.globalBanInfo.isBanned,
        newUser.globalBanInfo.banReason,
      ],
    );
    await this.dataSource.query(
      `
      INSERT INTO "USERS_CONFIRMATIONS"
      ("userId", "confirmationCode", "confirmationExpirationDate", "isConfirmed")
      VALUES ($1, $2, $3, $4)
            `,
      [
        insertedId,
        newUser.emailConfirmationData.confirmationCode,
        newUser.emailConfirmationData.expirationDate,
        newUser.emailConfirmationData.isConfirmed,
      ],
    );
    await this.dataSource.query(
      `
      INSERT INTO "USERS_RECOVERY"
      ("userId", "recoveryCode", "recoveryExpirationDate")
      VALUES ($1, $2, $3)
            `,
      [
        insertedId,
        newUser.recoveryCodeData.recoveryCode,
        newUser.recoveryCodeData.expirationDate,
      ],
    );

    // const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    // await queryRunner.connect();
    // await queryRunner.startTransaction();
    // try {
    //   const insertedIdResult = await queryRunner.query(
    //     `
    //   INSERT INTO "USERS"
    //   ("id", "login", "email", "createdAt", "hash")
    //   VALUES ($1, $2, $3, $4, $5)
    //   RETURNING id
    //       `,
    //     [
    //       newUser.id,
    //       newUser.accountData.login,
    //       newUser.accountData.email,
    //       newUser.accountData.createdAt,
    //       newUser.accountData.hash,
    //     ],
    //   );
    //   const insertedId = insertedIdResult[0].id;
    //   await this.dataSource.query(
    //     `
    //   INSERT INTO "USERS_GLOBAL_BAN"
    //   ("userId", "isBanned", "banReason")
    //   VALUES ($1, $2, $3)
    //         `,
    //     [
    //       insertedId,
    //       newUser.globalBanInfo.isBanned,
    //       newUser.globalBanInfo.banReason,
    //     ],
    //   );
    //   await queryRunner.query(
    //     `
    //   INSERT INTO "USERS_CONFIRMATIONS"
    //   ("userId", "confirmationCode", "confirmationExpirationDate", "isConfirmed")
    //   VALUES ($1, $2, $3, $4)
    //         `,
    //     [
    //       insertedId,
    //       newUser.emailConfirmationData.confirmationCode,
    //       newUser.emailConfirmationData.expirationDate,
    //       newUser.emailConfirmationData.isConfirmed,
    //     ],
    //   );
    //   await queryRunner.query(
    //     `
    //   INSERT INTO "USERS_RECOVERY"
    //   ("userId", "recoveryCode", "recoveryExpirationDate")
    //   VALUES ($1, $2, $3)
    //         `,
    //     [
    //       insertedId,
    //       newUser.recoveryCodeData.recoveryCode,
    //       newUser.recoveryCodeData.expirationDate,
    //     ],
    //   );
    //   await queryRunner.commitTransaction();
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
  catch(e) {
    console.log(e);
    // await queryRunner.rollbackTransaction();
    return null;
  }
  //finally {
  // await queryRunner.release();
  //}
  async deleteUser(id: string): Promise<boolean> {
    try {
      const result = await this.dataSource.query(
        `
DELETE FROM "USERS" AS u
WHERE u."id" = $1;
        `,
        [id],
      );
      return result[1] > 0;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
  async findByLoginOrEmail(loginOrEmail: string): Promise<User> {
    try {
      const result = await this.dataSource.query(
        sqlUserJoinQuery +
          `
        WHERE u."login" = $1 OR u."email" = $1
      `,
        [loginOrEmail],
      );
      if (result.length < 1) return null;
      const foundUser: UserSqlJoinedType = result[0];
      return this._mapUserSqlJoinedTypeToUserType(foundUser);
    } catch (e) {
      console.log(e);
      return;
    }
  }
  async findByConfirmationCode(emailConfirmationCode: string): Promise<User> {
    try {
      const result = await this.dataSource.query(
        sqlUserJoinQuery +
          `
        WHERE c."confirmationCode" = $1
      `,
        [emailConfirmationCode],
      );
      if (result.length < 1) return null;
      const foundUser: UserSqlJoinedType = result[0];
      return this._mapUserSqlJoinedTypeToUserType(foundUser);
    } catch (e) {
      console.log(e);
      return;
    }
  }
  async findByRecoveryCode(recoveryCode: string): Promise<User> {
    try {
      const result = await this.dataSource.query(
        sqlUserJoinQuery +
          `
        WHERE r."recoveryCode" = $1
      `,
        [recoveryCode],
      );
      if (result.length < 1) return null;
      const foundUser: UserSqlJoinedType = result[0];
      return this._mapUserSqlJoinedTypeToUserType(foundUser);
    } catch (e) {
      console.log(e);
      return;
    }
  }
  async confirmationSetUser(userId: string): Promise<boolean> {
    try {
      await this.dataSource.query(
        `
UPDATE "USERS_CONFIRMATIONS"
SET "isConfirmed" = true
WHERE "userId" = $1
      `,
        [userId],
      );
    } catch (e) {
      return false;
    }
    return true;
  }
  async updateConfirmationCode(userId: string, newCode: string): Promise<void> {
    const userSearchResult = await this.dataSource.query(
      `
SELECT * FROM "USERS"
WHERE "id" = $1
    `,
      [userId],
    );
    if (userSearchResult.length < 1) {
      return;
    } else {
      await this.dataSource.query(
        `
UPDATE "USERS_CONFIRMATIONS"
SET "confirmationCode" = $1
WHERE "userId" = $2
      `,
        [newCode, userId],
      );
    }
  }
  async updateRecoveryCode(id: string, newRecoveryCode: string): Promise<void> {
    const userSearchResult = await this.dataSource.query(
      `
SELECT * FROM "USERS"
WHERE "id" = $1
    `,
      [id],
    );
    if (userSearchResult.length < 1) {
      return;
    } else {
      await this.dataSource.query(
        `
UPDATE "USERS_RECOVERY"
SET "recoveryCode" = $1, "recoveryExpirationDate" = $2
WHERE "userId" = $3
      `,
        [newRecoveryCode, new Date(), id],
      );
      return;
    }
  }
  async updateHashByRecoveryCode(id: string, newHash: string): Promise<void> {
    const userSearchResult = await this.dataSource.query(
      `
SELECT * FROM "USERS"
WHERE "id" = $1
    `,
      [id],
    );
    if (userSearchResult.length < 1) {
      return;
    } else {
      await this.dataSource.query(
        `
UPDATE "USERS"
SET "hash" = $1
WHERE "id" = $2
      `,
        [newHash, id],
      );
      return;
    }
  }
  async banUserById(
    userId: string,
    isBanned: boolean,
    banReason: string,
  ): Promise<void> {
    if (isBanned) {
      await this.dataSource.query(
        `
UPDATE "USERS_GLOBAL_BAN"
SET "isBanned" = $1, "banDate" = $2, "banReason" = $3
WHERE "userId" = $4
        `,
        [isBanned, new Date(), banReason, userId],
      );
    } else {
      await this.dataSource.query(
        `
UPDATE "USERS_GLOBAL_BAN"
SET "isBanned" = $1, "banDate" = null, "banReason" = null
WHERE "userId" = $2
        `,
        [isBanned, userId],
      );
    }
    return;
  }
  private _mapUserSqlJoinedTypeToUserType(user: UserSqlJoinedType): User {
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
