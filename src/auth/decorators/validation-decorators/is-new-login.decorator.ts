import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { UsersRepository } from '../../../users/users.repository';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsNewLoginConstraint implements ValidatorConstraintInterface {
  constructor(private readonly usersRepo: UsersRepository) {}

  async validate(login: string) {
    return !(await this.usersRepo.findByLoginOrEmail(login));
  }
  defaultMessage() {
    return 'Logins already exists';
  }
}

export function IsNewLogin(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsNewLoginConstraint,
    });
  };
}
