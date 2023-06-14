import type { NestMiddleware } from '@nestjs/common';
import { Injectable, Logger, HttpStatus } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger(LoggingMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    const { ip, method, originalUrl } = req;

    res.on('finish', () => {
      const { statusCode, statusMessage } = res;

      const logFormat = `${method} | ${statusCode} | ${statusMessage} | ${originalUrl} | ${ip}`;

      if (statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
        this.logger.error(logFormat);
      } else if (statusCode >= HttpStatus.BAD_REQUEST) {
        this.logger.warn(logFormat);
      } else {
        this.logger.log(logFormat);
      }
    });

    next();
  }
}
