"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const database_1 = require("../config/database");
const models_1 = require("../models");
const models_2 = require("../models");
const models_3 = require("../models");
const models_4 = require("../models");
const runSeed = async () => {
    try {
        await (0, database_1.connectDatabase)();
        console.log('Connected to database for seeding...\n');
        // Clear existing data (development only)
        console.log('Clearing existing seed data...');
        await Promise.all([
            models_4.Booking.deleteMany({}),
            models_3.MenuItem.deleteMany({}),
            models_3.MenuCategory.deleteMany({}),
            models_3.Event.deleteMany({}),
            models_3.Blog.deleteMany({}),
            models_3.GalleryImage.deleteMany({}),
            models_3.Testimonial.deleteMany({}),
            models_2.HomepageSection.deleteMany({}),
            models_2.Room.deleteMany({}),
            models_2.RoomType.deleteMany({}),
            models_2.WebsiteSettings.deleteMany({}),
            models_1.User.deleteMany({}),
            models_1.Role.deleteMany({}),
            models_1.Permission.deleteMany({}),
        ]);
        console.log('Existing data cleared.\n');
        // 1. Permissions
        console.log('Seeding permissions...');
        const permissions = await models_1.Permission.insertMany([
            { name: 'Manage Bookings', resource: 'bookings', action: 'manage', status: 'active', isSystem: true },
            { name: 'View Bookings', resource: 'bookings', action: 'read', status: 'active', isSystem: true },
            { name: 'Approve Bookings', resource: 'bookings', action: 'approve', status: 'active', isSystem: true },
            { name: 'Manage Rooms', resource: 'rooms', action: 'manage', status: 'active', isSystem: true },
            { name: 'View Rooms', resource: 'rooms', action: 'read', status: 'active', isSystem: true },
            { name: 'Manage CMS', resource: 'cms', action: 'manage', status: 'active', isSystem: true },
            { name: 'Manage Users', resource: 'users', action: 'manage', status: 'active', isSystem: true },
            { name: 'Manage Settings', resource: 'settings', action: 'manage', status: 'active', isSystem: true },
            { name: 'View Dashboard', resource: 'dashboard', action: 'read', status: 'active', isSystem: true },
            { name: 'Manage Payments', resource: 'payments', action: 'manage', status: 'active', isSystem: true },
        ]);
        console.log(`  Inserted ${permissions.length} permissions.`);
        // 2. Roles
        console.log('Seeding roles...');
        const adminRole = await models_1.Role.create({
            name: 'Admin',
            slug: 'admin',
            description: 'Full system access',
            permissions: permissions.map((p) => p._id),
            accessLevel: 100,
            canApproveBookings: true,
            canManagePayments: true,
            canManageUsers: true,
            canManageCMS: true,
            canManageSettings: true,
            status: 'active',
            isSystem: true,
        });
        const managerRole = await models_1.Role.create({
            name: 'Manager',
            slug: 'manager',
            description: 'Hotel operations manager',
            permissions: permissions.filter((p) => ['bookings', 'rooms', 'dashboard', 'payments'].includes(p.resource)).map((p) => p._id),
            accessLevel: 50,
            canApproveBookings: true,
            canManagePayments: true,
            canManageUsers: false,
            canManageCMS: true,
            canManageSettings: false,
            status: 'active',
            isSystem: true,
        });
        const customerRole = await models_1.Role.create({
            name: 'Customer',
            slug: 'customer',
            description: 'Hotel guest / customer',
            permissions: [],
            accessLevel: 1,
            canApproveBookings: false,
            canManagePayments: false,
            canManageUsers: false,
            canManageCMS: false,
            canManageSettings: false,
            status: 'active',
            isSystem: true,
        });
        console.log(`  Inserted roles: ${adminRole.name}, ${managerRole.name}, ${customerRole.name}.`);
        // 3. Users
        console.log('Seeding users...');
        const adminUser = await models_1.User.create({
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@hotel.com',
            password: 'password123',
            phone: '+1234567890',
            role: adminRole._id,
            status: 'active',
            loginAttempts: 0,
            isDeleted: false,
        });
        const managerUser = await models_1.User.create({
            firstName: 'Hotel',
            lastName: 'Manager',
            email: 'manager@hotel.com',
            password: 'password123',
            phone: '+1234567891',
            role: managerRole._id,
            status: 'active',
            loginAttempts: 0,
            isDeleted: false,
        });
        const customerUser = await models_1.User.create({
            firstName: 'John',
            lastName: 'Doe',
            email: 'customer@example.com',
            password: 'password123',
            phone: '+1234567892',
            role: customerRole._id,
            status: 'active',
            loginAttempts: 0,
            isDeleted: false,
        });
        console.log(`  Inserted users: ${adminUser.email}, ${managerUser.email}, ${customerUser.email}.`);
        // 4. Website Settings
        console.log('Seeding website settings...');
        await models_2.WebsiteSettings.create({
            siteName: 'Luxury Hotel',
            tagline: 'Experience luxury and comfort',
            logo: '',
            contactInfo: {
                address: '123 Luxury Avenue, Beverly Hills, CA 90210',
                phone: '+1 (555) 123-4567',
                email: 'info@luxuryhotel.com',
                businessHours: '24/7',
            },
            socialMedia: {
                facebook: 'https://facebook.com/luxuryhotel',
                instagram: 'https://instagram.com/luxuryhotel',
                twitter: 'https://twitter.com/luxuryhotel',
                linkedin: 'https://linkedin.com/company/luxuryhotel',
            },
            currency: 'USD',
            timezone: 'America/Los_Angeles',
            language: 'en',
            maintenanceMode: false,
        });
        console.log('  Website settings inserted.');
        // 5. Room Types
        console.log('Seeding room types...');
        const standardRoomType = await models_2.RoomType.create({
            name: 'Standard Room',
            slug: 'standard-room',
            description: 'Comfortable and cozy room with all essential amenities for a pleasant stay.',
            maxOccupancy: 2,
            basePrice: 150,
            currency: 'USD',
            images: ['/rooms/standard-1.jpg', '/rooms/standard-2.jpg'],
            amenities: ['wifi', 'tv', 'minibar', 'air-conditioning'],
            status: 'active',
            displayOrder: 1,
        });
        const deluxeRoomType = await models_2.RoomType.create({
            name: 'Deluxe Room',
            slug: 'deluxe-room',
            description: 'Spacious room with premium amenities and beautiful city views.',
            maxOccupancy: 3,
            basePrice: 250,
            currency: 'USD',
            images: ['/rooms/deluxe-1.jpg', '/rooms/deluxe-2.jpg'],
            amenities: ['wifi', 'tv', 'minibar', 'air-conditioning', 'bathtub', 'balcony'],
            status: 'active',
            displayOrder: 2,
        });
        const suiteRoomType = await models_2.RoomType.create({
            name: 'Executive Suite',
            slug: 'executive-suite',
            description: 'Luxurious suite with separate living area and premium services.',
            maxOccupancy: 4,
            basePrice: 450,
            currency: 'USD',
            images: ['/rooms/suite-1.jpg', '/rooms/suite-2.jpg'],
            amenities: ['wifi', 'tv', 'minibar', 'air-conditioning', 'bathtub', 'balcony', 'living-room', 'kitchenette'],
            status: 'active',
            displayOrder: 3,
        });
        const presidentialRoomType = await models_2.RoomType.create({
            name: 'Presidential Suite',
            slug: 'presidential-suite',
            description: 'Our most exclusive accommodation with panoramic views and butler service.',
            maxOccupancy: 6,
            basePrice: 1200,
            currency: 'USD',
            images: ['/rooms/presidential-1.jpg', '/rooms/presidential-2.jpg'],
            amenities: ['wifi', 'tv', 'minibar', 'air-conditioning', 'bathtub', 'balcony', 'living-room', 'kitchenette', 'butler-service', 'private-pool'],
            status: 'active',
            displayOrder: 4,
        });
        console.log(`  Inserted ${4} room types.`);
        // 6. Rooms
        console.log('Seeding rooms...');
        const rooms = [];
        const roomNumbers = ['101', '102', '103', '201', '202', '203', '301', '302', '401', '402'];
        for (let i = 0; i < roomNumbers.length; i++) {
            let roomType;
            if (i < 3)
                roomType = standardRoomType._id;
            else if (i < 6)
                roomType = deluxeRoomType._id;
            else if (i < 9)
                roomType = suiteRoomType._id;
            else
                roomType = presidentialRoomType._id;
            rooms.push({
                roomNumber: roomNumbers[i],
                roomType,
                floor: Math.floor(i / 3) + 1,
                building: 'Main',
                status: 'available',
                images: ['/rooms/room-' + roomNumbers[i] + '.jpg'],
            });
        }
        const createdRooms = await models_2.Room.insertMany(rooms);
        console.log(`  Inserted ${createdRooms.length} rooms.`);
        // 7. Homepage Sections
        console.log('Seeding homepage sections...');
        await models_2.HomepageSection.insertMany([
            {
                sectionKey: 'hero',
                title: 'Welcome to Luxury Hotel',
                subtitle: 'Experience unparalleled luxury and comfort',
                content: '<p>Discover the perfect blend of elegance and comfort at Luxury Hotel.</p>',
                media: ['/hero/hero-1.jpg'],
                isVisible: true,
                displayOrder: 1,
                status: 'active',
            },
            {
                sectionKey: 'about',
                title: 'About Us',
                subtitle: 'A tradition of excellence since 1990',
                content: '<p>Luxury Hotel has been providing exceptional hospitality services for over 30 years.</p>',
                isVisible: true,
                displayOrder: 2,
                status: 'active',
            },
            {
                sectionKey: 'featured-rooms',
                title: 'Our Accommodations',
                subtitle: 'Rooms designed for your comfort',
                content: '<p>From standard rooms to presidential suites, we have the perfect accommodation for you.</p>',
                isVisible: true,
                displayOrder: 3,
                status: 'active',
            },
        ]);
        console.log('  Inserted homepage sections.');
        // 8. Blog Posts
        console.log('Seeding blog posts...');
        await models_3.Blog.insertMany([
            {
                title: 'Top 10 Reasons to Stay With Us',
                slug: 'top-10-reasons-to-stay-with-us',
                excerpt: 'Discover why guests choose Luxury Hotel for their stay.',
                content: '<p>Luxury Hotel offers exceptional service, beautiful rooms, and amazing amenities.</p>',
                coverImage: '/blog/blog-1.jpg',
                author: { name: 'Admin User', avatar: '/authors/admin.jpg' },
                categories: ['Hotel News'],
                tags: ['luxury', 'hospitality', 'experience'],
                views: 245,
                publishedAt: new Date('2026-01-15'),
                seo: { metaTitle: 'Top 10 Reasons', metaDescription: 'Discover why...', keywords: ['luxury', 'hotel'] },
                status: 'published',
            },
            {
                title: 'Dining Experience at Luxury Hotel',
                slug: 'dining-experience-at-luxury-hotel',
                excerpt: 'Explore our world-class restaurants and bars.',
                content: '<p>Our restaurants offer cuisine from around the world prepared by award-winning chefs.</p>',
                coverImage: '/blog/blog-2.jpg',
                author: { name: 'Admin User', avatar: '/authors/admin.jpg' },
                categories: ['Dining'],
                tags: ['dining', 'restaurant', 'cuisine'],
                views: 189,
                publishedAt: new Date('2026-02-20'),
                seo: { metaTitle: 'Dining Experience', metaDescription: 'Explore our...', keywords: ['dining', 'restaurant'] },
                status: 'published',
            },
        ]);
        console.log('  Inserted blog posts.');
        // 9. Events
        console.log('Seeding events...');
        await models_3.Event.insertMany([
            {
                title: 'Summer Wine Tasting Festival',
                slug: 'summer-wine-tasting-festival',
                description: 'Join us for an evening of fine wines and gourmet appetizers.',
                startDate: new Date('2026-08-20'),
                endDate: new Date('2026-08-21'),
                location: 'Hotel Garden',
                bannerImage: '/events/wine-tasting.jpg',
                price: 75,
                registrationLink: 'https://example.com/register/wine-tasting',
                seo: { metaTitle: 'Wine Tasting', metaDescription: 'Join us...', keywords: ['wine', 'event'] },
                status: 'upcoming',
            },
            {
                title: 'Live Jazz Night',
                slug: 'live-jazz-night',
                description: 'An evening of smooth jazz performances by renowned artists.',
                startDate: new Date('2026-09-05'),
                endDate: new Date('2026-09-05'),
                location: 'Grand Ballroom',
                bannerImage: '/events/jazz-night.jpg',
                price: 50,
                registrationLink: 'https://example.com/register/jazz-night',
                seo: { metaTitle: 'Jazz Night', metaDescription: 'Smooth jazz...', keywords: ['jazz', 'music'] },
                status: 'upcoming',
            },
        ]);
        console.log('  Inserted events.');
        // 10. Menu Categories & Items
        console.log('Seeding menu categories and items...');
        const breakfastCategory = await models_3.MenuCategory.create({
            name: 'Breakfast',
            slug: 'breakfast',
            description: 'Start your day with our delicious breakfast options',
            displayOrder: 1,
            isActive: true,
        });
        const lunchCategory = await models_3.MenuCategory.create({
            name: 'Lunch',
            slug: 'lunch',
            description: 'Enjoy our lunch specials',
            displayOrder: 2,
            isActive: true,
        });
        await models_3.MenuItem.insertMany([
            {
                category: breakfastCategory._id,
                name: 'Continental Breakfast',
                slug: 'continental-breakfast',
                description: 'Fresh pastries, fruits, coffee, and juice',
                price: 25,
                images: ['/menu/continental-breakfast.jpg'],
                ingredients: ['pastries', 'fruits', 'coffee', 'juice'],
                allergens: ['gluten', 'dairy'],
                dietaryTags: ['vegetarian'],
                isAvailable: true,
                preparationTime: 15,
            },
            {
                category: lunchCategory._id,
                name: 'Club Sandwich',
                slug: 'club-sandwich',
                description: 'Classic club sandwich with fries',
                price: 18,
                discountedPrice: 15,
                images: ['/menu/club-sandwich.jpg'],
                ingredients: ['bread', 'chicken', 'lettuce', 'tomato', 'fries'],
                allergens: ['gluten'],
                dietaryTags: [],
                isAvailable: true,
                preparationTime: 20,
            },
        ]);
        console.log('  Inserted menu categories and items.');
        // 11. Gallery Images
        console.log('Seeding gallery images...');
        await models_3.GalleryImage.insertMany([
            { title: 'Hotel Exterior', slug: 'hotel-exterior', category: 'exterior', imageUrl: '/gallery/exterior-1.jpg', altText: 'Hotel exterior view', displayOrder: 1, isVisible: true },
            { title: 'Deluxe Room', slug: 'deluxe-room', category: 'rooms', imageUrl: '/gallery/deluxe-room.jpg', altText: 'Deluxe room interior', displayOrder: 1, isVisible: true },
            { title: 'Restaurant', slug: 'restaurant', category: 'dining', imageUrl: '/gallery/restaurant.jpg', altText: 'Hotel restaurant', displayOrder: 1, isVisible: true },
            { title: 'Spa', slug: 'spa', category: 'facilities', imageUrl: '/gallery/spa.jpg', altText: 'Luxury spa', displayOrder: 1, isVisible: true },
        ]);
        console.log('  Inserted gallery images.');
        // 12. Testimonials
        console.log('Seeding testimonials...');
        await models_3.Testimonial.insertMany([
            {
                customerName: 'Sarah Johnson',
                customerAvatar: '/testimonials/sarah.jpg',
                designation: 'Travel Blogger',
                rating: 5,
                comment: 'Absolutely amazing experience! The staff was incredibly attentive and the room was stunning.',
                featured: true,
                isVisible: true,
            },
            {
                customerName: 'Michael Chen',
                customerAvatar: '/testimonials/michael.jpg',
                designation: 'Business Traveler',
                rating: 4,
                comment: 'Great location and excellent service. Will definitely come back.',
                featured: true,
                isVisible: true,
            },
        ]);
        console.log('  Inserted testimonials.');
        // 13. Sample Booking
        console.log('Seeding sample booking...');
        const availableRoom = createdRooms.find((r) => r.status === 'available');
        if (availableRoom) {
            await models_4.Booking.create({
                bookingReference: 'BK-' + Date.now().toString(36).toUpperCase(),
                customerId: customerUser._id,
                guestDetails: {
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'customer@example.com',
                    phone: '+1234567892',
                    country: 'USA',
                    specialRequests: 'Late check-in',
                },
                checkIn: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                checkOut: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
                rooms: [
                    {
                        roomId: availableRoom._id,
                        roomType: standardRoomType.name,
                        quantity: 1,
                        price: standardRoomType.basePrice,
                    },
                ],
                pricing: {
                    subtotal: standardRoomType.basePrice * 3,
                    tax: standardRoomType.basePrice * 3 * 0.12,
                    discount: 0,
                    total: standardRoomType.basePrice * 3 * 1.12,
                },
                status: 'confirmed',
                paymentStatus: 'paid',
                source: 'website',
            });
            console.log('  Inserted sample booking.');
        }
        console.log('\n========================================');
        console.log('Seed completed successfully!');
        console.log('========================================');
        console.log('\nDevelopment credentials:');
        console.log('  Admin:    admin@hotel.com    / password123');
        console.log('  Manager:  manager@hotel.com  / password123');
        console.log('  Customer: customer@example.com / password123');
        await mongoose_1.default.disconnect();
        process.exit(0);
    }
    catch (error) {
        console.error('Seed failed:', error);
        await mongoose_1.default.disconnect();
        process.exit(1);
    }
};
runSeed();
//# sourceMappingURL=seed.js.map