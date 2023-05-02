import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Trim } from '../../../auth/decorators/validation-decorators/trim.decorator';

export class InputBanUserDto {
  @IsNotEmpty()
  isBanned: boolean;

  @MinLength(20)
  @IsString()
  @IsNotEmpty()
  @Trim()
  banReason: string;
}
