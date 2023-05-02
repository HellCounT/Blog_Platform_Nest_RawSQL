import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { Trim } from '../decorators/validation-decorators/trim.decorator';
import { EmailIsNotConfirmed } from '../decorators/validation-decorators/email-is-not-confirmed.decorator';

export class InputEmailDto {
  @EmailIsNotConfirmed()
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  @Trim()
  email: string;
}
