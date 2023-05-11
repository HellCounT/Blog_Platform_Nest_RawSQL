import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { BlogsRepository } from '../../blogs.repository';

@ValidatorConstraint({ async: true })
@Injectable()
export class BlogExistsConstraint implements ValidatorConstraintInterface {
  constructor(private readonly blogsRepo: BlogsRepository) {}

  async validate(blogId: string) {
    const blog = await this.blogsRepo.getBlogById(blogId);
    return !!blog;
  }
  defaultMessage() {
    return `Blog is not found`;
  }
}

export function BlogExists(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: BlogExistsConstraint,
    });
  };
}
