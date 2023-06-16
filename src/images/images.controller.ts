import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFiles,
  Headers,
  HttpException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ImagesService } from '@/images/images.service';
import type { IDecodedTokenInfoType } from '@/dto/auth.dto';

@Controller('files')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Post('upload')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FilesInterceptor('files'))
  async uploadImage(@UploadedFiles() files: Express.Multer.File[], @Headers('Authorization') header: string) {
    try {
      const decoded = await this.imagesService.checkHeader(header);
      const { _id } = decoded as IDecodedTokenInfoType;

      const results = await this.imagesService.uploadImage(files, _id);

      const mappedResults = results.map((result) => ({
        name: result.Key.split('/')[2],
        location: result.Location,
      }));

      return { images: mappedResults };
    } catch (err: unknown) {
      if (err instanceof HttpException) {
        throw new HttpException({ message: `${err.getResponse()}` }, err.getStatus());
      }
    }
  }
}
