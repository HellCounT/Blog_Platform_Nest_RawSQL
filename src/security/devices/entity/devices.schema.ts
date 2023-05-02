import mongoose, { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type DeviceDocument = HydratedDocument<Device>;

@Schema()
export class Device {
  @Prop({ required: true })
  userId: mongoose.Types.ObjectId;
  @Prop({ required: true })
  ip: string;
  @Prop({ required: true })
  deviceName: string;
  @Prop({ required: true })
  issuedAt: Date;
  @Prop({ required: true })
  expirationDate: Date;
  @Prop({ required: true })
  refreshTokenMeta: string;
}

export const DeviceSchema = SchemaFactory.createForClass(Device);
