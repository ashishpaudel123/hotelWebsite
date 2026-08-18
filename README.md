# Hotel Booking System

A complete hotel management system with admin panel and public website.

## Project Structure

- `/backend` - Node.js/Express API server
- `/admin-panel` - Next.js admin dashboard
- `/website` - Public-facing website (to be implemented)

## Backend Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or cloud)

### Installation

```bash
cd backend
npm install
```

### Configuration

Create `.env` file in backend directory:

```env
NODE_ENV=development
PORT=3000
DATABASE=mongodb://localhost:27017/hotel-booking
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=90d
JWT_COOKIE_EXPIRES_IN=90
```

### Run Backend

```bash
npm run dev
```

Server will start on http://localhost:3000

## Admin Panel Setup

### Installation

```bash
cd admin-panel
npm install
```

### Configuration

`.env.local` is already configured with:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

### Run Admin Panel

```bash
npm run dev
```

Admin panel will start on http://localhost:3001

## Default Admin Credentials

Create first admin user via API:

```bash
curl -X POST http://localhost:3000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@hotel.com",
    "password": "admin123",
    "name": "Admin User",
    "role": "admin"
  }'
```

## API Endpoints

### Authentication
- POST `/api/v1/auth/signup` - Register new user
- POST `/api/v1/auth/login` - Login
- POST `/api/v1/auth/logout` - Logout
- GET `/api/v1/auth/me` - Get current user
- PATCH `/api/v1/auth/update-password` - Update password
- POST `/api/v1/auth/forgot-password` - Request password reset
- PATCH `/api/v1/auth/reset-password/:token` - Reset password

### Rooms
- GET `/api/v1/rooms` - Get all rooms
- GET `/api/v1/rooms/:id` - Get room by ID
- POST `/api/v1/rooms` - Create room (admin)
- PATCH `/api/v1/rooms/:id` - Update room (admin)
- DELETE `/api/v1/rooms/:id` - Delete room (admin)
- GET `/api/v1/rooms/available` - Get available rooms

### Bookings
- GET `/api/v1/bookings` - Get all bookings
- GET `/api/v1/bookings/:id` - Get booking by ID
- POST `/api/v1/bookings` - Create booking
- PATCH `/api/v1/bookings/:id` - Update booking
- POST `/api/v1/bookings/:id/cancel` - Cancel booking
- POST `/api/v1/bookings/:id/confirm` - Confirm booking

### Users
- GET `/api/v1/users` - Get all users (admin)
- GET `/api/v1/users/:id` - Get user by ID
- POST `/api/v1/users` - Create user (admin)
- PATCH `/api/v1/users/:id` - Update user (admin)
- DELETE `/api/v1/users/:id` - Delete user (admin)

### Dashboard
- GET `/api/v1/dashboard/stats` - Get dashboard statistics
- GET `/api/v1/dashboard/recent-bookings` - Get recent bookings
- GET `/api/v1/dashboard/revenue-chart` - Get revenue data

### CMS
- GET `/api/v1/cms/blogs` - Get blog posts
- GET `/api/v1/cms/events` - Get events
- GET `/api/v1/cms/gallery` - Get gallery images
- GET `/api/v1/cms/testimonials` - Get testimonials
- GET `/api/v1/cms/menu-items` - Get menu items
- GET `/api/v1/cms/homepage-sections` - Get homepage sections
- GET `/api/v1/cms/website-settings` - Get website settings
- GET `/api/v1/cms/theme-settings` - Get theme settings

### Payments
- POST `/api/v1/payments/initiate` - Initiate payment
- POST `/api/v1/payments/verify` - Verify payment
- POST `/api/v1/payments/refund` - Process refund

## Features Implemented

### Backend
✅ User authentication (JWT)
✅ Role-based access control
✅ Room management
✅ Booking management
✅ Payment processing
✅ CMS modules
✅ Dashboard statistics
✅ Error handling
✅ Email notifications (configured)
✅ SMS notifications (configured)

### Admin Panel
✅ Login page
✅ Dashboard with statistics
✅ Bookings management
✅ Rooms management (API ready)
✅ Users management (API ready)
✅ Authentication context
✅ API client with interceptors
✅ TypeScript types
✅ UI components
✅ Responsive design

## Next Steps

1. **Test the application:**
   - Start backend: `cd backend && npm run dev`
   - Start admin panel: `cd admin-panel && npm run dev`
   - Create admin user via API
   - Login to admin panel

2. **Implement remaining features:**
   - Complete all admin panel pages
   - Build public website
   - Add email templates
   - Configure payment gateway credentials
   - Add image upload functionality

3. **Production deployment:**
   - Update JWT_SECRET in production
   - Configure MongoDB connection string
   - Set up SSL/HTTPS
   - Configure environment variables
   - Deploy to hosting platform

## Support

For issues or questions, please check the documentation or contact support.
