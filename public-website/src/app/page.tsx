import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { HomepageSection, Room } from '@/types';

async function getHomepageSections() {
  try {
    return await api.getHomepageSections();
  } catch {
    return [];
  }
}

async function getFeaturedRooms() {
  try {
    const rooms = await api.getRooms({ limit: '3', status: 'available' });
    return rooms || [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const sections = await getHomepageSections();
  const rooms = await getFeaturedRooms();

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30 z-10" />
        <Image
          src="/hero-placeholder.jpg"
          alt="Luxury Hotel"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="relative z-20 text-center text-white px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 font-serif">
            Experience Luxury & Comfort
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Your perfect getaway awaits in the heart of paradise
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8">Book Your Stay</Button>
            <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent border-white text-white hover:bg-white hover:text-primary">
              Explore Rooms
            </Button>
          </div>
        </div>
      </section>

      {/* Dynamic Sections from CMS */}
      {sections
        .filter((section) => section.isVisible)
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .map((section) => (
          <section
            key={section._id}
            className="py-16 md:py-24"
            style={{
              backgroundColor: section.backgroundColor || undefined,
              color: section.textColor || undefined,
            }}
          >
            <div className="container mx-auto px-4">
              {section.title && (
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 font-serif">
                  {section.title}
                </h2>
              )}
              {section.subtitle && (
                <p className="text-lg text-center mb-12 opacity-80">{section.subtitle}</p>
              )}
              <div
                className="max-w-4xl mx-auto prose prose-lg"
                dangerouslySetInnerHTML={{ __html: section.content }}
              />
              {section.media && section.media.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
                  {section.media.map((image: string, index: number) => (
                    <Image
                      key={index}
                      src={image}
                      alt={`${section.title} image ${index + 1}`}
                      width={400}
                      height={300}
                      className="rounded-lg object-cover w-full h-64"
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        ))}

      {/* Featured Rooms */}
      <section className="py-16 md:py-24 bg-secondary/20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 font-serif">
            Our Featured Rooms
          </h2>
          <p className="text-lg text-center mb-12 opacity-80">
            Discover our luxurious accommodations
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rooms.map((room) => (
              <Link key={room._id} href={`/rooms/${room.roomType.slug}`}>
                <div className="group cursor-pointer">
                  <div className="relative h-64 rounded-lg overflow-hidden mb-4">
                    {room.roomType.images?.[0] ? (
                      <Image
                        src={room.roomType.images[0]}
                        alt={room.roomType.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400">No Image</span>
                      </div>
                    )}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{room.roomType.name}</h3>
                  <p className="text-sm opacity-80 mb-3 line-clamp-2">
                    {room.roomType.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-primary">
                      ${room.roomType.basePrice}
                      <span className="text-sm font-normal opacity-80">/night</span>
                    </span>
                    <Button size="sm">View Details</Button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/rooms">
              <Button size="lg" variant="outline">View All Rooms</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 font-serif">
            Ready to Book Your Stay?
          </h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Experience unparalleled luxury and service. Book now and get the best rates guaranteed.
          </p>
          <Button size="lg" className="bg-accent text-white hover:bg-accent/90">
            Book Now
          </Button>
        </div>
      </section>
    </div>
  );
}
