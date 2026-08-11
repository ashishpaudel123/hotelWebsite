import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { api } from '@/lib/api';
import { BookingResult } from '@/types';

interface PageProps {
  params: Promise<{ reference: string }>;
}

async function getBookingByReference(reference: string): Promise<BookingResult | null> {
  try {
    return await api.getBookingByReference(reference);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps) {
  const { reference } = await params;
  const booking = await getBookingByReference(reference);

  if (!booking) {
    return { title: 'Booking Not Found' };
  }

  return {
    title: `Booking ${booking.bookingReference}`,
    description: `Booking confirmation for ${booking.bookingReference}`,
  };
}

export default async function BookingConfirmationPage({ params }: PageProps) {
  const { reference } = await params;
  const booking = await getBookingByReference(reference);

  if (!booking) {
    notFound();
  }

  const nights = Math.round(
    (new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="py-12 md:py-16">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Booking Confirmed!</h1>
          <p className="text-lg opacity-80">
            Reference: <span className="font-semibold">{booking.bookingReference}</span>
          </p>
        </div>

        <Card>
          <CardContent className="p-6 md:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Booking Details</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="opacity-80">Status</span>
                    <span className="font-medium capitalize">{booking.status.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-80">Payment</span>
                    <span className="font-medium capitalize">{booking.paymentStatus}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-80">Nights</span>
                    <span className="font-medium">{nights}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Guest Information</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="opacity-80">Name</span>
                    <span className="font-medium">
                      {booking.guestDetails.firstName} {booking.guestDetails.lastName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-80">Email</span>
                    <span className="font-medium">{booking.guestDetails.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-80">Phone</span>
                    <span className="font-medium">{booking.guestDetails.phone}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Stay Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="opacity-80">Check-in</span>
                  <span className="font-medium">{new Date(booking.checkIn).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-80">Check-out</span>
                  <span className="font-medium">{new Date(booking.checkOut).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-80">Room</span>
                  <span className="font-medium">{booking.rooms[0]?.roomType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-80">Quantity</span>
                  <span className="font-medium">{booking.rooms[0]?.quantity}</span>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Price Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="opacity-80">Subtotal</span>
                  <span className="font-medium">${booking.pricing.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-80">Tax</span>
                  <span className="font-medium">${booking.pricing.tax.toFixed(2)}</span>
                </div>
                {booking.pricing.discount > 0 && (
                  <div className="flex justify-between">
                    <span className="opacity-80">Discount</span>
                    <span className="font-medium text-green-600">-${booking.pricing.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-3 border-t">
                  <span>Total</span>
                  <span>${booking.pricing.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {booking.guestDetails.specialRequests && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-2">Special Requests</h3>
                <p className="text-sm opacity-80">{booking.guestDetails.specialRequests}</p>
              </div>
            )}

            <div className="border-t pt-6 text-center">
              <p className="text-sm opacity-80 mb-4">
                A confirmation email will be sent to your email address.
                Please keep your booking reference for check-in.
              </p>
              <Link href="/rooms" className="inline-flex items-center justify-center rounded-md font-medium transition-colors bg-primary text-white hover:bg-primary/90 h-11 px-8 text-lg">
                Return to Rooms
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}