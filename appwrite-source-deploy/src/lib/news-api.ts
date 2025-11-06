import { NewsArticle, Province } from './news-types';

// NewsAPI.org response types
interface NewsAPIArticle {
  source: {
    id: string | null;
    name: string;
  };
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}

interface NewsAPIResponse {
  status: string;
  totalResults: number;
  articles: NewsAPIArticle[];
}

// Province keywords for detection (must be specific to South Africa)
const PROVINCE_KEYWORDS: Record<Province, string[]> = {
  "Eastern Cape": ["eastern cape", "port elizabeth", "east london", "grahamstown", "bisho", "nelson mandela bay", "gqeberha", "nelson mandela university", "nmu"],
  "Free State": ["free state", "bloemfontein", "welkom", "kroonstad", "university of the free state", "ufs"],
  "Gauteng": ["gauteng", "johannesburg", "pretoria", "soweto", "sandton", "rosebank", "witwatersrand", "wits", "university of johannesburg", "uj", "tshwane", "university of pretoria", "up"],
  "KwaZulu-Natal": ["kwazulu-natal", "kwazulu natal", "kwa-zulu natal", "durban", "pietermaritzburg", "ukzn", "university of kwazulu-natal"],
  "Limpopo": ["limpopo", "polokwane", "thohoyandou", "modimolle", "university of limpopo"],
  "Mpumalanga": ["mpumalanga", "nelspruit", "mbombela", "witbank"],
  "Northern Cape": ["northern cape", "kimberley", "upington", "springbok"],
  "North West": ["north west", "mahikeng", "mmabatho", "rustenburg", "potchefstroom", "nwu", "north west university"],
  "Western Cape": ["western cape", "cape town", "stellenbosch", "uct", "university of cape town", "uws", "university of western cape", "tygerberg", "cput", "cape peninsula"],
};

// Keywords that strongly indicate South African content
const SA_INDICATORS = [
  "south africa", "south african", "south africans",
  "cape town", "johannesburg", "pretoria", "durban", "bloemfontein",
  "gauteng", "western cape", "eastern cape", "kwazulu-natal", "kwazulu natal",
  "free state", "limpopo", "mpumalanga", "northern cape", "north west",
  "caps curriculum", "department of basic education", "department of higher education",
  "nqf", "matric", "nsfas", "udw", "ukzn", "wits", "uct", "nmu", "ufs"
];

// Keywords that indicate NON-South African content (exclude these)
const NON_SA_INDICATORS = [
  "california", "california's", "californian",
  "south korea", "south korean", "seoul", "korea",
  "south dakota", "north dakota",
  "south carolina", "north carolina",
  "eastern europe", "eastern asia",
  "cape cod", "cape canaveral", // Not Cape Town
  "new york", "texas", "florida", "london", "paris", "tokyo",
  "united states", "usa", "us ", "uk ", "britain", "australia", "canada",
  "harvard", "mit", "stanford", "oxford", "cambridge" // Well-known non-SA universities
];

