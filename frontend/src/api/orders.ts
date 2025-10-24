import { api, PaginatedResponse } from './client';

// Типы данных для заявок
export interface Order {
  id: string;
  orderNumber: string;
  title: string;
  description?: string;
  customerId: string;
  customer?: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  managerId: string;
  manager?: {
    id: string;
    name: string;
    email: string;
  };
  status: 'NEW' | 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  estimatedCompletionDate?: string;
  actualCompletionDate?: string;
  totalAmount?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  stages?: OrderStage[];
}

export interface OrderStage {
  id: string;
  orderId: string;
  stageId: string;
  stage?: {
    id: string;
    name: string;
    description?: string;
    estimatedDuration?: number;
  };
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED';
  assignedToId?: string;
  assignedTo?: {
    id: string;
    name: string;
    email: string;
  };
  startedAt?: string;
  completedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderRequest {
  orderNumber: string;
  title: string;
  description?: string;
  customerId: string;
  managerId: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  estimatedCompletionDate?: string;
  totalAmount?: number;
  notes?: string;
}

export interface UpdateOrderRequest {
  orderNumber?: string;
  title?: string;
  description?: string;
  customerId?: string;
  managerId?: string;
  status?: 'NEW' | 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  estimatedCompletionDate?: string;
  totalAmount?: number;
  notes?: string;
}

export interface QueryOrdersRequest {
  page?: number;
  limit?: number;
  status?: string;
  priority?: string;
  customerId?: string;
  managerId?: string;
  search?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'orderNumber' | 'title' | 'priority';
  sortOrder?: 'ASC' | 'DESC';
  dateFrom?: string;
  dateTo?: string;
}

export interface CreateOrderStageRequest {
  stageId: string;
  assignedToId?: string;
  notes?: string;
}

export interface UpdateOrderStageRequest {
  assignedToId?: string;
  notes?: string;
}

export interface AssignOrderStageRequest {
  assignedToId: string;
}

export interface OrderStatistics {
  total: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  recentlyCreated: number;
  recentlyCompleted: number;
  overdueCount: number;
}

// API функции для работы с заявками
export const ordersApi = {
  // Создание новой заявки
  create: async (data: CreateOrderRequest): Promise<Order> => {
    const response = await api.post<Order>('/orders', data);
    return response.data;
  },

  // Получение списка заявок
  findAll: async (params?: QueryOrdersRequest): Promise<PaginatedResponse<Order>> => {
    const response = await api.get<PaginatedResponse<Order>>('/orders', { params });
    return response.data;
  },

  // Получение статистики по заявкам
  getStatistics: async (managerId?: string): Promise<OrderStatistics> => {
    const params = managerId ? { managerId } : {};
    const response = await api.get<OrderStatistics>('/orders/statistics', { params });
    return response.data;
  },

  // Получение заявки по ID
  findOne: async (id: string): Promise<Order> => {
    const response = await api.get<Order>(`/orders/${id}`);
    return response.data;
  },

  // Обновление заявки
  update: async (id: string, data: UpdateOrderRequest): Promise<Order> => {
    const response = await api.patch<Order>(`/orders/${id}`, data);
    return response.data;
  },

  // Удаление заявки
  remove: async (id: string): Promise<void> => {
    await api.delete(`/orders/${id}`);
  },

  // Отмена заявки
  cancel: async (id: string, reason: string): Promise<Order> => {
    const response = await api.post<Order>(`/orders/${id}/cancel`, { reason });
    return response.data;
  },

  // Приостановка заявки
  pause: async (id: string, reason: string): Promise<Order> => {
    const response = await api.post<Order>(`/orders/${id}/pause`, { reason });
    return response.data;
  },

  // Возобновление заявки
  resume: async (id: string): Promise<Order> => {
    const response = await api.post<Order>(`/orders/${id}/resume`);
    return response.data;
  },

  // Завершение заявки
  complete: async (id: string): Promise<Order> => {
    const response = await api.post<Order>(`/orders/${id}/complete`);
    return response.data;
  },

  // Получение всех этапов заявки
  getOrderStages: async (id: string): Promise<OrderStage[]> => {
    const response = await api.get<OrderStage[]>(`/orders/${id}/stages`);
    return response.data;
  },

  // Получение конкретного этапа заявки
  getOrderStage: async (id: string, stageId: string): Promise<OrderStage> => {
    const response = await api.get<OrderStage>(`/orders/${id}/stages/${stageId}`);
    return response.data;
  },

  // Добавление этапа к заявке
  addOrderStage: async (id: string, data: CreateOrderStageRequest): Promise<OrderStage> => {
    const response = await api.post<OrderStage>(`/orders/${id}/stages`, data);
    return response.data;
  },

  // Обновление этапа заявки
  updateOrderStage: async (
    id: string,
    stageId: string,
    data: UpdateOrderStageRequest
  ): Promise<OrderStage> => {
    const response = await api.patch<OrderStage>(`/orders/${id}/stages/${stageId}`, data);
    return response.data;
  },

  // Удаление этапа из заявки
  removeOrderStage: async (id: string, stageId: string): Promise<void> => {
    await api.delete(`/orders/${id}/stages/${stageId}`);
  },

  // Начало работы над этапом
  startOrderStage: async (id: string, stageId: string): Promise<OrderStage> => {
    const response = await api.post<OrderStage>(`/orders/${id}/stages/${stageId}/start`);
    return response.data;
  },

  // Завершение этапа
  completeOrderStage: async (id: string, stageId: string): Promise<OrderStage> => {
    const response = await api.post<OrderStage>(`/orders/${id}/stages/${stageId}/complete`);
    return response.data;
  },

  // Пропуск этапа
  skipOrderStage: async (id: string, stageId: string, reason: string): Promise<OrderStage> => {
    const response = await api.post<OrderStage>(`/orders/${id}/stages/${stageId}/skip`, { reason });
    return response.data;
  },

  // Назначение исполнителя на этап
  assignOrderStage: async (
    id: string,
    stageId: string,
    data: AssignOrderStageRequest
  ): Promise<OrderStage> => {
    const response = await api.post<OrderStage>(`/orders/${id}/stages/${stageId}/assign`, data);
    return response.data;
  },
};

export default ordersApi;