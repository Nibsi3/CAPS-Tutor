import Link from 'next/link';
import { posts } from '@/lib/blog-posts';

export default function BlogIndexPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="font-headline mb-2 text-4xl font-bold">Blog</h1>
      <p className="text-muted-foreground mb-8">Insights, evidence and updates on AI for CAPS learning.</p>
      <div className="grid gap-6 md:grid-cols-2">
        {posts.map(post => (
          <article key={post.slug} className="rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="font-headline mb-2 text-2xl font-semibold">
              <Link href={`/blog/${post.slug}`}>{post.title}</Link>
            </h2>
            <p className="text-xs text-muted-foreground">{new Date(post.date).toLocaleDateString()}</p>
            <p className="mt-3 text-sm text-muted-foreground">{post.excerpt}</p>
            <div className="mt-4">
              <Link className="text-primary" href={`/blog/${post.slug}`}>Read more →</Link>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}


