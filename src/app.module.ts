import type { MiddlewareConsumer } from '@nestjs/common';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import type { MongooseModuleFactoryOptions } from '@nestjs/mongoose';
import { AuthModule } from '@/auth/auth.module';
import { PostsModule } from '@/posts/posts.module';
import { ImagesModule } from '@/images/images.module';
import { LoggingMiddleware } from './middleware/logging.middleware';

@Module({
  imports: [
    // NOTE: dotenv패키지 없이 nestjs의 ConfigModule을 사용하는 방법
    ConfigModule.forRoot(),
    // NOTE: MongoDB를 동기적으로 연결하는 방법
    // MongooseModule.forRoot(process.env.MONGO_URI, {
    //   useNewUrlParser: true,
    //   useUnifiedTopology: true,
    // }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService): MongooseModuleFactoryOptions => ({
        uri: configService.get<string>('MONGO_URI'),
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    PostsModule,
    ImagesModule,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
