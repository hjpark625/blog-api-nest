import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './auth.schema';
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
    if (!user) throw new Error('존재하지 않는 이메일입니다.');

    const isValidPassword = await user.checkPassword(password);
    if (!isValidPassword) throw new Error('비밀번호가 일치하지 않습니다.');

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    await this.userModel.findByIdAndUpdate(user._id, { refreshToken });

    return { accessToken, refreshToken, user };
  }
}
