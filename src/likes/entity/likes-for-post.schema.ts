import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { LikeStatus } from '../types/likes.types';

export type LikeForPostDocument = HydratedDocument<LikeForPost>;

@Schema()
export class LikeForPost {
  @Prop({ required: true })
  _id: mongoose.Types.ObjectId;
  @Prop({ required: true })
  postId: string;
  @Prop({ required: true })
  userId: string;
  @Prop({ required: true })
  userLogin: string;
  @Prop({ required: true, default: false })
  isBanned: boolean;
  @Prop({ required: true })
  addedAt: Date;
  @Prop({ required: true })
  likeStatus: LikeStatus;
}

export const LikesForPostsSchema = SchemaFactory.createForClass(LikeForPost);
