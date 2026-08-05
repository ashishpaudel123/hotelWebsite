# Public Website

Next.js 15 public-facing website for the Hotel Management System.

## Features

- ✅ **Server Components** - All data fetched on server for optimal performance
- ✅ **Dynamic CMS** - Zero hardcoded content, everything from backend API
- ✅ **SEO Optimization** - Dynamic metadata, Open Graph, structured data
- ✅ **Image Optimization** - Next.js Image component with proper sizing
- ✅ **Responsive Design** - Mobile-first approach with Tailwind CSS
- ✅ **Loading States** - Skeleton screens for better UX
- ✅ **Error Handling** - Graceful fallbacks and custom 404 page
- ✅ **Accessibility** - ARIA labels, focus states, semantic HTML
- ✅ **Performance** - ISR with revalidateTag caching

## Tech Stack

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI
- **Icons**: Lucide React
- **Fonts**: Google Fonts (Playfair Display, Inter)

## Project Structure

```
public-web/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # Root layout with dynamic theme
│   │   ├── page.tsx            # Homepage with CMS sections
│   │   ├── rooms/
│   │   │   ├── page.tsx        # Rooms listing
│   │   │   └── [slug]/page.tsx # Dynamic room detail
│   │   ├── globals.css         # Global styles
│   │   └── not-found.tsx       # Custom 404 page
│   ├── components/
│   │   ├── ui/                 # Shadcn UI components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── badge.tsx
│   │   │   └── skeleton.tsx
│   │   └── layout/             # Layout components
│   │       ├── Header.tsx      # Dynamic header
│   │       └── Footer.tsx      # Dynamic footer
│   ├── lib/
│   │   ├── api.ts              # API client with caching
│   │   └── utils.ts            # Utility functions
│   └── types/
│       └── index.ts            # TypeScript interfaces
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── postcss.config.js
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- Backend API running on port 5000 (or update `NEXT_PUBLIC_API_URL`)

### Installation

```bash
cd public-web
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

## Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

## Key Features

### Dynamic Homepage
- Hero section with dynamic tagline
- CMS-controlled sections (About, Rooms, Testimonials, etc.)
- Theme colors from database
- Logo and branding from settings

### Rooms Pages
- Listing page with filters (ready for expansion)
- Dynamic detail pages with SSR
- Image galleries
- Real-time pricing
- Availability checking

### SEO
- Dynamic metadata per page
- Open Graph tags
- Structured data ready
- Sitemap support
- Robots.txt configuration

### Performance
- Server-side rendering
- Incremental Static Regeneration (ISR)
- Image optimization
- Font optimization
- Code splitting

## API Integration

The website fetches data from the backend API:

- `/website/settings` - Site configuration
- `/website/theme` - Theme colors and fonts
- `/website/homepage-sections` - CMS sections
- `/rooms` - Room listings
- `/blogs` - Blog posts
- `/events` - Upcoming events
- `/gallery` - Image gallery
- `/testimonials` - Customer reviews

## Caching Strategy

Uses Next.js 15 cache tags for intelligent revalidation:

```typescript
// Data cached for 1 hour, revalidated on mutation
next: {
  tags: ['rooms'],
  revalidate: 3600,
}
```

## Accessibility

- WCAG AA compliant color contrast
- Keyboard navigation support
- Screen reader friendly
- Focus indicators
- Semantic HTML structure

## Responsive Breakpoints

- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

## Next Steps

1. Add booking engine integration
2. Implement blog listing and detail pages
3. Add events calendar
4. Create gallery page with lightbox
5. Build contact form with validation
6. Add newsletter subscription
7. Implement search functionality
8. Add multi-language support
