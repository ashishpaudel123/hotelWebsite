# Hotel Management & Booking System - Backend

## Overview
Production-ready backend for a comprehensive Hotel CMS + Booking Management System built with Node.js, Express.js, and MongoDB.

## Features
- ✅ JWT Authentication with RBAC
- ✅ Role-Based Access Control (Granular Permissions)
- ✅ Clean Architecture (Controllers, Services, Repositories)
- ✅ Zod Validation
- ✅ Soft Deletes
- ✅ Audit Logging
- ✅ Rate Limiting
- ✅ Security Headers (Helmet)
- ✅ CORS Configuration
- ✅ Error Handling
- ✅ Logging (Winston)
- ✅ Database Connection Management

## Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: Zod
- **Security**: Helmet, bcryptjs
- **Logging**: Winston + Morgan
- **Rate Limiting**: express-rate-limit

## Project Structure
```
src/
├── config/           # Database and configuration files
├── constants/        # Application constants
├── controllers/      # Request handlers
├── dtos/            # Data Transfer Objects
├── middleware/       # Custom middleware (auth, validation, error handling)
├── models/          # Mongoose schemas
├── modules/         # Feature modules
│   ├── auth/        # Authentication module
│   ├── user/        # User management
│   ├── role/        # Role management
│   ├── permission/  # Permission management
│   └── ...          # Other modules
├── routes/          # Route definitions
├── services/        # Business logic
├── utils/           # Utility functions
├── validators/      # Validation schemas
├── jobs/            # Scheduled tasks
├── events/          # Event handlers
└── server.js        # Application entry point
```

## Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- npm or yarn

### Steps

1. **Clone the repository**
```bash
cd hotel-backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Create environment file**
```bash
cp .env.example .env
```

4. **Configure environment variables**
Edit `.env` file with your credentials:
- MongoDB connection string
- JWT secrets
- Cloudinary credentials
- Email SMTP settings
- Payment gateway credentials

5. **Run the application**

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Endpoints

### Health Check
```
GET /health
```

### Permissions (Example Module)
```
POST   /api/v1/permissions          - Create permission
GET    /api/v1/permissions          - List permissions
GET    /api/v1/permissions/:id      - Get permission by ID
PUT    /api/v1/permissions/:id      - Update permission
DELETE /api/v1/permissions/:id      - Delete permission
GET    /api/v1/permissions/resource/:resource - Get by resource
POST   /api/v1/permissions/initialize - Initialize default permissions
```

## Authentication

The system uses JWT-based authentication with the following flow:

1. User logs in with email/password
2. Server validates credentials and returns access token + refresh token
3. Client includes access token in Authorization header: `Bearer <token>`
4. Server validates token on protected routes
5. Refresh token used to obtain new access token when expired

## Role-Based Access Control (RBAC)

The system implements granular RBAC:

- **Roles**: Define groups of permissions (e.g., Super Admin, Admin, Receptionist)
- **Permissions**: Granular actions on resources (e.g., `booking:read`, `booking:write`)
- **Middleware**: `protect()`, `authorize()`, `checkPermission()`

### Example Permission Structure
```javascript
{
  name: "Create Bookings",
  resource: "bookings",
  action: "write",
  isSystem: true
}
```

## Validation

All inputs are validated using Zod schemas:
- Request body validation
- Query parameter validation
- URL parameter validation
- Custom error messages

## Error Handling

Standardized error response format:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [...]
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## Logging

Winston logger with multiple transports:
- Console (colored output in development)
- File (error.log, combined.log)
- HTTP request logging via Morgan

## Security Features

- Password hashing with bcryptjs
- JWT token authentication
- Rate limiting on all endpoints
- Helmet security headers
- CORS configuration
- Input validation and sanitization
- SQL/NoSQL injection protection
- XSS protection

## Database Models

Each model includes:
- Timestamps (createdAt, updatedAt)
- Soft delete support (isDeleted, deletedAt)
- Audit fields (createdBy, updatedBy)
- Indexes for performance
- Validation rules
- Virtual properties
- Instance methods
- Static methods

## Testing

```bash
npm test
```

## Deployment

### Environment Variables for Production
- Set `NODE_ENV=production`
- Use strong JWT secrets
- Configure production MongoDB
- Set up Cloudinary for image storage
- Configure production email service

### Recommended Infrastructure
- PM2 for process management
- Nginx as reverse proxy
- SSL/TLS certificates
- MongoDB replica set for high availability
- Redis for caching (future enhancement)

## Future Enhancements

- [ ] Redis caching layer
- [ ] WebSocket for real-time updates
- [ ] GraphQL API
- [ ] Microservices architecture
- [ ] Docker containerization
- [ ] Kubernetes deployment
- [ ] CI/CD pipeline
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Unit and integration tests
- [ ] Performance monitoring (APM)

## License

ISC

## Support

For issues and questions, please create an issue in the repository.
