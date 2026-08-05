# Comprehensive Testing Plan
## Hotel Management & Booking System

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Testing Strategy Overview](#testing-strategy-overview)
3. [Backend Tests](#backend-tests)
4. [Frontend Tests](#frontend-tests)
5. [API Tests](#api-tests)
6. [Security Tests](#security-tests)
7. [Performance Tests](#performance-tests)
8. [Bug Checklist](#bug-checklist)
9. [Deployment Checklist](#deployment-checklist)
10. [Test Environment Setup](#test-environment-setup)
11. [Tools & Technologies](#tools--technologies)

---

## Executive Summary

This document outlines a comprehensive testing strategy for the Hotel Management & Booking System. The testing approach follows industry best practices, ensuring production-ready code quality, security, performance, and reliability across all system components.

### Testing Objectives

- **Quality Assurance**: Ensure all features meet functional and non-functional requirements
- **Risk Mitigation**: Identify and resolve defects before production deployment
- **Performance Validation**: Verify system handles expected load and scales appropriately
- **Security Compliance**: Validate security controls and protect against common vulnerabilities
- **Regression Prevention**: Maintain existing functionality while adding new features

### Testing Principles

1. **Test Early, Test Often**: Integrate testing throughout the development lifecycle
2. **Automation First**: Automate repetitive tests; manual testing for exploratory scenarios
3. **Clean Architecture Compliance**: Tests follow the same architectural patterns as production code
4. **SOLID Principles**: Tests are maintainable, extensible, and follow single responsibility
5. **TypeScript Strict Mode**: All test code adheres to strict TypeScript configuration
6. **No Hardcoded Values**: Use environment variables and configuration files
7. **Reusable Components**: Create shared test utilities and fixtures

---

## Testing Strategy Overview

### Testing Pyramid

```
                    /\
                   /  \
                  / E2E \        (10% - Critical User Journeys)
                 /--------\
                /          \
               / Integration \    (20% - Module Interactions)
              /--------------\
             /                \
            /     Unit Tests   \  (70% - Individual Components)
           /--------------------\
```

### Test Levels

| Level | Scope | Responsibility | Tools |
|-------|-------|----------------|-------|
| Unit | Individual functions, classes, methods | Developers | Jest, React Testing Library |
| Integration | Module interactions, API endpoints | Developers, QA | Jest, Supertest |
| E2E | Complete user workflows | QA, Automation Engineers | Playwright, Cypress |
| Performance | Load, stress, scalability | Performance Engineers | k6, Artillery |
| Security | Vulnerabilities, compliance | Security Team | OWASP ZAP, Snyk |

### Test Coverage Targets

| Component Type | Minimum Coverage | Target Coverage |
|----------------|------------------|-----------------|
| Core Business Logic | 90% | 95% |
| API Endpoints | 85% | 90% |
| UI Components | 80% | 85% |
| Utilities/Helpers | 95% | 100% |
| Configuration | 100% | 100% |

---

## Backend Tests

### Architecture Decision

**Decision**: Backend tests follow Clean Architecture principles with separate test directories mirroring the source structure. Each module contains its own tests, promoting encapsulation and maintainability.

**Rationale**: 
- Tests are co-located with their corresponding source code
- Easy to identify missing tests for any component
- Supports incremental testing during development
- Facilitates refactoring with confidence

### Folder Structure

```
src/
├── modules/
│   └── auth/
│       ├── __tests__/
│       │   ├── controllers/
│       │   ├── services/
│       │   ├── repositories/
│       │   └── validators/
│       ├── controllers/
│       ├── services/
│       ├── repositories/
│       └── validators/
├── __tests__/
│   ├── setup.ts
│   ├── teardown.ts
│   └── global.d.ts
├── utils/
│   └── __tests__/
└── middleware/
    └── __tests__/
```

### Unit Tests

#### Purpose
Test individual units of code in isolation, mocking external dependencies.

#### Test Categories

1. **Service Layer Tests**
   - Business logic validation
   - Domain rule enforcement
   - State transitions
   - Error handling

2. **Repository Layer Tests**
   - Database query construction
   - Data transformation
   - Soft delete implementation
   - Transaction handling

3. **Validator Tests**
   - Schema validation
   - Input sanitization
   - Error message formatting
   - Edge case handling

4. **Utility Function Tests**
   - Helper functions
   - Date/time calculations
   - String manipulations
   - Encryption/decryption

#### Example Test Structure (Jest)

```typescript
// src/modules/auth/__tests__/services/auth.service.test.ts

import { AuthService } from '../../services/auth.service';
import { UserRepository } from '../../repositories/user.repository';
import { TokenService } from '../../services/token.service';
import { BadRequestError } from '@/utils/errors';

describe('AuthService', () => {
  let authService: AuthService;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockTokenService: jest.Mocked<TokenService>;

  beforeEach(() => {
    mockUserRepository = {
      findByEmail: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    } as any;

    mockTokenService = {
      generateAccessToken: jest.fn(),
      generateRefreshToken: jest.fn(),
      verifyToken: jest.fn(),
    } as any;

    authService = new AuthService(mockUserRepository, mockTokenService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return tokens and user data on successful login', async () => {
      // Arrange
      const mockUser = {
        id: 'u_123',
        email: 'test@example.com',
        passwordHash: 'hashed_password',
        isActive: true,
        isLocked: false,
      };

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockTokenService.generateAccessToken.mockReturnValue('access_token');
      mockTokenService.generateRefreshToken.mockReturnValue('refresh_token');

      // Act
      const result = await authService.login('test@example.com', 'password123');

      // Assert
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe('test@example.com');
    });

    it('should throw BadRequestError for invalid credentials', async () => {
      // Arrange
      mockUserRepository.findByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(authService.login('wrong@email.com', 'password'))
        .rejects
        .toThrow(BadRequestError);
    });

    it('should throw ForbiddenError when account is locked', async () => {
      // Arrange
      const lockedUser = {
        id: 'u_123',
        email: 'locked@example.com',
        passwordHash: 'hashed_password',
        isActive: true,
        isLocked: true,
        lockUntil: new Date(Date.now() + 900000),
      };

      mockUserRepository.findByEmail.mockResolvedValue(lockedUser);

      // Act & Assert
      await expect(authService.login('locked@example.com', 'password'))
        .rejects
        .toThrowError(/Account locked/);
    });
  });
});
```

### Integration Tests

#### Purpose
Verify interactions between multiple components work correctly together.

#### Test Scenarios

1. **Controller-Service-Repository Flow**
   - Complete request-response cycle
   - Database operations
   - Transaction management
   - Event publishing

2. **Middleware Integration**
   - Authentication middleware
   - Authorization middleware
   - Rate limiting
   - Request logging

3. **External Service Integration**
   - Email service (password reset)
   - Payment gateways (eSewa, Khalti)
   - SMS providers
   - Cloud storage

#### Example Integration Test

```typescript
// src/modules/auth/__tests__/integration/auth.integration.test.ts

import request from 'supertest';
import { app } from '@/server';
import { mongooseConnect, mongooseDisconnect } from '@/__tests__/setup';
import { User } from '@/models/user.model';

describe('Auth Integration Tests', () => {
  beforeAll(async () => {
    await mongooseConnect();
  });

  afterAll(async () => {
    await mongooseDisconnect();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'SecurePass123!',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+977-9841234567',
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toHaveProperty('id');
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.accessToken).toBeDefined();
    });

    it('should return 409 for duplicate email', async () => {
      const userData = {
        email: 'duplicate@example.com',
        password: 'SecurePass123!',
        firstName: 'John',
        lastName: 'Doe',
      };

      // First registration
      await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(201);

      // Duplicate registration
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(409);

      expect(response.body.error.code).toBe('RES_002');
    });
  });
});
```

### Test Utilities

#### Mock Factories

```typescript
// src/__tests__/utils/factories/user.factory.ts

import { faker } from '@faker-js/faker';
import { User } from '@/models/user.model';
import { Role } from '@/models/role.model';

export class UserFactory {
  static make(attributes: Partial<User> = {}): User {
    return {
      id: `u_${faker.string.uuid()}`,
      email: faker.internet.email(),
      passwordHash: 'hashed_password',
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      phone: faker.phone.number(),
      role: Role.Customer,
      permissions: ['booking:create', 'booking:read'],
      isActive: true,
      isLocked: false,
      failedAttempts: 0,
      ...attributes,
    } as User;
  }

  static makeAdmin(attributes: Partial<User> = {}): User {
    return this.make({
      role: Role.Admin,
      permissions: ['*:*'],
      ...attributes,
    });
  }

  static makeLocked(attributes: Partial<User> = {}): User {
    return this.make({
      isLocked: true,
      lockUntil: new Date(Date.now() + 900000),
      failedAttempts: 5,
      ...attributes,
    });
  }
}
```

#### Test Database Helpers

```typescript
// src/__tests__/utils/database.helpers.ts

import { connect, disconnect, dropDatabase } from 'mongoose';
import { config } from '@/config/env';

export const TestDB = {
  async connect(): Promise<void> {
    await connect(config.testMongoURI, {
      maxPoolSize: 10,
    });
  },

  async disconnect(): Promise<void> {
    await disconnect();
  },

  async clear(): Promise<void> {
    await dropDatabase();
  },

  async seed<T>(collection: string, documents: T[]): Promise<T[]> {
    const db = connection.db;
    await db.collection(collection).insertMany(documents);
    return documents;
  },
};
```

### Configuration

#### Jest Configuration

```javascript
// jest.config.js

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/?(*.)+(spec|test).ts'
  ],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: 'tsconfig.test.json',
    }],
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts',
    '!src/__tests__/**',
    '!src/server.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@modules/(.*)$': '<rootDir>/src/modules/$1',
    '^@models/(.*)$': '<rootDir>/src/models/$1',
    '^@middleware/(.*)$': '<rootDir>/src/middleware/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@config/(.*)$': '<rootDir>/src/config/$1',
  },
  verbose: true,
  testTimeout: 10000,
};
```

#### Test Scripts

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:unit": "jest --testPathPattern=unit",
    "test:integration": "jest --testPathPattern=integration",
    "test:ci": "jest --ci --coverage --reporters=default --reporters=jest-junit"
  }
}
```

---

## Frontend Tests

### Architecture Decision

**Decision**: Each frontend application (public-web, admin-panel, public-website) maintains its own test suite following the same patterns. Shared test utilities are extracted to a common package if duplication exceeds threshold.

**Rationale**:
- Applications have different purposes and user flows
- Independent test execution prevents cross-contamination
- Enables parallel CI/CD pipelines
- Clear ownership and responsibility

### Testing Stack

| Application | Testing Library | E2E Framework | Mocking |
|-------------|----------------|---------------|---------|
| public-web | React Testing Library | Playwright | MSW |
| admin-panel | React Testing Library | Playwright | MSW |
| public-website | React Testing Library | Playwright | MSW |

### Folder Structure (per application)

```
public-web/
├── src/
│   ├── components/
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.test.tsx
│   │   │   └── Button.stories.tsx
│   │   └── ...
│   ├── pages/
│   │   ├── Home/
│   │   │   ├── Home.page.tsx
│   │   │   └── Home.test.tsx
│   │   └── ...
│   ├── hooks/
│   │   ├── useBooking/
│   │   │   ├── useBooking.ts
│   │   │   └── useBooking.test.ts
│   │   └── ...
│   ├── utils/
│   │   ├── __tests__/
│   │   └── ...
│   └── __tests__/
│       ├── setup.ts
│       ├── mocks/
│       └── fixtures/
├── __e2e__/
│   ├── specs/
│   ├── pages/
│   └── fixtures/
├── jest.config.js
└── playwright.config.ts
```

### Unit Tests (Components)

#### Component Test Patterns

```typescript
// public-web/src/components/RoomCard/RoomCard.test.tsx

import { render, screen, fireEvent } from '@testing-library/react';
import { RoomCard } from './RoomCard';
import { Room } from '@/types/room';

const mockRoom: Room = {
  id: 'room_123',
  name: 'Deluxe Ocean View',
  description: 'Beautiful ocean view room',
  price: 150,
  capacity: 2,
  amenities: ['wifi', 'ac', 'minibar'],
  images: ['/images/room1.jpg'],
  isAvailable: true,
};

describe('RoomCard', () => {
  it('should render room information correctly', () => {
    render(<RoomCard room={mockRoom} />);

    expect(screen.getByText('Deluxe Ocean View')).toBeInTheDocument();
    expect(screen.getByText('$150')).toBeInTheDocument();
    expect(screen.getByText(/Beautiful ocean view room/)).toBeInTheDocument();
  });

  it('should display availability status', () => {
    render(<RoomCard room={mockRoom} />);

    expect(screen.getByText('Available')).toBeInTheDocument();
  });

  it('should call onSelect when book button is clicked', () => {
    const mockOnSelect = jest.fn();
    render(<RoomCard room={mockRoom} onSelect={mockOnSelect} />);

    fireEvent.click(screen.getByRole('button', { name: /book now/i }));

    expect(mockOnSelect).toHaveBeenCalledWith(mockRoom.id);
    expect(mockOnSelect).toHaveBeenCalledTimes(1);
  });

  it('should disable book button when room is not available', () => {
    const unavailableRoom = { ...mockRoom, isAvailable: false };
    render(<RoomCard room={unavailableRoom} />);

    const bookButton = screen.getByRole('button', { name: /book now/i });
    expect(bookButton).toBeDisabled();
  });

  it('should display all amenities', () => {
    render(<RoomCard room={mockRoom} />);

    expect(screen.getByText('WiFi')).toBeInTheDocument();
    expect(screen.getByText('Air Conditioning')).toBeInTheDocument();
    expect(screen.getByText('Minibar')).toBeInTheDocument();
  });
});
```

### Hook Tests

```typescript
// public-web/src/hooks/useBooking/__tests__/useBooking.test.ts

import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useBooking } from '../useBooking';
import { bookingAPI } from '@/api/booking';
import { server } from '@/__tests__/mocks/server';
import { http, HttpResponse } from 'msw';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useBooking', () => {
  it('should fetch booking successfully', async () => {
    const { result } = renderHook(
      () => useBooking('booking_123'),
      { wrapper: createWrapper() }
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.id).toBe('booking_123');
  });

  it('should handle booking creation', async () => {
    const { result } = renderHook(
      () => useBooking(),
      { wrapper: createWrapper() }
    );

    const bookingData = {
      roomId: 'room_123',
      checkIn: '2024-02-01',
      checkOut: '2024-02-05',
      guests: 2,
    };

    await act(async () => {
      await result.current.createBooking.mutateAsync(bookingData);
    });

    expect(result.current.createBooking.isSuccess).toBe(true);
  });

  it('should handle error state', async () => {
    server.use(
      http.get('/api/bookings/:id', () => {
        return HttpResponse.json({ error: 'Not found' }, { status: 404 });
      })
    );

    const { result } = renderHook(
      () => useBooking('invalid_id'),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});
```

### Page Tests

```typescript
// public-web/src/pages/Booking/__tests__/Booking.page.test.tsx

import { render, screen, waitFor } from '@testing-library/react';
import { BookingPage } from '../Booking.page';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { server } from '@/__tests__/mocks/server';
import { http, HttpResponse, delay } from 'msw';

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{component}</BrowserRouter>
    </QueryClientProvider>
  );
};

describe('BookingPage', () => {
  it('should display loading state initially', () => {
    server.use(
      http.get('/api/bookings/:id', async () => {
        await delay(1000);
        return HttpResponse.json({ data: {} });
      })
    );

    renderWithProviders(<BookingPage bookingId="123" />);

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('should display booking details after loading', async () => {
    const mockBooking = {
      id: 'booking_123',
      status: 'confirmed',
      room: { name: 'Deluxe Suite' },
      checkIn: '2024-02-01',
      checkOut: '2024-02-05',
      totalPrice: 600,
    };

    server.use(
      http.get('/api/bookings/:id', () => {
        return HttpResponse.json({ data: mockBooking });
      })
    );

    renderWithProviders(<BookingPage bookingId="123" />);

    await waitFor(() => {
      expect(screen.getByText('Deluxe Suite')).toBeInTheDocument();
      expect(screen.getByText('Confirmed')).toBeInTheDocument();
      expect(screen.getByText('$600')).toBeInTheDocument();
    });
  });

  it('should display error state on failure', async () => {
    server.use(
      http.get('/api/bookings/:id', () => {
        return HttpResponse.json({ error: 'Not found' }, { status: 404 });
      })
    );

    renderWithProviders(<BookingPage bookingId="invalid" />);

    await waitFor(() => {
      expect(screen.getByText(/booking not found/i)).toBeInTheDocument();
    });
  });
});
```

### E2E Tests (Playwright)

#### Configuration

```typescript
// public-web/playwright.config.ts

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './__e2e__',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html'], ['junit', { outputFile: 'e2e-results.xml' }]],
  
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    port: 3000,
    timeout: 120000,
    reuseExistingServer: !process.env.CI,
  },
});
```

#### E2E Test Examples

```typescript
// public-web/__e2e__/specs/booking-flow.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Booking Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should complete a full booking flow', async ({ page }) => {
    // Step 1: Search for rooms
    await page.getByLabel('Check-in').fill('2024-02-01');
    await page.getByLabel('Check-out').fill('2024-02-05');
    await page.getByLabel('Guests').selectOption('2');
    await page.getByRole('button', { name: 'Search' }).click();

    // Step 2: Select a room
    await expect(page.locator('[data-testid="room-card"]')).toHaveCount.greaterThan(0);
    await page.locator('[data-testid="room-card"]').first().getByRole('button', { name: 'Book Now' }).click();

    // Step 3: Enter guest details
    await page.getByLabel('First Name').fill('John');
    await page.getByLabel('Last Name').fill('Doe');
    await page.getByLabel('Email').fill('john.doe@example.com');
    await page.getByLabel('Phone').fill('+977-9841234567');

    // Step 4: Review booking
    await page.getByRole('button', { name: 'Continue to Payment' }).click();
    await expect(page.getByText('Booking Summary')).toBeVisible();

    // Step 5: Payment
    await page.getByLabel('Card Number').fill('4111111111111111');
    await page.getByLabel('Expiry').fill('12/25');
    await page.getByLabel('CVV').fill('123');
    await page.getByRole('button', { name: 'Pay Now' }).click();

    // Step 6: Confirmation
    await expect(page.getByText('Booking Confirmed')).toBeVisible({ timeout: 10000 });
    await expect(page.url()).toContain('/booking/confirmation');
    
    // Verify booking reference exists
    const bookingRef = await page.locator('[data-testid="booking-reference"]').textContent();
    expect(bookingRef).toMatch(/^BK-\d+$/);
  });

  test('should handle booking validation errors', async ({ page }) => {
    await page.goto('/rooms');
    
    // Try to book without dates
    await page.locator('[data-testid="room-card"]').first().getByRole('button', { name: 'Book Now' }).click();
    
    // Submit without required fields
    await page.getByRole('button', { name: 'Continue' }).click();
    
    // Verify error messages
    await expect(page.getByText('First name is required')).toBeVisible();
    await expect(page.getByText('Email is required')).toBeVisible();
  });

  test('should persist booking in history', async ({ page }) => {
    // Complete a booking
    await page.goto('/');
    // ... complete booking flow ...
    
    // Navigate to booking history
    await page.getByRole('link', { name: 'My Bookings' }).click();
    
    // Verify booking appears in history
    await expect(page.locator('[data-testid="booking-history-item"]')).toHaveCount.greaterThan(0);
  });
});
```

```typescript
// public-web/__e2e__/specs/authentication.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should register a new user', async ({ page }) => {
    await page.goto('/register');

    await page.getByLabel('First Name').fill('Jane');
    await page.getByLabel('Last Name').fill('Smith');
    await page.getByLabel('Email').fill('jane.smith@test.com');
    await page.getByLabel('Password').fill('SecurePass123!');
    await page.getByLabel('Confirm Password').fill('SecurePass123!');
    await page.getByRole('button', { name: 'Register' }).click();

    await expect(page.url()).toContain('/dashboard');
    await expect(page.getByText('Welcome, Jane')).toBeVisible();
  });

  test('should login with valid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('Email').fill('existing@test.com');
    await page.getByLabel('Password').fill('ValidPassword123!');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.url()).toContain('/dashboard');
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('Email').fill('wrong@test.com');
    await page.getByLabel('Password').fill('WrongPassword');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.getByText('Invalid credentials')).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.getByLabel('Email').fill('user@test.com');
    await page.getByLabel('Password').fill('Password123!');
    await page.getByRole('button', { name: 'Login' }).click();

    // Logout
    await page.getByRole('button', { name: 'Logout' }).click();

    await expect(page.url()).toContain('/login');
  });
});
```

### Visual Regression Tests

```typescript
// public-web/__e2e__/specs/visual-regression.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Visual Regression', () => {
  test('homepage should match snapshot', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveScreenshot('homepage.png', {
      fullPage: true,
      maxDiffPixels: 100,
    });
  });

  test('room listing page should match snapshot', async ({ page }) => {
    await page.goto('/rooms');
    await expect(page).toHaveScreenshot('rooms-listing.png');
  });

  test('booking form should match snapshot', async ({ page }) => {
    await page.goto('/booking/new');
    await expect(page).toHaveScreenshot('booking-form.png');
  });
});
```

### Accessibility Tests

```typescript
// public-web/__e2e__/specs/accessibility.spec.ts

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility', () => {
  test('homepage should not have accessibility violations', async ({ page }) => {
    await page.goto('/');

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('booking form should be accessible', async ({ page }) => {
    await page.goto('/booking/new');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('[data-testid="booking-form"]')
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/');

    // Tab through interactive elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Verify focus is visible
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });
});
```

---

## API Tests

### Architecture Decision

**Decision**: API tests use Supertest for HTTP assertions with a dedicated test database. Tests validate both happy paths and error scenarios, including edge cases and boundary conditions.

**Rationale**:
- Supertest provides fluent API for HTTP testing
- Isolated test database prevents data contamination
- Comprehensive error scenario coverage ensures robustness
- Contract testing prevents breaking changes

### Test Categories

1. **Contract Tests**: Validate API schema and response format
2. **Functional Tests**: Verify endpoint behavior
3. **Integration Tests**: Test with actual database
4. **Negative Tests**: Validate error handling
5. **Boundary Tests**: Test limits and constraints

### API Test Structure

```typescript
// src/modules/auth/__tests__/api/auth.api.test.ts

