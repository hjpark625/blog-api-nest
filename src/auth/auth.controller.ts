import { Body, Controller, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterInfoDto } from 'src/dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() body: RegisterInfoDto, @Res() res: Response) {
    const { email, nickname, password } = body;

    try {
      const isExistUser = await this.authService.checkDuplicatedUser(email);
      if (isExistUser) {
        res.status(409).json({ message: '이미 존재하는 이메일입니다.' });
        return;
      }
      const result = await this.authService.saveUserInfoAndGenerateToken(email, nickname, password);
      res.status(201).json({
        user: {
          info: result.user.serialize(),
          access_token: result.accessToken,
          refresh_token: result.refreshToken,
        },
      });
      return;
    } catch (err: unknown) {
      res.status(500).json({ message: `${err}` });
      return;
    }
  }
}
