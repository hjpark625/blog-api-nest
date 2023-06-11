import { Body, Controller, HttpException, Get, Post, Res, Headers, Query } from '@nestjs/common';
import { Response } from 'express';
import { PostsService } from './posts.service';
import { JsonWebTokenError } from 'jsonwebtoken';

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
        res.status(error.getStatus()).json(error.getResponse());
      }
    }
  }
}
