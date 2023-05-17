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

export const getBanStatusForQuery = (banStatus: BanStatus): string => {
  if (banStatus === BanStatus.banned) {
    return `b."isBanned" = true AND `;
  } else if (banStatus === BanStatus.notBanned) {
    return `b."isBanned" = false AND `;
  } else return ``;
};
export const pickOrderForUsersQuery = (
  order: string,
  direction: 1 | -1,
): string => {
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
};

export const pickOrderForBannedByBloggerUsersQuery = (
  order: string,
  direction: 1 | -1,
): string => {
  let orderString = 'ORDER BY';
  switch (order) {
    case 'id':
      orderString += ' u."id"';
      break;
    case 'login':
      orderString += ' u."login"';
      break;
    case 'email':
      orderString += ' "banDate"';
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
};

export const pickOrderForBlogsQuery = (
  order: string,
  direction: 1 | -1,
): string => {
  let orderString = 'ORDER BY';
  switch (order) {
    case 'id':
      orderString += ' b."id"';
      break;
    case 'name':
      orderString += ' b."name"';
      break;
    case 'description':
      orderString += ' b."description"';
      break;
    case 'websiteUrl':
      orderString += ' b."websiteUrl"';
      break;
    case 'ownerId':
      orderString += ' b."ownerId"';
      break;
    default:
      orderString = 'ORDER BY b."createdAt"';
  }
  if (direction === 1) {
    orderString += ' ASC';
  } else {
    orderString += ' DESC';
  }
  return orderString;
};

export const pickOrderForPostsQuery = (
  order: string,
  direction: 1 | -1,
): string => {
  let orderString = 'ORDER BY';
  switch (order) {
    case 'id':
      orderString += ' p."id"';
      break;
    case 'title':
      orderString += ' p."title"';
      break;
    case 'shortDescription':
      orderString += ' p."shortDescription"';
      break;
    case 'blogId':
      orderString += ' p."blogId"';
      break;
    case 'ownerId':
      orderString += ' p."ownerId"';
      break;
    default:
      orderString = 'ORDER BY p."createdAt"';
  }
  if (direction === 1) {
    orderString += ' ASC';
  } else {
    orderString += ' DESC';
  }
  return orderString;
};

export const pickOrderForCommentsQuery = (
  order: string,
  direction: 1 | -1,
): string => {
  let orderString = 'ORDER BY';
  switch (order) {
    case 'id':
      orderString += ' c."id"';
      break;
    case 'content':
      orderString += ' c."content"';
      break;
    case 'userId':
      orderString += ' c."useId"';
      break;
    case 'postId':
      orderString += ' c."postId"';
      break;
    case 'likesCount':
      orderString += ' c."likesCount"';
      break;
    case 'dislikesCount':
      orderString += ' c."dislikesCount"';
      break;
    default:
      orderString = 'ORDER BY c."createdAt"';
  }
  if (direction === 1) {
    orderString += ' ASC';
  } else {
    orderString += ' DESC';
  }
  return orderString;
};

export enum BanStatus {
  all = 'all',
  banned = 'banned',
  notBanned = 'notBanned',
}
