"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PROVINCES, type Province, type NewsArticle, getProvinceTabLabel } from "@/lib/news-types";
import { Search, Calendar, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useScrollRestore } from "@/hooks/use-scroll-restore";

const ITEMS_PER_PAGE = 12;
const SEARCH_DEBOUNCE_MS = 500;

export default function NewsPage() {
  const searchParams = useSearchParams();
  
  // Persist state across reloads
  const [selectedProvince, setSelectedProvince] = useLocalStorage<Province | "All South Africa">("news-selected-province", "All South Africa");
  const [searchQuery, setSearchQuery] = useLocalStorage<string>("news-search-query", "");
  
  // Restore scroll position on reload
  useScrollRestore("news-page");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize search query from URL parameters (URL takes precedence)
  useEffect(() => {
    const searchParam = searchParams.get('search');
    if (searchParam) {
      setSearchQuery(searchParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]); // Only run when URL params change - URL params take precedence over localStorage

  // Debounce search query
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const fetchNews = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedProvince) params.append("province", selectedProvince);
      if (debouncedSearchQuery) params.append("search", debouncedSearchQuery);

      const response = await fetch(`/api/news?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch news: ${response.statusText}`);
      }
      const data = await response.json();
      if (!data || !Array.isArray(data.articles)) {
        throw new Error('Invalid response format');
      }
      setArticles(data.articles || []);
    } catch (error) {
      console.error("Failed to fetch news:", error);
      setArticles([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedProvince, debouncedSearchQuery]);

  useEffect(() => {
    fetchNews();
    setDisplayCount(ITEMS_PER_PAGE); // Reset to first page when filters change
  }, [fetchNews]);

  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-ZA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, []);

  const getTimeAgo = useCallback((dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
  }, []);

  const categoryColors = {
    school: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
    university: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
    general: "bg-gray-500/10 text-gray-700 dark:text-gray-400",
  };

  const isValidExternalUrl = useCallback((url: string | undefined): boolean => {
    if (!url || url === "#" || url.trim() === "") return false;
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
    } catch {
      return false;
    }
  }, []);

  const handleTagClick = useCallback((tag: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSearchQuery(tag);
    setDisplayCount(ITEMS_PER_PAGE); // Reset to first page
    // Update URL with search parameter
    const url = new URL(window.location.href);
    url.searchParams.set('search', tag);
    window.history.pushState({}, '', url.toString());
    // Scroll to top of articles
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <main className="flex-1">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight font-headline">Educational News</h1>
            <p className="text-muted-foreground">
              Stay updated with the latest school and university news from across South Africa
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search news by title, description, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Province Tabs */}
          <Tabs
            value={selectedProvince}
            onValueChange={(value) => setSelectedProvince(value as Province | "All South Africa")}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10 h-auto">
              <TabsTrigger value="All South Africa" className="text-xs sm:text-sm">
                All SA
              </TabsTrigger>
              {PROVINCES.map((province) => (
                <TabsTrigger
                  key={province}
                  value={province}
                  className="text-xs sm:text-sm whitespace-nowrap"
                >
                  {getProvinceTabLabel(province)}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Articles Content */}
            <div className="mt-6">
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <p className="mt-4 text-muted-foreground">Loading news...</p>
                </div>
              ) : articles.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    {searchQuery
                      ? "No news articles found matching your search."
                      : `No news articles available for ${selectedProvince}.`}
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {articles.slice(0, displayCount).map((article) => {
                      const hasValidUrl = isValidExternalUrl(article.sourceUrl);
                      
                      const cardContent = (
                        <Card className="flex flex-col hover:shadow-lg transition-shadow cursor-pointer h-full">
                          <CardHeader>
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <Badge
                                className={categoryColors[article.category]}
                                variant="secondary"
                              >
                                {article.category}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {article.province}
                              </Badge>
                            </div>
                            <CardTitle className="text-lg line-clamp-2">
                              {article.title}
                            </CardTitle>
                            <CardDescription className="line-clamp-2">
                              {article.description}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="flex-1 flex flex-col">
                            <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-1">
                              {article.content}
                            </p>
                            <div className="space-y-3 pt-4 border-t">
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>{getTimeAgo(article.publishedAt)}</span>
                                </div>
                                <span>{formatDate(article.publishedAt)}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-muted-foreground">
                                  {article.source}
                                </span>
                                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                  Read more
                                  {hasValidUrl ? (
                                    <ExternalLink className="h-3 w-3" />
                                  ) : null}
                                </span>
                              </div>
                              {article.tags && article.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 pt-2">
                                  {article.tags.slice(0, 3).map((tag, index) => (
                                    <Badge
                                      key={index}
                                      variant="outline"
                                      className="text-xs cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                                      onClick={(e) => handleTagClick(tag, e)}
                                    >
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );

                      return hasValidUrl ? (
                        <a
                          key={article.id}
                          href={article.sourceUrl!}
                          rel="noopener noreferrer"
                          className="block"
                        >
                          {cardContent}
                        </a>
                      ) : (
                        <Link
                          key={article.id}
                          href={`/news/${article.id}`}
                          className="block"
                        >
                          {cardContent}
                        </Link>
                      );
                    })}
                  </div>
                  {articles.length > displayCount && (
                    <div className="flex justify-center mt-8">
                      <Button
                        onClick={() => setDisplayCount(displayCount + ITEMS_PER_PAGE)}
                        variant="outline"
                        size="lg"
                      >
                        Load More ({articles.length - displayCount} remaining)
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </Tabs>
        </div>
      </div>
    </main>
  );
}

