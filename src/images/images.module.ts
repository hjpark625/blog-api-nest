import { Module } from '@nestjs/common';
import { ImagesService } from '@/images/images.service';
import { ImagesController } from '@/images/images.controller';

@Module({
  imports: [],
  controllers: [ImagesController],
  providers: [ImagesService],
  exports: [ImagesService],
})
export class ImagesModule {}
