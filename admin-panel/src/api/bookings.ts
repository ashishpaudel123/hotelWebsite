import apiClient from '@/lib/api';

export interface Booking {
  _id: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  status: 'pending' | 'confirmed' | 'checked-in' | 'checked-out' | 'cancelled';
  totalPrice: number;
  paymentStatus: 'pending' | 'paid' | 'refunded';
}

export const bookingApi = {
  getAll: async (params?: any) => {
    const response = await apiClient.get('/bookings', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/bookings/${id}`);
    return response.data;
  },

  create: async (data: Partial<Booking>) => {
    const response = await apiClient.post('/bookings', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Booking>) => {
    const response = await apiClient.patch(`/bookings/${id}`, data);
    return response.data;
  },

  cancel: async (id: string) => {
    const response = await apiClient.post(`/bookings/${id}/cancel`);
    return response.data;
  },

  confirm: async (id: string) => {
    const response = await apiClient.post(`/bookings/${id}/confirm`);
    return response.data;
  },
};
