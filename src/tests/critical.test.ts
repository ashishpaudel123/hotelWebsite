import mongoose from 'mongoose';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import app from '../server';
import { User, Role, Permission, RoomType, Room, Booking } from '../models';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';

describe('Critical Security & Booking Tests', () => {
  let adminToken: string;
  let staffToken: string;
  let customerToken: string;
  let adminUser: any;
  let staffUser: any;
  let customerUser: any;
  let roomType: any;
  let room: any;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hotel-management-test');
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Promise.all([
      User.deleteMany({}),
      Role.deleteMany({}),
      Permission.deleteMany({}),
      RoomType.deleteMany({}),
      Room.deleteMany({}),
      Booking.deleteMany({}),
    ]);

    const perm = await Permission.create({ name: 'Manage Bookings', resource: 'bookings', action: 'manage', status: 'active', isSystem: true });
    const adminRole = await Role.create({
      name: 'Admin', slug: 'admin', description: 'Admin', permissions: [perm._id], accessLevel: 100,
      canApproveBookings: true, canManagePayments: true, canManageUsers: true, canManageCMS: true, canManageSettings: true, status: 'active', isSystem: true,
    });
    const staffRole = await Role.create({
      name: 'Staff', slug: 'staff', description: 'Staff', permissions: [perm._id], accessLevel: 50,
      canApproveBookings: true, canManagePayments: false, canManageUsers: false, canManageCMS: false, canManageSettings: false, status: 'active', isSystem: true,
    });
    const customerRole = await Role.create({
      name: 'Customer', slug: 'customer', description: 'Customer', permissions: [], accessLevel: 10,
      canApproveBookings: false, canManagePayments: false, canManageUsers: false, canManageCMS: false, canManageSettings: false, status: 'active', isSystem: true,
    });

    const hashedPassword = await bcrypt.hash('password123', 12);

    adminUser = await User.create({ firstName: 'Admin', lastName: 'Admin', email: 'admin@test.com', password: hashedPassword, role: adminRole._id, status: 'active' });
    staffUser = await User.create({ firstName: 'Staff', lastName: 'Staff', email: 'staff@test.com', password: hashedPassword, role: staffRole._id, status: 'active' });
    customerUser = await User.create({ firstName: 'Customer', lastName: 'Customer', email: 'customer@test.com', password: hashedPassword, role: customerRole._id, status: 'active' });

    adminToken = jwt.sign({ sub: adminUser._id.toString(), email: adminUser.email, role: 'admin', permissions: ['booking:manage'] }, JWT_SECRET, { expiresIn: '15m' });
    staffToken = jwt.sign({ sub: staffUser._id.toString(), email: staffUser.email, role: 'staff', permissions: ['booking:read'] }, JWT_SECRET, { expiresIn: '15m' });
    customerToken = jwt.sign({ sub: customerUser._id.toString(), email: customerUser.email, role: 'customer', permissions: [] }, JWT_SECRET, { expiresIn: '15m' });

    roomType = await RoomType.create({ name: 'Deluxe', slug: 'deluxe', description: 'Nice room', maxOccupancy: 2, basePrice: 100, currency: 'USD', status: 'active' });
    room = await Room.create({ roomNumber: '101', roomType: roomType._id, floor: 1, status: 'available', images: [] });
  });

  afterEach(async () => {
    await Promise.all([User.deleteMany({}), Role.deleteMany({}), Permission.deleteMany({}), RoomType.deleteMany({}), Room.deleteMany({}), Booking.deleteMany({})]);
  });

  describe('1. Authentication & Authorization', () => {
    test('GET /api/v1/bookings without token returns 401', async () => {
      const res = await request(app).get('/api/v1/bookings');
      expect(res.status).toBe(401);
    });

    test('GET /api/v1/bookings with admin token returns 200', async () => {
      const res = await request(app).get('/api/v1/bookings').set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
    });

    test('GET /api/v1/bookings with staff token returns 200', async () => {
      const res = await request(app).get('/api/v1/bookings').set('Authorization', `Bearer ${staffToken}`);
      expect(res.status).toBe(200);
    });

    test('GET /api/v1/bookings with customer token returns 403', async () => {
      const res = await request(app).get('/api/v1/bookings').set('Authorization', `Bearer ${customerToken}`);
      expect(res.status).toBe(403);
    });

    test('GET /api/v1/coupons without token returns 401', async () => {
      const res = await request(app).get('/api/v1/coupons');
      expect(res.status).toBe(401);
    });

    test('GET /api/v1/coupons with admin token returns 200', async () => {
      const res = await request(app).get('/api/v1/coupons').set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
    });

    test('GET /api/v1/coupons with customer token returns 403', async () => {
      const res = await request(app).get('/api/v1/coupons').set('Authorization', `Bearer ${customerToken}`);
      expect(res.status).toBe(403);
    });

    test('GET /api/v1/dashboard/stats without token returns 401', async () => {
      const res = await request(app).get('/api/v1/dashboard/stats');
      expect(res.status).toBe(401);
    });

    test('GET /api/v1/dashboard/stats with admin token returns 200', async () => {
      const res = await request(app).get('/api/v1/dashboard/stats').set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
    });

    test('POST /api/v1/users without token returns 401', async () => {
      const res = await request(app).post('/api/v1/users').send({ firstName: 'Test', lastName: 'User', email: 'test@test.com', password: 'password123' });
      expect(res.status).toBe(401);
    });

    test('DELETE /api/v1/users/:id with customer token returns 403', async () => {
      const res = await request(app).delete(`/api/v1/users/${adminUser._id}`).set('Authorization', `Bearer ${customerToken}`);
      expect(res.status).toBe(403);
    });
  });

  describe('2. Double Booking Prevention', () => {
    const futureDate = (days: number) => {
      const d = new Date();
      d.setDate(d.getDate() + days);
      return d.toISOString().split('T')[0];
    };

    const bookingPayload = (checkIn: string, checkOut: string, roomId: string) => ({
      customerId: customerUser._id.toString(),
      guestDetails: { firstName: 'John', lastName: 'Doe', email: 'customer@test.com', phone: '+1234567890' },
      checkIn,
      checkOut,
      rooms: [{ roomId, roomType: roomType.name, quantity: 1, adults: 1, children: 0 }],
      source: 'website',
    });

    test('Same room + same dates → rejected', async () => {
      const checkIn = futureDate(5);
      const checkOut = futureDate(7);
      await request(app).post('/api/v1/bookings').set('Authorization', `Bearer ${customerToken}`).send(bookingPayload(checkIn, checkOut, room._id.toString()));
      const res2 = await request(app).post('/api/v1/bookings').set('Authorization', `Bearer ${customerToken}`).send(bookingPayload(checkIn, checkOut, room._id.toString()));
      expect(res2.status).toBe(409);
    });

    test('Same room + partially overlapping dates → rejected', async () => {
      await request(app).post('/api/v1/bookings').set('Authorization', `Bearer ${customerToken}`).send(bookingPayload(futureDate(5), futureDate(8), room._id.toString()));
      const res2 = await request(app).post('/api/v1/bookings').set('Authorization', `Bearer ${customerToken}`).send(bookingPayload(futureDate(7), futureDate(10), room._id.toString()));
      expect(res2.status).toBe(409);
    });

    test('Same room + completely overlapping dates → rejected', async () => {
      await request(app).post('/api/v1/bookings').set('Authorization', `Bearer ${customerToken}`).send(bookingPayload(futureDate(5), futureDate(10), room._id.toString()));
      const res2 = await request(app).post('/api/v1/bookings').set('Authorization', `Bearer ${customerToken}`).send(bookingPayload(futureDate(6), futureDate(9), room._id.toString()));
      expect(res2.status).toBe(409);
    });

    test('Same room + checkout exactly equals next check-in → allowed', async () => {
      const res1 = await request(app).post('/api/v1/bookings').set('Authorization', `Bearer ${customerToken}`).send(bookingPayload(futureDate(5), futureDate(7), room._id.toString()));
      expect(res1.status).toBe(201);
      const res2 = await request(app).post('/api/v1/bookings').set('Authorization', `Bearer ${customerToken}`).send(bookingPayload(futureDate(7), futureDate(9), room._id.toString()));
      expect(res2.status).toBe(201);
    });

    test('Same room + non-overlapping dates → allowed', async () => {
      const res1 = await request(app).post('/api/v1/bookings').set('Authorization', `Bearer ${customerToken}`).send(bookingPayload(futureDate(5), futureDate(7), room._id.toString()));
      expect(res1.status).toBe(201);
      const res2 = await request(app).post('/api/v1/bookings').set('Authorization', `Bearer ${customerToken}`).send(bookingPayload(futureDate(10), futureDate(12), room._id.toString()));
      expect(res2.status).toBe(201);
    });

    test('Different room + same dates → allowed', async () => {
      const roomType2 = await RoomType.create({ name: 'Standard', slug: 'standard', description: 'Standard room', maxOccupancy: 2, basePrice: 80, currency: 'USD', status: 'active' });
      const room2 = await Room.create({ roomNumber: '102', roomType: roomType2._id, floor: 1, status: 'available', images: [] });
      const payload = bookingPayload(futureDate(5), futureDate(7), room._id.toString());
      const payload2 = { ...payload, rooms: [{ roomId: room2._id.toString(), roomType: roomType2.name, quantity: 1, adults: 1, children: 0 }] };
      const res1 = await request(app).post('/api/v1/bookings').set('Authorization', `Bearer ${customerToken}`).send(payload);
      expect(res1.status).toBe(201);
      const res2 = await request(app).post('/api/v1/bookings').set('Authorization', `Bearer ${customerToken}`).send(payload2);
      expect(res2.status).toBe(201);
    });
  });

  describe('3. Server-side Booking Price Calculation', () => {
    const futureDate = (days: number) => {
      const d = new Date();
      d.setDate(d.getDate() + days);
      return d.toISOString().split('T')[0];
    };

    const basePayload = (checkIn: string, checkOut: string, clientTotal?: number) => ({
      customerId: customerUser._id.toString(),
      guestDetails: { firstName: 'John', lastName: 'Doe', email: 'customer@test.com', phone: '+1234567890' },
      checkIn,
      checkOut,
      rooms: [{ roomId: room._id.toString(), roomType: roomType.name, quantity: 1, adults: 1, children: 0 }],
      pricing: clientTotal !== undefined ? { subtotal: 0, tax: 0, discount: 0, total: clientTotal } : undefined,
      source: 'website',
    });

    test('Normal booking uses server-calculated price', async () => {
      const checkIn = futureDate(5);
      const checkOut = futureDate(7);
      const res = await request(app).post('/api/v1/bookings').set('Authorization', `Bearer ${customerToken}`).send(basePayload(checkIn, checkOut));
      expect(res.status).toBe(201);
      const expectedSubtotal = 100 * 1 * 2;
      const expectedTax = expectedSubtotal * 0.13;
      expect(res.body.data.pricing.subtotal).toBeCloseTo(expectedSubtotal, 2);
      expect(res.body.data.pricing.tax).toBeCloseTo(expectedTax, 2);
      expect(res.body.data.pricing.total).toBeCloseTo(expectedSubtotal + expectedTax, 2);
    });

    test('Multiple nights calculates correctly', async () => {
      const checkIn = futureDate(5);
      const checkOut = futureDate(10);
      const res = await request(app).post('/api/v1/bookings').set('Authorization', `Bearer ${customerToken}`).send(basePayload(checkIn, checkOut));
      expect(res.status).toBe(201);
      const expectedSubtotal = 100 * 1 * 5;
      const expectedTax = expectedSubtotal * 0.13;
      expect(res.body.data.pricing.subtotal).toBeCloseTo(expectedSubtotal, 2);
      expect(res.body.data.pricing.total).toBeCloseTo(expectedSubtotal + expectedTax, 2);
    });

    test('Multiple quantity calculates correctly', async () => {
      const roomType2 = await RoomType.create({ name: 'Suite', slug: 'suite', description: 'Suite', maxOccupancy: 4, basePrice: 200, currency: 'USD', status: 'active' });
      const room2 = await Room.create({ roomNumber: '201', roomType: roomType2._id, floor: 2, status: 'available', images: [] });
      const checkIn = futureDate(5);
      const checkOut = futureDate(7);
      const res = await request(app).post('/api/v1/bookings').set('Authorization', `Bearer ${customerToken}`).send({
        ...basePayload(checkIn, checkOut),
        rooms: [{ roomId: room2._id.toString(), roomType: roomType2.name, quantity: 3, adults: 1, children: 0 }],
      });
      expect(res.status).toBe(201);
      const expectedSubtotal = 200 * 3 * 2;
      const expectedTax = expectedSubtotal * 0.13;
      expect(res.body.data.pricing.subtotal).toBeCloseTo(expectedSubtotal, 2);
      expect(res.body.data.pricing.total).toBeCloseTo(expectedSubtotal + expectedTax, 2);
    });

    test('Invalid client price (zero) → rejected', async () => {
      const checkIn = futureDate(5);
      const checkOut = futureDate(7);
      const res = await request(app).post('/api/v1/bookings').set('Authorization', `Bearer ${customerToken}`).send(basePayload(checkIn, checkOut, 0));
      expect(res.status).toBe(400);
    });

    test('Invalid client price (too low) → rejected', async () => {
      const checkIn = futureDate(5);
      const checkOut = futureDate(7);
      const res = await request(app).post('/api/v1/bookings').set('Authorization', `Bearer ${customerToken}`).send(basePayload(checkIn, checkOut, 10));
      expect(res.status).toBe(400);
    });

    test('Invalid client price (negative) → rejected', async () => {
      const checkIn = futureDate(5);
      const checkOut = futureDate(7);
      const res = await request(app).post('/api/v1/bookings').set('Authorization', `Bearer ${customerToken}`).send(basePayload(checkIn, checkOut, -50));
      expect(res.status).toBe(400);
    });
  });

  describe('4. Booking Date Validation', () => {
    test('Valid future booking succeeds', async () => {
      const checkIn = new Date();
      checkIn.setDate(checkIn.getDate() + 5);
      const checkOut = new Date(checkIn);
      checkOut.setDate(checkOut.getDate() + 2);
      const res = await request(app).post('/api/v1/bookings').set('Authorization', `Bearer ${customerToken}`).send({
        customerId: customerUser._id.toString(),
        guestDetails: { firstName: 'John', lastName: 'Doe', email: 'customer@test.com', phone: '+1234567890' },
        checkIn: checkIn.toISOString().split('T')[0],
        checkOut: checkOut.toISOString().split('T')[0],
        rooms: [{ roomId: room._id.toString(), roomType: roomType.name, quantity: 1, adults: 1, children: 0 }],
        source: 'website',
      });
      expect(res.status).toBe(201);
    });

    test('checkOut before checkIn → rejected', async () => {
      const checkIn = new Date();
      checkIn.setDate(checkIn.getDate() + 5);
      const checkOut = new Date(checkIn);
      checkOut.setDate(checkOut.getDate() - 2);
      const res = await request(app).post('/api/v1/bookings').set('Authorization', `Bearer ${customerToken}`).send({
        customerId: customerUser._id.toString(),
        guestDetails: { firstName: 'John', lastName: 'Doe', email: 'customer@test.com', phone: '+1234567890' },
        checkIn: checkIn.toISOString().split('T')[0],
        checkOut: checkOut.toISOString().split('T')[0],
        rooms: [{ roomId: room._id.toString(), roomType: roomType.name, quantity: 1, adults: 1, children: 0 }],
        source: 'website',
      });
      expect(res.status).toBe(400);
    });

    test('Same checkIn/checkOut → rejected', async () => {
      const date = new Date();
      date.setDate(date.getDate() + 5);
      const dateStr = date.toISOString().split('T')[0];
      const res = await request(app).post('/api/v1/bookings').set('Authorization', `Bearer ${customerToken}`).send({
        customerId: customerUser._id.toString(),
        guestDetails: { firstName: 'John', lastName: 'Doe', email: 'customer@test.com', phone: '+1234567890' },
        checkIn: dateStr,
        checkOut: dateStr,
        rooms: [{ roomId: room._id.toString(), roomType: roomType.name, quantity: 1, adults: 1, children: 0 }],
        source: 'website',
      });
      expect(res.status).toBe(400);
    });

    test('Past checkIn → rejected', async () => {
      const checkIn = new Date();
      checkIn.setDate(checkIn.getDate() - 2);
      const checkOut = new Date(checkIn);
      checkOut.setDate(checkOut.getDate() + 2);
      const res = await request(app).post('/api/v1/bookings').set('Authorization', `Bearer ${customerToken}`).send({
        customerId: customerUser._id.toString(),
        guestDetails: { firstName: 'John', lastName: 'Doe', email: 'customer@test.com', phone: '+1234567890' },
        checkIn: checkIn.toISOString().split('T')[0],
        checkOut: checkOut.toISOString().split('T')[0],
        rooms: [{ roomId: room._id.toString(), roomType: roomType.name, quantity: 1, adults: 1, children: 0 }],
        source: 'website',
      });
      expect(res.status).toBe(400);
    });

    test('Invalid date string → rejected', async () => {
      const res = await request(app).post('/api/v1/bookings').set('Authorization', `Bearer ${customerToken}`).send({
        customerId: customerUser._id.toString(),
        guestDetails: { firstName: 'John', lastName: 'Doe', email: 'customer@test.com', phone: '+1234567890' },
        checkIn: 'not-a-date',
        checkOut: 'not-a-date',
        rooms: [{ roomId: room._id.toString(), roomType: roomType.name, quantity: 1, adults: 1, children: 0 }],
        source: 'website',
      });
      expect(res.status).toBe(400);
    });
  });

  describe('5. Password Update Security', () => {
    test('Normal profile update does not expose plaintext password', async () => {
      const res = await request(app).put(`/api/v1/users/${customerUser._id}`).set('Authorization', `Bearer ${customerToken}`).send({ firstName: 'Updated' });
      expect(res.status).toBe(200);
      expect(res.body.data.password).toBeUndefined();
    });

    test('Password update hashes password', async () => {
      const newPassword = 'newpassword123';
      const res = await request(app).put(`/api/v1/users/${customerUser._id}`).set('Authorization', `Bearer ${customerToken}`).send({ password: newPassword });
      expect(res.status).toBe(200);

      const updatedUser = await User.findById(customerUser._id).select('+password');
      expect(updatedUser?.password).not.toBe(newPassword);
      expect(await bcrypt.compare(newPassword, updatedUser!.password)).toBe(true);
    });

    test('Login works with new password', async () => {
      const newPassword = 'newpassword456';
      await request(app).put(`/api/v1/users/${customerUser._id}`).set('Authorization', `Bearer ${customerToken}`).send({ password: newPassword });

      const res = await request(app).post('/api/v1/auth/login').send({ email: 'customer@test.com', password: newPassword });
      expect(res.status).toBe(200);
      expect(res.body.data.accessToken).toBeDefined();
    });

    test('Old password no longer works after update', async () => {
      const newPassword = 'newpassword789';
      await request(app).put(`/api/v1/users/${customerUser._id}`).set('Authorization', `Bearer ${customerToken}`).send({ password: newPassword });

      const res = await request(app).post('/api/v1/auth/login').send({ email: 'customer@test.com', password: 'password123' });
      expect(res.status).toBe(401);
    });
  });
});
