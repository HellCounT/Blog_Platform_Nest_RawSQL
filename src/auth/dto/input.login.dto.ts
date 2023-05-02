import { IsNotEmpty, IsString } from 'class-validator';
import { Trim } from '../decorators/validation-decorators/trim.decorator';

export class InputLoginUserDto {
  @IsString({ message: 'invalid format' })
  @IsNotEmpty({ message: 'login or email has not been provided' })
  @Trim()
  loginOrEmail: string;

  @IsString({ message: 'invalid format' })
  @IsNotEmpty({ message: 'password has not been provided' })
  @Trim()
  password: string;
}
