import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { IsNewLogin } from '../decorators/validation-decorators/is-new-login.decorator';
import { Trim } from '../decorators/validation-decorators/trim.decorator';
import { IsUniqueEmail } from '../decorators/validation-decorators/is-unique-email.decorator';

export class InputRegistrationUserDto {
  @IsNewLogin({ message: 'Login is not valid' })
  @Matches(/^[a-zA-Z0-9_-]*$/, { message: 'Incorrect login pattern' })
  @Length(3, 10, { message: 'Incorrect login length' })
  @IsString({ message: 'Invalid format' })
  @IsNotEmpty({ message: 'Login is not provided' })
  @Trim()
  login: string;

  @Length(6, 20)
  @IsString({ message: 'Invalid format' })
  @IsNotEmpty({ message: 'Password is not provided' })
  @Trim()
  password: string;

  @IsUniqueEmail({ message: 'Email is not valid' })
  @IsEmail({}, { message: 'Invalid email address format' })
  @IsString({ message: 'Invalid format' })
  @IsNotEmpty({ message: 'Email is not provided' })
  @Trim()
  email: string;
}
