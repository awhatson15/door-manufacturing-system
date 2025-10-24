import { api } from './client';

// Типы данных для аутентификации
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  roleId?: string;
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    roleId: string;
    isActive: boolean;
    emailVerified: boolean;
    createdAt: string;
    updatedAt: string;
  };
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  roleId: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  permissions?: string[];
}

// API функции для аутентификации
export const authApi = {
  // Вход в систему
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', data);
    return response.data;
  },

  // Регистрация нового пользователя
  register: async (data: RegisterRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/register', data);
    return response.data;
  },

  // Выход из системы
  logout: async (): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/auth/logout');
    return response.data;
  },

  // Обновление токена
  refreshToken: async (refreshToken: string): Promise<RefreshTokenResponse> => {
    const response = await api.post<RefreshTokenResponse>('/auth/refresh', {
      refreshToken,
    });
    return response.data;
  },

  // Получение профиля пользователя
  getProfile: async (): Promise<UserProfile> => {
    const response = await api.get<UserProfile>('/auth/profile');
    return response.data;
  },

  // Сохранение токенов в localStorage
  saveTokens: (accessToken: string, refreshToken: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
    }
  },

  // Удаление токенов из localStorage
  clearTokens: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    }
  },

  // Получение access токена
  getAccessToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  },

  // Получение refresh токена
  getRefreshToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('refreshToken');
    }
    return null;
  },

  // Проверка наличия токена
  hasToken: (): boolean => {
    return !!authApi.getAccessToken();
  },

  // Автоматическое обновление токена
  autoRefreshToken: async (): Promise<boolean> => {
    try {
      const refreshToken = authApi.getRefreshToken();
      if (!refreshToken) {
        return false;
      }

      const response = await authApi.refreshToken(refreshToken);
      authApi.saveTokens(response.accessToken, response.refreshToken);
      return true;
    } catch (error) {
      console.error('Ошибка при обновлении токена:', error);
      authApi.clearTokens();
      return false;
    }
  },
};

export default authApi;