import request from 'supertest';
import { app } from '@/server';
import { TestDB } from '@/__tests__/utils/database.helpers';
import { UserFactory } from '@/__tests__/utils/factories/user.factory';
import { User } from '@/models/user.model';
import { APIResponse } from '@/utils/types';

describe('Auth API Tests', () => {
  beforeAll(async () => {
    await TestDB.connect();
  });

  afterAll(async () => {
    await TestDB.disconnect();
  });

  beforeEach(async () => {
    await TestDB.clear();
  });

  describe('POST /api/v1/auth/login', () => {
    it('should return 200 and tokens on valid credentials', async () => {
      // Arrange
      const user = await User.create(UserFactory.make({
        passwordHash: await bcrypt.hash('Password123!', 12),
      }));

      // Act
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: user.email,
          password: 'Password123!',
        });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        success: true,
        message: 'Login successful',
        data: {
          accessToken: expect.any(String),
          refreshToken: expect.any(String),
          expiresIn: expect.any(Number),
          user: {
            id: expect.any(String),
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
          },
        },
      });
    });

    it('should return 401 for invalid email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Password123!',
        });

      expect(response.status).toBe(401);
      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: 'AUTH_001',
          message: 'Invalid credentials',
        },
      });
    });

    it('should return 401 for invalid password', async () => {
      const user = await User.create(UserFactory.make());

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: user.email,
          password: 'WrongPassword',
        });

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('AUTH_001');
    });

    it('should return 403 when account is locked', async () => {
      const lockedUser = await User.create(UserFactory.makeLocked());

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: lockedUser.email,
          password: 'Password123!',
        });

      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe('AUTH_003');
    });

    it('should return 400 for invalid email format', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'invalid-email',
          password: 'Password123!',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VAL_001');
    });
  });

  describe('POST /api/v1/auth/register', () => {
    it('should create user and return 201', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'SecurePass123!',
        firstName: 'New',
        lastName: 'User',
        phone: '+977-9841234567',
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user).not.toHaveProperty('password');
    });

    it('should return 409 for duplicate email', async () => {
      const existingUser = await User.create(UserFactory.make());

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: existingUser.email,
          password: 'Password123!',
          firstName: 'Duplicate',
          lastName: 'User',
        });

      expect(response.status).toBe(409);
      expect(response.body.error.code).toBe('RES_002');
    });

    it('should return 400 for weak password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'weakpass@example.com',
          password: '123',
          firstName: 'Weak',
          lastName: 'Password',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.details).toContainEqual(
        expect.objectContaining({ message: expect.stringContaining('password') })
      );
    });
  });

  describe('GET /api/v1/auth/profile', () => {
    let authToken: string;

    beforeEach(async () => {
      const user = await User.create(UserFactory.make());
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: user.email, password: 'Password123!' });
      
      authToken = loginResponse.body.data.accessToken;
    });

    it('should return user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.user).toHaveProperty('email');
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/profile');

      expect(response.status).toBe(401);
    });

    it('should return 401 with expired token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', 'Bearer expired_token_here');

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('AUTH_002');
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    let refreshToken: string;

    beforeEach(async () => {
      const user = await User.create(UserFactory.make());
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: user.email, password: 'Password123!' });
      
      refreshToken = loginResponse.body.data.refreshToken;
    });

    it('should return new access token with valid refresh token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('accessToken');
    });

    it('should return 401 with invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: 'invalid_token' });

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('AUTH_004');
    });
  });

  describe('Rate Limiting', () => {
    it('should return 429 after too many requests', async () => {
      const requests = [];
      for (let i = 0; i < 15; i++) {
        requests.push(
          request(app)
            .post('/api/v1/auth/login')
            .send({ email: 'test@example.com', password: 'wrong' })
        );
      }

      const responses = await Promise.all(requests);
      const rateLimitedResponses = responses.filter(r => r.status === 429);

      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });
});
```

### API Contract Tests

```typescript
// src/__tests__/api/contract/auth.contract.test.ts

