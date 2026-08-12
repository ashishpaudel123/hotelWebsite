import { getWebsiteSettings } from '@/lib/api';

export const metadata = {
  title: 'Contact Us',
  description: 'Get in touch with our hotel',
};

export default async function ContactPage() {
  let settings;
  try {
    settings = await getWebsiteSettings();
  } catch (error) {
    console.error('Failed to fetch settings:', error);
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold font-heading mb-4">Contact Us</h1>
        <p className="text-lg text-muted-foreground">
          We would love to hear from you.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold font-heading">Hotel Information</h2>
          {settings?.contactInfo?.address && (
            <p className="text-muted-foreground">📍 {settings.contactInfo.address}</p>
          )}
          {settings?.contactInfo?.phone && (
            <p className="text-muted-foreground">
              📞 <a href={`tel:${settings.contactInfo.phone}`} className="hover:text-primary">{settings.contactInfo.phone}</a>
            </p>
          )}
          {settings?.contactInfo?.email && (
            <p className="text-muted-foreground">
              ✉️ <a href={`mailto:${settings.contactInfo.email}`} className="hover:text-primary">{settings.contactInfo.email}</a>
            </p>
          )}
          {settings?.contactInfo?.businessHours && (
            <p className="text-muted-foreground">🕒 {settings.contactInfo.businessHours}</p>
          )}
        </div>

        <form className="space-y-4">
          <input
            type="text"
            placeholder="Your Name"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
          <input
            type="email"
            placeholder="Your Email"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
          <textarea
            placeholder="Your Message"
            rows={5}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground h-10 px-4 text-sm font-medium hover:bg-primary/90"
          >
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
}
