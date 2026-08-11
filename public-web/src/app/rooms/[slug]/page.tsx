import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Wifi, ArrowLeft } from 'lucide-react';
import { getRoomBySlug, getRooms } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import BookingForm from '@/components/booking/BookingForm';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  try {
    const rooms = await getRooms();
    const slugs = rooms
      .filter((room) => room.roomType?.slug)
      .map((room) => room.roomType!.slug);
    return [...new Set(slugs)].map((slug) => ({ slug }));
  } catch (error) {
    console.error('Failed to generate static params:', error);
    return [];
  }
}

export async function generateMetadata({ params }: PageProps) {
  const resolvedParams = await params;
  try {
    const room = await getRoomBySlug(resolvedParams.slug);
    return {
      title: room.roomType?.name || 'Room Details',
      description: room.roomType?.description || 'Luxury room details',
    };
  } catch {
    return {
      title: 'Room Not Found',
    };
  }
}

export default async function RoomDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  
  let room;
  try {
    room = await getRoomBySlug(resolvedParams.slug);
  } catch (error) {
    console.error('Failed to fetch room:', error);
    notFound();
  }

  if (!room) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Back Link */}
      <Link href="/rooms" className="inline-flex items-center text-muted-foreground hover:text-primary mb-8">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Rooms
      </Link>

      {/* Image Gallery */}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="relative h-[400px] md:h-[500px] rounded-lg overflow-hidden">
          <Image
            src={room.images?.[0] || '/placeholder-room.jpg'}
            alt={room.roomType?.name || 'Room'}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {room.images?.slice(1, 5).map((image: string, index: number) => (
            <div key={index} className="relative h-[200px] rounded-lg overflow-hidden">
              <Image
                src={image || '/placeholder-room.jpg'}
                alt={`${room.roomType?.name} view ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="grid lg:grid-cols-3 gap-12">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <Badge className="mb-4">{room.roomType?.name || 'Standard'}</Badge>
            <h1 className="text-4xl font-bold font-heading mb-4">
              {room.roomType?.name || 'Room'} {room.roomNumber}
            </h1>
            <p className="text-lg text-muted-foreground">
              {room.roomType?.description || 'Luxurious accommodation with modern amenities'}
            </p>
          </div>

          {/* Amenities */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Amenities</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {room.roomType?.amenities?.map((amenity: string, index: number) => (
                <div key={index} className="flex items-center gap-2">
                  <Wifi className="h-5 w-5 text-primary" />
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Policies */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Policies</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Check-in: 2:00 PM</li>
              <li>• Check-out: 11:00 AM</li>
              <li>• Free cancellation up to 24 hours before arrival</li>
              <li>• No smoking</li>
              <li>• Pets allowed upon request</li>
            </ul>
          </div>
        </div>

        {/* Booking Sidebar */}
        <div className="lg:col-span-1">
          <BookingForm room={room} />
        </div>
      </div>
    </div>
  );
}
