import { Body, Controller, HttpException, Post, Res, Headers } from '@nestjs/common';
import { Response } from 'express';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}
}
