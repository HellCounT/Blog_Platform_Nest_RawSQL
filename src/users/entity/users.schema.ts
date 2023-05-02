import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ _id: false })
class AccountData {
  @Prop({ required: true })
  login: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  hash: string;

  @Prop({ required: true })
  createdAt: string;
}

const AccountDataSchema = SchemaFactory.createForClass(AccountData);

@Schema({ _id: false })
class EmailConfirmationData {
  @Prop({ required: true })
  confirmationCode: string;
  @Prop({ required: true })
  expirationDate: string;
  @Prop({ required: true })
  isConfirmed: boolean;
}

const EmailConfirmationDataSchema = SchemaFactory.createForClass(
  EmailConfirmationData,
);

@Schema({ _id: false })
class RecoveryCodeData {
  @Prop({ required: false })
  recoveryCode: string;
  @Prop({ required: false })
  expirationDate: Date;
}

const RecoveryCodeDataSchema = SchemaFactory.createForClass(RecoveryCodeData);

@Schema({ _id: false })
export class GlobalBanInfo {
  @Prop({ required: true, default: false })
  isBanned: boolean;

  @Prop({ required: false })
  banDate: Date | null;

  @Prop({ minlength: 20, maxlength: 100 })
  banReason: string | null;
}

const GlobalBanInfoSchema = SchemaFactory.createForClass(GlobalBanInfo);

@Schema()
export class User {
  @Prop({ required: true, type: AccountDataSchema })
  accountData: AccountData;

  @Prop({ required: true, type: EmailConfirmationDataSchema })
  emailConfirmationData: EmailConfirmationData;

  @Prop({ required: false, type: RecoveryCodeDataSchema })
  recoveryCodeData: RecoveryCodeData;

  @Prop({ required: true, type: GlobalBanInfoSchema })
  globalBanInfo: GlobalBanInfo;
}

export const UserSchema = SchemaFactory.createForClass(User);
