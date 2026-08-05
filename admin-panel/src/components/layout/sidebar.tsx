'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  BedDouble,
  CalendarCheck,
  UtensilsCrossed,
  Images,
  PartyPopper,
  Tag,
  FileText,
  Users,
  Shield,
  Key,
  Home,
  Palette,
  Settings,
  Mail,
  Bell,
  BarChart3,
  FileBarChart,
  Sliders,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Bookings', href: '/dashboard/bookings', icon: CalendarCheck },
  { name: 'Rooms', href: '/dashboard/rooms', icon: BedDouble },
  { name: 'Restaurant', href: '/dashboard/restaurant', icon: UtensilsCrossed },
  { name: 'Menus', href: '/dashboard/menus', icon: FileText },
  { name: 'Gallery', href: '/dashboard/gallery', icon: Images },
  { name: 'Events', href: '/dashboard/events', icon: PartyPopper },
  { name: 'Offers', href: '/dashboard/offers', icon: Tag },
  { name: 'Blogs', href: '/dashboard/blogs', icon: FileText },
  { name: 'Users', href: '/dashboard/users', icon: Users },
  { name: 'Roles', href: '/dashboard/roles', icon: Shield },
  { name: 'Permissions', href: '/dashboard/permissions', icon: Key },
  { name: 'Homepage Builder', href: '/dashboard/homepage', icon: Home },
  { name: 'Theme Settings', href: '/dashboard/theme', icon: Palette },
  { name: 'Website Settings', href: '/dashboard/website', icon: Settings },
  { name: 'SEO', href: '/dashboard/seo', icon: BarChart3 },
  { name: 'Email Templates', href: '/dashboard/email-templates', icon: Mail },
  { name: 'Notification Templates', href: '/dashboard/notification-templates', icon: Bell },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Reports', href: '/dashboard/reports', icon: FileBarChart },
  { name: 'System Settings', href: '/dashboard/system', icon: Sliders },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col bg-card border-r">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg">
          <BedDouble className="h-6 w-6" />
          <span>Hotel Admin</span>
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
