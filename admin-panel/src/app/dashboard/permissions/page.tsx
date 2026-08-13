'use client';

import { AdminLayout } from '@/components/layout/admin-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PermissionsPage() {
  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Permissions</h1>
          <p className="text-muted-foreground">Manage permissions</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Permissions Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] flex items-center justify-center text-muted-foreground">
              Permissions management content - to be implemented
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
