export type BlogViewModelType = {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  isMembership: boolean;
};

export class Blog {
  constructor(
    public id: string,
    public name: string,
    public description: string,
    public websiteUrl: string,
    public createdAt: string,
    public isMembership: boolean,
    public ownerId: string,
    public isBanned: boolean,
    public banDate: Date | null,
  ) {}
}

export type BlogDbJoinedType = {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  isMembership: boolean;
  ownerId: string;
  ownerLogin: string;
  ownerIsBanned: boolean;
  isBanned: boolean;
  banDate: Date | null;
};

export type BlogPaginatorType = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: BlogViewModelType[];
};
