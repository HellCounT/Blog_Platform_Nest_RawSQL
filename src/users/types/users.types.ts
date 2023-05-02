import mongoose from 'mongoose';

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

export class UserDb {
  constructor(
    public _id: mongoose.Types.ObjectId,
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
