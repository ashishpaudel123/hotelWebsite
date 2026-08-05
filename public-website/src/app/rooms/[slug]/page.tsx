import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { api } from '@/lib/api';
import { Room, SEO } from '@/types';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getRoomBySlug(slug: string): Promise<Room | null> {
  try {
    return await api.getRoomBySlug(slug);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const room = await getRoomBySlug(slug);

  if (!room) {
    return {
      title: 'Room Not Found',
    };
  }

  return {
    title: room.roomType.name,
    description: room.roomType.description,
    openGraph: {
      images: room.roomType.images?.[0] ? [{ url: room.roomType.images[0] }] : [],
    },
  };
}

export default async function RoomDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const room = await getRoomBySlug(slug);

  if (!room) {
    notFound();
  }

  return (
    <div className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        {/* Image Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <div className="relative h-[400px] md:h-[500px] rounded-lg overflow-hidden">
            {room.roomType.images?.[0] ? (
              <Image
                src={room.roomType.images[0]}
                alt={room.roomType.name}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400">No Image</span>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {room.roomType.images?.slice(1, 5).map((image, index) => (
              <div key={index} className="relative h-[200px] rounded-lg overflow-hidden">
                <Image
                  src={image}
                  alt={`${room.roomType.name} view ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 font-serif">
                {room.roomType.name}
              </h1>
              <div className="flex items-center gap-4 text-lg">
                <span className="font-semibold text-primary">
                  ${room.roomType.basePrice}
                  <span className="text-base font-normal opacity-80">/night</span>
                </span>
                <span className="opacity-60">•</span>
                <span className="opacity-80">Room {room.roomNumber}</span>
                <span className="opacity-60">•</span>
                <span className="opacity-80">Floor {room.floor}</span>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4">Description</h2>
              <p className="text-lg opacity-80 leading-relaxed">
                {room.roomType.description}
              </p>
            </div>

            {/* Amenities */}
            {room.roomType.amenities && room.roomType.amenities.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold mb-4">Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {room.roomType.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-accent" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="opacity-80">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Room Details */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-semibold mb-4">Room Details</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm opacity-60">Max Occupancy</p>
                    <p className="font-semibold">{room.roomType.maxOccupancy} Guests</p>
                  </div>
                  <div>
                    <p className="text-sm opacity-60">Room Number</p>
                    <p className="font-semibold">{room.roomNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm opacity-60">Floor</p>
                    <p className="font-semibold">{room.floor}</p>
                  </div>
                  <div>
                    <p className="text-sm opacity-60">Status</p>
                    <p className="font-semibold capitalize">{room.status}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Book Your Stay</h3>
                  <p className="text-sm opacity-80">Best price guaranteed</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Check-in</label>
                    <input
                      type="date"
                      className="w-full px-4 py-2 border rounded-md bg-background"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Check-out</label>
                    <input
                      type="date"
                      className="w-full px-4 py-2 border rounded-md bg-background"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Guests</label>
                    <select className="w-full px-4 py-2 border rounded-md bg-background">
                      {Array.from({ length: room.roomType.maxOccupancy }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1} {i === 0 ? 'Guest' : 'Guests'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <Button className="w-full" size="lg">
                  Check Availability
                </Button>

                <p className="text-xs text-center opacity-60">
                  No payment required now
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
