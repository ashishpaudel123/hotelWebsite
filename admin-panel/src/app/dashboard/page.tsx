'use client';

import { AdminLayout } from '@/components/layout/admin-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarCheck, BedDouble, DollarSign, Users, Loader2 } from 'lucide-react';
import { useDashboardStats } from '@/hooks/useApi';

const statsConfig = [
  { title: 'Active Bookings', key: 'totalBookings', icon: CalendarCheck, suffix: '' },
  { title: 'Total Rooms', key: 'totalRooms', icon: BedDouble, suffix: '' },
  { title: 'Revenue (MTD)', key: 'revenue', icon: DollarSign, prefix: '$', suffix: '' },
  { title: 'Total Guests', key: 'totalUsers', icon: Users, suffix: '' },
];

export default function DashboardPage() {
  const { data, isLoading, error } = useDashboardStats();

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64 text-red-500">
          Failed to load dashboard data
        </div>
      </AdminLayout>
    );
  }

  const stats = data?.data;

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your hotel performance</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statsConfig.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stat.prefix || ''}
                  {String(stats?.[stat.key as keyof typeof stats]?.toLocaleString?.() ?? stats?.[stat.key as keyof typeof stats] ?? 0)}
                  {stat.suffix || ''}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stat.key === 'revenue' ? 'Total revenue' : `Total ${stat.title.toLowerCase()}`}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Occupancy Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                {stats?.occupancy ? (
                  <div className="w-full space-y-2">
                    {Object.entries(stats.occupancy).map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between">
                        <span className="capitalize">{status}</span>
                        <span className="font-bold">{count}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  'No occupancy data available'
                )}
              </div>
            </CardContent>
          </Card>
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Recent Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.recentBookings?.length ? (
                  stats.recentBookings.map((booking) => (
                    <div key={booking._id} className="flex items-center justify-between border-b pb-4 last:border-0">
                      <div>
                        <p className="font-medium">{booking.bookingReference}</p>
                        <p className="text-sm text-muted-foreground">{booking.customer}</p>
                      </div>
                      <span className="text-sm font-medium text-green-600 capitalize">
                        {booking.status.replace('_', ' ')}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">No recent bookings</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
