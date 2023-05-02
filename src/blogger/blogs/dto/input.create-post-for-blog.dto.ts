import { Length } from 'class-validator';
import { Trim } from '../../../auth/decorators/validation-decorators/trim.decorator';

export class InputCreatePostForBlogDto {
  @Trim()
  @Length(1, 30, { message: 'Incorrect title length' })
  title: string;
  @Trim()
  @Length(1, 100, { message: 'Incorrect short description length' })
  shortDescription: string;
  @Trim()
  @Length(1, 1000, { message: 'Incorrect content length' })
  content: string;
}
