import { Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { Room } from '@/types';

async function RoomsList() {
  const rooms: Room[] = await api.getRooms();

  if (rooms.length === 0) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-semibold mb-4">No rooms available</h2>
        <p className="opacity-80">Please check back later or contact us for more information.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {rooms.map((room) => (
        <Card key={room._id} className="overflow-hidden group">
          <Link href={`/rooms/${room.roomType.slug}`}>
            <div className="relative h-64 overflow-hidden">
              {room.roomType.images?.[0] ? (
                <Image
                  src={room.roomType.images[0]}
                  alt={room.roomType.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">No Image</span>
                </div>
              )}
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-sm font-semibold">
                ${room.roomType.basePrice}/night
              </div>
            </div>
            <CardHeader>
              <CardTitle className="text-xl">{room.roomType.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm opacity-80 mb-4 line-clamp-2">
                {room.roomType.description}
              </p>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Max {room.roomType.maxOccupancy} guests
                </span>
                <Button size="sm">View Details</Button>
              </div>
            </CardContent>
          </Link>
        </Card>
      ))}
    </div>
  );
}

function RoomsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Card key={i} className="overflow-hidden">
          <div className="relative h-64 bg-gray-200 animate-pulse" />
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="h-4 bg-gray-200 rounded w-full mb-2 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default async function RoomsPage() {
  return (
    <div className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-serif">Our Rooms & Suites</h1>
          <p className="text-lg opacity-80 max-w-2xl mx-auto">
            Discover our luxurious accommodations designed for your comfort and relaxation
          </p>
        </div>

        {/* Filters would go here - connected to backend API */}
        <div className="mb-8 flex flex-wrap gap-4 justify-center">
          <select className="px-4 py-2 border rounded-md bg-background">
            <option value="">All Room Types</option>
            <option value="deluxe">Deluxe</option>
            <option value="suite">Suite</option>
            <option value="penthouse">Penthouse</option>
          </select>
          <select className="px-4 py-2 border rounded-md bg-background">
            <option value="">Price Range</option>
            <option value="0-100">$0 - $100</option>
            <option value="100-200">$100 - $200</option>
            <option value="200+">$200+</option>
          </select>
        </div>

        <Suspense fallback={<RoomsSkeleton />}>
          <RoomsList />
        </Suspense>
      </div>
    </div>
  );
}
