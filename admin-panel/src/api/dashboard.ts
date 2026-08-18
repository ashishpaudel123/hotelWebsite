import apiClient from '@/lib/api';

export interface DashboardStats {
  totalBookings: number;
  activeBookings: number;
  totalRevenue: number;
  occupancyRate: number;
  availableRooms: number;
  pendingBookings: number;
}

export const dashboardApi = {
  getStats: async () => {
    const response = await apiClient.get('/dashboard/stats');
    return response.data;
  },

  getRecentBookings: async (limit = 10) => {
    const response = await apiClient.get(`/dashboard/recent-bookings?limit=${limit}`);
    return response.data;
  },

  getRevenueChart: async (days = 30) => {
    const response = await apiClient.get(`/dashboard/revenue-chart?days=${days}`);
    return response.data;
  },
};
