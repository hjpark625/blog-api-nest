import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as AWS from 'aws-sdk';
import { JsonWebTokenError } from 'jsonwebtoken';
import type { ManagedUpload, PutObjectRequest } from 'aws-sdk/clients/s3';
import type { ObjectId } from 'mongoose';

@Injectable()
export class ImagesService {
  constructor(private jwtService: JwtService) {}
  private readonly s3: AWS.S3 = new AWS.S3({
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_KEY,
    },
    region: process.env.AWS_REGION,
  });

  async checkHeader(header: string) {
    try {
      if (!header) {
        throw new HttpException('헤더가 존재하지 않습니다.', HttpStatus.BAD_REQUEST);
      }
      const [tokenType, tokenValue] = header.split(' ');
      if (tokenType !== 'Bearer') {
        throw new HttpException('올바른 헤더 타입이 아닙니다.', HttpStatus.BAD_REQUEST);
      }
      const decoded = this.jwtService.verify(tokenValue);
      return decoded;
    } catch (err: unknown) {
      if (err instanceof HttpException) {
        throw new HttpException(err.getResponse(), err.getStatus());
      }
      if (err instanceof JsonWebTokenError) {
        throw new HttpException(err.message, HttpStatus.UNAUTHORIZED);
      }
    }
  }

  // TODO: S3 에러 핸들링 최적화 필요
  async uploadImage(files: Express.Multer.File[], userId: ObjectId) {
    const myFiles = Array.isArray(files) ? files : typeof files === 'object' ? [files] : null;

    if (myFiles) {
      try {
        const filePromises = myFiles.map((file) => {
          const { originalname, mimetype, buffer } = file;
          const params = {
            Bucket: 'frontyardposts',
            Key: `images/${userId}/${originalname ?? ''}`,
            Body: buffer,
            ContentType: mimetype,
          } satisfies PutObjectRequest;

          return new Promise<ManagedUpload.SendData>((resolve, reject) => {
            this.s3.upload(params, (error: Error, data: ManagedUpload.SendData) => {
              if (error) {
                console.error(error);
                reject(error);
                return;
              }
              resolve(data);
              return;
            });
          });
        });
        const results = await Promise.all(filePromises);

        return results;
      } catch (err: unknown) {
        if (err instanceof HttpException) {
          throw new HttpException(err.getResponse(), err.getStatus());
        }
      }
    }
  }
}
