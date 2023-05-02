import { IsNotEmpty, IsString } from 'class-validator';
import { Trim } from '../../auth/decorators/validation-decorators/trim.decorator';
import { IsLike } from '../decorators/is-like.decorator';
import { LikeStatus } from '../types/likes.types';

export class InputLikeStatusDto {
  @IsLike()
  @IsString()
  @IsNotEmpty()
  @Trim()
  likeStatus: LikeStatus;
}
