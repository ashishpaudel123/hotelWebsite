import apiClient from '@/lib/api';

export interface User {
  _id: string;
  email: string;
  name: string;
  role: 'admin' | 'staff' | 'manager';
  phone?: string;
  isActive: boolean;
}

export const userApi = {
  getAll: async () => {
    const response = await apiClient.get('/users');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },

  create: async (data: Partial<User>) => {
    const response = await apiClient.post('/users', data);
    return response.data;
  },

  update: async (id: string, data: Partial<User>) => {
    const response = await apiClient.patch(`/users/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/users/${id}`);
    return response.data;
  },

  getMe: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
};
