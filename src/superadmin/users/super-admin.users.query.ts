import {
  BanStatus,
  UserQueryParser,
} from '../../application-helpers/query.parser';
import {
  UserAndBanInfoSqlType,
  UserPaginatorType,
} from '../../users/types/users.types';
import { OutputSuperAdminUserDto } from './dto/output.super-admin.user.dto';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class SuperAdminUsersQuery {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}
  async viewAllUsers(q: UserQueryParser): Promise<UserPaginatorType> {
    const allUsersCount = await this.dataSource.query(
      `
SELECT COUNT(*)
FROM "USERS" as u
JOIN "USERS_GLOBAL_BAN" as b
ON u."id" = b."userId"
WHERE ${this._getBanStatusForQuery(q.banStatus)} (
    u."login" ILIKE '%' || COALESCE($1, '') || '%'
    OR
    u."email" ILIKE '%' || COALESCE($2, '') || '%'
)
      `,
      [q.searchLoginTerm, q.searchEmailTerm],
    );
    const offsetSize = (q.pageNumber - 1) * q.pageSize;
    const reqPageUsers: UserAndBanInfoSqlType[] = await this.dataSource.query(
      `
SELECT u."id", u."login", u."email", u."createdAt", 
b."isBanned", b."banDate", b."banReason"
FROM "USERS" as u
JOIN "USERS_GLOBAL_BAN" as b
ON u."id" = b."userId"
WHERE ${this._getBanStatusForQuery(q.banStatus)} (
    u."login" ILIKE '%' || COALESCE($1, '') || '%'
    OR
    u."email" ILIKE '%' || COALESCE($2, '') || '%'
) ${this._pickOrderForQuery(q.sortBy, q.sortDirection)}
LIMIT $3 OFFSET $4
      `,
      [q.searchLoginTerm, q.searchEmailTerm, q.pageSize, offsetSize],
    );
    const pageUsers = reqPageUsers.map((u) => this._mapUserToSAViewType(u));
    return {
      pagesCount: Math.ceil(allUsersCount / q.pageSize),
      page: q.pageNumber,
      pageSize: q.pageSize,
      totalCount: allUsersCount,
      items: pageUsers,
    };
  }
  private _mapUserToSAViewType(
    user: UserAndBanInfoSqlType,
  ): OutputSuperAdminUserDto {
    let banDateString;
    if (user.banDate === null) banDateString = null;
    else banDateString = user.banDate.toISOString();
    return {
      id: user.id,
      login: user.login,
      email: user.email,
      createdAt: user.createdAt,
      banInfo: {
        isBanned: user.isBanned,
        banDate: banDateString,
        banReason: user.banReason,
      },
    };
  }
  private _getBanStatusForQuery(banStatus: BanStatus): string {
    if (banStatus === BanStatus.banned) {
      return `b."isBanned" = true AND `;
    } else if (banStatus === BanStatus.notBanned) {
      return `b."isBanned" = false AND `;
    } else return ``;
  }
  private _pickOrderForQuery(order: string, direction: 1 | -1): string {
    let orderString = 'ORDER BY';
    switch (order) {
      case 'id':
        orderString += ' u."id"';
        break;
      case 'login':
        orderString += ' u."login"';
        break;
      case 'email':
        orderString += ' u."email"';
        break;
      default:
        orderString = 'ORDER BY u."createdAt"';
    }
    if (direction === 1) {
      orderString += ' ASC';
    } else {
      orderString += ' DESC';
    }
    return orderString;
  }
}