import { z } from 'zod';
import { loginResponseSchema, errorResponseSchema } from '@/modules/auth/dtos/auth.dto';

describe('API Contract Tests', () => {
  describe('Login Response Schema', () => {
    it('should validate successful login response', () => {
      const validResponse = {
        success: true,
        message: 'Login successful',
        data: {
          accessToken: 'eyJhbGciOiJIUzI1NiIs...',
          refreshToken: 'dGhpcyBpcyBhIHJlZnJl...',
          expiresIn: 900,
          user: {
            id: 'u_123',
            email: 'user@example.com',
            firstName: 'John',
            lastName: 'Doe',
            role: 'customer',
            permissions: ['booking:create'],
          },
        },
        timestamp: new Date().toISOString(),
      };

      expect(() => loginResponseSchema.parse(validResponse)).not.toThrow();
    });

    it('should reject response missing required fields', () => {
      const invalidResponse = {
        success: true,
        // Missing message
        data: {
          accessToken: 'token',
          // Missing refreshToken
          expiresIn: 900,
          user: {
            id: 'u_123',
            // Missing other required fields
          },
        },
      };

      expect(() => loginResponseSchema.parse(invalidResponse)).toThrow(z.ZodError);
    });
  });

  describe('Error Response Schema', () => {
    it('should validate error response format', () => {
      const validErrorResponse = {
        success: false,
        error: {
          code: 'AUTH_001',
          message: 'Invalid credentials',
          details: [],
        },
        timestamp: new Date().toISOString(),
      };

      expect(() => errorResponseSchema.parse(validErrorResponse)).not.toThrow();
    });

    it('should validate error response with details', () => {
      const errorWithDetails = {
        success: false,
        error: {
          code: 'VAL_001',
          message: 'Validation failed',
          details: [
            { field: 'email', message: 'Invalid email format' },
            { field: 'password', message: 'Password too short' },
          ],
        },
        timestamp: new Date().toISOString(),
      };

      expect(() => errorResponseSchema.parse(errorWithDetails)).not.toThrow();
    });
  });
});
```

### OpenAPI/Swagger Tests

```typescript
// src/__tests__/api/openapi-validation.test.ts

