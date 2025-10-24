import { api, PaginatedResponse } from './client';

// Типы данных для этапов производства
export interface Stage {
  id: string;
  name: string;
  description?: string;
  estimatedDuration?: number; // в днях
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStageRequest {
  name: string;
  description?: string;
  estimatedDuration?: number;
  order?: number;
  isActive?: boolean;
}

export interface UpdateStageRequest {
  name?: string;
  description?: string;
  estimatedDuration?: number;
  order?: number;
  isActive?: boolean;
}

export interface QueryStagesRequest {
  page?: number;
  limit?: number;
  isActive?: boolean;
  search?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'name' | 'order';
  sortOrder?: 'ASC' | 'DESC';
}

// API функции для работы с этапами производства
export const stagesApi = {
  // Создание нового этапа
  create: async (data: CreateStageRequest): Promise<Stage> => {
    const response = await api.post<Stage>('/stages', data);
    return response.data;
  },

  // Получение списка этапов производства
  findAll: async (params?: QueryStagesRequest): Promise<PaginatedResponse<Stage>> => {
    const response = await api.get<PaginatedResponse<Stage>>('/stages', { params });
    return response.data;
  },

  // Получение этапа по ID
  findOne: async (id: string): Promise<Stage> => {
    const response = await api.get<Stage>(`/stages/${id}`);
    return response.data;
  },

  // Обновление этапа
  update: async (id: string, data: UpdateStageRequest): Promise<Stage> => {
    const response = await api.patch<Stage>(`/stages/${id}`, data);
    return response.data;
  },

  // Удаление этапа
  remove: async (id: string): Promise<void> => {
    await api.delete(`/stages/${id}`);
  },

  // Изменение порядка этапов
  reorder: async (stageIds: string[]): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/stages/reorder', { stageIds });
    return response.data;
  },

  // Активация/деактивация этапа
  toggleActive: async (id: string): Promise<Stage> => {
    const response = await api.post<Stage>(`/stages/${id}/toggle-active`);
    return response.data;
  },
};

export default stagesApi;