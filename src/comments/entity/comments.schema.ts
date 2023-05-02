import mongoose, { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  LikesInfo,
  LikesInfoSchema,
} from '../../likes/entity/likes-info.schema';

export type CommentDocument = HydratedDocument<Comment>;

@Schema({ _id: false })
class CommentatorInfo {
  @Prop({ required: true })
  userId: string;
  @Prop({ required: true })
  userLogin: string;
  @Prop({ required: true })
  isBanned: boolean;
}

const CommentatorInfoSchema = SchemaFactory.createForClass(CommentatorInfo);

@Schema()
export class Comment {
  @Prop({ required: true })
  _id: mongoose.Types.ObjectId;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true, type: CommentatorInfoSchema })
  commentatorInfo: CommentatorInfo;

  @Prop({ required: true })
  postId: string;

  @Prop({ required: true })
  bloggerId: string;

  @Prop({ required: true })
  createdAt: string;

  @Prop({ required: true, type: LikesInfoSchema })
  likesInfo: LikesInfo;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
