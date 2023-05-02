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
export class EmailConfirmationCodeIsCorrectConstraint
  implements ValidatorConstraintInterface
{
  constructor(private readonly usersRepo: UsersRepository) {}

  async validate(emailConfirmationCode: string): Promise<boolean> {
    const foundUser = await this.usersRepo.findByConfirmationCode(
      emailConfirmationCode,
    );
    return !(
      !foundUser ||
      foundUser.emailConfirmationData.confirmationCode !==
        emailConfirmationCode ||
      foundUser.emailConfirmationData.isConfirmed ||
      new Date(foundUser.emailConfirmationData.expirationDate) < new Date()
    );
  }
  defaultMessage() {
    return `email is already confirmed or not exists`;
  }
}

export function EmailConfirmationCodeIsCorrect(
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: EmailConfirmationCodeIsCorrectConstraint,
    });
  };
}
