import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : { message: exception.message || 'Internal server error' };

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      ...(typeof message === 'object' ? message : { message }),
    };

    // Log the error for internal tracking (exclude normal client 400s/404s if too chatty, but good for diagnostics)
    if (status >= 500) {
      console.error(
        `[ErrorFilter] 500 on ${request.method} ${request.url}:`,
        exception,
      );
    }

    response.status(status).json(errorResponse);
  }
}
