import { IsMongoId, IsNotEmpty, IsString, Length } from 'class-validator';
import { BlogExists } from '../../blogs/decorators/validation-decorators/blog-exists.decorator';
import { Trim } from '../../auth/decorators/validation-decorators/trim.decorator';

export class InputCreatePostDto {
  @IsString({ message: 'Invalid format' })
  @IsNotEmpty({ message: 'Field is not provided' })
  @Trim()
  @Length(1, 30, { message: 'Incorrect title length' })
  title: string;
  @IsString({ message: 'Invalid format' })
  @IsNotEmpty({ message: 'Field is not provided' })
  @Trim()
  @Length(1, 100, { message: 'Incorrect short description length' })
  shortDescription: string;
  @IsString({ message: 'Invalid format' })
  @IsNotEmpty({ message: 'Field is not provided' })
  @Trim()
  @Length(1, 1000, { message: 'Incorrect content length' })
  content: string;
  @IsMongoId({ message: 'Invalid id pattern' })
  @BlogExists({ message: 'Blog does not exist' })
  @IsString({ message: 'Invalid format' })
  @IsNotEmpty({ message: 'Field is not provided' })
  @Trim()
  blogId: string;
}
