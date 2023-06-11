import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class User extends Document {
  @Prop({ required: true })
  email!: string;

  @Prop()
  nickname!: string;

  @Prop({ required: true })
  hashedPassword!: string;

  @Prop({ default: Date.now() })
  registeredAt!: Date;

  @Prop({ default: null })
  updatedAt!: Date;

  @Prop()
  refreshToken!: string;

  @Prop()
  accessToken!: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
