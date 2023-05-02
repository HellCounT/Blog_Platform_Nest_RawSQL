import { CommentViewDto } from './output.comment.view.dto';

export class CommentPaginatorDto {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: CommentViewDto[];
}
