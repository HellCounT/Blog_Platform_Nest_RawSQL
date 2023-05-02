import { IsNotEmpty, IsString } from 'class-validator';
import { Trim } from '../decorators/validation-decorators/trim.decorator';
import { EmailConfirmationCodeIsCorrect } from '../decorators/validation-decorators/confirmation-code-is-correct.decorator';
export class InputConfirmationCodeDto {
  @EmailConfirmationCodeIsCorrect()
  @IsString()
  @IsNotEmpty()
  @Trim()
  code: string;
}
