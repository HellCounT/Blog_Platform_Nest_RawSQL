import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { Trim } from '../decorators/validation-decorators/trim.decorator';

export class InputEmailPasswordRecoveryDto {
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  @Trim()
  email: string;
}
