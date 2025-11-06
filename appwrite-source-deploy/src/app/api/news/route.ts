import { NextRequest, NextResponse } from 'next/server';
import { getNewsByProvince, searchNews, mockNewsArticles } from '@/lib/news-data';
import { fetchNewsFromAPI } from '@/lib/news-api';
import { Province } from '@/lib/news-types';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const province = searchParams.get('province') as Province | 'All South Africa' | null;
    const query = searchParams.get('search') || '';
    const useRealAPI = process.env.NEWS_API_KEY ? true : false;

    // Always start with our curated mock data
    let mockArticles: typeof mockNewsArticles;
    if (query) {
      mockArticles = searchNews(query, province || undefined);
    } else if (province) {
      mockArticles = getNewsByProvince(province);
    } else {
      mockArticles = getNewsByProvince('All South Africa');
    }

    // Try to fetch additional articles from real API if API key is available
    let apiArticles: typeof mockNewsArticles = [];
    if (useRealAPI) {
      try {
        const fetchedApiArticles = await fetchNewsFromAPI(query || undefined);
        
        if (fetchedApiArticles.length > 0) {
          // Filter by province if specified
          if (province && province !== 'All South Africa') {
            apiArticles = fetchedApiArticles.filter(article => article.province === province);
          } else {
            apiArticles = fetchedApiArticles;
          }
          
          // If search query is provided, filter articles
          if (query) {
            const lowerQuery = query.toLowerCase();
            apiArticles = apiArticles.filter(article =>
              article.title.toLowerCase().includes(lowerQuery) ||
              article.description.toLowerCase().includes(lowerQuery) ||
              article.content.toLowerCase().includes(lowerQuery) ||
              article.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
            );
          }
        }
      } catch (apiError) {
        console.error('Failed to fetch from NewsAPI, using mock data only:', apiError);
        // Continue with mock data only
      }
    }

    // Combine mock and API articles, avoiding duplicates by URL
    const urlSet = new Set(mockArticles.map(a => a.sourceUrl || a.id));
    const uniqueApiArticles = apiArticles.filter(a => 
      a.sourceUrl && !urlSet.has(a.sourceUrl) && !urlSet.has(a.id)
    );

    // Combine: mock articles first, then API articles
    const allArticles = [...mockArticles, ...uniqueApiArticles];

    // Sort by newest first
    const sortedArticles = allArticles.sort((a, b) => 
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

    return NextResponse.json({ 
      articles: sortedArticles, 
      source: useRealAPI && apiArticles.length > 0 ? 'combined' : 'mock' 
    });
  } catch (error: any) {
    console.error('News API error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch news' },
      { status: 500 }
    );
  }
}

