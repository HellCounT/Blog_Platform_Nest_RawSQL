import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserBannedByBloggerDocument = HydratedDocument<UserBannedByBlogger>;

@Schema()
export class UserBannedByBlogger {
  @Prop({ required: true })
  blogId: string;
  @Prop({ required: true })
  blogOwnerId: string;
  @Prop({ required: true })
  bannedUserId: string;
  @Prop({ required: true })
  bannedUserLogin: string;
  @Prop({ required: true, minlength: 20 })
  banReason: string;
  @Prop({ required: true })
  banDate: Date;
}

export const UserBannedByBloggerSchema =
  SchemaFactory.createForClass(UserBannedByBlogger);
