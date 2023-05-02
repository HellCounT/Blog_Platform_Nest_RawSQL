import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { BlogsQuery } from '../../blogs.query';

@ValidatorConstraint({ async: true })
@Injectable()
export class BlogExistsConstraint implements ValidatorConstraintInterface {
  constructor(private readonly blogsQuery: BlogsQuery) {}

  async validate(blogId: string) {
    const blog = await this.blogsQuery.findBlogById(blogId);
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
