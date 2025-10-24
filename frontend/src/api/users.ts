import { api, PaginatedResponse } from './client';

// Типы данных для пользователей
export interface User {
  id: string;
  email: string;
  name: string;
  roleId: string;
  role?: {
    id: string;
    name: string;
    description?: string;
  };
  isActive: boolean;
  emailVerified: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  permissions?: string[];
}

export interface CreateUserRequest {
  email: string;
  name: string;
  password: string;
  roleId: string;
  isActive?: boolean;
}

export interface UpdateUserRequest {
  email?: string;
  name?: string;
  roleId?: string;
  isActive?: boolean;
}

export interface ChangePasswordRequest {
  currentPassword?: string;
  newPassword: string;
}

export interface UserStatistics {
  total: number;
  active: number;
  inactive: number;
  emailVerified: number;
  recentlyCreated: number;
  byRole: Record<string, number>;
}

// API функции для работы с пользователями
export const usersApi = {
  // Создание нового пользователя
  create: async (data: CreateUserRequest): Promise<User> => {
    const response = await api.post<User>('/users', data);
    return response.data;
  },

  // Получение списка всех пользователей
  findAll: async (): Promise<User[]> => {
    const response = await api.get<User[]>('/users');
    return response.data;
  },

  // Получение списка активных пользователей
  findActive: async (): Promise<User[]> => {
    const response = await api.get<User[]>('/users/active');
    return response.data;
  },

  // Поиск пользователей
  search: async (query: string): Promise<User[]> => {
    const response = await api.get<User[]>(`/users/search/${query}`);
    return response.data;
  },

  // Получение пользователя по ID
  findOne: async (id: string): Promise<User> => {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  },

  // Обновление данных пользователя
  update: async (id: string, data: UpdateUserRequest): Promise<User> => {
    const response = await api.patch<User>(`/users/${id}`, data);
    return response.data;
  },

  // Удаление пользователя
  remove: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  },

  // Активация пользователя
  activate: async (id: string): Promise<User> => {
    const response = await api.post<User>(`/users/${id}/activate`);
    return response.data;
  },

  // Деактивация пользователя
  deactivate: async (id: string): Promise<User> => {
    const response = await api.post<User>(`/users/${id}/deactivate`);
    return response.data;
  },

  // Блокировка пользователя
  suspend: async (id: string): Promise<User> => {
    const response = await api.post<User>(`/users/${id}/suspend`);
    return response.data;
  },

  // Подтверждение email пользователя
  verifyEmail: async (id: string): Promise<User> => {
    const response = await api.post<User>(`/users/${id}/verify-email`);
    return response.data;
  },

  // Смена пароля пользователя (самим пользователем)
  changePassword: async (data: ChangePasswordRequest): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/users/change-password', data);
    return response.data;
  },

  // Смена пароля пользователя (администратором)
  changeUserPassword: async (id: string, data: ChangePasswordRequest): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>(`/users/${id}/change-password`, data);
    return response.data;
  },

  // Получение прав пользователя
  getUserPermissions: async (id: string): Promise<string[]> => {
    const response = await api.get<string[]>(`/users/${id}/permissions`);
    return response.data;
  },

  // Получение пользователей по роли
  getUsersByRole: async (roleName: string): Promise<User[]> => {
    const response = await api.get<User[]>(`/users/role/${roleName}`);
    return response.data;
  },
};

export default usersApi;