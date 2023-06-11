import { Body, Controller, HttpException, Get, Post, Res, Headers, Query, Param, Delete, Patch } from '@nestjs/common';
import { Response } from 'express';
import { PostsService } from './posts.service';
import { JsonWebTokenError } from 'jsonwebtoken';
import { IPostsSchemaType } from '../dto/posts.dto';
import { ObjectId, Error } from 'mongoose';
import type { IDecodedTokenInfoType } from 'src/dto/auth.dto';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  async getPosts(
    @Headers('Authorization') header: string,
    @Query() query: { page: string; limit: string },
    @Res() res: Response,
  ) {
    try {
      await this.postsService.checkHeader(header);
      const { page, limit } = query;
      const { posts, postsCount } = await this.postsService.getPostsLists(page, limit);
      res.status(200).json({
        data: posts.map((post) => ({
          ...post,
          title: post.title.normalize(),
          body:
            post.body.normalize().length < 200 ? post.body.normalize() : `${post.body.normalize().slice(0, 200)}...`,
        })),
        totalCount: postsCount,
      });
      return;
    } catch (error: unknown) {
      if (error instanceof JsonWebTokenError) {
        res.status(401).json({ message: '토큰이 만료되었습니다.' });
      }
      if (error instanceof HttpException) {
        res.status(error.getStatus()).json({ message: error.getResponse() });
      }
    }
  }

  @Post()
  async createPost(@Headers('Authorization') header: string, @Body() payload: IPostsSchemaType, @Res() res: Response) {
    try {
      const { title, body, images } = payload;
      const decoded = await this.postsService.checkHeader(header);

      const result = await this.postsService.createPost(title, body, images, decoded);
      res.status(201).json(result);
      return;
    } catch (err: unknown) {
      if (err instanceof JsonWebTokenError) {
        res.status(401).json({ message: '토큰이 만료되었습니다.' });
      }
      if (err instanceof HttpException) {
        res.status(err.getStatus()).json({ message: err.getResponse() });
      }
    }
  }

  @Get(':postId')
  async getPostById(@Headers('Authorization') header: string, @Res() res: Response, @Param('postId') postId: ObjectId) {
    try {
      await this.postsService.checkHeader(header);
      const post = await this.postsService.getPostById(postId);
      res.status(200).json(post);
      return;
    } catch (err: unknown) {
      if (err instanceof JsonWebTokenError) {
        res.status(401).json({ message: '토큰이 만료되었습니다.' });
      }
      if (err instanceof HttpException) {
        res.status(err.getStatus()).json({ message: err.getResponse() });
      }
    }
  }

  @Delete(':postId')
  async deletePostById(
    @Headers('Authorization') header: string,
    @Res() res: Response,
    @Param('postId') postId: ObjectId,
  ) {
    try {
      await this.postsService.checkHeader(header);
      await this.postsService.deletePostById(postId);
      res.status(204).send();
      return;
    } catch (err: unknown) {
      if (err instanceof JsonWebTokenError) {
        res.status(401).json({ message: '토큰이 만료되었습니다.' });
      }
      if (err instanceof HttpException) {
        res.status(err.getStatus()).json({ message: err.getResponse() });
      }
    }
  }

  @Patch(':postId')
  async updatePost(
    @Headers('Authorization') header: string,
    @Res() res: Response,
    @Body() payload: IPostsSchemaType,
    @Param('postId') postId: ObjectId,
  ) {
    try {
      await this.postsService.checkHeader(header);
      const result = await this.postsService.updatePostById(payload, postId);
      res.status(200).json(result);
      return;
    } catch (err: unknown) {
      if (err instanceof JsonWebTokenError) {
        res.status(401).json({ message: '토큰이 만료되었습니다.' });
      }
      if (err instanceof HttpException) {
        res.status(err.getStatus()).json({ message: err.getResponse() });
      }
    }
  }

  @Get('user/:userId')
  async getPostByUserId(
    @Headers('Authorization') header: string,
    @Res() res: Response,
    @Param('userId') userId: ObjectId,
  ) {
    try {
      const decoded = await this.postsService.checkHeader(header);
      const { _id } = decoded as IDecodedTokenInfoType;
      const { posts, postsCount } = await this.postsService.getPostsByUserId(userId, _id);
      res.status(200).json({ data: posts, totalCount: postsCount });
      return;
    } catch (err: unknown) {
      if (err instanceof JsonWebTokenError) {
        res.status(401).json({ message: '토큰이 만료되었습니다.' });
      }
      if (err instanceof Error.CastError) {
        res.status(404).json({ message: '존재하지 않는 유저입니다.' });
      }
      if (err instanceof HttpException) {
        res.status(err.getStatus()).json({ message: err.getResponse() });
      }
    }
  }
}
