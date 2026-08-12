import Image from 'next/image';
import Link from 'next/link';
import { getMenuCategories, getMenuItems } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';

export const metadata = {
  title: 'Dining & Menu',
  description: 'Explore our restaurant menu',
};

export default async function RestaurantPage() {
  let categoriesData = { data: [] as any[] };
  let itemsData = { data: [] as any[] };

  try {
    [categoriesData, itemsData] = await Promise.all([
      getMenuCategories(),
      getMenuItems(),
    ]);
  } catch (error) {
    console.error('Failed to fetch menu:', error);
  }

  const categories = categoriesData?.data || [];
  const items = itemsData?.data || [];

  const itemsByCategory = categories.map((cat: any) => ({
    ...cat,
    items: items.filter((item: any) => item.category?._id === cat._id),
  }));

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold font-heading mb-4">Dining & Menu</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Savor a curated selection of local and international cuisine prepared by our chefs.
        </p>
      </div>

      {itemsByCategory.length === 0 ? (
        <p className="text-center text-muted-foreground">Our menu is being updated. Please check back soon.</p>
      ) : (
        itemsByCategory.map((cat: any) => (
          <section key={cat._id} className="mb-12">
            <h2 className="text-2xl font-bold font-heading mb-6">{cat.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {cat.items.map((item: any) => (
                <Card key={item._id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="text-lg font-semibold">{item.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {item.dietaryTags?.map((tag: string, i: number) => (
                            <Badge key={i} variant="secondary" className="text-xs capitalize">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xl font-bold text-primary">
                          {formatCurrency(item.price)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        ))
      )}

      <div className="text-center mt-8">
        <Link href="/contact" className="text-primary hover:underline">
          Have dietary requirements? Contact us
        </Link>
      </div>
    </div>
  );
}
