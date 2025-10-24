import { api, PaginatedResponse, uploadFile, downloadFile } from './client';

// Типы данных для файлов
export interface FileEntity {
  id: string;
  originalName: string;
  fileName: string;
  mimeType: string;
  size: number;
  filePath: string;
  type: 'DOCUMENT' | 'IMAGE' | 'DRAWING' | 'OTHER';
  visibility: 'PUBLIC' | 'PRIVATE' | 'INTERNAL';
  description?: string;
  orderId?: string;
  order?: {
    id: string;
    orderNumber: string;
    title: string;
  };
  uploadedById: string;
  uploadedBy?: {
    id: string;
    name: string;
    email: string;
  };
  downloadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFileRequest {
  orderId?: string;
  type: 'DOCUMENT' | 'IMAGE' | 'DRAWING' | 'OTHER';
  visibility: 'PUBLIC' | 'PRIVATE' | 'INTERNAL';
  description?: string;
}

export interface UpdateFileRequest {
  type?: 'DOCUMENT' | 'IMAGE' | 'DRAWING' | 'OTHER';
  visibility?: 'PUBLIC' | 'PRIVATE' | 'INTERNAL';
  description?: string;
}

export interface QueryFilesRequest {
  page?: number;
  limit?: number;
  orderId?: string;
  type?: string;
  visibility?: string;
  search?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'originalName' | 'size' | 'downloadCount';
  sortOrder?: 'ASC' | 'DESC';
}

export interface FileStatistics {
  total: number;
  totalSize: number;
  byType: Record<string, number>;
  byVisibility: Record<string, number>;
  recentlyUploaded: number;
  mostDownloaded: number;
}

// API функции для работы с файлами
export const filesApi = {
  // Загрузка файла
  upload: async (
    file: globalThis.File,
    data: CreateFileRequest
  ): Promise<FileEntity> => {
    const response = await uploadFile('/files/upload', file, data);
    return response.data;
  },

  // Получение списка файлов
  findAll: async (params?: QueryFilesRequest): Promise<PaginatedResponse<FileEntity>> => {
    const response = await api.get<PaginatedResponse<FileEntity>>('/files', { params });
    return response.data;
  },

  // Получение статистики по файлам
  getStatistics: async (orderId?: string): Promise<FileStatistics> => {
    const params = orderId ? { orderId } : {};
    const response = await api.get<FileStatistics>('/files/statistics', { params });
    return response.data;
  },

  // Получение информации о файле
  findOne: async (id: string): Promise<FileEntity> => {
    const response = await api.get<FileEntity>(`/files/${id}`);
    return response.data;
  },

  // Скачивание файла
  download: async (id: string, filename?: string): Promise<void> => {
    await downloadFile(`/files/${id}/download`, filename);
  },

  // Обновление метаданных файла
  update: async (id: string, data: UpdateFileRequest): Promise<FileEntity> => {
    const response = await api.patch<FileEntity>(`/files/${id}`, data);
    return response.data;
  },

  // Удаление файла
  remove: async (id: string): Promise<void> => {
    await api.delete(`/files/${id}`);
  },
};

export default filesApi;