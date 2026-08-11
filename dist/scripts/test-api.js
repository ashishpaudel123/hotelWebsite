#!/usr/bin/env node
"use strict";
// @ts-nocheck
const BASE = 'http://localhost:5001/api/v1';
let authToken = '';
let adminToken = '';
let passed = 0;
let failed = 0;
async function runTest(name, fn) {
    try {
        await fn();
        console.log(`  ✓ ${name}`);
        passed++;
    }
    catch (err) {
        console.log(`  ✗ ${name}: ${err.message}`);
        failed++;
    }
}
function assert(condition, message) {
    if (!condition)
        throw new Error(message || 'Assertion failed');
}
async function run() {
    console.log('\n=== Public APIs ===');
    await runTest('GET /website/settings returns settings', async () => {
        const res = await fetch(`${BASE}/website/settings`);
        assert(res.status === 200, `Expected 200, got ${res.status}`);
        const data = await res.json();
        assert(data.success, 'Response success should be true');
        assert(data.data.siteName === 'Luxury Hotel', 'Site name mismatch');
    });
    await runTest('GET /website/homepage-sections returns sections', async () => {
        const res = await fetch(`${BASE}/website/homepage-sections`);
        assert(res.status === 200, `Expected 200, got ${res.status}`);
        const data = await res.json();
        assert(Array.isArray(data.data), 'Data should be array');
        assert(data.data.length > 0, 'Should have sections');
    });
    await runTest('GET /website/theme returns theme', async () => {
        const res = await fetch(`${BASE}/website/theme`);
        assert(res.status === 200, `Expected 200, got ${res.status}`);
        const data = await res.json();
        assert(data.data.primaryColor, 'Should have primaryColor');
    });
    await runTest('GET /rooms returns rooms', async () => {
        const res = await fetch(`${BASE}/rooms`);
        assert(res.status === 200, `Expected 200, got ${res.status}`);
        const data = await res.json();
        assert(Array.isArray(data.data), 'Data should be array');
        assert(data.data.length > 0, 'Should have rooms');
    });
    await runTest('GET /rooms/slug/:slug returns room detail', async () => {
        const res = await fetch(`${BASE}/rooms`);
        const data = await res.json();
        const slug = data.data[0]?.roomType?.slug;
        assert(slug, 'Should have a room slug');
        const detailRes = await fetch(`${BASE}/rooms/slug/${slug}`);
        assert(detailRes.status === 200, `Expected 200, got ${detailRes.status}`);
        const detail = await detailRes.json();
        assert(detail.data, 'Should have room detail');
    });
    await runTest('GET /cms/blogs returns blogs', async () => {
        const res = await fetch(`${BASE}/cms/blogs`);
        assert(res.status === 200, `Expected 200, got ${res.status}`);
        const data = await res.json();
        assert(Array.isArray(data.data), 'Data should be array');
        assert(data.data.length > 0, 'Should have blogs');
    });
    await runTest('GET /cms/events returns events', async () => {
        const res = await fetch(`${BASE}/cms/events`);
        assert(res.status === 200, `Expected 200, got ${res.status}`);
        const data = await res.json();
        assert(Array.isArray(data.data), 'Data should be array');
        assert(data.data.length > 0, 'Should have events');
    });
    await runTest('GET /cms/menu-categories returns categories', async () => {
        const res = await fetch(`${BASE}/cms/menu-categories`);
        assert(res.status === 200, `Expected 200, got ${res.status}`);
        const data = await res.json();
        assert(Array.isArray(data.data), 'Data should be array');
        assert(data.data.length > 0, 'Should have categories');
    });
    await runTest('GET /cms/menu-items returns items', async () => {
        const res = await fetch(`${BASE}/cms/menu-items`);
        assert(res.status === 200, `Expected 200, got ${res.status}`);
        const data = await res.json();
        assert(Array.isArray(data.data), 'Data should be array');
        assert(data.data.length > 0, 'Should have items');
    });
    await runTest('GET /cms/gallery returns images', async () => {
        const res = await fetch(`${BASE}/cms/gallery`);
        assert(res.status === 200, `Expected 200, got ${res.status}`);
        const data = await res.json();
        assert(Array.isArray(data.data), 'Data should be array');
        assert(data.data.length > 0, 'Should have images');
    });
    await runTest('GET /cms/testimonials returns testimonials', async () => {
        const res = await fetch(`${BASE}/cms/testimonials`);
        assert(res.status === 200, `Expected 200, got ${res.status}`);
        const data = await res.json();
        assert(Array.isArray(data.data), 'Data should be array');
        assert(data.data.length > 0, 'Should have testimonials');
    });
    console.log('\n=== Auth APIs ===');
    await runTest('POST /auth/register creates user', async () => {
        const res = await fetch(`${BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: `testregister_${Date.now()}@example.com`,
                password: 'password123',
                firstName: 'Test',
                lastName: 'Register',
            }),
        });
        assert(res.status === 201, `Expected 201, got ${res.status}`);
        const data = await res.json();
        assert(data.success, 'Should succeed');
        assert(data.data.accessToken, 'Should return access token');
        authToken = data.data.accessToken;
    });
    await runTest('POST /auth/login returns token', async () => {
        const res = await fetch(`${BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@hotel.com',
                password: 'password123',
            }),
        });
        assert(res.status === 200, `Expected 200, got ${res.status}`);
        const data = await res.json();
        assert(data.success, 'Should succeed');
        assert(data.data.accessToken, 'Should return access token');
        adminToken = data.data.accessToken;
    });
    await runTest('POST /auth/login with wrong password returns 401', async () => {
        const res = await fetch(`${BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@hotel.com',
                password: 'wrongpassword',
            }),
        });
        assert(res.status === 401, `Expected 401, got ${res.status}`);
    });
    await runTest('GET /auth/profile returns user with token', async () => {
        const res = await fetch(`${BASE}/auth/profile`, {
            headers: { Authorization: `Bearer ${adminToken}` },
        });
        assert(res.status === 200, `Expected 200, got ${res.status}`);
        const data = await res.json();
        assert(data.data.email === 'admin@hotel.com', 'Email mismatch');
    });
    await runTest('GET /auth/profile without token returns 401', async () => {
        const res = await fetch(`${BASE}/auth/profile`);
        assert(res.status === 401, `Expected 401, got ${res.status}`);
    });
    console.log('\n=== Admin APIs ===');
    await runTest('GET /users returns users with admin token', async () => {
        const res = await fetch(`${BASE}/users`, {
            headers: { Authorization: `Bearer ${adminToken}` },
        });
        assert(res.status === 200, `Expected 200, got ${res.status}`);
        const data = await res.json();
        assert(Array.isArray(data.data), 'Data should be array');
        assert(data.data.length > 0, 'Should have users');
    });
    await runTest('GET /bookings returns bookings with admin token', async () => {
        const res = await fetch(`${BASE}/bookings`, {
            headers: { Authorization: `Bearer ${adminToken}` },
        });
        assert(res.status === 200, `Expected 200, got ${res.status}`);
        const data = await res.json();
        assert(data.data.length >= 1, 'Should have at least 1 booking from seed');
    });
    await runTest('GET /rooms admin endpoint returns rooms', async () => {
        const res = await fetch(`${BASE}/rooms`, {
            headers: { Authorization: `Bearer ${adminToken}` },
        });
        assert(res.status === 200, `Expected 200, got ${res.status}`);
        const data = await res.json();
        assert(data.data.length >= 10, 'Should have seeded rooms');
    });
    await runTest('GET /cms/blogs with admin token returns blogs', async () => {
        const res = await fetch(`${BASE}/cms/blogs`, {
            headers: { Authorization: `Bearer ${adminToken}` },
        });
        assert(res.status === 200, `Expected 200, got ${res.status}`);
        const data = await res.json();
        assert(data.data.length >= 2, 'Should have seeded blogs');
    });
    await runTest('GET /cms/events with admin token returns events', async () => {
        const res = await fetch(`${BASE}/cms/events`, {
            headers: { Authorization: `Bearer ${adminToken}` },
        });
        assert(res.status === 200, `Expected 200, got ${res.status}`);
        const data = await res.json();
        assert(data.data.length >= 2, 'Should have seeded events');
    });
    await runTest('GET /cms/testimonials with admin token returns testimonials', async () => {
        const res = await fetch(`${BASE}/cms/testimonials`, {
            headers: { Authorization: `Bearer ${adminToken}` },
        });
        assert(res.status === 200, `Expected 200, got ${res.status}`);
        const data = await res.json();
        assert(data.data.length >= 2, 'Should have seeded testimonials');
    });
    console.log('\n=== Booking Flow ===');
    const customerLoginRes = await fetch(`${BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'customer@example.com', password: 'password123' }),
    });
    const customerLoginData = await customerLoginRes.json();
    const customerToken = customerLoginData.data.accessToken;
    await runTest('Customer can login', async () => {
        assert(customerLoginRes.status === 200, `Expected 200, got ${customerLoginRes.status}`);
        assert(customerToken, 'Should have token');
    });
    const roomsRes = await fetch(`${BASE}/rooms?status=available`);
    const roomsData = await roomsRes.json();
    const availableRoom = roomsData.data.find((r) => r.status === 'available');
    await runTest('POST /bookings creates booking for customer', async () => {
        assert(availableRoom, 'Should have an available room');
        const checkIn = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const checkOut = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const res = await fetch(`${BASE}/bookings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${customerToken}`,
            },
            body: JSON.stringify({
                customerId: customerLoginData.data.user.id,
                guestDetails: {
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'customer@example.com',
                    phone: '+1234567892',
                    specialRequests: 'Late check-in',
                },
                checkIn,
                checkOut,
                rooms: [
                    {
                        roomId: availableRoom._id,
                        roomType: availableRoom.roomType.name,
                        quantity: 1,
                    },
                ],
                source: 'website',
            }),
        });
        assert(res.status === 201, `Expected 201, got ${res.status}`);
        const data = await res.json();
        assert(data.success, 'Should succeed');
        assert(data.data._id, 'Should return booking ID');
    });
    console.log('\n========================================');
    console.log(`Results: ${passed} passed, ${failed} failed`);
    console.log('========================================\n');
    process.exit(failed > 0 ? 1 : 0);
}
run().catch((err) => {
    console.error('Test runner failed:', err);
    process.exit(1);
});
//# sourceMappingURL=test-api.js.map