import SwaggerParser from '@apidevtools/swagger-parser';
import { readFileSync } from 'fs';

describe('OpenAPI Specification', () => {
  let openApiSpec: any;

  beforeAll(async () => {
    const specContent = readFileSync('./openapi.yaml', 'utf-8');
    openApiSpec = await SwaggerParser.parse(specContent);
  });

  it('should have valid OpenAPI specification', () => {
    expect(openApiSpec.openapi).toBeDefined();
    expect(openApiSpec.info).toBeDefined();
    expect(openApiSpec.paths).toBeDefined();
  });

  it('should document all authentication endpoints', () => {
    const authPaths = Object.keys(openApiSpec.paths).filter(path => 
      path.includes('/auth/')
    );

    expect(authPaths).toContain('/api/v1/auth/login');
    expect(authPaths).toContain('/api/v1/auth/register');
    expect(authPaths).toContain('/api/v1/auth/refresh');
    expect(authPaths).toContain('/api/v1/auth/profile');
  });

  it('should have response schemas for all endpoints', () => {
    Object.entries(openApiSpec.paths).forEach(([path, methods]: [string, any]) => {
      Object.entries(methods).forEach(([method, operation]: [string, any]) => {
        if (['get', 'post', 'put', 'patch', 'delete'].includes(method)) {
          expect(operation.responses).toBeDefined();
          expect(operation.responses['200'] ?? operation.responses['201'] ?? operation.responses['204'])
            .toBeDefined();
        }
      });
    });
  });
});
```

---

## Security Tests

### Architecture Decision

**Decision**: Security testing is multi-layered, combining automated SAST/DAST tools with manual penetration testing procedures. Security tests run in every CI pipeline and before each deployment.

**Rationale**:
- Early detection of vulnerabilities reduces remediation cost
- Automated tools catch common issues; manual testing finds complex vulnerabilities
- Regular security audits ensure ongoing compliance
- Defense in depth approach minimizes risk

### Security Testing Categories

1. **Static Application Security Testing (SAST)**
2. **Dynamic Application Security Testing (DAST)**
3. **Dependency Scanning**
4. **Secret Detection**
5. **Penetration Testing**
6. **Compliance Validation**

### OWASP Top 10 Test Cases

#### 1. Injection Prevention

```typescript
// src/__tests__/security/injection.test.ts

import request from 'supertest';
import { app } from '@/server';
import { TestDB } from '@/__tests__/utils/database.helpers';

