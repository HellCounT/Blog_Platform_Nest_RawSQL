import { BadRequestException, Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { UsersRepository } from '../../../users/users.repository';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsCorrectRecoveryCodeConstraint
  implements ValidatorConstraintInterface
{
  constructor(private readonly usersRepo: UsersRepository) {}

  async validate(recoveryCode: string) {
    const user = await this.usersRepo.findByRecoveryCode(recoveryCode);
    if (!user) {
      throw new BadRequestException();
    }
    if (user.recoveryCodeData.recoveryCode !== recoveryCode) {
      throw new BadRequestException();
    }
    if (user.recoveryCodeData.expirationDate < new Date()) {
      throw new BadRequestException();
    }
    return true;
  }
}

export function IsCorrectRecoveryCode(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsCorrectRecoveryCodeConstraint,
    });
  };
}
