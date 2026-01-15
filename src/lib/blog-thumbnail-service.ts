import 'server-only';

import { publishedBlogPosts } from '@/lib/blog-posts';

type Provider = 'unsplash' | 'pexels';

interface CachedThumbnail {
  url: string;
  provider: Provider;
  fetchedAt: number;
}

const CACHE_TTL = 1000 * 60 * 60 * 12; // 12 hours
const thumbnailCache = new Map<string, CachedThumbnail>();

// Topic-specific search queries for better image relevance
const TOPIC_QUERIES: Record<string, string> = {
  'bridging-the-gap-ai-in-south-african-education': 'classroom students africa education school inequality',
  'accessible-ai-learning-in-11-languages': 'languages multilingual communication diversity translation',
  'global-impact-of-ai-in-education': 'global education world technology innovation',
  'preparing-for-nsc-exams-with-ai': 'exam study preparation test books graduation',
  'caps-aligned-ai-why-it-matters': 'curriculum books education learning syllabus',
  'adaptive-learning-personalized-pathways': 'personalized learning individual technology adaptive',
  'supporting-teachers-with-ai': 'teacher classroom education teaching support',
  'equity-in-education-bridging-digital-divide': 'digital technology access inequality laptop computer',
  'learning-from-mistakes-ai-feedback': 'mistakes learning feedback correction improvement',
  'future-of-assessment-ai-evaluation': 'assessment test evaluation exam future technology',
  'building-study-habits-ai-coaching': 'study habits routine learning schedule discipline',
  'parent-role-ai-assisted-learning': 'parent child family learning together support',
  'ai-tutoring-myths-realities': 'AI artificial intelligence technology robot innovation',
  'research-personalized-learning-ai-effectiveness': 'research study data analysis charts personalized',
  'research-ai-feedback-learning-outcomes': 'feedback learning research study outcomes',
  'global-studies-ai-education-meta-analysis': 'global study research analysis world education',
  'how-to-pass-exams-flying-colours': 'exam success achievement celebration graduation',
  'ai-tutor-vs-traditional-tutoring-comparison': 'tutor teaching comparison traditional modern',
  'metacognition-self-regulated-learning': 'thinking brain cognitive learning mental reflection',
  'critical-thinking-ai-education': 'critical thinking problem solving analysis reasoning',
  'remote-learning-success-strategies': 'laptop online learning remote education digital',
  'early-childhood-education-ai': 'children kids preschool learning toys education',
  'stem-education-ai-enhanced-learning': 'science lab technology engineering math innovation',
  'emotional-intelligence-learning-success': 'emotions social skills communication feelings empathy',
  'south-africa-education-budget-2025': 'budget finance money education funding resources',
  'matric-results-2024-analysis-ai-impact': 'graduation cap results achievement certificate success',
  'western-cape-digital-schools-initiative': 'digital school technology computer classroom innovation',
  'teacher-shortage-crisis-south-africa': 'teacher shortage education empty classroom crisis',
  'caps-curriculum-updates-2025': 'curriculum update education books documents learning',
  'cognitive-load-theory-optimizing-learning': 'brain cognitive load learning mental capacity optimization',
  'gamification-ai-learning-engagement': 'game gamification fun learning interactive engagement',
  'preparing-university-ai-study-skills': 'university college campus study preparation',
  'mastering-time-management-ai-tools': 'time management clock schedule organization productivity',
  'building-confidence-through-ai-guided-practice': 'confidence support encouragement anxiety relief practice',
  'multilingual-ai-breaking-language-barriers': 'language translation multilingual communication diversity',
  'data-driven-learning-analytics-and-insights': 'data analytics charts graphs learning insights',
  'collaborative-learning-in-digital-age': 'teamwork collaboration group learning digital',
  'inclusive-education-ai-accessibility': 'accessibility inclusive diversity learning support',
  'motivation-and-engagement-ai-strategies': 'motivation inspiration goal achievement engagement',
  'parent-guide-ai-tutoring-success': 'parent guide book reading support family',
  'holiday-learning-maintaining-momentum': 'holiday vacation reading learning book study',
  'year-end-reflection-goal-setting': 'goal setting planning new year reflection strategy',
  'exam-stress-management-techniques': 'stress relief meditation calm anxiety management',
  'winter-school-programs-south-africa': 'winter school program education learning support',
  'reading-comprehension-ai-support': 'reading books comprehension literacy learning',
  'new-year-academic-resolutions': 'new year resolution goal planning academic',
  'transitioning-grade-levels-ai-support': 'transition change growth education school progression',
  'back-to-school-preparation-2026': 'back to school backpack books preparation learning',
  'matric-preparation-early-start': 'matric grade 12 study preparation early',
  'career-planning-education-pathways': 'career planning future job path education',
  'learning-styles-ai-personalization': 'learning styles individual preference personalization',
  'summer-learning-loss-prevention': 'summer learning book reading vacation education',
  'community-learning-spaces-south-africa': 'community center learning library space',
  'active-recall-study-technique-ai': 'recall memory study technique brain learning',
  'mindfulness-meditation-study-focus': 'mindfulness meditation calm focus concentration',
  'note-taking-strategies-digital-age': 'note taking writing notebook digital',
  'growth-mindset-academic-success': 'growth mindset success achievement learning',
  'mathematics-anxiety-overcoming-fear': 'math numbers calculation confidence anxiety',
  'holiday-season-balancing-rest-learning': 'holiday rest relaxation balance learning',
  'personalized-feedback-ai-learning': 'personalized feedback correction improvement learning',
  'sleep-study-performance-link': 'sleep rest bed recovery health performance',
  'adaptive-learning-paths-ai': 'pathway journey learning road adaptive',
  'family-support-student-success': 'family support love encouragement together success',
  'interactive-learning-engagement': 'interactive engagement participation learning technology',
  'year-end-review-planning-ahead': 'review planning reflection strategy future',
  'new-year-fresh-start-academic': 'new year fresh start beginning academic',
  'habits-academic-success-formation': 'habits routine consistency discipline success',
  'metacognition-thinking-about-thinking': 'thinking reflection metacognition brain learning',
  'peer-tutoring-ai-enhanced': 'peer tutoring collaboration help study support',
  'problem-solving-skills-ai-development': 'problem solving puzzle solution development',
  'motivation-sustaining-long-term': 'long term motivation persistence dedication',
  'organizational-skills-student-success': 'organization planning structure order success',
  'creative-thinking-innovation-education': 'creativity innovation thinking idea education',
  'spaced-repetition-memory-retention': 'memory retention brain learning repetition',
  'digital-literacy-21st-century-skills': 'digital literacy computer technology skills',
  'self-directed-learning-independence': 'independent learning self study autonomy',
  'mistakes-learning-opportunities': 'mistakes learning growth improvement opportunity',
  'multimodal-learning-approaches': 'multimodal senses learning visual auditory',
  'procrastination-overcoming-delay': 'procrastination productivity action motivation',
  'lifelong-learning-continuous-growth': 'lifelong learning growth development continuous',
};

