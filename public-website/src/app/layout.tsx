import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { api } from '@/lib/api';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });

async function getWebsiteSettings() {
  try {
    return await api.getWebsiteSettings();
  } catch {
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getWebsiteSettings();
  
  return {
    title: {
      default: settings?.siteName || 'Luxury Hotel',
      template: `%s | ${settings?.siteName || 'Luxury Hotel'}`,
    },
    description: settings?.tagline || 'Experience luxury and comfort',
    keywords: ['hotel', 'luxury', 'accommodation', 'resort', 'booking'],
    openGraph: {
      type: 'website',
      locale: 'en_US',
      siteName: settings?.siteName || 'Luxury Hotel',
      images: ['/og-image.jpg'],
    },
    twitter: {
      card: 'summary_large_image',
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="min-h-screen flex flex-col font-sans antialiased">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
