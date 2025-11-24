import { NextRequest, NextResponse } from 'next/server';
import { getThumbnailForPost } from '@/lib/blog-thumbnail-service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { slugs } = await request.json();

    if (!Array.isArray(slugs) || slugs.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or empty slugs array' },
        { status: 400 }
      );
    }

    const uniqueSlugs = Array.from(new Set(slugs.filter(Boolean)));

    const entries = await Promise.all(
      uniqueSlugs.map(async (slug) => {
        try {
          const url = await getThumbnailForPost(String(slug));
          return [slug, url] as const;
        } catch (error) {
          console.warn(
            `Thumbnail lookup failed for slug "${slug}":`,
            (error as Error).message
          );
          return null;
        }
      })
    );

    const thumbnails = Object.fromEntries(
      entries.filter(Boolean) as [string, string][]
    );

    return NextResponse.json({ thumbnails });
  } catch (error) {
    console.error('Error fetching blog thumbnails:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog thumbnails', details: (error as Error).message },
      { status: 500 }
    );
  }
}

