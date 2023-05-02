import {
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';
import { Trim } from '../../../auth/decorators/validation-decorators/trim.decorator';

export class InputBanUserForBlogDto {
  @IsNotEmpty()
  @IsBoolean()
  isBanned: boolean;

  @MinLength(20)
  @IsString()
  @IsNotEmpty()
  @Trim()
  banReason: string;

  @IsString()
  @IsNotEmpty()
  @Trim()
  @IsMongoId()
  blogId: string;
}
