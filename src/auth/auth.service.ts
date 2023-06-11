import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as jwt from 'jsonwebtoken';
import { User } from './auth.schema';
import type { IDecodedTokenInfoType } from '../dto/auth.dto';
import { IUserModelType } from '../dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(@InjectModel(User.name) private userModel: IUserModelType) {}

  async checkDuplicatedUser(email: string) {
    const isExistUser = await this.userModel.findByUserEmail(email);
    if (isExistUser) return true;
    else return false;
  }

  async saveUserInfoAndGenerateToken(email: string, nickname: string | null, password: string) {
    const user = new this.userModel({
      email,
      nickname: nickname ?? email.split('@')[0],
      registeredAt: new Date(),
      updatedAt: null,
      refreshToken: null,
    });

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    await user.setPassword(password);
    await user.save();
    await user.saveRefreshToken(refreshToken);

    const data = user.toJSON();

    delete data.password;

    return { accessToken, refreshToken, user };
  }

  async checkUserAndGenerateToken(email: string, password: string) {
    const user = await this.userModel.findByUserEmail(email);
    if (!user) throw new HttpException('존재하지 않는 이메일입니다.', HttpStatus.BAD_REQUEST);

    const isValidPassword = await user.checkPassword(password);
    if (!isValidPassword) throw new HttpException('비밀번호가 일치하지 않습니다.', HttpStatus.UNAUTHORIZED);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    await this.userModel.findByIdAndUpdate(user._id, { refreshToken });

    return { accessToken, refreshToken, user };
  }

  async checkHeader(header: string) {
    if (!header) throw new HttpException('헤더가 존재하지 않습니다.', HttpStatus.BAD_REQUEST);
    const [tokenType, tokenValue] = header.split(' ');
    if (tokenType !== 'Bearer') throw new HttpException('올바른 헤더 타입이 아닙니다.', HttpStatus.BAD_REQUEST);
    if (tokenValue == null) throw new HttpException('토큰이 존재하지 않습니다.', HttpStatus.BAD_REQUEST);
    return tokenValue;
  }

  async logoutUser(refreshToken: string) {
    const { _id } = jwt.verify(refreshToken, `${process.env.JWT_SECRET}`) as IDecodedTokenInfoType;
    const user = await this.userModel.findById({ _id });

    if ((user && user.refreshToken) !== refreshToken) {
      throw new HttpException('토큰이 일치하지 않거나 잘못된 토큰입니다.', HttpStatus.UNAUTHORIZED);
    }
    if (!user) throw new HttpException('존재하지 않는 유저입니다.', HttpStatus.NOT_FOUND);

    user.refreshToken = '';
    user.save();
    return HttpStatus.NO_CONTENT;
  }

  async reissueAccessToken(refreshToken: string) {
    const { _id } = jwt.verify(refreshToken, `${process.env.JWT_SECRET}`) as IDecodedTokenInfoType;
    const user = await this.userModel.findById({ _id });

    if (user && user.refreshToken === refreshToken) {
      const access_token = user.generateAccessToken();
      return { access_token };
    } else {
      throw new HttpException('토큰이 일치하지 않거나 잘못된 토큰입니다.', HttpStatus.BAD_REQUEST);
    }
  }
}
