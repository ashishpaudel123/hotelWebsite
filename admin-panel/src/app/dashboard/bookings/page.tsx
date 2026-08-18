'use client';

import { AdminLayout } from '@/components/layout/admin-layout';
import { DataTable } from '@/components/data-table/data-table';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import { useBookings } from '@/hooks/useApi';
import { Booking } from '@/types';

export default function BookingsPage() {
  // In production, implement proper pagination and filters
  const { data, isLoading } = useBookings({ page: 1, limit: 20 });

  const columns: ColumnDef<Booking>[] = [
    {
      accessorKey: 'bookingReference',
      header: 'Reference',
      cell: ({ row }) => <span className="font-medium">{row.getValue('bookingReference')}</span>,
    },
    {
      accessorKey: 'guestDetails',
      header: 'Guest',
      cell: ({ row }) => {
        const guest = row.original.guestDetails || row.original.customerId;
        const name = 'firstName' in guest && guest.firstName && guest.lastName 
          ? `${guest.firstName} ${guest.lastName}`
          : 'name' in guest && guest.name ? guest.name : 'Unknown';
        const email = guest?.email || '';
        return (
          <div>
            <p className="font-medium">{name}</p>
            <p className="text-sm text-muted-foreground">{email}</p>
          </div>
        );
      },
    },
    {
      accessorKey: 'checkIn',
      header: 'Check-in',
      cell: ({ row }) => new Date(row.getValue('checkIn')).toLocaleDateString(),
    },
    {
      accessorKey: 'checkOut',
      header: 'Check-out',
      cell: ({ row }) => new Date(row.getValue('checkOut')).toLocaleDateString(),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        const colors: Record<string, string> = {
          pending: 'bg-yellow-100 text-yellow-800',
          confirmed: 'bg-green-100 text-green-800',
          checked_in: 'bg-blue-100 text-blue-800',
          checked_out: 'bg-gray-100 text-gray-800',
          cancelled: 'bg-red-100 text-red-800',
          failed: 'bg-red-100 text-red-800',
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100'}`}>
            {status.replace('_', ' ')}
          </span>
        );
      },
    },
    {
      accessorKey: 'pricing',
      header: 'Total',
      cell: ({ row }) => {
        const pricing = row.getValue('pricing') as { total?: number; currency?: string } | undefined;
        const total = pricing?.total ?? 0;
        const currency = pricing?.currency || 'NPR';
        return <span>{currency === 'NPR' ? 'NPR' : '$'} {total.toLocaleString()}</span>;
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <Button variant="outline" size="sm">
          View Details
        </Button>
      ),
    },
  ];

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <p>Loading bookings...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Bookings</h1>
            <p className="text-muted-foreground">Manage all hotel reservations</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Booking
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={data?.data || []}
          searchKey="bookingReference"
          searchPlaceholder="Search by reference..."
        />
      </div>
    </AdminLayout>
  );
}
