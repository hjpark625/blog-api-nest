import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { config } from 'dotenv';
import type { MongooseModuleOptions } from '@nestjs/mongoose';
import { AuthModule } from '@/auth/auth.module';
import { PostsModule } from '@/posts/posts.module';
import { ImagesModule } from '@/images/images.module';

config();

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: (): MongooseModuleOptions => ({
        uri: process.env.MONGO_URI,
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }),
    }),
    AuthModule,
    PostsModule,
    ImagesModule,
  ],
})
export class AppModule {}