// Simple in-memory cache (in production, consider using Redis or similar)
interface CacheEntry {
  articles: NewsArticle[];
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

function isSouthAfrican(article: NewsAPIArticle): boolean {
  const text = `${article.title} ${article.description || ''} ${article.content || ''}`.toLowerCase();
  const source = article.source.name?.toLowerCase() || '';
  
  // Check for non-SA indicators first (high priority exclusion)
  for (const indicator of NON_SA_INDICATORS) {
    if (text.includes(indicator.toLowerCase())) {
      return false; // Definitely not South African
    }
  }
  
  // Check for SA indicators (must have at least one)
  let hasSAIndicator = false;
  for (const indicator of SA_INDICATORS) {
    if (text.includes(indicator.toLowerCase()) || source.includes(indicator.toLowerCase())) {
      hasSAIndicator = true;
      break;
    }
  }
  
  // Also check if source is a known SA news source
  const saNewsSources = [
    'sowetan', 'timeslive', 'news24', 'iol', 'enca', 'sabc', 
    'mail & guardian', 'fin24', 'business day', 'citizen',
    'sunday times', 'herald', 'cape times', 'star', 'pretoria news'
  ];
  
  const isSASource = saNewsSources.some(sourceName => 
    source.includes(sourceName.toLowerCase())
  );
  
  return hasSAIndicator || isSASource;
}

function detectProvince(article: NewsAPIArticle): Province | null {
  const text = `${article.title} ${article.description || ''} ${article.content || ''}`.toLowerCase();
  
  // Must be South African first
  if (!isSouthAfrican(article)) {
    return null;
  }
  
  // Score each province based on keyword matches
  const scores: Record<Province, number> = {
    "Eastern Cape": 0,
    "Free State": 0,
    "Gauteng": 0,
    "KwaZulu-Natal": 0,
    "Limpopo": 0,
    "Mpumalanga": 0,
    "Northern Cape": 0,
    "North West": 0,
    "Western Cape": 0,
  };

  // Check for province keywords (case-insensitive)
  for (const [province, keywords] of Object.entries(PROVINCE_KEYWORDS)) {
    for (const keyword of keywords) {
      const lowerKeyword = keyword.toLowerCase();
      // Use word boundaries to avoid false matches (e.g., "cape" matching "cape cod")
      const regex = new RegExp(`\\b${lowerKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (regex.test(text)) {
        scores[province as Province]++;
        // University names get higher weight
        if (lowerKeyword.includes('university') || lowerKeyword.includes('uct') || 
            lowerKeyword.includes('wits') || lowerKeyword.includes('ukzn') ||
            lowerKeyword.includes('uj') || lowerKeyword.includes('uws') ||
            lowerKeyword.includes('nmu') || lowerKeyword.includes('ufs') ||
            lowerKeyword.includes('cput') || lowerKeyword.includes('nwu')) {
          scores[province as Province] += 3; // Higher weight for universities
        }
        // Province names get higher weight
        if (lowerKeyword.includes('cape') || lowerKeyword.includes('gauteng') || 
            lowerKeyword.includes('kwazulu') || lowerKeyword.includes('limpopo') ||
            lowerKeyword.includes('mpumalanga') || lowerKeyword.includes('free state') ||
            lowerKeyword.includes('northern cape') || lowerKeyword.includes('north west')) {
          scores[province as Province] += 2;
        }
      }
    }
  }

  // Find province with highest score
  let maxScore = 0;
  let detectedProvince: Province | null = null;
  
  for (const [province, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      detectedProvince = province as Province;
    }
  }

  // Require at least 2 points for confidence (to avoid false positives)
  return maxScore >= 2 ? detectedProvince : null;
}

function determineCategory(article: NewsAPIArticle): "school" | "university" | "general" {
  const text = `${article.title} ${article.description || ''}`.toLowerCase();
  
  if (text.includes('university') || text.includes('universities') || text.includes('varsity') || 
      text.includes('uct') || text.includes('wits') || text.includes('ukzn') || 
      text.includes('student') || text.includes('undergraduate') || text.includes('postgraduate')) {
    return 'university';
  }
  
  if (text.includes('school') || text.includes('learner') || text.includes('pupil') || 
      text.includes('grade') || text.includes('teacher') || text.includes('principal') ||
      text.includes('caps') || text.includes('matric') || text.includes('curriculum')) {
    return 'school';
  }
  
  return 'general';
}

function convertToNewsArticle(apiArticle: NewsAPIArticle): NewsArticle | null {
  // Must be South African and have a detected province
  const detectedProvince = detectProvince(apiArticle);
  
  if (!detectedProvince) {
    return null; // Don't include articles we can't confidently assign to a province
  }
  
  const category = determineCategory(apiArticle);
  
  // Extract tags from article (simple keyword extraction)
  const tags: string[] = [];
  const text = `${apiArticle.title} ${apiArticle.description || ''}`.toLowerCase();
  const commonTags = ['education', 'school', 'university', 'student', 'teacher', 'learning', 'curriculum', 'matric', 'scholarship'];
  commonTags.forEach(tag => {
    if (text.includes(tag)) {
      tags.push(tag);
    }
  });

  return {
    id: apiArticle.url || `article-${Date.now()}-${Math.random()}`,
    title: apiArticle.title,
    description: apiArticle.description || apiArticle.title,
    content: apiArticle.content || apiArticle.description || apiArticle.title,
    province: detectedProvince,
    source: apiArticle.source.name,
    sourceUrl: apiArticle.url,
    publishedAt: apiArticle.publishedAt,
    imageUrl: apiArticle.urlToImage || undefined,
    category,
    tags: tags.length > 0 ? tags : undefined,
  };
}

export async function fetchNewsFromAPI(
  searchQuery?: string,
  useCache: boolean = true
): Promise<NewsArticle[]> {
  const apiKey = process.env.NEWS_API_KEY;
  
  if (!apiKey) {
    console.warn('NEWS_API_KEY not set, returning empty array');
    return [];
  }

  const cacheKey = `news-${searchQuery || 'all'}`;
  
  // Check cache first
  if (useCache) {
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.articles;
    }
  }

  try {
    // Build query for South African educational news - be more specific
    let query = 'education';
    if (searchQuery) {
      query = `(${query}) AND (${searchQuery})`;
    }
    
    // Use more specific South African search terms
    const saTerms = [
      'South Africa', 'South African', 
      'Cape Town', 'Johannesburg', 'Pretoria', 'Durban', 'Bloemfontein',
      'Gauteng', 'Western Cape', 'Eastern Cape', 'KwaZulu-Natal',
      'CAPS', 'Department of Basic Education', 'Department of Higher Education'
    ].join(' OR ');
    
    const url = new URL('https://newsapi.org/v2/everything');
    url.searchParams.append('q', `${query} AND (${saTerms})`);
    url.searchParams.append('language', 'en');
    url.searchParams.append('sortBy', 'publishedAt');
    url.searchParams.append('pageSize', '100'); // Get more to filter better
    url.searchParams.append('apiKey', apiKey);

    const response = await fetch(url.toString(), {
      next: { revalidate: 900 } // Revalidate every 15 minutes
    });

    if (!response.ok) {
      throw new Error(`NewsAPI error: ${response.status} ${response.statusText}`);
    }

    const data: NewsAPIResponse = await response.json();

    if (data.status !== 'ok') {
      throw new Error(`NewsAPI returned status: ${data.status}`);
    }

    // Filter and convert articles - strict filtering for South African educational content
    const articles = data.articles
      .filter(article => {
        // Must be South African first
        if (!isSouthAfrican(article)) {
          return false;
        }
        
        // Filter for educational content
        const text = `${article.title} ${article.description || ''}`.toLowerCase();
        return text.includes('education') || 
               text.includes('school') || 
               text.includes('university') || 
               text.includes('student') || 
               text.includes('teacher') || 
               text.includes('learner') ||
               text.includes('pupil') ||
               text.includes('curriculum') ||
               text.includes('matric') ||
               text.includes('caps') ||
               text.includes('nqf') ||
               text.includes('scholarship') ||
               text.includes('tuition');
      })
      .map(convertToNewsArticle)
      .filter((article): article is NewsArticle => article !== null) // Remove nulls (articles without province)
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    // Cache the results
    if (useCache) {
      cache.set(cacheKey, {
        articles,
        timestamp: Date.now(),
      });
    }

    return articles;
  } catch (error) {
    console.error('Error fetching news from API:', error);
    // Return empty array on error (caller can fallback to mock data)
    return [];
  }
}

// Function to clear cache (useful for testing or manual refresh)
export function clearNewsCache() {
  cache.clear();
}

