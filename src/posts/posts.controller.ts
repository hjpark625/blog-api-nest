import {
  Body,
  Controller,
  HttpException,
  Get,
  Post,
  HttpCode,
  Headers,
  Query,
  Param,
  Delete,
  Patch,
  HttpStatus,
} from '@nestjs/common';
import { ObjectId } from 'mongoose';
import { PostsService } from '@/posts/posts.service';
import { IPostsSchemaType } from '@/dto/posts.dto';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getPosts(@Headers('Authorization') header: string, @Query() query: { page: string; limit: string }) {
    try {
      await this.postsService.checkHeader(header);
      const { page, limit } = query;
      const { posts, postsCount } = await this.postsService.getPostsLists(page, limit);
      return {
        data: posts.map((post) => ({
          ...post,
          title: post.title.normalize(),
          body:
            post.body.normalize().length < 200 ? post.body.normalize() : `${post.body.normalize().slice(0, 200)}...`,
        })),
        totalCount: postsCount,
      };
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw new HttpException({ message: error.getResponse() }, error.getStatus());
      }
    }
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createPost(@Headers('Authorization') header: string, @Body() payload: IPostsSchemaType) {
    try {
      const { title, body, images } = payload;
      const decoded = await this.postsService.checkHeader(header);

      const result = await this.postsService.createPost(title, body, images, decoded);
      return result;
    } catch (err: unknown) {
      if (err instanceof HttpException) {
        throw new HttpException({ message: err.getResponse() }, err.getStatus());
      }
    }
  }

  @Get(':postId')
  @HttpCode(HttpStatus.OK)
  async getPostById(@Headers('Authorization') header: string, @Param('postId') postId: ObjectId) {
    try {
      await this.postsService.checkHeader(header);
      const post = await this.postsService.getPostById(postId);
      return post;
      return;
    } catch (err: unknown) {
      if (err instanceof HttpException) {
        throw new HttpException({ message: err.getResponse() }, err.getStatus());
      }
    }
  }

  @Delete(':postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePostById(@Headers('Authorization') header: string, @Param('postId') postId: ObjectId) {
    try {
      await this.postsService.checkHeader(header);
      await this.postsService.deletePostById(postId);
      return;
    } catch (err: unknown) {
      if (err instanceof HttpException) {
        throw new HttpException({ message: err.getResponse() }, err.getStatus());
      }
    }
  }

  @Patch(':postId')
  @HttpCode(HttpStatus.OK)
  async updatePost(
    @Headers('Authorization') header: string,
    @Body() payload: IPostsSchemaType,
    @Param('postId') postId: ObjectId,
  ) {
    try {
      await this.postsService.checkHeader(header);
      const result = await this.postsService.updatePostById(payload, postId);
      return result;
    } catch (err: unknown) {
      if (err instanceof HttpException) {
        throw new HttpException({ message: err.getResponse() }, err.getStatus());
      }
    }
  }

  @Get('user/:userId')
  @HttpCode(HttpStatus.OK)
  async getPostByUserId(@Headers('Authorization') header: string, @Param('userId') userId: ObjectId) {
    try {
      const decoded = await this.postsService.checkHeader(header);
      const { _id } = decoded;
      const { posts, postsCount } = await this.postsService.getPostsByUserId(userId, _id);
      return {
        data: posts,
        totalCount: postsCount,
      };
    } catch (err: unknown) {
      if (err instanceof HttpException) {
        throw new HttpException({ message: err.getResponse() }, err.getStatus());
      }
    }
  }
}
