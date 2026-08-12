import { connectDatabase } from '../config/database';
import {
  WebsiteSettings,
  ThemeSettings,
  HomepageSection,
} from '../models/website';
import {
  RoomType,
  Room,
} from '../models/room';
import {
  BlogPost,
  Event,
  GalleryImage,
  Testimonial,
  MenuCategory,
  MenuItem,
} from '../models/content';

const IMAGE = '/hero-bg.jpg';
const ROOM_IMG = '/placeholder-room.jpg';

async function seed() {
  await connectDatabase();

  // Website Settings (upsert single document)
  await WebsiteSettings.findOneAndUpdate(
    {},
    {
      siteName: 'Grand Luxury Hotel',
      tagline: 'Where luxury meets comfort in the heart of Kathmandu',
      logo: '',
      contactInfo: {
        address: '123 Luxury Avenue, Kathmandu, Nepal',
        phone: '+977-1-4000000',
        email: 'info@grandluxuryhotel.com',
        emergencyContact: '+977-1-4000001',
        businessHours: '24 Hours',
      },
      socialMedia: {
        facebook: 'https://facebook.com/grandluxuryhotel',
        instagram: 'https://instagram.com/grandluxuryhotel',
        twitter: 'https://twitter.com/grandluxuryhotel',
        linkedin: '',
        youtube: '',
      },
      currency: 'USD',
      timezone: 'Asia/Kathmandu',
      language: 'en',
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  // Theme Settings
  await ThemeSettings.findOneAndUpdate(
    {},
    {
      primaryColor: '222.2 47.4% 11.2%',
      secondaryColor: '210 40% 96.1%',
      accentColor: '38 92% 50%',
      fontFamilyHeading: 'Playfair Display',
      fontFamilyBody: 'Inter',
      layoutWidth: 'full',
      headerStyle: 'modern',
      footerStyle: 'multi-column',
      showScrollToTop: true,
      animationEnabled: true,
      darkModeDefault: false,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  // Homepage Sections
  const sections = [
    {
      sectionKey: 'about',
      title: 'About Our Hotel',
      subtitle: 'A blend of heritage and modern luxury',
      content:
        'Grand Luxury Hotel offers world-class accommodation with breathtaking views, fine dining, and impeccable service tailored to make every stay unforgettable.',
      media: [IMAGE],
      isVisible: true,
      displayOrder: 1,
      status: 'active' as const,
    },
    {
      sectionKey: 'rooms',
      title: 'Luxurious Rooms & Suites',
      subtitle: 'Designed for your ultimate comfort',
      isVisible: true,
      displayOrder: 2,
      status: 'active' as const,
    },
    {
      sectionKey: 'testimonials',
      title: 'What Our Guests Say',
      isVisible: true,
      displayOrder: 3,
      status: 'active' as const,
    },
  ];
  for (const s of sections) {
    await HomepageSection.findOneAndUpdate({ sectionKey: s.sectionKey }, s, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    });
  }

  // Room Types
  const deluxe = await RoomType.findOneAndUpdate(
    { slug: 'deluxe-room' },
    {
      name: 'Deluxe Room',
      slug: 'deluxe-room',
      description: 'Spacious room with city views, king bed, and premium amenities.',
      maxOccupancy: 2,
      basePrice: 120,
      images: [ROOM_IMG],
      amenities: ['wifi', 'breakfast', 'air-conditioning', 'mini-bar'],
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  const suite = await RoomType.findOneAndUpdate(
    { slug: 'executive-suite' },
    {
      name: 'Executive Suite',
      slug: 'executive-suite',
      description: 'Luxurious suite with separate living area and panoramic views.',
      maxOccupancy: 4,
      basePrice: 250,
      images: [ROOM_IMG],
      amenities: ['wifi', 'breakfast', 'parking', 'kitchen', 'balcony'],
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  const standard = await RoomType.findOneAndUpdate(
    { slug: 'standard-room' },
    {
      name: 'Standard Room',
      slug: 'standard-room',
      description: 'Cozy and comfortable room perfect for short stays.',
      maxOccupancy: 2,
      basePrice: 80,
      images: [ROOM_IMG],
      amenities: ['wifi', 'breakfast'],
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  // Rooms
  const rooms = [
    { roomNumber: '101', roomType: deluxe._id, floor: 1, status: 'available', images: [ROOM_IMG] },
    { roomNumber: '102', roomType: deluxe._id, floor: 1, status: 'available', images: [ROOM_IMG] },
    { roomNumber: '201', roomType: suite._id, floor: 2, status: 'available', images: [ROOM_IMG] },
    { roomNumber: '301', roomType: standard._id, floor: 3, status: 'available', images: [ROOM_IMG] },
  ];
  for (const r of rooms) {
    await Room.findOneAndUpdate({ roomNumber: r.roomNumber }, r, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    });
  }

  // Blog Posts
  const blogs = [
    {
      title: 'Top 10 Things to Do in Kathmandu',
      slug: 'top-things-to-do-in-kathmandu',
      excerpt: 'Discover the best experiences the valley has to offer.',
      content: 'Kathmandu is a city of temples, culture, and adventure...',
      coverImage: IMAGE,
      author: { name: 'Hotel Editor' },
      categories: ['Travel', 'Culture'],
      tags: ['kathmandu', 'nepal', 'travel'],
      status: 'published' as const,
      publishedAt: new Date(),
    },
    {
      title: 'A Guide to Nepali Cuisine',
      slug: 'guide-to-nepali-cuisine',
      excerpt: 'From dal bhat to momos, explore local flavors.',
      content: 'Nepali food is hearty, healthy, and full of flavor...',
      coverImage: IMAGE,
      author: { name: 'Hotel Chef' },
      categories: ['Food'],
      tags: ['food', 'cuisine'],
      status: 'published' as const,
      publishedAt: new Date(),
    },
    {
      title: 'Wellness Retreats at Our Spa',
      slug: 'wellness-retreats-at-our-spa',
      excerpt: 'Rejuvenate body and mind with our signature treatments.',
      content: 'Our spa offers traditional and modern therapies...',
      coverImage: IMAGE,
      author: { name: 'Spa Team' },
      categories: ['Wellness'],
      tags: ['spa', 'wellness'],
      status: 'published' as const,
      publishedAt: new Date(),
    },
  ];
  for (const b of blogs) {
    await BlogPost.findOneAndUpdate({ slug: b.slug }, b, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    });
  }

  // Events
  const events = [
    {
      title: 'New Year Gala Dinner',
      slug: 'new-year-gala-dinner',
      description: 'Celebrate the new year with a grand buffet and live music.',
      startDate: new Date(Date.now() + 30 * 86400000),
      endDate: new Date(Date.now() + 30 * 86400000),
      location: 'Grand Ballroom',
      bannerImage: IMAGE,
      price: 50,
      status: 'upcoming' as const,
    },
    {
      title: 'Cultural Night',
      slug: 'cultural-night',
      description: 'An evening of traditional dance and music.',
      startDate: new Date(Date.now() + 14 * 86400000),
      endDate: new Date(Date.now() + 14 * 86400000),
      location: 'Garden Pavilion',
      bannerImage: IMAGE,
      status: 'upcoming' as const,
    },
  ];
  for (const e of events) {
    await Event.findOneAndUpdate({ slug: e.slug }, e, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    });
  }

  // Gallery
  const gallery = [
    { title: 'Deluxe Room', slug: 'deluxe-room-img', category: 'rooms', imageUrl: ROOM_IMG, altText: 'Deluxe Room', displayOrder: 1, isVisible: true },
    { title: 'Hotel Exterior', slug: 'exterior-img', category: 'exterior', imageUrl: IMAGE, altText: 'Hotel Exterior', displayOrder: 2, isVisible: true },
    { title: 'Dining Area', slug: 'dining-img', category: 'dining', imageUrl: IMAGE, altText: 'Dining', displayOrder: 3, isVisible: true },
    { title: 'Event Hall', slug: 'event-img', category: 'events', imageUrl: IMAGE, altText: 'Event Hall', displayOrder: 4, isVisible: true },
  ];
  for (const g of gallery) {
    await GalleryImage.findOneAndUpdate({ slug: g.slug }, g, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    });
  }

  // Testimonials
  const testimonials = [
    { customerName: 'Aarav Sharma', designation: 'Business Traveler', rating: 5, comment: 'Exceptional service and beautiful rooms. Will return!', isVisible: true, featured: true },
    { customerName: 'Sarah Johnson', designation: 'Tourist', rating: 5, comment: 'The staff went above and beyond. Highly recommend.', isVisible: true, featured: true },
    { customerName: 'Kenji Tanaka', designation: 'Honeymooner', rating: 4, comment: 'Lovely stay, great views and food.', isVisible: true, featured: false },
  ];
  for (const t of testimonials) {
    await Testimonial.findOneAndUpdate({ customerName: t.customerName, comment: t.comment }, t, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    });
  }

  // Menu Categories
  const breakfast = await MenuCategory.findOneAndUpdate(
    { slug: 'breakfast' },
    { name: 'Breakfast', slug: 'breakfast', description: 'Start your day right', displayOrder: 1, isActive: true },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  const main = await MenuCategory.findOneAndUpdate(
    { slug: 'main-course' },
    { name: 'Main Course', slug: 'main-course', description: 'Hearty meals', displayOrder: 2, isActive: true },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  const dessert = await MenuCategory.findOneAndUpdate(
    { slug: 'desserts' },
    { name: 'Desserts', slug: 'desserts', description: 'Sweet endings', displayOrder: 3, isActive: true },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  // Menu Items
  const menuItems = [
    { category: breakfast._id, name: 'Continental Breakfast', slug: 'continental-breakfast', description: 'Eggs, toast, pastries, and coffee.', price: 12, images: [IMAGE], dietaryTags: ['vegetarian'], isAvailable: true },
    { category: breakfast._id, name: 'Nepali Breakfast', slug: 'nepali-breakfast', description: 'Dal bhat, roti, and achar.', price: 10, images: [IMAGE], dietaryTags: ['vegan', 'gluten-free'], isAvailable: true },
    { category: main._id, name: 'Grilled Salmon', slug: 'grilled-salmon', description: 'Fresh salmon with seasonal vegetables.', price: 28, images: [IMAGE], dietaryTags: ['gluten-free'], isAvailable: true, spicyLevel: 0 },
    { category: main._id, name: 'Chicken Curry', slug: 'chicken-curry', description: 'Traditional curry with basmati rice.', price: 18, images: [IMAGE], dietaryTags: ['spicy'], isAvailable: true, spicyLevel: 2 },
    { category: dessert._id, name: 'Chocolate Lava Cake', slug: 'chocolate-lava-cake', description: 'Warm cake with molten center.', price: 9, images: [IMAGE], dietaryTags: ['vegetarian'], isAvailable: true },
  ];
  for (const m of menuItems) {
    await MenuItem.findOneAndUpdate({ slug: m.slug }, m, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    });
  }

  console.log('CMS seed completed successfully.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
