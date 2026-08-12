import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getBlogBySlug } from '@/lib/api';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const resolvedParams = await params;
  try {
    const post = await getBlogBySlug(resolvedParams.slug);
    return {
      title: post?.seo?.metaTitle || post?.title || 'Blog Post',
      description: post?.seo?.metaDescription || post?.excerpt || '',
    };
  } catch {
    return { title: 'Blog Post' };
  }
}

export default async function BlogDetailPage({ params }: PageProps) {
  const resolvedParams = await params;

  let post;
  try {
    post = await getBlogBySlug(resolvedParams.slug);
  } catch (error) {
    console.error('Failed to fetch blog post:', error);
    notFound();
  }

  if (!post) {
    notFound();
  }

  return (
    <article className="container mx-auto px-4 py-12 max-w-3xl">
      <Link href="/blog" className="text-muted-foreground hover:text-primary mb-8 inline-block">
        ← Back to Blog
      </Link>

      <h1 className="text-4xl font-bold font-heading mb-4">{post.title}</h1>
      <p className="text-sm text-muted-foreground mb-8">
        By {post.author?.name || 'Hotel Admin'} •{' '}
        {new Date(post.publishedAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </p>

      {post.coverImage && (
        <div className="relative h-[400px] rounded-lg overflow-hidden mb-8">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      <div className="prose prose-lg max-w-none">
        <p className="text-lg text-muted-foreground mb-6">{post.excerpt}</p>
        <p className="text-muted-foreground whitespace-pre-line leading-relaxed">{post.content}</p>
      </div>
    </article>
  );
}
