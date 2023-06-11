import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { config } from 'dotenv';
import { Posts } from './posts.schema';
import { InjectModel } from '@nestjs/mongoose';
import { IPostsModelType } from '../dto/posts.dto';

config();

@Injectable()
export class PostsService {
  constructor(@InjectModel(Posts.name) private postsModel: IPostsModelType) {}
  async checkHeader(header: string) {
    if (!header) {
      throw new HttpException('헤더가 존재하지 않습니다.', HttpStatus.BAD_REQUEST);
    }
    const [tokenType, tokenValue] = header.split(' ');
    if (tokenType !== 'Bearer') {
      throw new HttpException('올바른 헤더 타입이 아닙니다.', HttpStatus.BAD_REQUEST);
    }
    jwt.verify(tokenValue, process.env.JWT_SECRET);
    return;
  }

  async getPostsLists(page: string, limit: string) {
    const posts = await this.postsModel
      .find()
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .lean()
      .exec();

    const postsCount = await this.postsModel.countDocuments().exec();

    return { posts, postsCount };
  }
}
