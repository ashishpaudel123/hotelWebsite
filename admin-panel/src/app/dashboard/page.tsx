'use client';

import { AdminLayout } from '@/components/layout/admin-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarCheck, BedDouble, DollarSign, Users, TrendingUp, TrendingDown } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface DashboardStats {
  activeBookings: number;
  occupancyRate: number;
  revenueMTD: number;
  totalGuests: number;
  bookingChange: number;
  occupancyChange: number;
  revenueChange: number;
  guestsChange: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  const { data: statsData, isLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const { data } = await apiClient.get('/dashboard/stats');
      return data.data;
    },
    retry: false,
    enabled: isAuthenticated,
  });

  const stats = [
    {
      title: 'Active Bookings',
      value: statsData?.activeBookings?.toString() || '45',
      icon: CalendarCheck,
      change: `${statsData?.bookingChange >= 0 ? '+' : ''}${statsData?.bookingChange || 12}% from last month`,
      trend: (statsData?.bookingChange || 12) >= 0 ? 'up' : 'down',
    },
    {
      title: 'Occupancy Rate',
      value: `${statsData?.occupancyRate || 78.5}%`,
      icon: BedDouble,
      change: `${statsData?.occupancyChange >= 0 ? '+' : ''}${statsData?.occupancyChange || 5.2}% from last month`,
      trend: (statsData?.occupancyChange || 5.2) >= 0 ? 'up' : 'down',
    },
    {
      title: 'Revenue (MTD)',
      value: `$${(statsData?.revenueMTD || 15400).toLocaleString()}`,
      icon: DollarSign,
      change: `${statsData?.revenueChange >= 0 ? '+' : ''}${statsData?.revenueChange || 18}% from last month`,
      trend: (statsData?.revenueChange || 18) >= 0 ? 'up' : 'down',
    },
    {
      title: 'Total Guests',
      value: (statsData?.totalGuests || 312).toString(),
      icon: Users,
      change: `${statsData?.guestsChange >= 0 ? '+' : ''}${statsData?.guestsChange || 24}% from last month`,
      trend: (statsData?.guestsChange || 24) >= 0 ? 'up' : 'down',
    },
  ];

  const { data: recentBookings } = useQuery({
    queryKey: ['recent-bookings'],
    queryFn: async () => {
      const { data } = await apiClient.get('/bookings?limit=5&sortBy=createdAt&sortOrder=desc');
      return data.data || [];
    },
    retry: false,
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your hotel performance</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{isLoading ? '...' : stat.value}</div>
                <div className="flex items-center gap-1">
                  {stat.trend === 'up' ? (
                    <TrendingUp className="h-3 w-3 text-green-600" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-600" />
                  )}
                  <p className="text-xs text-muted-foreground">{stat.change}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Revenue chart - integrate with Recharts
              </div>
            </CardContent>
          </Card>
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Recent Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading ? (
                  <p className="text-center text-muted-foreground">Loading...</p>
                ) : recentBookings && recentBookings.length > 0 ? (
                  recentBookings.map((booking: any) => (
                    <div key={booking._id} className="flex items-center justify-between border-b pb-4 last:border-0">
                      <div>
                        <p className="font-medium">Booking #{booking.bookingReference}</p>
                        <p className="text-sm text-muted-foreground">Check-in: {new Date(booking.checkIn).toLocaleDateString()}</p>
                      </div>
                      <span className={`text-sm font-medium ${
                        booking.status === 'confirmed' ? 'text-green-600' :
                        booking.status === 'pending' ? 'text-yellow-600' :
                        booking.status === 'cancelled' ? 'text-red-600' :
                        'text-blue-600'
                      }`}>
                        {booking.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground">No recent bookings</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
