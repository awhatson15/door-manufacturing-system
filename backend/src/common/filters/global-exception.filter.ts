import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  constructor(private readonly configService: ConfigService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: HttpStatus;
    let message: string | object;
    let error: string;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || exception.message;
        error = (exceptionResponse as any).error;
      } else {
        message = exception.message;
      }
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Внутренняя ошибка сервера';
      error = 'Internal Server Error';
    }

    // Log error details
    const errorDetails = {
      statusCode: status,
      message,
      error,
      path: request.url,
      method: request.method,
      ip: request.ip,
      userAgent: request.get('User-Agent'),
      timestamp: new Date().toISOString(),
      stack: exception instanceof Error ? exception.stack : undefined,
    };

    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : exception,
      );
    } else {
      this.logger.warn(JSON.stringify(errorDetails));
    }

    // Prepare response
    const isDevelopment = this.configService.get('NODE_ENV') === 'development';

    const errorResponse: any = {
      statusCode: status,
      timestamp: errorDetails.timestamp,
      path: errorDetails.path,
      method: errorDetails.method,
      message: isDevelopment ? message : this.sanitizeMessage(message),
    };

    if (error) {
      errorResponse.error = error;
    }

    // Include additional details in development
    if (isDevelopment) {
      errorResponse.ip = errorDetails.ip;
      errorResponse.userAgent = errorDetails.userAgent;

      if (exception instanceof Error && exception.stack) {
        errorResponse.stack = exception.stack;
      }
    }

    response.status(status).json(errorResponse);
  }

  private sanitizeMessage(message: string | object): string {
    if (typeof message === 'string') {
      // Remove sensitive information from error messages
      return message.replace(/password/i, '****')
                   .replace(/token/i, '****')
                   .replace(/secret/i, '****');
    }

    if (typeof message === 'object' && message !== null) {
      try {
        const sanitized = JSON.parse(JSON.stringify(message));
        return JSON.stringify(sanitized);
      } catch {
        return 'Ошибка обработки данных';
      }
    }

    return 'Произошла ошибка';
  }
}
