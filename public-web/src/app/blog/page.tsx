import Image from 'next/image';
import Link from 'next/link';
import { getBlogs } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Blog',
  description: 'Stories, guides, and news from our hotel',
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default async function BlogPage() {
  let blogsData = { data: [] as any[] };
  try {
    blogsData = await getBlogs(9);
  } catch (error) {
    console.error('Failed to fetch blogs:', error);
  }

  const posts = blogsData?.data || [];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold font-heading mb-4">Blog</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Travel guides, stories, and updates from our team.
        </p>
      </div>

      {posts.length === 0 ? (
        <p className="text-center text-muted-foreground">No posts published yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post: any) => (
            <Card key={post._id} className="overflow-hidden flex flex-col">
              <div className="relative h-48 bg-muted">
                {post.coverImage && (
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    className="object-cover"
                  />
                )}
              </div>
              <CardContent className="p-6 flex-1 flex flex-col">
                <p className="text-sm text-muted-foreground mb-2">{formatDate(post.publishedAt)}</p>
                <h3 className="text-xl font-bold mb-2">{post.title}</h3>
                <p className="text-muted-foreground text-sm mb-4 flex-1">{post.excerpt}</p>
                <Button asChild variant="outline">
                  <Link href={`/blog/${post.slug}`}>Read More</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
