import Image from 'next/image';
import Link from 'next/link';
import { getHomepageSections, getWebsiteSettings } from '@/lib/api';
import { Button } from '@/components/ui/button';

export default async function HomePage() {
  let sections;
  let settings;
  
  try {
    [sections, settings] = await Promise.all([
      getHomepageSections(),
      getWebsiteSettings(),
    ]);
  } catch (error) {
    console.error('Failed to fetch homepage data:', error);
    sections = [];
    settings = null;
  }

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero-bg.jpg"
            alt={settings?.siteName || 'Hotel'}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>
        
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold font-heading mb-6 animate-fade-in-up">
            {settings?.tagline || 'Experience Luxury'}
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Welcome to {settings?.siteName || 'Our Hotel'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8">
              Book Your Stay
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent text-white border-white hover:bg-white hover:text-black">
              Explore Rooms
            </Button>
          </div>
        </div>
      </section>

      {/* Dynamic Sections from CMS */}
      {sections?.map((section) => (
        <section
          key={section._id}
          className="py-16 md:py-24"
          style={{
            backgroundColor: section.backgroundColor || undefined,
            color: section.textColor || undefined,
          }}
        >
          <div className="container mx-auto px-4">
            {section.sectionKey === 'about' && (
              <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-3xl md:text-4xl font-bold font-heading mb-6">
                  {section.title}
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  {section.content}
                </p>
                {section.media?.[0] && (
                  <Image
                    src={section.media[0]}
                    alt={section.title || 'About'}
                    width={800}
                    height={400}
                    className="rounded-lg mx-auto"
                  />
                )}
              </div>
            )}

            {section.sectionKey === 'rooms' && (
              <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">
                  {section.title}
                </h2>
                <p className="text-muted-foreground mb-12 max-w-2xl mx-auto">
                  {section.subtitle}
                </p>
                <Link href="/rooms">
                  <Button size="lg">View All Rooms</Button>
                </Link>
              </div>
            )}

            {section.sectionKey === 'testimonials' && (
              <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">
                  {section.title}
                </h2>
                <div className="grid md:grid-cols-3 gap-8 mt-12">
                  {/* Testimonial cards would be mapped here */}
                  <div className="p-6 bg-card rounded-lg shadow">
                    <p className="italic mb-4">"Amazing experience!"</p>
                    <p className="font-semibold">- Happy Guest</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      ))}

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">
            Ready to Book Your Stay?
          </h2>
          <p className="text-lg mb-8 opacity-90">
            Experience unparalleled luxury and service
          </p>
          <Button size="lg" variant="secondary" className="text-lg px-8">
            Reserve Now
          </Button>
        </div>
      </section>
    </div>
  );
}
