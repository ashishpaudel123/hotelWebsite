import Link from 'next/link';
import { Facebook, Instagram, Twitter, Linkedin, Youtube } from 'lucide-react';
import { getWebsiteSettings } from '@/lib/api';

const socialIcons = {
  facebook: Facebook,
  instagram: Instagram,
  twitter: Twitter,
  linkedin: Linkedin,
  youtube: Youtube,
};

export default async function Footer() {
  let settings;
  try {
    settings = await getWebsiteSettings();
  } catch (error) {
    console.error('Failed to fetch website settings:', error);
  }

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-muted border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold font-heading">{settings?.siteName}</h3>
            <p className="text-sm text-muted-foreground">
              {settings?.tagline || 'Luxury accommodation and exceptional service'}
            </p>
            <div className="flex space-x-4">
              {settings?.socialMedia &&
                Object.entries(settings.socialMedia).map(([platform, url]) => {
                  if (!url) return null;
                  const Icon = socialIcons[platform as keyof typeof socialIcons];
                  if (!Icon) return null;
                  return (
                    <Link
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Icon className="h-5 w-5" />
                      <span className="sr-only">{platform}</span>
                    </Link>
                  );
                })}
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="font-semibold">Contact Us</h4>
            <address className="not-italic space-y-2 text-sm text-muted-foreground">
              {settings?.contactInfo?.address && (
                <p>{settings.contactInfo.address}</p>
              )}
              {settings?.contactInfo?.phone && (
                <p>
                  <Link href={`tel:${settings.contactInfo.phone}`} className="hover:text-primary">
                    {settings.contactInfo.phone}
                  </Link>
                </p>
              )}
              {settings?.contactInfo?.email && (
                <p>
                  <Link href={`mailto:${settings.contactInfo.email}`} className="hover:text-primary">
                    {settings.contactInfo.email}
                  </Link>
                </p>
              )}
            </address>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold">Quick Links</h4>
            <nav className="flex flex-col space-y-2 text-sm">
              <Link href="/rooms" className="text-muted-foreground hover:text-primary transition-colors">
                Rooms & Suites
              </Link>
              <Link href="/restaurant" className="text-muted-foreground hover:text-primary transition-colors">
                Dining
              </Link>
              <Link href="/events" className="text-muted-foreground hover:text-primary transition-colors">
                Events
              </Link>
              <Link href="/gallery" className="text-muted-foreground hover:text-primary transition-colors">
                Gallery
              </Link>
              <Link href="/blog" className="text-muted-foreground hover:text-primary transition-colors">
                Blog
              </Link>
              <Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                Contact
              </Link>
            </nav>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h4 className="font-semibold">Newsletter</h4>
            <p className="text-sm text-muted-foreground">
              Subscribe for exclusive offers and updates
            </p>
            <form className="flex space-x-2">
              <input
                type="email"
                placeholder="Your email"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-muted-foreground">
              © {currentYear} {settings?.siteName}. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm">
              <Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
