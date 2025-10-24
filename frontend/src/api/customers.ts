import { api, PaginatedResponse } from './client';

// Типы данных для клиентов
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  inn?: string;
  kpp?: string;
  ogrn?: string;
  contactPerson?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'BLACKLISTED';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerRequest {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  inn?: string;
  kpp?: string;
  ogrn?: string;
  contactPerson?: string;
  notes?: string;
}

export interface UpdateCustomerRequest {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  inn?: string;
  kpp?: string;
  ogrn?: string;
  contactPerson?: string;
  notes?: string;
}

export interface QueryCustomersRequest {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'name' | 'email';
  sortOrder?: 'ASC' | 'DESC';
}

export interface CustomerStatistics {
  total: number;
  active: number;
  inactive: number;
  blacklisted: number;
  recentlyAdded: number;
  withOrders: number;
}

// API функции для работы с клиентами
export const customersApi = {
  // Создание нового клиента
  create: async (data: CreateCustomerRequest): Promise<Customer> => {
    const response = await api.post<Customer>('/customers', data);
    return response.data;
  },

  // Получение списка клиентов
  findAll: async (params?: QueryCustomersRequest): Promise<PaginatedResponse<Customer>> => {
    const response = await api.get<PaginatedResponse<Customer>>('/customers', { params });
    return response.data;
  },

  // Получение статистики по клиентам
  getStatistics: async (): Promise<CustomerStatistics> => {
    const response = await api.get<CustomerStatistics>('/customers/statistics');
    return response.data;
  },

  // Получение клиента по ID
  findOne: async (id: string): Promise<Customer> => {
    const response = await api.get<Customer>(`/customers/${id}`);
    return response.data;
  },

  // Обновление клиента
  update: async (id: string, data: UpdateCustomerRequest): Promise<Customer> => {
    const response = await api.patch<Customer>(`/customers/${id}`, data);
    return response.data;
  },

  // Удаление клиента
  remove: async (id: string): Promise<void> => {
    await api.delete(`/customers/${id}`);
  },

  // Активация клиента
  activate: async (id: string): Promise<Customer> => {
    const response = await api.post<Customer>(`/customers/${id}/activate`);
    return response.data;
  },

  // Деактивация клиента
  deactivate: async (id: string): Promise<Customer> => {
    const response = await api.post<Customer>(`/customers/${id}/deactivate`);
    return response.data;
  },

  // Добавление клиента в черный список
  blacklist: async (id: string): Promise<Customer> => {
    const response = await api.post<Customer>(`/customers/${id}/blacklist`);
    return response.data;
  },
};

export default customersApi;