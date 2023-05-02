import { IsNotEmpty } from 'class-validator';

export class InputSABanBlogDto {
  @IsNotEmpty()
  isBanned: true;
}
