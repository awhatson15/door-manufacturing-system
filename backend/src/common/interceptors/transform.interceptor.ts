import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  success: boolean;
  data?: T;
  message?: string;
  meta?: {
    timestamp: string;
    path: string;
    method: string;
  };
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    return next.handle().pipe(
      map(data => {
        // If the response is already in our format, return it as is
        if (data && typeof data === 'object' && 'success' in data) {
          return data;
        }

        // Transform successful responses
        const transformedResponse: Response<T> = {
          success: true,
          data: data,
          meta: {
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
          },
        };

        // Handle pagination
        if (data && typeof data === 'object' && 'items' in data && 'total' in data) {
          transformedResponse.data = {
            items: (data as any).items,
            pagination: {
              total: (data as any).total,
              page: (data as any).page || 1,
              limit: (data as any).limit || 10,
              totalPages: Math.ceil((data as any).total / ((data as any).limit || 10)),
            },
          } as T;
        } else {
          transformedResponse.data = data as T;
        }

        // Add message if available
        const message = this.extractMessage(request, response);
        if (message) {
          transformedResponse.message = message;
        }

        return transformedResponse;
      })
    );
  }

  private extractMessage(request: any, response: any): string | undefined {
    const method = request.method;
    const path = request.url;

    // Extract message based on HTTP method and path
    if (method === 'POST') {
      if (path.includes('/auth/login')) {
        return 'Вход выполнен успешно';
      }
      if (path.includes('/auth/logout')) {
        return 'Выход выполнен успешно';
      }
      return 'Ресурс создан успешно';
    }

    if (method === 'PUT' || method === 'PATCH') {
      return 'Ресурс обновлён успешно';
    }

    if (method === 'DELETE') {
      return 'Ресурс удалён успешно';
    }

    if (method === 'GET') {
      if (path.includes('/auth/profile')) {
        return 'Данные профиля получены';
      }
      return 'Данные получены успешно';
    }

    return undefined;
  }
}
