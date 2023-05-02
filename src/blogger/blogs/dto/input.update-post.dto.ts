import { IsString, Length } from 'class-validator';
import { Trim } from '../../../auth/decorators/validation-decorators/trim.decorator';

export class InputUpdatePostDto {
  @IsString({ message: 'Invalid format' })
  @Trim()
  @Length(1, 30, { message: 'Incorrect title length' })
  title: string;
  @IsString({ message: 'Invalid format' })
  @Trim()
  @Length(1, 100, { message: 'Incorrect short description length' })
  shortDescription: string;
  @IsString({ message: 'Invalid format' })
  @Trim()
  @Length(1, 1000, { message: 'Incorrect content length' })
  content: string;
}
