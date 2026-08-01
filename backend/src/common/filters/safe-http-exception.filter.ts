import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class SafeHttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(SafeHttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request & { correlationId?: string }>();

    const isProduction = process.env.NODE_ENV === 'production';
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_ERROR';
    let message = 'An unexpected error occurred.';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse();
      if (typeof body === 'string') {
        message = body;
      } else if (
        typeof body === 'object' &&
        body !== null &&
        'message' in body
      ) {
        const raw = (body as { message?: string | string[] }).message;
        message = Array.isArray(raw) ? raw.join(', ') : (raw ?? message);
      }
      code = HttpStatus[status] ?? 'HTTP_ERROR';
    }

    if (!isProduction && exception instanceof Error) {
      this.logger.error(exception.message, exception.stack);
    } else if (exception instanceof Error) {
      this.logger.error(exception.message);
    }

    response.status(status).json({
      code,
      message,
      correlationId: request.correlationId ?? null,
      timestamp: new Date().toISOString(),
    });
  }
}
