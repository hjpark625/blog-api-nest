import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ImagesService } from '@/images/images.service';
import { ImagesController } from '@/images/images.controller';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    MulterModule.registerAsync({
      useFactory: () => ({
        limits: { fileSize: 5 * 1024 * 1024 },
      }),
    }),
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: `${process.env.JWT_SECRET}`,
        signOptions: { algorithm: 'HS256' },
      }),
    }),
  ],
  controllers: [ImagesController],
  providers: [ImagesService],
  exports: [ImagesService],
})
export class ImagesModule {}
