import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';

// Типы для ответов API
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Типы для ошибок
export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

// Создание экземпляра axios
const createApiInstance = (): AxiosInstance => {
  // Определяем базовый URL в зависимости от окружения
  // Определяем baseURL для API
  // В Docker-окружении используем внутреннее имя сервиса, если доступно
  // В противном случае используем переменную окружения или localhost по умолчанию
  const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
  
  // Логирование для диагностики CORS
  console.log('🔍 Frontend API Configuration:');
  console.log(`- baseURL: ${baseURL}`);
  console.log(`- NEXT_PUBLIC_API_URL: ${process.env.NEXT_PUBLIC_API_URL}`);
  console.log(`- NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`- Current origin: ${typeof window !== 'undefined' ? window.location.origin : 'Server-side'}`);
  
  const instance = axios.create({
    baseURL,
    timeout: 30000, // 30 секунд
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: true, // Важно для CORS с credentials
  });

  // Interceptor для запросов - добавление токена авторизации
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      // Получаем токен из localStorage
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // Логирование запросов в development
      if (process.env.NODE_ENV === 'development') {
        console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
          data: config.data,
          params: config.params,
        });
      }
      
      return config;
    },
    (error: AxiosError) => {
      console.error('❌ Request Error:', error);
      return Promise.reject(error);
    }
  );

  // Interceptor для ответов - обработка ошибок и логирование
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      // Логирование ответов в development
      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
          status: response.status,
          data: response.data,
        });
      }
      
      return response;
    },
    (error: AxiosError) => {
      // Логирование ошибок в development
      if (process.env.NODE_ENV === 'development') {
        console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
      }
      
      // Обработка ошибок авторизации
      if (error.response?.status === 401) {
        // Удаляем невалидный токен
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          
          // Перенаправляем на страницу входа, если не находимся на ней
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
      }
      
      // Преобразование ошибки в удобный формат
      const apiError: ApiError = {
        message: (error.response?.data as any)?.message || error.message || 'Произошла ошибка',
        status: error.response?.status || 500,
        errors: (error.response?.data as any)?.errors,
      };
      
      return Promise.reject(apiError);
    }
  );

  return instance;
};

// Создаем и экспортируем экземпляр API
export const apiClient = createApiInstance();

// Вспомогательные функции для HTTP-методов
export const api = {
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => 
    apiClient.get<T>(url, config),
    
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => 
    apiClient.post<T>(url, data, config),
    
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => 
    apiClient.put<T>(url, data, config),
    
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => 
    apiClient.patch<T>(url, data, config),
    
  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => 
    apiClient.delete<T>(url, config),
};

// Функция для загрузки файлов
export const uploadFile = async (
  url: string,
  file: File,
  additionalData?: Record<string, any>
): Promise<AxiosResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  
  if (additionalData) {
    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(key, value);
    });
  }
  
  return apiClient.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// Функция для скачивания файлов
export const downloadFile = async (url: string, filename?: string): Promise<void> => {
  try {
    const response = await apiClient.get(url, {
      responseType: 'blob',
    });
    
    // Создаем URL для скачивания
    const blobUrl = window.URL.createObjectURL(response.data);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Освобождаем URL
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error('Ошибка при скачивании файла:', error);
    throw error;
  }
};

export default apiClient;