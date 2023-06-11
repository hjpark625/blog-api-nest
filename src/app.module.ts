import { Module } from '@nestjs/common';
import type { MongooseModuleOptions } from '@nestjs/mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { config } from 'dotenv';
import { AuthModule } from './auth/auth.module';

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
    // MongooseModule.forRoot(process.env.MONGO_URI, {
    //   connectionName: 'front-yard',
    //   useNewUrlParser: true,
    //   useUnifiedTopology: true,
    //   connectionFactory: (connection) => {
    //     connection.on('connected', () => {
    //       console.info('Connected to database');
    //     });
    //     connection.on('error', (error: unknown) => {
    //       console.error(`Error connecting to database: ${error}`);
    //     });
    //     return connection;
    //   },
    // }),
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
