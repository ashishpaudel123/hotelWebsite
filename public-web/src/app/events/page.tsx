import Image from 'next/image';
import Link from 'next/link';
import { getEvents } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Events',
  description: 'Upcoming events at our hotel',
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default async function EventsPage() {
  let eventsData = { data: [] as any[] };
  try {
    eventsData = await getEvents();
  } catch (error) {
    console.error('Failed to fetch events:', error);
  }

  const events = eventsData?.data || [];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold font-heading mb-4">Events</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Join us for memorable experiences throughout the year.
        </p>
      </div>

      {events.length === 0 ? (
        <p className="text-center text-muted-foreground">No upcoming events at the moment.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event: any) => (
            <Card key={event._id} className="overflow-hidden flex flex-col">
              <div className="relative h-48 bg-muted">
                {event.bannerImage && (
                  <Image
                    src={event.bannerImage}
                    alt={event.title}
                    fill
                    className="object-cover"
                  />
                )}
              </div>
              <CardContent className="p-6 flex-1 flex flex-col">
                <p className="text-sm text-muted-foreground mb-2">{formatDate(event.startDate)}</p>
                <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                <p className="text-muted-foreground text-sm mb-4 flex-1">{event.description}</p>
                <p className="text-sm text-muted-foreground mb-4">📍 {event.location}</p>
                {event.registrationLink && (
                  <Button asChild>
                    <Link href={event.registrationLink} target="_blank" rel="noopener noreferrer">
                      Register
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
