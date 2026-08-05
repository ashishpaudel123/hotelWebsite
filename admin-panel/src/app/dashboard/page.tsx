'use client';

import { AdminLayout } from '@/components/layout/admin-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarCheck, BedDouble, DollarSign, Users } from 'lucide-react';

const stats = [
  {
    title: 'Active Bookings',
    value: '45',
    icon: CalendarCheck,
    change: '+12% from last month',
  },
  {
    title: 'Occupancy Rate',
    value: '78.5%',
    icon: BedDouble,
    change: '+5.2% from last month',
  },
  {
    title: 'Revenue (MTD)',
    value: '$15,400',
    icon: DollarSign,
    change: '+18% from last month',
  },
  {
    title: 'Total Guests',
    value: '312',
    icon: Users,
    change: '+24% from last month',
  },
];

export default function DashboardPage() {
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
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.change}</p>
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
                Revenue chart placeholder - integrate with Recharts
              </div>
            </CardContent>
          </Card>
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Recent Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center justify-between border-b pb-4 last:border-0">
                    <div>
                      <p className="font-medium">Booking #{2023000 + i}</p>
                      <p className="text-sm text-muted-foreground">Check-in: Nov {i}, 2023</p>
                    </div>
                    <span className="text-sm font-medium text-green-600">Confirmed</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
