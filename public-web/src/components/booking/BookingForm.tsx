'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Room, BookingPayload, AvailabilityResult } from '@/types';
import { checkAvailability, createBooking } from '@/lib/api';

interface BookingFormProps {
  room: Room;
}

export default function BookingForm({ room }: BookingFormProps) {
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [availability, setAvailability] = useState<AvailabilityResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<{
    reference: string;
    total: number;
    guestName: string;
  } | null>(null);

  const today = new Date().toISOString().split('T')[0];

  const calculateNights = useCallback(() => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diff = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(diff, 0);
  }, [checkIn, checkOut]);

  const calculatePrice = useCallback(() => {
    const nights = calculateNights();
    if (nights <= 0) return 0;
    return room.roomType.basePrice * guests * nights;
  }, [calculateNights, guests, room.roomType.basePrice]);

  const handleCheckAvailability = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setAvailability(null);

    if (!checkIn || !checkOut) {
      setError('Please select check-in and check-out dates');
      return;
    }

    if (new Date(checkOut) <= new Date(checkIn)) {
      setError('Check-out must be after check-in');
      return;
    }

    setIsChecking(true);
    try {
      const result = await checkAvailability({
        roomId: room._id,
        checkIn,
        checkOut,
        quantity: guests,
      });
      setAvailability(result);
      if (!result.available) {
        setError(result.message);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to check availability');
    } finally {
      setIsChecking(false);
    }
  };

  const handleGuestSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;

    if (!firstName || !lastName || !email || !phone) {
      setError('Please fill in all required fields');
      return;
    }

    const payload: BookingPayload = {
      guestDetails: { firstName, lastName, email, phone },
      checkIn,
      checkOut,
      rooms: [{ roomId: room._id, roomType: room.roomType.name, quantity: guests }],
      source: 'website',
    };

    const token = localStorage.getItem('accessToken');
    if (!token) {
      setError('Please log in to complete your booking');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createBooking(payload);
      setConfirmation({
        reference: result.bookingReference,
        total: result.pricing.total,
        guestName: `${firstName} ${lastName}`,
      });
      setAvailability(null);
    } catch (err: any) {
      if (err.message?.includes('409') || err.message?.toLowerCase().includes('no longer available')) {
        setError('Room is no longer available for the selected dates. Please try different dates.');
      } else if (err.message?.includes('401')) {
        setError('Please log in to complete your booking');
      } else {
        setError(err.message || 'Failed to create booking. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (confirmation) {
    return (
      <Card className="sticky top-24">
        <CardContent className="p-6 space-y-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-2">Booking Confirmed!</h3>
            <p className="text-sm text-muted-foreground">Reference: <span className="font-semibold">{confirmation.reference}</span></p>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Guest</span>
              <span className="font-medium">{confirmation.guestName}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-3 border-t">
              <span>Total</span>
              <span>${confirmation.total.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="sticky top-24">
      <CardContent className="p-6 space-y-6">
        <div>
          <span className="text-3xl font-bold text-primary">{formatCurrency(room.roomType.basePrice)}</span>
          <span className="text-muted-foreground"> /night</span>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {availability?.available && !confirmation && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-700 font-medium">Room is available!</p>
            <p className="text-lg font-bold text-primary mt-1">${calculatePrice().toFixed(2)} total</p>
          </div>
        )}

        <form onSubmit={handleCheckAvailability} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Check-in</label>
            <input
              type="date"
              value={checkIn}
              onChange={(e) => { setCheckIn(e.target.value); setAvailability(null); setError(null); }}
              min={today}
              required
              className="w-full px-4 py-2 border rounded-md bg-background"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Check-out</label>
            <input
              type="date"
              value={checkOut}
              onChange={(e) => { setCheckOut(e.target.value); setAvailability(null); setError(null); }}
              min={checkIn || today}
              required
              className="w-full px-4 py-2 border rounded-md bg-background"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Guests</label>
            <select
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              className="w-full px-4 py-2 border rounded-md bg-background"
            >
              {Array.from({ length: room.roomType.maxOccupancy }, (_, i) => (
                <option key={i + 1} value={i + 1}>{i + 1} Guest{i > 0 ? 's' : ''}</option>
              ))}
            </select>
          </div>
          <Button type="submit" className="w-full" disabled={isChecking}>
            {isChecking ? 'Checking...' : 'Check Availability'}
          </Button>
        </form>

        {availability?.available && !confirmation && (
          <form onSubmit={handleGuestSubmit} className="space-y-4 pt-4 border-t">
            <h4 className="font-semibold">Guest Details</h4>
            <div className="grid grid-cols-2 gap-4">
              <input name="firstName" required placeholder="First Name" className="w-full px-4 py-2 border rounded-md bg-background" />
              <input name="lastName" required placeholder="Last Name" className="w-full px-4 py-2 border rounded-md bg-background" />
            </div>
            <input name="email" type="email" required placeholder="Email" className="w-full px-4 py-2 border rounded-md bg-background" />
            <input name="phone" type="tel" required placeholder="Phone" className="w-full px-4 py-2 border rounded-md bg-background" />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Booking...' : 'Confirm Booking'}
            </Button>
          </form>
        )}

        <p className="text-xs text-center text-muted-foreground">
          No payment required now
        </p>
      </CardContent>
    </Card>
  );
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}