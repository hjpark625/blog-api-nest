import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import type { ObjectId } from 'mongoose';
import { User, UserSchema } from './auth.schema';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: User.name,
        useFactory: () => {
          const schema = UserSchema;

          schema.methods.setPassword = async function (password: string) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            this.hashedPassword = hashedPassword;
          };

          schema.methods.checkPassword = async function (password: string) {
            const result = await bcrypt.compare(password, this.hashedPassword);
            return result;
          };

          schema.methods.saveRefreshToken = async function (refreshToken: string) {
            this.refreshToken = refreshToken;
            await this.save();
          };

          schema.methods.serialize = function () {
            const data = this.toJSON();
            delete data.hashedPassword;
            delete data.refreshToken;
            return data;
          };

          schema.methods.generateAccessToken = function () {
            const accessToken = jwt.sign(
              {
                _id: this._id as ObjectId,
                nickname: this.nickname,
              },
              `${process.env.JWT_SECRET}`,
              { algorithm: 'HS256', expiresIn: '30m' },
            );
            return accessToken;
          };

          schema.methods.generateRefreshToken = function () {
            const refreshToken = jwt.sign(
              {
                _id: this._id as ObjectId,
                nickname: this.nickname,
                email: this.email,
                password: this.hashedPassword,
              },
              `${process.env.JWT_SECRET}`,
              { algorithm: 'HS256', expiresIn: '14d' },
            );
            return refreshToken;
          };

          schema.statics.findByUserEmail = function (email: string) {
            return this.findOne({ email });
          };

          return schema;
        },
      },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
