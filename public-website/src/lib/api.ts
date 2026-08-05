const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

interface FetchOptions extends RequestInit {
  revalidate?: number | false;
  tags?: string[];
}

async function fetchAPI<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { revalidate = 3600, tags = [], ...fetchOptions } = options;

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...fetchOptions,
    headers: {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    },
    next: { revalidate, tags },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data.data as T;
}

export const api = {
  // Website Settings
  getWebsiteSettings: () => fetchAPI<WebsiteSettings>('/website/settings'),
  getThemeSettings: () => fetchAPI<ThemeSettings>('/website/theme'),
  getHomepageSections: () => fetchAPI<HomepageSection[]>('/website/homepage-sections'),
  
  // Rooms
  getRooms: (filters?: Record<string, string>) => {
    const params = new URLSearchParams(filters).toString();
    return fetchAPI<{ rooms: Room[]; meta: any }>(`/rooms?${params}`);
  },
  getRoomBySlug: (slug: string) => fetchAPI<Room>(`/rooms/slug/${slug}`),
  
  // Content
  getBlogPosts: (filters?: Record<string, string>) => {
    const params = new URLSearchParams(filters).toString();
    return fetchAPI<{ posts: BlogPost[]; meta: any }>(`/blogs?${params}`);
  },
  getEvents: (filters?: Record<string, string>) => {
    const params = new URLSearchParams(filters).toString();
    return fetchAPI<{ events: Event[] }>(`/events?${params}`);
  },
  getMenuItems: (categoryId?: string) => {
    const params = categoryId ? `?category=${categoryId}` : '';
    return fetchAPI<{ items: MenuItem[] }>(`/menu-items${params}`);
  },
  getGallery: (category?: string) => {
    const params = category ? `?category=${category}` : '';
    return fetchAPI<{ images: GalleryImage[] }>(`/gallery${params}`);
  },
  getTestimonials: () => fetchAPI<{ testimonials: Testimonial[] }>('/testimonials'),
  
  // SEO
  getPageSEO: (slug: string) => fetchAPI<SEO>(`/seo/pages/${slug}`),
};

// Re-export types for convenience
export type {
  Room,
  WebsiteSettings,
  HomepageSection,
  ThemeSettings,
  SEO,
  BlogPost,
  Event,
  MenuItem,
  GalleryImage,
  Testimonial,
} from '@/types';
