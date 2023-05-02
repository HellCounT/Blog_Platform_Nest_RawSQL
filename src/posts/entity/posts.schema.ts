import mongoose, { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  LikesInfo,
  LikesInfoSchema,
} from '../../likes/entity/likes-info.schema';

export type PostDocument = HydratedDocument<Post>;

@Schema()
class PostOwnerInfo {
  @Prop({ required: true, maxlength: 50 })
  userId: string;

  @Prop({ required: true, default: false })
  isBanned: boolean;
}

export const PostOwnerInfoSchema = SchemaFactory.createForClass(PostOwnerInfo);

@Schema()
export class Post {
  @Prop({ required: true })
  _id: mongoose.Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  shortDescription: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  blogId: string;

  @Prop({ required: true })
  blogName: string;

  @Prop({ required: true })
  createdAt: Date;

  @Prop({ required: true, type: LikesInfoSchema })
  likesInfo: LikesInfo;

  @Prop({ required: true, type: PostOwnerInfoSchema })
  postOwnerInfo: PostOwnerInfo;

  @Prop({ required: true })
  parentBlogIsBanned: boolean;
}

export const PostSchema = SchemaFactory.createForClass(Post);
