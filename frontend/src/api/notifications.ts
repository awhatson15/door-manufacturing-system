import { api, PaginatedResponse } from './client';

// Типы данных для уведомлений
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  userId?: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  isRead: boolean;
  readAt?: string;
  sentAt?: string;
  data?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNotificationRequest {
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  userId?: string;
  data?: Record<string, any>;
}

export interface QueryNotificationsRequest {
  page?: number;
  limit?: number;
  type?: string;
  isRead?: boolean;
  userId?: string;
  search?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'title' | 'readAt';
  sortOrder?: 'ASC' | 'DESC';
}

export interface NotificationStatistics {
  total: number;
  read: number;
  unread: number;
  byType: Record<string, number>;
  recentlyCreated: number;
}

// API функции для работы с уведомлениями
export const notificationsApi = {
  // Создание уведомления
  create: async (data: CreateNotificationRequest): Promise<Notification> => {
    const response = await api.post<Notification>('/notifications', data);
    return response.data;
  },

  // Получение списка уведомлений
  findAll: async (params?: QueryNotificationsRequest): Promise<PaginatedResponse<Notification>> => {
    const response = await api.get<PaginatedResponse<Notification>>('/notifications', { params });
    return response.data;
  },

  // Получение статистики по уведомлениям
  getStatistics: async (): Promise<NotificationStatistics> => {
    const response = await api.get<NotificationStatistics>('/notifications/statistics');
    return response.data;
  },

  // Получение количества непрочитанных уведомлений
  getUnreadCount: async (): Promise<{ count: number }> => {
    const response = await api.get<{ count: number }>('/notifications/unread-count');
    return response.data;
  },

  // Получение уведомления по ID
  findOne: async (id: string): Promise<Notification> => {
    const response = await api.get<Notification>(`/notifications/${id}`);
    return response.data;
  },

  // Пометка уведомления как прочитанного
  markAsRead: async (id: string): Promise<Notification> => {
    const response = await api.patch<Notification>(`/notifications/${id}/read`);
    return response.data;
  },

  // Пометка всех уведомлений как прочитанных
  markAllAsRead: async (): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/notifications/mark-all-read');
    return response.data;
  },

  // Отправка уведомления
  send: async (id: string): Promise<Notification> => {
    const response = await api.post<Notification>(`/notifications/${id}/send`);
    return response.data;
  },

  // Повторная отправка неудачных уведомлений
  retryFailed: async (): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/notifications/retry-failed');
    return response.data;
  },

  // Удаление уведомления
  remove: async (id: string): Promise<void> => {
    await api.delete(`/notifications/${id}`);
  },
};

export default notificationsApi;