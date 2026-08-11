import Image from 'next/image';
import Link from 'next/link';
import { Users } from 'lucide-react';
import { getRooms } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { Room } from '@/types';

export const metadata = {
  title: 'Rooms & Suites',
  description: 'Explore our luxurious rooms and suites',
};

export default async function RoomsPage() {
  let rooms: Room[] = [];
  try {
    rooms = await getRooms({ status: 'available' });
  } catch (error) {
    console.error('Failed to fetch rooms:', error);
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold font-heading mb-4">
          Rooms & Suites
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Discover our carefully designed accommodations featuring modern amenities 
          and luxurious comforts for an unforgettable stay.
        </p>
      </div>

      {/* Filters would go here */}
      
      {/* Room Grid */}
      {rooms.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground mb-4">No rooms available at the moment</p>
          <Button asChild>
            <Link href="/contact">Contact Us</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {rooms.map((room) => (
            <Card key={room._id} className="overflow-hidden group hover:shadow-lg transition-shadow">
              <div className="relative h-64 overflow-hidden">
                <Image
                  src={room.images?.[0] || '/placeholder-room.jpg'}
                  alt={room.roomType?.name || 'Room'}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <Badge className="absolute top-4 right-4">
                  {room.roomType?.name || 'Standard'}
                </Badge>
              </div>
              
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2">
                  {room.roomType?.name || 'Room'} {room.roomNumber}
                </h3>
                
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                  {room.roomType?.description || 'Luxurious room with modern amenities'}
                </p>
                
                {/* Amenities */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {room.roomType?.amenities?.slice(0, 4).map((amenity: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {amenity}
                    </Badge>
                  ))}
                </div>
                
                {/* Capacity & Price */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{room.roomType?.maxOccupancy || 2} Guests</span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-primary">
                      {formatCurrency(room.roomType?.basePrice || 0)}
                    </span>
                    <span className="text-sm text-muted-foreground">/night</span>
                  </div>
                </div>
                
                <Button asChild className="w-full">
                  <Link href={`/rooms/${room.roomType?.slug || 'room'}`}>
                    View Details
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