function getPost(slug: string) {
  const post = publishedBlogPosts.find((p) => p.slug === slug);
  if (!post) {
    throw new Error(`Blog post with slug "${slug}" not found`);
  }
  return post;
}

function buildUnsplashQuery(slug: string, category?: string, authorRole?: string): string {
  // Use topic-specific query if available
  if (TOPIC_QUERIES[slug]) {
    return TOPIC_QUERIES[slug];
  }

  // Fallback to building query from metadata
  const keywords = [
    category,
    'education',
    'South Africa',
    slug.replace(/-/g, ' '),
    authorRole,
  ]
    .filter(Boolean)
    .join(' ');

  return keywords || 'education students south africa';
}

async function fetchUnsplashImage(query: string): Promise<string | null> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) {
    console.warn('UNSPLASH_ACCESS_KEY is not set');
    return null;
  }

  const apiUrl = new URL('https://api.unsplash.com/photos/random');
  apiUrl.searchParams.set('query', query);
  apiUrl.searchParams.set('orientation', 'landscape');
  apiUrl.searchParams.set('content_filter', 'high');
  apiUrl.searchParams.set('count', '1');

  try {
    const response = await fetch(apiUrl.toString(), {
      headers: {
        Authorization: `Client-ID ${accessKey}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(
        `Unsplash request failed with status ${response.status}: ${response.statusText}`,
      );
    }

    const data = await response.json();
    const photo = Array.isArray(data) ? data[0] : data;
    const url: string | undefined =
      photo?.urls?.regular ||
      photo?.urls?.full ||
      photo?.urls?.raw ||
      photo?.urls?.small;

    return url ?? null;
  } catch (error) {
    console.error(`Unsplash API error for query "${query}":`, (error as Error).message);
    return null;
  }
}

function getCachedThumbnail(slug: string): CachedThumbnail | null {
  const cached = thumbnailCache.get(slug);
  if (!cached) {
    return null;
  }
  
  // If cached image is from Pexels, ignore it and force refresh to Unsplash
  if (cached.provider === 'pexels') {
    thumbnailCache.delete(slug);
    return null;
  }
  
  // Check if cache is expired
  if (Date.now() - cached.fetchedAt > CACHE_TTL) {
    thumbnailCache.delete(slug);
    return null;
  }
  
  return cached;
}

export async function getThumbnailForPost(slug: string): Promise<string> {
  // Check cache, but ignore Pexels images (force refresh to Unsplash)
  const cached = getCachedThumbnail(slug);
  if (cached && cached.provider === 'unsplash') {
    return cached.url;
  }

  const post = getPost(slug);
  const query = buildUnsplashQuery(slug, post.category, post.author?.role);

  // Always try Unsplash first
  try {
    const unsplashUrl = await fetchUnsplashImage(query);
    if (unsplashUrl) {
      thumbnailCache.set(slug, {
        url: unsplashUrl,
        provider: 'unsplash',
        fetchedAt: Date.now(),
      });
      console.log(`✓ Fetched Unsplash image for "${slug}" with query: "${query}"`);
      return unsplashUrl;
    }
  } catch (error) {
    console.warn(
      `Unsplash fetch failed for slug "${slug}" (${query}):`,
      (error as Error).message,
    );
  }

  // Fallback to Pexels only if Unsplash fails
  const fallbackUrl =
    post.imageUrl ||
    'https://images.pexels.com/photos/3760851/pexels-photo-3760851.jpeg?auto=compress&cs=tinysrgb&w=2070&dpr=2';

  // Cache the fallback but mark it as Pexels so it will be refreshed next time
  thumbnailCache.set(slug, {
    url: fallbackUrl,
    provider: 'pexels',
    fetchedAt: Date.now(),
  });

  console.warn(`⚠ Using Pexels fallback for "${slug}" (Unsplash unavailable)`);
  return fallbackUrl;
}

export function getThumbnailCache() {
  return thumbnailCache;
}

// Utility function to clear cache for a specific slug (useful for forcing refresh)
export function clearThumbnailCache(slug?: string) {
  if (slug) {
    thumbnailCache.delete(slug);
  } else {
    thumbnailCache.clear();
  }
}
