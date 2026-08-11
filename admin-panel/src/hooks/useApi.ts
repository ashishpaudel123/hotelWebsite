'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import { ApiResponse, PaginationParams, User, Role, Permission, DashboardStats, Booking, Room, MenuCategory, MenuItem, GalleryItem, Blog, Event, HomepageSection, Coupon, EmailTemplate, NotificationTemplate, AnalyticsData, WebsiteSettings, ThemeSettings } from '@/types';

// Users
export function useUsers(params: PaginationParams = {}) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<User[]>>('/users', { params });
      return data;
    },
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: ['user', id],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<User>>(`/users/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userData: Partial<User>) => {
      const { data } = await apiClient.post<ApiResponse<User>>('/users', userData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...userData }: Partial<User> & { id: string }) => {
      const { data } = await apiClient.put<ApiResponse<User>>(`/users/${id}`, userData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete<ApiResponse<void>>(`/users/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

// Dashboard
export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<DashboardStats>>('/dashboard/stats');
      return data;
    },
  });
}

// Bookings
export function useBookings(params: PaginationParams = {}) {
  return useQuery({
    queryKey: ['bookings', params],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<Booking[]>>('/bookings', { params });
      return data;
    },
  });
}

// Rooms
export function useRooms(params: PaginationParams = {}) {
  return useQuery({
    queryKey: ['rooms', params],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<Room[]>>('/rooms', { params });
      return data;
    },
  });
}

// Menu Categories
export function useMenuCategories(params: PaginationParams = {}) {
  return useQuery({
    queryKey: ['menu-categories', params],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<MenuCategory[]>>('/menu-categories', { params });
      return data;
    },
  });
}

// Menu Items
export function useMenuItems(params: PaginationParams = {}) {
  return useQuery({
    queryKey: ['menu-items', params],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<MenuItem[]>>('/menu-items', { params });
      return data;
    },
  });
}

// Events
export function useEvents(params: PaginationParams = {}) {
  return useQuery({
    queryKey: ['events', params],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<Event[]>>('/events', { params });
      return data;
    },
  });
}

// Gallery
export function useGallery(params: PaginationParams = {}) {
  return useQuery({
    queryKey: ['gallery', params],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<GalleryItem[]>>('/gallery', { params });
      return data;
    },
  });
}

// Blogs
export function useBlogs(params: PaginationParams = {}) {
  return useQuery({
    queryKey: ['blogs', params],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<Blog[]>>('/blogs', { params });
      return data;
    },
  });
}

// Coupons
export function useCoupons(params: PaginationParams = {}) {
  return useQuery({
    queryKey: ['coupons', params],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<Coupon[]>>('/coupons', { params });
      return data;
    },
  });
}

// Homepage Sections
export function useHomepageSections(params: PaginationParams = {}) {
  return useQuery({
    queryKey: ['homepage-sections', params],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<HomepageSection[]>>('/homepage-sections', { params });
      return data;
    },
  });
}

// Website Settings
export function useWebsiteSettings() {
  return useQuery({
    queryKey: ['website-settings'],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<WebsiteSettings>>('/website/settings');
      return data;
    },
  });
}

// Theme Settings
export function useThemeSettings() {
  return useQuery({
    queryKey: ['theme-settings'],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<ThemeSettings>>('/website/theme');
      return data;
    },
  });
}

// Email Templates
export function useEmailTemplates(params: PaginationParams = {}) {
  return useQuery({
    queryKey: ['email-templates', params],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<EmailTemplate[]>>('/email-templates', { params });
      return data;
    },
  });
}

// Notification Templates
export function useNotificationTemplates(params: PaginationParams = {}) {
  return useQuery({
    queryKey: ['notification-templates', params],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<NotificationTemplate[]>>('/notification-templates', { params });
      return data;
    },
  });
}

// Analytics
export function useAnalytics(params: { startDate: string; endDate: string; metricType: string }) {
  return useQuery({
    queryKey: ['analytics', params],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<AnalyticsData[]>>('/analytics', { params });
      return data;
    },
  });
}

// Generic CRUD Hook
export function useCrud<T>(queryKey: string, endpoint: string) {
  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey: [queryKey, 'list'],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<T[]>>(endpoint);
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (item: Partial<T>) => {
      const { data } = await apiClient.post<ApiResponse<T>>(endpoint, item);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...item }: { id: string } & Partial<T>) => {
      const { data } = await apiClient.put<ApiResponse<T>>(`${endpoint}/${id}`, item);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete<ApiResponse<void>>(`${endpoint}/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
    },
  });

  return {
    listQuery,
    createMutation,
    updateMutation,
    deleteMutation,
  };
}
