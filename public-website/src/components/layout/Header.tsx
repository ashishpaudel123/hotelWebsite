import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { WebsiteSettings } from '@/types';

async function getWebsiteSettings(): Promise<WebsiteSettings | null> {
  try {
    return await api.getWebsiteSettings();
  } catch (error) {
    console.error('Failed to fetch website settings:', error);
    return null;
  }
}

export default async function Header() {
  const settings = await getWebsiteSettings();

  if (!settings) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="font-bold text-xl">Loading...</div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          {settings.logo ? (
            <Image
              src={settings.logo}
              alt={settings.siteName}
              width={120}
              height={40}
              className="h-10 w-auto object-contain"
              priority
            />
          ) : (
            <span className="font-bold text-xl text-primary">{settings.siteName}</span>
          )}
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/rooms" className="text-sm font-medium hover:text-primary transition-colors">
            Rooms
          </Link>
          <Link href="/restaurant" className="text-sm font-medium hover:text-primary transition-colors">
            Restaurant
          </Link>
          <Link href="/events" className="text-sm font-medium hover:text-primary transition-colors">
            Events
          </Link>
          <Link href="/gallery" className="text-sm font-medium hover:text-primary transition-colors">
            Gallery
          </Link>
          <Link href="/blog" className="text-sm font-medium hover:text-primary transition-colors">
            Blog
          </Link>
          <Link href="/contact" className="text-sm font-medium hover:text-primary transition-colors">
            Contact
          </Link>
        </nav>

        {/* CTA Button */}
        <div className="hidden md:flex items-center space-x-4">
          <Button size="sm">Book Now</Button>
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden p-2" aria-label="Toggle menu">
          <Menu className="h-6 w-6" />
        </button>
      </div>
    </header>
  );
}
