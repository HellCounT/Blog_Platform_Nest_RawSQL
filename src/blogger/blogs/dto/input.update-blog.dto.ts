import { IsUrl, Length, MaxLength } from 'class-validator';
import { Trim } from '../../../auth/decorators/validation-decorators/trim.decorator';

export class InputUpdateBlogDto {
  @Trim()
  @Length(1, 15, { message: 'Incorrect name length' })
  name: string;
  @Trim()
  @Length(1, 500, { message: 'Incorrect description length' })
  description: string;
  @Trim()
  @IsUrl({}, { message: 'Value is not an URL' })
  @MaxLength(100, { message: 'Max URL length exceeded' })
  websiteUrl: string;
}
