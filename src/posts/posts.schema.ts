import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import type { ObjectId } from 'mongoose';

@Schema()
export class Posts extends Document {
  @Prop({ type: String, required: true })
  title!: string;

  @Prop({ type: String, required: true })
  body!: string;

  @Prop({ type: Date, default: Date.now() })
  createdAt!: Date;

  @Prop({ type: Date, default: null })
  updatedAt!: Date;

  @Prop({ type: Array })
  images!: { filename: string; imageUrl: string }[];

  @Prop({ type: Object })
  user!: { _id: ObjectId; username: string };
}

export const PostsSchema = SchemaFactory.createForClass(Posts);
