import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getWebsiteSettings } from '@/lib/api';

interface MenuItem {
  label: string;
  href: string;
}

export default async function Header() {
  let settings;
  try {
    settings = await getWebsiteSettings();
  } catch (error) {
    console.error('Failed to fetch website settings:', error);
  }

  const menuItems: MenuItem[] = [
    { label: 'Home', href: '/' },
    { label: 'Rooms', href: '/rooms' },
    { label: 'Restaurant', href: '/restaurant' },
    { label: 'Events', href: '/events' },
    { label: 'Gallery', href: '/gallery' },
    { label: 'Blog', href: '/blog' },
    { label: 'Contact', href: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          {settings?.logo ? (
            <Image
              src={settings.logo}
              alt={settings.siteName || 'Hotel Logo'}
              width={120}
              height={40}
              className="h-10 w-auto object-contain"
              priority
            />
          ) : (
            <span className="text-xl font-bold font-heading">
              {settings?.siteName || 'Hotel'}
            </span>
          )}
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
          <Button size="sm">Book Now</Button>
        </nav>

        {/* Mobile Menu Button */}
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </div>
    </header>
  );
}
