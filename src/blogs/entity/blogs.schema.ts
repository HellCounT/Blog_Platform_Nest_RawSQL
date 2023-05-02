import mongoose, { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type BlogDocument = HydratedDocument<Blog>;

@Schema({ _id: false })
class BlogOwnerInfo {
  @Prop({ required: true, maxlength: 50 })
  userId: string;

  @Prop({ required: true, maxlength: 50 })
  userLogin: string;

  @Prop({ required: true })
  isBanned: boolean;
}

export const BlogOwnerInfoSchema = SchemaFactory.createForClass(BlogOwnerInfo);

@Schema()
export class Blog {
  @Prop({ required: true })
  _id: mongoose.Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  websiteUrl: string;

  @Prop({ required: true })
  createdAt: string;

  @Prop({ required: true })
  isMembership: boolean;

  @Prop({ required: true, type: BlogOwnerInfoSchema })
  blogOwnerInfo: BlogOwnerInfo;

  @Prop({ required: true })
  isBanned: boolean;

  @Prop({ required: false })
  banDate: Date | null;
}

export const BlogSchema = SchemaFactory.createForClass(Blog);
