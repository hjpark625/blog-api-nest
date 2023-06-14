import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { InjectModel } from '@nestjs/mongoose';
import { Posts } from '@/posts/posts.schema';
import { IPostsModelType } from '@/dto/posts.dto';
import type { IPostsSchemaType } from '@/dto/posts.dto';
import type { ObjectId } from 'mongoose';
import type { IDecodedTokenInfoType } from '@/dto/auth.dto';

@Injectable()
export class PostsService {
  constructor(@InjectModel(Posts.name) private postsModel: IPostsModelType) {}
  async checkHeader(header: string) {
    try {
      if (!header) {
        throw new HttpException('헤더가 존재하지 않습니다.', HttpStatus.BAD_REQUEST);
      }
      const [tokenType, tokenValue] = header.split(' ');
      if (tokenType !== 'Bearer') {
        throw new HttpException('올바른 헤더 타입이 아닙니다.', HttpStatus.BAD_REQUEST);
      }
      const decoded = jwt.verify(tokenValue, process.env.JWT_SECRET);
      return decoded;
    } catch (err: unknown) {
      if (err instanceof HttpException) {
        throw new HttpException(err.getResponse(), err.getStatus());
      }
      if (err instanceof jwt.JsonWebTokenError) {
        throw new HttpException(err.message, HttpStatus.UNAUTHORIZED);
      }
    }
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

  async createPost(title: string, body: string, images: IPostsSchemaType['images'], info: jwt.JwtPayload | string) {
    const { _id, nickname } = info as IDecodedTokenInfoType;
    if (!title || !body) {
      throw new HttpException('제목과 내용을 입력해주세요.', HttpStatus.BAD_REQUEST);
    }

    const post = new this.postsModel({
      title,
      body,
      images: images ? images : [],
      user: {
        _id,
        nickname,
      },
    });
    await post.save();
    return post;
  }

  async getPostById(postId: ObjectId) {
    const post = await this.postsModel.findById(postId).exec();
    if (!post) {
      throw new HttpException('게시글이 존재하지 않습니다.', HttpStatus.NOT_FOUND);
    }
    return post;
  }

  async deletePostById(postId: ObjectId) {
    await this.postsModel.findByIdAndDelete(postId).exec();
  }

  async updatePostById(contents: Pick<IPostsSchemaType, 'title' | 'body' | 'images'>, postId: ObjectId) {
    const { title, body, images } = contents;
    const post = await this.postsModel.findByIdAndUpdate(postId, { title, body, images, updatedAt: Date.now() }).exec();
    if (!post) {
      throw new HttpException('게시글이 존재하지 않습니다.', HttpStatus.NOT_FOUND);
    }
    const updatedPost = await this.postsModel.findById(postId).exec();
    return updatedPost;
  }

  async getPostsByUserId(userId: ObjectId, decodedId: ObjectId) {
    if (userId !== decodedId) {
      throw new HttpException('아이디가 일치하지 않습니다.', HttpStatus.FORBIDDEN);
    }
    const posts = await this.postsModel.find({ 'user._id': userId }).sort({ createdAt: -1 }).exec();
    const postsCount = posts.length;
    return { posts, postsCount };
  }
}
