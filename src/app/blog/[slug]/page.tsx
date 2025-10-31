import { getPost } from '@/lib/blog-posts';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getPost(params.slug);
  if (!post) return notFound();
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="font-headline mb-2 text-4xl font-bold">{post.title}</h1>
      <p className="text-xs text-muted-foreground">{new Date(post.date).toLocaleDateString()}</p>
      <div className="prose mt-6 max-w-none dark:prose-invert">
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </div>
    </main>
  );
}


