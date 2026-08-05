import type { Metadata } from 'next';
import { Playfair_Display, Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { getWebsiteSettings, getThemeSettings } from '@/lib/api';

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
});

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

export async function generateMetadata(): Promise<Metadata> {
  let settings;
  try {
    settings = await getWebsiteSettings();
  } catch (error) {
    console.error('Failed to fetch settings:', error);
  }

  return {
    title: {
      default: settings?.siteName || 'Luxury Hotel',
      template: `%s | ${settings?.siteName || 'Luxury Hotel'}`,
    },
    description: settings?.tagline || 'Experience luxury and comfort',
    keywords: ['hotel', 'luxury', 'accommodation', 'resort'],
    authors: [{ name: settings?.siteName || 'Hotel' }],
    openGraph: {
      type: 'website',
      locale: 'en_US',
      siteName: settings?.siteName || 'Hotel',
      images: [settings?.socialMedia?.ogImage || '/og-image.jpg'].filter(Boolean),
    },
    twitter: {
      card: 'summary_large_image',
      site: settings?.socialMedia?.twitter,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let themeSettings;
  try {
    themeSettings = await getThemeSettings();
  } catch (error) {
    console.error('Failed to fetch theme settings:', error);
  }

  const cssVariables = {
    '--primary': themeSettings?.primaryColor || '222.2 47.4% 11.2%',
    '--secondary': themeSettings?.secondaryColor || '210 40% 96.1%',
    '--accent': themeSettings?.accentColor || '210 40% 96.1%',
  } as React.CSSProperties;

  return (
    <html lang="en" suppressHydrationWarning>
      <body 
        className={`${playfair.variable} ${inter.variable} font-body antialiased`}
        style={cssVariables}
      >
        <div className="relative flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
