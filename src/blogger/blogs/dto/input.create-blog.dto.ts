import { IsNotEmpty, IsUrl, MaxLength } from 'class-validator';
import { Trim } from '../../../auth/decorators/validation-decorators/trim.decorator';

export class InputBlogCreateDto {
  @Trim()
  @IsNotEmpty()
  @MaxLength(15, { message: 'Incorrect name length' })
  name: string;
  @Trim()
  @IsNotEmpty()
  @MaxLength(500, { message: 'Incorrect description length' })
  description: string;
  @Trim()
  @IsNotEmpty()
  @MaxLength(100, { message: 'Max URL length exceeded' })
  @IsUrl({}, { message: 'websiteUrl is not an URL' })
  websiteUrl: string;
}