describe('Security: Injection Prevention', () => {
  beforeAll(async () => {
    await TestDB.connect();
  });

  afterAll(async () => {
    await TestDB.disconnect();
  });

  it('should prevent SQL injection in search', async () => {
    const maliciousInput = "'; DROP TABLE users; --";
    
    const response = await request(app)
      .get(`/api/v1/rooms?search=${encodeURIComponent(maliciousInput)}`);

    // Should not crash, should return empty or validated results
    expect(response.status).toBeGreaterThanOrEqual(200);
    expect(response.status).toBeLessThan(500);
  });

  it('should prevent NoSQL injection in queries', async () => {
    const maliciousPayload = {
      email: { $ne: null },
      password: { $gt: '' },
    };

    const response = await request(app)
      .post('/api/v1/auth/login')
      .send(maliciousPayload);

    // Should reject with validation error
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VAL_001');
  });

  it('should sanitize XSS in user input', async () => {
    const xssPayload = '<script>alert("XSS")</script>';
    
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'test@example.com',
        password: 'SecurePass123!',
        firstName: xssPayload,
        lastName: 'Test',
      });

    // Should either reject or sanitize the input
    if (response.status === 201) {
      const savedUser = response.body.data.user;
      expect(savedUser.firstName).not.toContain('<script>');
    }
  });
});
```

#### 2. Authentication & Session Management

```typescript
// src/__tests__/security/authentication.test.ts

describe('Security: Authentication', () => {
  it('should enforce strong password policy', async () => {
    const weakPasswords = [
      '123456',
      'password',
      'qwerty',
      'abc123',
      'Password',
      '12345678',
    ];

    for (const password of weakPasswords) {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: `test${password}@example.com`,
          password,
          firstName: 'Test',
          lastName: 'User',
        });

      expect(response.status).toBe(400);
    }
  });

  it('should lock account after failed attempts', async () => {
    const email = 'locktest@example.com';
    
    // Create user
    await request(app)
      .post('/api/v1/auth/register')
      .send({
        email,
        password: 'SecurePass123!',
        firstName: 'Lock',
        lastName: 'Test',
      });

    // Attempt 5 failed logins
    for (let i = 0; i < 5; i++) {
      await request(app)
        .post('/api/v1/auth/login')
        .send({ email, password: 'WrongPassword' });
    }

    // Next attempt should fail with account locked
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email, password: 'WrongPassword' });

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe('AUTH_003');
  });

  it('should invalidate tokens on logout', async () => {
    // Login
    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'test@example.com', password: 'SecurePass123!' });

    const token = loginResponse.body.data.accessToken;

    // Logout
    await request(app)
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${token}`);

    // Try to use token again
    const response = await request(app)
      .get('/api/v1/auth/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(401);
  });

  it('should use secure cookie settings', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'test@example.com', password: 'SecurePass123!' });

    const cookies = response.headers['set-cookie'];
    
    if (cookies) {
      cookies.forEach(cookie => {
        expect(cookie).toContain('Secure');
        expect(cookie).toContain('HttpOnly');
        expect(cookie).toContain('SameSite=Strict');
      });
    }
  });
});
```

#### 3. Authorization Tests

```typescript
// src/__tests__/security/authorization.test.ts

describe('Security: Authorization', () => {
  let adminToken: string;
  let userToken: string;

  beforeEach(async () => {
    // Create admin user
    const adminResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@hotel.com', password: 'AdminPass123!' });
    adminToken = adminResponse.body.data.accessToken;

    // Create regular user
    const userResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'user@hotel.com', password: 'UserPass123!' });
    userToken = userResponse.body.data.accessToken;
  });

  it('should prevent horizontal privilege escalation', async () => {
    // User tries to access another user's profile
    const response = await request(app)
      .get('/api/v1/users/other_user_id')
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe('PERM_001');
  });

  it('should prevent vertical privilege escalation', async () => {
    // Regular user tries to access admin endpoint
    const response = await request(app)
      .get('/api/v1/admin/users')
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.status).toBe(403);
  });

  it('should allow admin to access protected resources', async () => {
    const response = await request(app)
      .get('/api/v1/admin/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
  });
});
```

#### 4. Input Validation

```typescript
// src/__tests__/security/input-validation.test.ts

describe('Security: Input Validation', () => {
  it('should reject oversized payloads', async () => {
    const largePayload = {
      email: 'test@example.com',
      password: 'SecurePass123!',
      firstName: 'A'.repeat(10000), // Exceeds max length
    };

    const response = await request(app)
      .post('/api/v1/auth/register')
      .send(largePayload);

    expect(response.status).toBe(400);
  });

  it('should reject malformed JSON', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .set('Content-Type', 'application/json')
      .send('{"email": "test@example.com", invalid}');

    expect(response.status).toBe(400);
  });

  it('should validate date formats', async () => {
    const response = await request(app)
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        roomId: 'room_123',
        checkIn: 'invalid-date',
        checkOut: '2024-02-05',
      });

    expect(response.status).toBe(400);
    expect(response.body.error.details).toContainEqual(
      expect.objectContaining({ field: 'checkIn' })
    );
  });

  it('should validate numeric ranges', async () => {
    const response = await request(app)
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        roomId: 'room_123',
        checkIn: '2024-02-01',
        checkOut: '2024-02-05',
        guests: 100, // Exceeds max capacity
      });

    expect(response.status).toBe(400);
  });
});
```

#### 5. Security Headers

```typescript
// src/__tests__/security/security-headers.test.ts

describe('Security: HTTP Headers', () => {
  it('should include security headers in all responses', async () => {
    const response = await request(app).get('/health');

    expect(response.headers).toMatchObject({
      'x-content-type-options': 'nosniff',
      'x-frame-options': 'DENY',
      'x-xss-protection': '1; mode=block',
      'strict-transport-security': expect.stringContaining('max-age='),
      'content-security-policy': expect.any(String),
    });
  });

  it('should not expose server information', async () => {
    const response = await request(app).get('/health');

    expect(response.headers).not.toHaveProperty('x-powered-by');
    expect(response.headers.server).toBeUndefined();
  });
});
```

### Dependency Scanning

```bash
# scripts/security-scan.sh

#!/bin/bash

echo "Running security scans..."

# npm audit for known vulnerabilities
npm audit --audit-level=high

# Snyk for comprehensive dependency scanning
npx snyk test

# Check for outdated packages
npm outdated

echo "Security scan complete"
```

### Secret Detection

```typescript
// src/__tests__/security/secrets-detection.test.ts

import { execSync } from 'child_process';

describe('Security: Secret Detection', () => {
  it('should not contain hardcoded secrets in codebase', () => {
    try {
      // Search for potential secrets patterns
      const patterns = [
        'password\\s*=\\s*["\'][^"\']+["\']',
        'secret\\s*=\\s*["\'][^"\']+["\']',
        'api_key\\s*=\\s*["\'][^"\']+["\']',
        'AWS_SECRET',
        'PRIVATE_KEY',
      ];

      patterns.forEach(pattern => {
        const result = execSync(`grep -r "${pattern}" src/ --exclude-dir=node_modules || true`, {
          encoding: 'utf-8',
        });

        // Should not find hardcoded secrets (excluding test files and examples)
        const lines = result.split('\n').filter(line => 
          line && 
          !line.includes('.test.ts') && 
          !line.includes('__tests__') &&
          !line.includes('.example.')
        );

        expect(lines.length).toBe(0);
      });
    } catch (error) {
      // grep returns non-zero exit code when no matches found, which is good
    }
  });
});
```

### Penetration Testing Checklist

