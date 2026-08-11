'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function HeaderAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    setIsLoggedIn(false);
    router.push('/');
  };

  if (!isLoggedIn) {
    return (
      <div className="hidden md:flex items-center space-x-4">
        <Link href="/login">
          <Button size="sm">Sign In</Button>
        </Link>
        <Link href="/register">
          <Button size="sm" variant="outline">Register</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="hidden md:flex items-center space-x-4">
      <Link href="/rooms">
        <Button size="sm">Book Now</Button>
      </Link>
      <button
        onClick={handleLogout}
        className="text-sm font-medium hover:text-primary transition-colors"
      >
        Logout
      </button>
    </div>
  );
}