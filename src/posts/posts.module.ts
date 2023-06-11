import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Posts, PostsSchema } from '@/posts/posts.schema';
import { PostsController } from '@/posts/posts.controller';
import { PostsService } from '@/posts/posts.service';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Posts.name,
        useFactory: () => {
          const schema = PostsSchema;
          return schema;
        },
      },
    ]),
  ],
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule {}