```markdown
## Manual Penetration Testing Checklist

### Authentication
- [ ] Test for credential stuffing vulnerabilities
- [ ] Verify password reset token expiration
- [ ] Test for session fixation
- [ ] Check for brute force protection bypass
- [ ] Verify logout invalidates all sessions

### Authorization
- [ ] Test for IDOR (Insecure Direct Object Reference)
- [ ] Verify role-based access control
- [ ] Test for privilege escalation
- [ ] Check function-level access control

### Input Validation
- [ ] SQL injection testing
- [ ] NoSQL injection testing
- [ ] XSS (Cross-Site Scripting) testing
- [ ] CSRF (Cross-Site Request Forgery) testing
- [ ] Command injection testing
- [ ] Path traversal testing

### Session Management
- [ ] Token entropy analysis
- [ ] Session timeout verification
- [ ] Concurrent session handling
- [ ] Token revocation testing

### API Security
- [ ] Rate limiting bypass attempts
- [ ] Mass assignment vulnerabilities
- [ ] Improper asset management
- [ ] Server-side request forgery (SSRF)

### Business Logic
- [ ] Price manipulation
- [ ] Booking race conditions
- [ ] Coupon/offer abuse
- [ ] Inventory manipulation
```

---

## Performance Tests

### Architecture Decision

**Decision**: Performance testing uses k6 for load testing and Artillery for scenario-based testing. Tests simulate realistic user behavior patterns and measure key performance indicators (KPIs).

**Rationale**:
- k6 provides developer-friendly scripting with JavaScript
- Artillery excels at complex user journey simulation
- Both tools integrate well with CI/CD pipelines
- Results can be exported to various visualization tools

### Performance Test Types

1. **Load Testing**: Normal and peak expected load
2. **Stress Testing**: Beyond normal capacity
3. **Endurance Testing**: Extended period under load
4. **Spike Testing**: Sudden traffic increases
5. **Scalability Testing**: Horizontal/vertical scaling

### Performance KPIs

| Metric | Target | Warning | Critical |
|--------|--------|---------|----------|
| Response Time (p95) | < 500ms | 500-1000ms | > 1000ms |
| Response Time (p99) | < 1000ms | 1000-2000ms | > 2000ms |
| Error Rate | < 0.1% | 0.1-1% | > 1% |
| Throughput | > 1000 req/s | 500-1000 req/s | < 500 req/s |
| CPU Usage | < 70% | 70-85% | > 85% |
| Memory Usage | < 80% | 80-90% | > 90% |

### k6 Load Test Scripts

```typescript
// performance/tests/load/auth.load.test.ts

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const loginSuccessRate = new Rate('login_success');
const loginDuration = new Trend('login_duration');

export const options = {
  stages: [
    { duration: '2m', target: 100 },   // Ramp up to 100 users
    { duration: '5m', target: 100 },   // Stay at 100 users
    { duration: '2m', target: 200 },   // Ramp up to 200 users
    { duration: '5m', target: 200 },   // Stay at 200 users
    { duration: '2m', target: 500 },   // Ramp up to 500 users
    { duration: '5m', target: 500 },   // Peak load
    { duration: '3m', target: 0 },     // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'], // 95% of requests < 500ms
    login_success: ['rate>0.99'], // 99% success rate
    login_duration: ['p(95)<300'],
    http_req_failed: ['rate<0.01'], // Less than 1% failures
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000';

export default function () {
  // Simulate login
  const payload = {
    email: `user${__VU}@test.com`,
    password: 'SecurePass123!',
  };

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const startTime = Date.now();
  const response = http.post(`${BASE_URL}/api/v1/auth/login`, JSON.stringify(payload), params);
  const duration = Date.now() - startTime;

  loginSuccessRate.add(response.status === 200);
  loginDuration.add(duration);

  check(response, {
    'status is 200': (r) => r.status === 200,
    'has access token': (r) => {
      const body = r.json();
      return body.data && body.data.accessToken;
    },
    'response time OK': () => duration < 500,
  });

  sleep(1);
}
```

```typescript
// performance/tests/load/booking.load.test.ts

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

const bookingSuccessRate = new Rate('booking_success');
const bookingDuration = new Trend('booking_duration');
const bookingsCreated = new Counter('bookings_created');

export const options = {
  stages: [
    { duration: '3m', target: 50 },
    { duration: '5m', target: 50 },
    { duration: '3m', target: 100 },
    { duration: '5m', target: 100 },
    { duration: '2m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<800', 'p(99)<1500'],
    booking_success: ['rate>0.98'],
    http_req_failed: ['rate<0.02'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000';

// Get auth token first
function login() {
  const response = http.post(`${BASE_URL}/api/v1/auth/login`, JSON.stringify({
    email: 'loadtest@hotel.com',
    password: 'LoadTest123!',
  }), {
    headers: { 'Content-Type': 'application/json' },
  });

  return response.json().data.accessToken;
}

export default function () {
  const token = login();
  
  const bookingPayload = {
    roomId: `room_${Math.floor(Math.random() * 10) + 1}`,
    checkIn: '2024-03-01',
    checkOut: '2024-03-05',
    guests: 2,
    specialRequests: 'Late check-in',
  };

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  };

  const startTime = Date.now();
  const response = http.post(`${BASE_URL}/api/v1/bookings`, JSON.stringify(bookingPayload), params);
  const duration = Date.now() - startTime;

  bookingSuccessRate.add(response.status === 201);
  bookingDuration.add(duration);

  if (response.status === 201) {
    bookingsCreated.add(1);
  }

  check(response, {
    'booking created': (r) => r.status === 201,
    'has booking ID': (r) => {
      const body = r.json();
      return body.data && body.data.id;
    },
    'response time acceptable': () => duration < 1000,
  });

  sleep(2);
}
```

### Stress Test

```typescript
// performance/tests/stress/breakpoint.stress.test.ts

import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 },
    { duration: '5m', target: 100 },
    { duration: '2m', target: 300 },
    { duration: '5m', target: 300 },
    { duration: '2m', target: 500 },
    { duration: '5m', target: 500 },
    { duration: '2m', target: 1000 },
    { duration: '5m', target: 1000 },
    { duration: '2m', target: 2000 },
    { duration: '5m', target: 2000 },
    { duration: '5m', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.05'], // Allow up to 5% errors under extreme load
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000';

export default function () {
  const response = http.get(`${BASE_URL}/health`);
  
  check(response, {
    'health check passed': (r) => r.status === 200,
  });

  sleep(0.5);
}
```

### Endurance Test

```typescript
// performance/tests/endurance/stability.endurance.test.ts

import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '10m', target: 100 },
    { duration: '1h', target: 100 },   // Sustained load for 1 hour
    { duration: '10m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000';

export default function () {
  // Mix of different operations
  const operations = [
    () => http.get(`${BASE_URL}/health`),
    () => http.get(`${BASE_URL}/api/v1/rooms`),
    () => http.get(`${BASE_URL}/api/v1/amenities`),
  ];

  const operation = operations[Math.floor(Math.random() * operations.length)];
  const response = operation();

  check(response, {
    'status is 200': (r) => r.status === 200,
  });

  sleep(1);
}
```

### Spike Test

```typescript
// performance/tests/spike/traffic.spike.test.ts

import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '5m', target: 50 },    // Normal load
    { duration: '1m', target: 500 },   // Sudden spike (10x)
    { duration: '5m', target: 500 },   // Sustained spike
    { duration: '1m', target: 50 },    // Return to normal
    { duration: '5m', target: 50 },    // Recovery observation
  ],
  thresholds: {
    http_req_failed: ['rate<0.10'], // Allow higher error rate during spike
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000';

export default function () {
  const response = http.get(`${BASE_URL}/api/v1/rooms/available`);
  
  check(response, {
    'request succeeded': (r) => r.status === 200,
  });

  sleep(0.5);
}
```

### Artillery Scenario Test

