# Hotel Management & Booking System

A production-ready, enterprise-grade Hotel Management & Booking System built with Node.js, Express.js, MongoDB, and TypeScript.

## Features

### Core Modules (Implemented)
- ✅ **Authentication Module**: JWT-based auth with refresh tokens, password reset, account locking
- ✅ **RBAC System**: Granular permissions, role-based access control
- ✅ **User Management**: Complete user lifecycle with soft deletes
- ✅ **Logging**: Winston logger with file rotation and multiple transports
- ✅ **Error Handling**: Centralized error handling with custom error codes
- ✅ **Validation**: Zod schema validation for all inputs
- ✅ **Rate Limiting**: Configurable rate limiters for API protection
- ✅ **Security**: Helmet, CORS, compression middleware

### Planned Modules
- 🔄 Room Management
- 🔄 Booking Engine
- 🔄 Payment Integration (eSewa, Khalti)
- 🔄 CMS (Content Management System)
- 🔄 Restaurant & Menu Management
- 🔄 Events & Facilities
- 🔄 Reviews & Testimonials
-  Coupons & Offers
-  Blogs
-  Analytics & Reporting
-  Notifications
-  Audit Logs

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Language**: TypeScript
- **Validation**: Zod
- **Authentication**: JWT (jsonwebtoken)
- **Security**: Helmet, bcryptjs
- **Logging**: Winston
- **Testing**: Jest (planned)

## Project Structure

```
src/
├── config/          # Configuration files
├── middleware/      # Express middleware
├── models/          # Mongoose models
├── modules/         # Feature modules
│   └── auth/        # Authentication module
│       ├── controllers/
│       ├── dtos/
│       ├── repositories/
│       ├── routes/
│       ├── services/
│       ├── validators/
│       └── index.ts
├── utils/           # Utility functions
└── server.ts        # Application entry point
```

## Getting Started

### Prerequisites
- Node.js >= 18.0.0
- MongoDB >= 6.0
- npm >= 9.0.0

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd hotel-management-system
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment file:
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hotel-management
JWT_SECRET=your-secret-key
```

5. Start development server:
```bash
npm run dev
```

6. Build for production:
```bash
npm run build
npm start
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password
- `POST /api/v1/auth/logout` - Logout user
- `GET /api/v1/auth/profile` - Get user profile

### Health Check
- `GET /health` - Server health status

## API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1Ni...",
    "refreshToken": "dGhpcyBpcyBhIHJlZnJl...",
    "expiresIn": 900,
    "user": {
      "id": "u_123",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "customer",
      "permissions": ["booking:create", "booking:read"]
    }
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "AUTH_001",
    "message": "Invalid credentials",
    "details": []
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| AUTH_001 | 401 | Invalid credentials |
| AUTH_002 | 401 | Token expired |
| AUTH_003 | 403 | Account locked |
| AUTH_004 | 401 | Invalid refresh token |
| VAL_001 | 400 | Validation failed |
| RES_001 | 404 | Resource not found |
| RES_002 | 409 | Duplicate resource |
| PERM_001 | 403 | Insufficient permissions |
| SYS_001 | 500 | Internal server error |

## Security Features

- **Password Hashing**: bcryptjs with salt rounds of 12
- **JWT Tokens**: Short-lived access tokens (15min) + long-lived refresh tokens (7 days)
- **Account Locking**: 5 failed attempts triggers 15-minute lock
- **Rate Limiting**: Configurable limits per endpoint type
- **Input Validation**: Zod schemas for all inputs
- **Security Headers**: Helmet middleware
- **CORS**: Configured for specific origins
- **Soft Deletes**: All entities support soft deletion

## Development

### Run in development mode:
```bash
npm run dev
```

### Build for production:
```bash
npm run build
```

### Run tests:
```bash
npm test
```

### Lint code:
```bash
npm run lint
```

## Environment Variables

See `.env.example` for all available configuration options.

## License

MIT

## Support

For issues and questions, please create an issue in the repository.
