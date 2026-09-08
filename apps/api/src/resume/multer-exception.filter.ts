import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { MulterError } from 'multer';
import * as express from 'express';

// Multer throws before the route handler runs, so an oversized upload would
// otherwise surface as an unhandled 500 instead of a clean 400.
@Catch(MulterError)
export class MulterExceptionFilter implements ExceptionFilter {
  catch(exception: MulterError, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<express.Response>();
    const message =
      exception.code === 'LIMIT_FILE_SIZE'
        ? 'File exceeds the 10MB size limit'
        : 'Invalid file upload';
    response.status(HttpStatus.BAD_REQUEST).json({
      statusCode: HttpStatus.BAD_REQUEST,
      message,
      error: 'Bad Request',
    });
  }
}
