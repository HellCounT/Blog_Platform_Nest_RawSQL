import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type ExpiredTokenDocument = HydratedDocument<ExpiredToken>;

@Schema()
export class ExpiredToken {
  @Prop({ required: true })
  userId: string;
  @Prop({ required: true })
  refreshTokenMeta: string;
}

export const ExpiredTokenSchema = SchemaFactory.createForClass(ExpiredToken);
