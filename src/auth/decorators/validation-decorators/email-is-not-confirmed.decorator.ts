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
export class EmailIsNotConfirmedConstraint
  implements ValidatorConstraintInterface
{
  constructor(private readonly usersRepo: UsersRepository) {}

  async validate(email: string): Promise<boolean> {
    const user = await this.usersRepo.findByLoginOrEmail(email);
    return !(!user || user.emailConfirmationData.isConfirmed === true);
  }
  defaultMessage() {
    return `email is already confirmed or not exists`;
  }
}

export function EmailIsNotConfirmed(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: EmailIsNotConfirmedConstraint,
    });
  };
}
