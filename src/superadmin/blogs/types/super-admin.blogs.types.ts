import { OutputSuperAdminBlogDto } from '../dto/output.super-admin.blog.dto';

export type BlogSAPaginatorType = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: OutputSuperAdminBlogDto[];
};
