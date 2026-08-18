import apiClient from '@/lib/api';

export interface Room {
  _id: string;
  name: string;
  slug: string;
  type: string;
  price: number;
  capacity: number;
  size: number;
  floor: number;
  status: 'available' | 'occupied' | 'maintenance';
  amenities: string[];
  images: string[];
  description: string;
}

export const roomApi = {
  getAll: async () => {
    const response = await apiClient.get('/rooms');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/rooms/${id}`);
    return response.data;
  },

  create: async (data: Partial<Room>) => {
    const response = await apiClient.post('/rooms', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Room>) => {
    const response = await apiClient.patch(`/rooms/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/rooms/${id}`);
    return response.data;
  },

  getAvailable: async (checkIn?: string, checkOut?: string) => {
    const params: any = {};
    if (checkIn) params.checkIn = checkIn;
    if (checkOut) params.checkOut = checkOut;
    const response = await apiClient.get('/rooms/available', { params });
    return response.data;
  },
};
