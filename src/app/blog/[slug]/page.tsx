
import { notFound } from 'next/navigation';
import { blogPosts } from '@/lib/blog-posts';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import Link from 'next/link';
import { BlogSidebar } from '@/components/blog/BlogSidebar';

// Generate only the most recent 10 posts at build time for faster builds
// Other posts will be generated on-demand via ISR
export async function generateStaticParams() {
  // Sort by date (most recent first) and take top 10
  const recentPosts = [...blogPosts]
    .filter(post => !post.comingSoon)
    .sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime())
    .slice(0, 10);
  
  return recentPosts.map((post) => ({
    slug: post.slug,
  }));
}

// Enable ISR - pages will be regenerated every hour if accessed
export const revalidate = 3600;

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  return (
    <main className="flex-1 py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="mb-12">
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="outline">{post.category}</Badge>
                  {post.comingSoon && (
                    <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
                      Coming Soon
                    </Badge>
                  )}
                </div>
                <h1 className="text-4xl font-bold tracking-tight font-headline sm:text-5xl">{post.title}</h1>
                <div className="mt-6 flex items-center gap-x-4">
                  <p className="text-sm text-muted-foreground">By {post.author.name}</p>
                  <span className="text-sm text-muted-foreground">·</span>
                  <time dateTime={post.datetime} className="text-sm text-muted-foreground">
                    {post.date}
                  </time>
                </div>
              </div>

              <div className="relative mb-12">
                <Image
                  src={post.imageUrl}
                  alt={post.title}
                  width={1200}
                  height={600}
                  className="aspect-video w-full rounded-2xl bg-muted object-cover"
                />
                <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-foreground/10" />
              </div>

              <article className="prose prose-lg dark:prose-invert max-w-none font-body"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              <div className="mt-16 border-t pt-8">
                <Link href="/blog" className="text-primary hover:underline">
                  &larr; Back to all posts
                </Link>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto overscroll-contain pr-2 -mr-2">
                <div className="pb-4">
                  <BlogSidebar
                    currentPostSlug={post.slug}
                    currentPostCategory={post.category}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
    </main>
  );
}
