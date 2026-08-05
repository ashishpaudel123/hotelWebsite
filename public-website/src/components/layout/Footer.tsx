import Link from 'next/link';
import { Facebook, Instagram, Twitter, Linkedin } from 'lucide-react';
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

export default async function Footer() {
  const settings = await getWebsiteSettings();

  if (!settings) {
    return (
      <footer className="bg-primary text-primary-foreground py-12">
        <div className="container mx-auto px-4">Loading...</div>
      </footer>
    );
  }

  const socialLinks = [
    settings.socialMedia?.facebook && { name: 'Facebook', icon: Facebook, href: settings.socialMedia.facebook },
    settings.socialMedia?.instagram && { name: 'Instagram', icon: Instagram, href: settings.socialMedia.instagram },
    settings.socialMedia?.twitter && { name: 'Twitter', icon: Twitter, href: settings.socialMedia.twitter },
    settings.socialMedia?.linkedin && { name: 'LinkedIn', icon: Linkedin, href: settings.socialMedia.linkedin },
  ].filter(Boolean) as Array<{ name: string; icon: React.ElementType; href: string }>;

  return (
    <footer className="bg-primary text-primary-foreground py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold">{settings.siteName}</h3>
            {settings.tagline && <p className="text-sm opacity-90">{settings.tagline}</p>}
            <div className="space-y-2 text-sm opacity-90">
              <p>{settings.contactInfo.address}</p>
              <p>Phone: {settings.contactInfo.phone}</p>
              <p>Email: {settings.contactInfo.email}</p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/rooms" className="hover:text-accent transition-colors">Rooms</Link></li>
              <li><Link href="/restaurant" className="hover:text-accent transition-colors">Restaurant</Link></li>
              <li><Link href="/events" className="hover:text-accent transition-colors">Events</Link></li>
              <li><Link href="/gallery" className="hover:text-accent transition-colors">Gallery</Link></li>
              <li><Link href="/blog" className="hover:text-accent transition-colors">Blog</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/spa" className="hover:text-accent transition-colors">Spa & Wellness</Link></li>
              <li><Link href="/gym" className="hover:text-accent transition-colors">Fitness Center</Link></li>
              <li><Link href="/pool" className="hover:text-accent transition-colors">Swimming Pool</Link></li>
              <li><Link href="/conference" className="hover:text-accent transition-colors">Conference Hall</Link></li>
              <li><Link href="/wedding" className="hover:text-accent transition-colors">Wedding Venue</Link></li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h4 className="font-semibold mb-4">Follow Us</h4>
            {socialLinks.length > 0 ? (
              <div className="flex space-x-4">
                {socialLinks.map((social) => (
                  <Link
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-accent transition-colors"
                    aria-label={social.name}
                  >
                    <social.icon className="h-6 w-6" />
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm opacity-90">No social media links available</p>
            )}
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-sm opacity-90">
          <p>&copy; {new Date().getFullYear()} {settings.siteName}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
