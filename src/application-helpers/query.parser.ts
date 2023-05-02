export type QueryParser = {
  searchNameTerm: string | null;
  sortBy: string;
  sortDirection: 1 | -1;
  pageNumber: number;
  pageSize: number;
};
export type UserQueryParser = {
  banStatus: BanStatus;
  sortBy: string;
  sortDirection: 1 | -1;
  pageNumber: number;
  pageSize: number;
  searchLoginTerm: string | null;
  searchEmailTerm: string | null;
};

export const parseQueryPagination = (query): QueryParser => {
  const queryParamsParser: QueryParser = {
    searchNameTerm: null,
    sortBy: 'createdAt',
    sortDirection: -1,
    pageNumber: 1,
    pageSize: 10,
  };
  if (query.searchNameTerm)
    queryParamsParser.searchNameTerm = query.searchNameTerm.toString();
  if (query.sortBy) queryParamsParser.sortBy = query.sortBy.toString();
  if (query.sortDirection && query.sortDirection.toString() === 'asc')
    queryParamsParser.sortDirection = 1;
  if (query.pageNumber) queryParamsParser.pageNumber = +query.pageNumber;
  if (query.pageSize) queryParamsParser.pageSize = +query.pageSize;
  return queryParamsParser;
};

export const parseUserQueryPagination = (query): UserQueryParser => {
  const queryUserParamsParser: UserQueryParser = {
    banStatus: BanStatus.all,
    sortBy: 'createdAt',
    sortDirection: -1,
    pageNumber: 1,
    pageSize: 10,
    searchEmailTerm: null,
    searchLoginTerm: null,
  };
  if (query.searchLoginTerm)
    queryUserParamsParser.searchLoginTerm = query.searchLoginTerm.toString();
  if (query.searchEmailTerm)
    queryUserParamsParser.searchEmailTerm = query.searchEmailTerm.toString();
  if (query.sortBy) queryUserParamsParser.sortBy = query.sortBy.toString();
  if (query.sortDirection && query.sortDirection.toString() === 'asc')
    queryUserParamsParser.sortDirection = 1;
  if (query.pageNumber) queryUserParamsParser.pageNumber = +query.pageNumber;
  if (query.pageSize) queryUserParamsParser.pageSize = +query.pageSize;
  if (query.banStatus) queryUserParamsParser.banStatus = query.banStatus;
  return queryUserParamsParser;
};

export enum BanStatus {
  all = 'all',
  banned = 'banned',
  notBanned = 'notBanned',
}
