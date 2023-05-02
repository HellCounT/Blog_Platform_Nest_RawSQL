import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { LikeStatus } from '../types/likes.types';

@ValidatorConstraint()
export class IsLikeConstraint implements ValidatorConstraintInterface {
  validate(likeStatus: LikeStatus) {
    return Object.values(LikeStatus).includes(likeStatus);
  }
  defaultMessage() {
    return `Incorrect LikeStatus format`;
  }
}

export function IsLike(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsLikeConstraint,
    });
  };
}
