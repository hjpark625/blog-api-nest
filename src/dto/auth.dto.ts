import type { Model, HydratedDocument, ObjectId } from 'mongoose';
import type { JwtPayload } from 'jsonwebtoken';

export class RegisterInfoDto {
  email!: string;
  nickname!: string | null;
  password!: string;
}

export class UserSchemaDto {
  email!: string;
  nickname!: string;
  hashedPassword!: string;
  password?: string;
  registeredAt!: Date;
  updatedAt!: Date;
  refreshToken?: string;
}

export interface IUserInstanceType extends UserSchemaDto {
  setPassword: (password: string) => Promise<void>;
  checkPassword: (password: string) => Promise<boolean>;
  serialize: () => UserSchemaDto;
  generateAccessToken: () => string;
  generateRefreshToken: () => string;
  saveRefreshToken: (refreshToken: string) => Promise<void>;
}

export interface IUserModelType extends Model<UserSchemaDto, object, IUserInstanceType> {
  findByUserEmail: (email: string) => Promise<HydratedDocument<UserSchemaDto, IUserInstanceType>>;
}

export interface IDecodedTokenInfoType extends JwtPayload {
  _id: ObjectId;
  email: string;
  nickname: string;
}
