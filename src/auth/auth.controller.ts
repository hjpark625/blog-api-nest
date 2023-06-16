import { Body, Controller, HttpException, Post, Headers, HttpStatus, HttpCode } from '@nestjs/common';
import { AuthService } from '@/auth/auth.service';
import { LoginInfoDto, RegisterInfoDto } from '@/dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() body: RegisterInfoDto) {
    const { email, nickname, password } = body;

    try {
      const isExistUser = await this.authService.checkDuplicatedUser(email);
      if (isExistUser) {
        throw new HttpException('이미 존재하는 이메일입니다.', HttpStatus.CONFLICT);
      }
      const result = await this.authService.saveUserInfoAndGenerateToken(email, nickname, password);
      return {
        user: {
          info: result.user.serialize(),
          access_token: result.accessToken,
          refresh_token: result.refreshToken,
        },
      };
    } catch (err: unknown) {
      if (err instanceof HttpException) {
        throw new HttpException({ message: `${err.getResponse()}` }, err.getStatus());
      } else {
        throw new HttpException(`${err}`, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: LoginInfoDto) {
    const { email, password } = body;
    if (!email || !password) {
      throw new HttpException('이메일과 비밀번호를 입력해주세요.', HttpStatus.BAD_REQUEST);
    }

    try {
      const result = await this.authService.checkUserAndGenerateToken(email, password);
      return {
        user: {
          info: result.user.serialize(),
          access_token: result.accessToken,
          refresh_token: result.refreshToken,
        },
      };
    } catch (err: unknown) {
      if (err instanceof HttpException) {
        throw new HttpException({ message: `${err.getResponse()}` }, err.getStatus());
      } else {
        throw new HttpException(`${err}`, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Headers('Authorization') refreshToken: string) {
    try {
      const token = await this.authService.checkHeader(refreshToken);
      await this.authService.logoutUser(token);
      return;
    } catch (err: unknown) {
      if (err instanceof HttpException) {
        throw new HttpException({ message: `${err.getResponse()}` }, err.getStatus());
      } else {
        throw new HttpException(`${err}`, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Headers('Authorization') header: string) {
    try {
      const refreshToken = await this.authService.checkHeader(header);
      const { access_token } = await this.authService.reissueAccessToken(refreshToken);
      return { access_token };
    } catch (err: unknown) {
      if (err instanceof HttpException) {
        throw new HttpException({ message: `${err.getResponse()}` }, err.getStatus());
      } else {
        throw new HttpException(`${err}`, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }
}