```yaml
# performance/tests/scenarios/booking-journey.yml

config:
  target: "http://localhost:5000"
  phases:
    - duration: 60
      arrivalRate: 10
    - duration: 120
      arrivalRate: 50
    - duration: 60
      arrivalRate: 100
  defaults:
    headers:
      Content-Type: "application/json"
  variables:
    email: "test{{ $randomNumber(1, 10000) }}@hotel.com"
    password: "TestPass123!"

scenarios:
  - name: "Complete Booking Journey"
    flow:
      # Register
      - post:
          url: "/api/v1/auth/register"
          json:
            email: "{{ email }}"
            password: "{{ password }}"
            firstName: "Test"
            lastName: "User"
          capture:
            - json: "$.data.accessToken"
              as: "accessToken"
        
      # Search rooms
      - get:
          url: "/api/v1/rooms/available"
          headers:
            Authorization: "Bearer {{ accessToken }}"
          qs:
            checkIn: "2024-03-01"
            checkOut: "2024-03-05"
            guests: 2
          capture:
            - json: "$.data[0].id"
              as: "roomId"
      
      # Create booking
      - post:
          url: "/api/v1/bookings"
          headers:
            Authorization: "Bearer {{ accessToken }}"
          json:
            roomId: "{{ roomId }}"
            checkIn: "2024-03-01"
            checkOut: "2024-03-05"
            guests: 2
          capture:
            - json: "$.data.id"
              as: "bookingId"
      
      # Get booking details
      - get:
          url: "/api/v1/bookings/{{ bookingId }}"
          headers:
            Authorization: "Bearer {{ accessToken }}"
      
      # Get user profile
      - get:
          url: "/api/v1/auth/profile"
          headers:
            Authorization: "Bearer {{ accessToken }}"
```

### Performance Monitoring Integration

```typescript
// src/utils/performance-monitoring.ts

import { EventEmitter } from 'events';

interface PerformanceMetrics {
  endpoint: string;
  method: string;
  duration: number;
  statusCode: number;
  timestamp: Date;
  memoryUsage: NodeJS.MemoryUsage;
  cpuUsage: NodeJS.CpuUsage;
}

class PerformanceMonitor extends EventEmitter {
  private metrics: PerformanceMetrics[] = [];
  private readonly MAX_METRICS = 10000;

  record(metrics: PerformanceMetrics): void {
    this.metrics.push(metrics);
    
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics.shift();
    }

    this.emit('metric', metrics);

    // Alert on slow responses
    if (metrics.duration > 1000) {
      this.emit('slow-response', metrics);
    }
  }

  getStatistics(): {
    avgDuration: number;
    p95Duration: number;
    p99Duration: number;
    errorRate: number;
    throughput: number;
  } {
    if (this.metrics.length === 0) {
      return {
        avgDuration: 0,
        p95Duration: 0,
        p99Duration: 0,
        errorRate: 0,
        throughput: 0,
      };
    }

    const durations = this.metrics.map(m => m.duration).sort((a, b) => a - b);
    const errors = this.metrics.filter(m => m.statusCode >= 400).length;

    return {
      avgDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
      p95Duration: durations[Math.floor(durations.length * 0.95)],
      p99Duration: durations[Math.floor(durations.length * 0.99)],
      errorRate: errors / this.metrics.length,
      throughput: this.metrics.length / 3600, // per hour
    };
  }
}

export const performanceMonitor = new PerformanceMonitor();
```

---

## Bug Checklist

### Critical Bugs (P0 - Must Fix Before Release)

#### Authentication & Authorization
- [ ] Users can bypass authentication
- [ ] JWT tokens not properly validated
- [ ] Role-based access control can be circumvented
- [ ] Session fixation vulnerability
- [ ] Password reset tokens don't expire
- [ ] Account locking mechanism fails

#### Data Integrity
- [ ] Database transactions not atomic
- [ ] Data corruption during concurrent updates
- [ ] Soft delete not working correctly
- [ ] Audit logs missing critical events
- [ ] Data inconsistency between services

#### Payment & Booking
- [ ] Double booking of same room
- [ ] Payment processing failures not handled
- [ ] Price calculation errors
- [ ] Booking confirmation not sent
- [ ] Refund processing incorrect

#### Security
- [ ] SQL/NoSQL injection possible
- [ ] XSS vulnerability in user inputs
- [ ] CSRF protection missing
- [ ] Sensitive data exposed in logs
- [ ] API keys/secrets in code

### High Priority Bugs (P1 - Fix Within 24 Hours)

#### Functionality
- [ ] Core feature not working as specified
- [ ] API endpoint returns incorrect data
- [ ] Search functionality returns wrong results
- [ ] Filter/sort not working correctly
- [ ] Pagination broken

#### Performance
- [ ] Response time > 2 seconds for critical paths
- [ ] Memory leak detected
- [ ] Database queries not optimized
- [ ] N+1 query problem
- [ ] Connection pool exhaustion

#### User Experience
- [ ] Form validation not working
- [ ] Error messages unclear or missing
- [ ] Loading states not displayed
- [ ] Mobile responsiveness broken
- [ ] Accessibility issues (WCAG violations)

### Medium Priority Bugs (P2 - Fix Within Sprint)

#### Minor Functionality Issues
- [ ] Non-critical feature partially broken
- [ ] Edge case not handled gracefully
- [ ] Incorrect default values
- [ ] Date/time timezone issues
- [ ] File upload size limits incorrect

#### UI/UX
- [ ] Minor visual inconsistencies
- [ ] Tooltip text incorrect
- [ ] Icon misalignment
- [ ] Color contrast issues
- [ ] Animation glitches

#### Documentation
- [ ] API documentation outdated
- [ ] Code comments misleading
- [ ] README missing setup steps
- [ ] Changelog not updated

### Low Priority Bugs (P3 - Fix When Possible)

#### Cosmetic
- [ ] Typos in user-facing text
- [ ] Minor spacing issues
- [ ] Inconsistent font sizes
- [ ] Image quality issues

#### Enhancement Requests
- [ ] Feature could be more intuitive
- [ ] Performance could be improved
- [ ] Code could be cleaner
- [ ] Additional validation desired

### Bug Report Template

```markdown
## Bug Report

### Title
[Brief descriptive title]

### Severity
[P0/P1/P2/P3]

### Description
[Clear description of the bug]

### Steps to Reproduce
1. [First step]
2. [Second step]
3. [And so on...]

### Expected Behavior
[What should happen]

### Actual Behavior
[What actually happens]

### Environment
- OS: [e.g., macOS 14.0]
- Browser: [e.g., Chrome 120.0]
- Node Version: [e.g., 18.19.0]
- App Version: [e.g., 1.0.0]

### Screenshots/Logs
[Attach relevant screenshots or log excerpts]

### Additional Context
[Any other relevant information]

### Proposed Solution
[If known, suggest a fix]
```

---

## Deployment Checklist

### Pre-Deployment

#### Code Quality
- [ ] All tests passing (unit, integration, E2E)
- [ ] Code coverage meets minimum thresholds
- [ ] No ESLint errors or warnings
- [ ] TypeScript compilation successful with strict mode
- [ ] No console.log statements in production code
- [ ] Code reviewed and approved
- [ ] Security scan passed (no high/critical vulnerabilities)
- [ ] Dependency audit passed

#### Database
- [ ] Migration scripts tested on staging
- [ ] Database backup completed
- [ ] Rollback plan documented
- [ ] Index optimization verified
- [ ] Connection pool settings configured

#### Configuration
- [ ] Environment variables set for production
- [ ] Secrets stored in secure vault (not in code)
- [ ] Feature flags configured
- [ ] Rate limiting settings appropriate for production
- [ ] CORS origins whitelisted
- [ ] Logging level set appropriately

#### Infrastructure
- [ ] Server resources scaled appropriately
- [ ] Load balancer configured
- [ ] SSL certificates valid and auto-renewal enabled
- [ ] CDN configured for static assets
- [ ] Database connection strings updated
- [ ] Cache servers (Redis) configured

### Deployment Process

#### Staging Deployment
- [ ] Deploy to staging environment
- [ ] Run smoke tests
- [ ] Verify all integrations working
- [ ] Performance baseline established
- [ ] Stakeholder approval obtained

