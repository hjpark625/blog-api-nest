import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { config } from 'dotenv';

config();

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URI, {
      connectionName: 'front-yard',
      useNewUrlParser: true,
      useUnifiedTopology: true,
      connectionFactory: (connection) => {
        connection.on('connected', () => {
          console.info('Connected to database');
        });
        connection.on('error', (error: unknown) => {
          console.error(`Error connecting to database: ${error}`);
        });
        return connection;
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
