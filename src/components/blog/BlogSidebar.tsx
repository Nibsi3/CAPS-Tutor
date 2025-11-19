import Link from 'next/link';
import { publishedBlogPosts } from '@/lib/blog-posts';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';

interface BlogSidebarProps {
  currentPostSlug?: string;
  currentPostCategory?: string;
}

export function BlogSidebar({ currentPostSlug, currentPostCategory }: BlogSidebarProps) {
  // Get recent posts (excluding current post and coming soon posts)
  const recentPosts = publishedBlogPosts
    .filter((post) => post.slug !== currentPostSlug && !post.comingSoon)
    .sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime())
    .slice(0, 5);

  // Get related posts by category (excluding current post and coming soon posts)
  const relatedByCategory = publishedBlogPosts
    .filter(
      (post) =>
        post.slug !== currentPostSlug &&
        post.category === currentPostCategory &&
        currentPostCategory &&
        !post.comingSoon
    )
    .slice(0, 3);

  // Get all unique categories
  const categories = Array.from(
    new Set(publishedBlogPosts.map((post) => post.category))
  ).sort();

  // Get posts count by category
  const categoryCounts = categories.reduce((acc, category) => {
    acc[category] = publishedBlogPosts.filter((post) => post.category === category).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <aside className="space-y-8">
      {/* Recent Posts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Recent Posts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {recentPosts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group block"
            >
              <div className="flex gap-3">
                <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                  <Image
                    src={post.imageUrl}
                    alt={post.title}
                    width={64}
                    height={64}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {post.date}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>

      {/* Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Link
                key={category}
                href="/blog"
              >
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  {category}
                  <span className="ml-1 text-xs opacity-70">
                    ({categoryCounts[category]})
                  </span>
                </Badge>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Related by Category */}
      {relatedByCategory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              More in {currentPostCategory}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {relatedByCategory.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="block group"
              >
                <h4 className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                  {post.title}
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {post.date}
                </p>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Newsletter/CTA Card */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Stay Updated
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Get the latest insights on AI in education and learning strategies
            delivered to your inbox.
          </p>
          <Link
            href="/contact"
            className="inline-block w-full text-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            Get in Touch
          </Link>
        </CardContent>
      </Card>
    </aside>
  );
}

