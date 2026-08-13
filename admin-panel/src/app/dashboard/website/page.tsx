'use client';

import { AdminLayout } from '@/components/layout/admin-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function WebsitePage() {
  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Website Settings</h1>
          <p className="text-muted-foreground">Configure website settings</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Website Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] flex items-center justify-center text-muted-foreground">
              Website settings content - to be implemented
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
