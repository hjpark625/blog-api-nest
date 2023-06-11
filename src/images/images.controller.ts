import { Controller, Post, UseInterceptors, UploadedFiles, Res, Headers, HttpException } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { ImagesService } from './images.service';
import { config } from 'dotenv';
import type { IDecodedTokenInfoType } from 'src/dto/auth.dto';

config();

@Controller('files')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Post('upload')
  @UseInterceptors(FilesInterceptor('files'))
  async uploadImage(
    @UploadedFiles() files: Express.Multer.File[],
    @Headers('Authorization') header: string,
    @Res() res: Response,
  ) {
    try {
      const decoded = await this.imagesService.checkHeader(header);
      const { _id } = decoded as IDecodedTokenInfoType;

      const results = await this.imagesService.uploadImage(files, _id);

      const mappedResults = results.map((result) => ({
        name: result.Key.split('/')[2],
        location: result.Location,
      }));

      res.status(200).json(mappedResults);
    } catch (err: unknown) {
      if (err instanceof HttpException) {
        res.status(err.getStatus()).json({ message: err.getResponse() });
      }
      return err;
    }
  }
}
