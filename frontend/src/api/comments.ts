import { api, PaginatedResponse } from './client';

// Типы данных для комментариев
export interface Comment {
  id: string;
  content: string;
  orderId: string;
  order?: {
    id: string;
    orderNumber: string;
    title: string;
  };
  authorId: string;
  author?: {
    id: string;
    name: string;
    email: string;
  };
  isPinned: boolean;
  parentId?: string;
  parent?: Comment;
  replies?: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentRequest {
  content: string;
  orderId: string;
  parentId?: string;
}

export interface UpdateCommentRequest {
  content: string;
}

export interface QueryCommentsRequest {
  page?: number;
  limit?: number;
  orderId?: string;
  authorId?: string;
  isPinned?: boolean;
  parentId?: string;
  search?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'content';
  sortOrder?: 'ASC' | 'DESC';
}

// API функции для работы с комментариями
export const commentsApi = {
  // Создание комментария
  create: async (data: CreateCommentRequest): Promise<Comment> => {
    const response = await api.post<Comment>('/comments', data);
    return response.data;
  },

  // Получение списка комментариев
  findAll: async (params?: QueryCommentsRequest): Promise<PaginatedResponse<Comment>> => {
    const response = await api.get<PaginatedResponse<Comment>>('/comments', { params });
    return response.data;
  },

  // Получение комментария по ID
  findOne: async (id: string): Promise<Comment> => {
    const response = await api.get<Comment>(`/comments/${id}`);
    return response.data;
  },

  // Обновление комментария
  update: async (id: string, data: UpdateCommentRequest): Promise<Comment> => {
    const response = await api.patch<Comment>(`/comments/${id}`, data);
    return response.data;
  },

  // Удаление комментария
  remove: async (id: string): Promise<void> => {
    await api.delete(`/comments/${id}`);
  },

  // Закрепление/открепление комментария
  togglePin: async (id: string): Promise<Comment> => {
    const response = await api.post<Comment>(`/comments/${id}/toggle-pin`);
    return response.data;
  },
};

export default commentsApi;