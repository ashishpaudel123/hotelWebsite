import { WebsiteSettings, ThemeSettings, HomepageSection, Room, BlogPost, Event, MenuItem, MenuCategory, GalleryImage, Testimonial, BookingPayload, BookingResult, AvailabilityResult } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';

// Cache tags for revalidation
export const CACHE_TAGS = {
  SETTINGS: 'settings',
  ROOMS: 'rooms',
  HOMEPAGE: 'homepage',
  BLOGS: 'blogs',
  EVENTS: 'events',
  MENU: 'menu',
  GALLERY: 'gallery',
  TESTIMONIALS: 'testimonials',
} as const;

async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit,
  cacheTags?: string[]
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    next: {
      tags: cacheTags,
      revalidate: 3600, // 1 hour default revalidation
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Resource not found');
    }
    if (response.status >= 500) {
      throw new Error('Server error');
    }
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data.data as T;
}

// Settings APIs
export async function getWebsiteSettings() {
  return fetchAPI<WebsiteSettings>('/website/settings', undefined, [CACHE_TAGS.SETTINGS]);
}

export async function getThemeSettings() {
  return fetchAPI<ThemeSettings>('/website/theme', undefined, [CACHE_TAGS.SETTINGS]);
}

export async function getHomepageSections() {
  return fetchAPI<HomepageSection[]>('/website/homepage-sections?status=active&isVisible=true', undefined, [CACHE_TAGS.HOMEPAGE]);
}

// Room APIs
export async function getRooms(filters?: { status?: string; roomTypeId?: string }) {
  const params = new URLSearchParams();
  if (filters?.status) params.append('status', filters.status);
  if (filters?.roomTypeId) params.append('roomTypeId', filters.roomTypeId);
  
  const queryString = params.toString();
  return fetchAPI<Room[]>(`/rooms${queryString ? `?${queryString}` : ''}`, undefined, [CACHE_TAGS.ROOMS]);
}

export async function getRoomBySlug(slug: string) {
  const rooms = await fetchAPI<Room[]>(`/rooms/slug/${slug}`, undefined, [CACHE_TAGS.ROOMS, slug]);
  return rooms[0];
}

// Blog APIs
export async function getBlogs(limit = 6) {
  return fetchAPI<BlogPost[]>(`/blogs?status=published&limit=${limit}`, undefined, [CACHE_TAGS.BLOGS]);
}

export async function getBlogBySlug(slug: string) {
  return fetchAPI<BlogPost>(`/blogs/slug/${slug}`, undefined, [CACHE_TAGS.BLOGS, slug]);
}

// Event APIs
export async function getEvents(status = 'upcoming') {
  return fetchAPI<Event[]>(`/events?status=${status}`, undefined, [CACHE_TAGS.EVENTS]);
}

// Menu APIs
export async function getMenuItems() {
  return fetchAPI<MenuItem[]>('/menu-items?isAvailable=true', undefined, [CACHE_TAGS.MENU]);
}

export async function getMenuCategories() {
  return fetchAPI<MenuCategory[]>('/menu-categories?isActive=true', undefined, [CACHE_TAGS.MENU]);
}

// Gallery APIs
export async function getGalleryImages(category?: string) {
  const params = category ? `?category=${category}&isVisible=true` : '?isVisible=true';
  return fetchAPI<GalleryImage[]>(`/gallery${params}`, undefined, [CACHE_TAGS.GALLERY]);
}

// Testimonial APIs
export async function getTestimonials(featured = false) {
  const params = featured ? '?featured=true&isVisible=true' : '?isVisible=true';
  return fetchAPI<Testimonial[]>(`/testimonials${params}`, undefined, [CACHE_TAGS.TESTIMONIALS]);
}

export async function checkAvailability(payload: { roomId: string; checkIn: string; checkOut: string; quantity?: number }): Promise<AvailabilityResult> {
  return fetchAPI<AvailabilityResult>('/bookings/check-availability', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function createBooking(payload: BookingPayload): Promise<BookingResult> {
  return fetchAPI<BookingResult>('/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function getBookingByReference(reference: string): Promise<BookingResult> {
  return fetchAPI<BookingResult>(`/bookings/reference/${reference}`);
}