#### Production Deployment
- [ ] Maintenance mode enabled (if needed)
- [ ] Final backup completed
- [ ] Deploy during low-traffic window
- [ ] Monitor deployment progress
- [ ] Health checks passing
- [ ] Disable maintenance mode

### Post-Deployment

#### Verification
- [ ] Smoke tests passed in production
- [ ] All critical user journeys working
- [ ] Monitoring dashboards showing healthy metrics
- [ ] Error tracking shows no new critical errors
- [ ] Log aggregation working correctly
- [ ] API endpoints responding correctly

#### Monitoring
- [ ] Application Performance Monitoring (APM) active
- [ ] Error alerts configured and tested
- [ ] Uptime monitoring active
- [ ] Resource utilization within normal range
- [ ] Database performance metrics normal
- [ ] Cache hit rates acceptable

#### Communication
- [ ] Release notes published
- [ ] Stakeholders notified
- [ ] Support team briefed on changes
- [ ] Documentation updated
- [ ] Changelog updated

### Rollback Plan

#### Triggers for Rollback
- [ ] Critical bug affecting core functionality
- [ ] Performance degradation > 50%
- [ ] Error rate > 5%
- [ ] Security vulnerability discovered
- [ ] Data corruption detected

#### Rollback Steps
1. [ ] Enable maintenance mode
2. [ ] Restore previous database backup (if needed)
3. [ ] Deploy previous stable version
4. [ ] Verify rollback successful
5. [ ] Disable maintenance mode
6. [ ] Notify stakeholders
7. [ ] Document incident

### Deployment Automation Script

```bash
#!/bin/bash
# scripts/deploy.sh

set -e

echo "Starting deployment process..."

# Pre-deployment checks
echo "Running pre-deployment checks..."
npm run lint
npm run test:ci
npm run build
npm audit --audit-level=high

# Backup database
echo "Creating database backup..."
mongodump --uri="$MONGODB_URI" --out="./backups/$(date +%Y%m%d_%H%M%S)"

# Deploy to staging
echo "Deploying to staging..."
# Add staging deployment commands

# Run staging tests
echo "Running staging tests..."
npm run test:e2e -- --baseUrl=$STAGING_URL

# Wait for approval
read -p "Proceed to production deployment? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled"
    exit 1
fi

# Deploy to production
echo "Deploying to production..."
# Add production deployment commands

# Post-deployment verification
echo "Running post-deployment verification..."
curl -f $PRODUCTION_URL/health || exit 1

echo "Deployment completed successfully!"
```

### CI/CD Pipeline Configuration

```yaml
# .github/workflows/deploy.yml

name: Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      mongodb:
        image: mongo:6.0
        ports:
          - 27017:27017
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Lint
        run: npm run lint
      
      - name: Type check
        run: npx tsc --noEmit
      
      - name: Run tests
        run: npm run test:ci
        env:
          MONGODB_URI: mongodb://localhost:27017/test
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
  
  security:
    runs-on: ubuntu-latest
    needs: test
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Run security scan
        run: npm audit --audit-level=high
      
      - name: Run Snyk
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
  
  deploy-staging:
    runs-on: ubuntu-latest
    needs: [test, security]
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to staging
        run: ./scripts/deploy-staging.sh
        env:
          STAGING_HOST: ${{ secrets.STAGING_HOST }}
          SSH_KEY: ${{ secrets.SSH_KEY }}
  
  deploy-production:
    runs-on: ubuntu-latest
    needs: deploy-staging
    if: github.ref == 'refs/heads/main'
    
    environment: production
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to production
        run: ./scripts/deploy-production.sh
        env:
          PRODUCTION_HOST: ${{ secrets.PRODUCTION_HOST }}
          SSH_KEY: ${{ secrets.SSH_KEY }}
```

---

## Test Environment Setup

### Local Development Environment

```bash
# .env.example

# Server
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/hotel-management-dev
MONGODB_TEST_URI=mongodb://localhost:27017/hotel-management-test

# Authentication
JWT_SECRET=your-development-secret-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=debug
LOG_FILE_PATH=./logs/app.log

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:3002

# External Services (Development/Test Keys)
EMAIL_SERVICE_API_KEY=test-key
PAYMENT_GATEWAY_API_KEY=test-key
SMS_SERVICE_API_KEY=test-key
```

### Test Database Setup

```typescript
// src/__tests__/setup.ts

import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { config } from '@/config/env';

let mongod: MongoMemoryServer;

export const mongooseConnect = async (): Promise<void> => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  
  await mongoose.connect(uri, {
    maxPoolSize: 10,
  });
};

export const mongooseDisconnect = async (): Promise<void> => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
  await mongod.stop();
};

export const mongooseClear = async (): Promise<void> => {
  const collections = mongoose.connection.collections;
  
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
};
```

### Docker Test Environment

```dockerfile
# Dockerfile.test

FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

EXPOSE 5000

CMD ["npm", "run", "test:ci"]
```

```yaml
# docker-compose.test.yml

version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.test
    environment:
      - NODE_ENV=test
      - MONGODB_URI=mongodb://mongo:27017/hotel-management-test
      - JWT_SECRET=test-secret-key
    depends_on:
      - mongo
    volumes:
      - ./coverage:/app/coverage

  mongo:
    image: mongo:6.0
    ports:
      - "27018:27017"
    volumes:
      - mongo_test_data:/data/db

volumes:
  mongo_test_data:
```

---

## Tools & Technologies

### Testing Tools

| Category | Tool | Purpose |
|----------|------|---------|
| Unit Testing | Jest | Backend unit tests |
| Component Testing | React Testing Library | Frontend component tests |
| E2E Testing | Playwright | Cross-browser E2E tests |
| API Testing | Supertest | HTTP API testing |
| Load Testing | k6 | Performance/load testing |
| Scenario Testing | Artillery | User journey testing |
| Security Scanning | Snyk | Dependency vulnerability scanning |
| Security Scanning | OWASP ZAP | Dynamic security testing |
| Code Quality | ESLint | Code linting |
| Type Checking | TypeScript | Static type checking |
| Coverage | Istanbul/nyc | Code coverage reporting |
| Mocking | MSW (Mock Service Worker) | API mocking |
| Test Data | @faker-js/faker | Test data generation |
| Visual Testing | Playwright Screenshots | Visual regression testing |
| Accessibility | axe-core | Accessibility testing |

### Monitoring & Observability

| Tool | Purpose |
|------|---------|
| Winston | Application logging |
| Morgan | HTTP request logging |
| Prometheus | Metrics collection |
| Grafana | Metrics visualization |
| Jaeger | Distributed tracing |
| Sentry | Error tracking |
| New Relic | APM |

### CI/CD Tools

| Tool | Purpose |
|------|---------|
| GitHub Actions | CI/CD pipeline |
| Docker | Containerization |
| Kubernetes | Orchestration |
| Helm | Package management |

---

## Appendix

### Glossary

- **SAST**: Static Application Security Testing
- **DAST**: Dynamic Application Security Testing
- **E2E**: End-to-End
- **KPI**: Key Performance Indicator
- **SLA**: Service Level Agreement
- **CI/CD**: Continuous Integration/Continuous Deployment
- **APM**: Application Performance Monitoring
- **IDOR**: Insecure Direct Object Reference
- **XSS**: Cross-Site Scripting
- **CSRF**: Cross-Site Request Forgery
- **OWASP**: Open Web Application Security Project

### References

- [Jest Documentation](https://jestjs.io/)
- [Playwright Documentation](https://playwright.dev/)
- [k6 Documentation](https://k6.io/docs/)
- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [Testing Library](https://testing-library.com/)
- [TypeScript Testing](https://www.typescriptlang.org/docs/handbook/testing.html)

---

*Document Version: 1.0*
*Last Updated: $(date)*
*Author: Development Team*
