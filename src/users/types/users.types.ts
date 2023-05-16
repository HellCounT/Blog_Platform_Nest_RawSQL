export type UserViewModelType = {
  id: string;
  login: string;
  email: string;
  createdAt: string;
};

export type UserPaginatorType = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: UserViewModelType[];
};

export class User {
  constructor(
    public id: string,
    public accountData: {
      login: string;
      email: string;
      hash: string;
      createdAt: string;
    },
    public emailConfirmationData: {
      confirmationCode: string;
      expirationDate: string;
      isConfirmed: boolean;
    },
    public recoveryCodeData: {
      recoveryCode?: string;
      expirationDate?: Date;
    },
    public globalBanInfo: {
      isBanned: boolean;
      banDate?: Date | null;
      banReason?: string | null;
    },
  ) {}
}

export type UserSqlJoinedType = {
  id: string;
  login: string;
  email: string;
  hash: string;
  createdAt: string;
  confirmationCode: string;
  confirmationExpirationDate: string;
  isConfirmed: boolean;
  recoveryCode?: string;
  recoveryExpirationDate?: Date;
  isBanned: boolean;
  banDate?: Date | null;
  banReason?: string | null;
};

export type UserAndBanInfoSqlType = {
  id: string;
  login: string;
  email: string;
  createdAt: string;
  isBanned: boolean;
  banDate?: Date | null;
  banReason?: string | null;
};

export type UserQueryType = {
  id: string;
  login: string;
  email: string;
};
