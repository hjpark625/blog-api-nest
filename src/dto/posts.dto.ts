import type { Model, ObjectId } from 'mongoose';

export interface IImageFileType {
  filename: string;
  imageUrl: string;
}

export interface IPostsSchemaType {
  title: string;
  body: string;
  createdAt: Date;
  images: IImageFileType[];
  updatedAt: Date | null;
  user: {
    _id: ObjectId;
    nickname: string;
  };
}

export type IPostsModelType = Model<IPostsSchemaType, object, object>;
