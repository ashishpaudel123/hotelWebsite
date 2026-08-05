const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

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

  return response.json();
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
  return fetchAPI<{ data: Room[] }>(`/rooms${queryString ? `?${queryString}` : ''}`, undefined, [CACHE_TAGS.ROOMS]);
}

export async function getRoomBySlug(slug: string) {
  return fetchAPI<Room>(`/rooms/slug/${slug}`, undefined, [CACHE_TAGS.ROOMS, slug]);
}

// Blog APIs
export async function getBlogs(limit = 6) {
  return fetchAPI<{ data: BlogPost[] }>(`/blogs?status=published&limit=${limit}`, undefined, [CACHE_TAGS.BLOGS]);
}

export async function getBlogBySlug(slug: string) {
  return fetchAPI<BlogPost>(`/blogs/slug/${slug}`, undefined, [CACHE_TAGS.BLOGS, slug]);
}

// Event APIs
export async function getEvents(status = 'upcoming') {
  return fetchAPI<{ data: Event[] }>(`/events?status=${status}`, undefined, [CACHE_TAGS.EVENTS]);
}

// Menu APIs
export async function getMenuItems() {
  return fetchAPI<{ data: MenuItem[] }>('/menu-items?isAvailable=true', undefined, [CACHE_TAGS.MENU]);
}

export async function getMenuCategories() {
  return fetchAPI<{ data: any[] }>('/menu-categories?isActive=true', undefined, [CACHE_TAGS.MENU]);
}

// Gallery APIs
export async function getGalleryImages(category?: string) {
  const params = category ? `?category=${category}&isVisible=true` : '?isVisible=true';
  return fetchAPI<{ data: GalleryImage[] }>(`/gallery${params}`, undefined, [CACHE_TAGS.GALLERY]);
}

// Testimonial APIs
export async function getTestimonials(featured = false) {
  const params = featured ? '?featured=true&isVisible=true' : '?isVisible=true';
  return fetchAPI<{ data: Testimonial[] }>(`/testimonials${params}`, undefined, [CACHE_TAGS.TESTIMONIALS]);
}
