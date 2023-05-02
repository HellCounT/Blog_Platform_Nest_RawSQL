import { IsNotEmpty, IsString, Length } from 'class-validator';
import { Trim } from '../decorators/validation-decorators/trim.decorator';
import { IsCorrectRecoveryCode } from '../decorators/validation-decorators/is-correct-recovery-code.decorator';

export class InputNewPasswordDto {
  @Length(6, 20, { message: 'Incorrect password length' })
  @IsString({ message: 'invalid format' })
  @IsNotEmpty({ message: 'new password has not been provided' })
  @Trim()
  newPassword: string;

  @IsCorrectRecoveryCode({ message: 'Incorrect code' })
  @IsString({ message: 'invalid format' })
  @IsNotEmpty({ message: 'recovery code has not been provided' })
  @Trim()
  recoveryCode: string;
}
