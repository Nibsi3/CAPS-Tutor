"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowLeft, ExternalLink, Clock, MapPin, Share2 } from "lucide-react";
import { type NewsArticle } from "@/lib/news-types";
import { SafeImage } from "@/components/ui/safe-image";

export default function NewsArticlePage() {
  const params = useParams();
  const router = useRouter();
  const articleId = params.id as string;
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [allArticles, setAllArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/news");
        if (!response.ok) {
          throw new Error("Failed to fetch news");
        }
        const data = await response.json();
        setAllArticles(data.articles || []);
        const foundArticle = data.articles?.find((a: NewsArticle) => a.id === articleId);
        setArticle(foundArticle || null);
      } catch (error) {
        console.error("Failed to fetch article:", error);
        setArticle(null);
        setAllArticles([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (articleId) {
      fetchArticles();
    }
  }, [articleId]);

  // Get related articles (same category or province, excluding current article)
  const relatedArticles = useMemo(() => {
    if (!article || allArticles.length === 0) return [];
    
    return allArticles
      .filter((a) => 
        a.id !== article.id && 
        (a.category === article.category || a.province === article.province)
      )
      .slice(0, 4);
  }, [article, allArticles]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-ZA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getTimeAgo = (dateString: string) => {
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
  };

  const categoryColors = {
    school: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    university: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
    general: "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20",
  };

  const shareArticle = () => {
    if (navigator.share && article) {
      navigator.share({
        title: article.title,
        text: article.description,
        url: window.location.href,
      }).catch(() => {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(window.location.href);
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleTagClick = (tag: string) => {
    // Navigate to news page with tag as search query
    router.push(`/news?search=${encodeURIComponent(tag)}`);
  };

  // Split content into paragraphs for better readability
  const contentParagraphs = useMemo(() => {
    if (!article?.content) return [];
    return article.content.split(/\n\n+/).filter(p => p.trim().length > 0);
  }, [article]);

  if (isLoading) {
    return (
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">Loading article...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!article) {
    return (
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">Article not found.</p>
            <Button onClick={() => router.push("/news")} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to News
            </Button>
          </div>
        </div>
      </main>
    );
  }

  const defaultImageUrl = "https://images.pexels.com/photos/5212317/pexels-photo-5212317.jpeg?auto=compress&cs=tinysrgb&w=1200&dpr=2";

  return (
    <main className="flex-1 bg-muted/30">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Back Button */}
        <Button
          onClick={() => router.push("/news")}
          variant="ghost"
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to News
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Article Header */}
            <Card className="overflow-hidden">
              {/* Hero Image */}
              {article.imageUrl && (
                <div className="relative w-full h-64 md:h-96 bg-muted">
                  <SafeImage
                    src={article.imageUrl}
                    alt={article.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 66vw"
                    className="object-cover"
                    fallbackSrc={defaultImageUrl}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/50 to-transparent" />
                </div>
              )}

              <CardHeader className="space-y-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge
                    className={categoryColors[article.category]}
                    variant="outline"
                  >
                    {article.category}
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {article.province}
                  </Badge>
                </div>

                <CardTitle className="text-3xl md:text-4xl font-bold font-headline leading-tight">
                  {article.title}
                </CardTitle>

                <CardDescription className="text-lg text-muted-foreground leading-relaxed">
                  {article.description}
                </CardDescription>

                <div className="flex items-center justify-between flex-wrap gap-4 pt-4 border-t">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(article.publishedAt)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{getTimeAgo(article.publishedAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-foreground">
                      {article.source}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={shareArticle}
                      className="h-8 w-8 p-0"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Article Content */}
            <Card>
              <CardContent className="pt-6">
                <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-headline">
                  {contentParagraphs.map((paragraph, index) => (
                    <p
                      key={index}
                      className="text-foreground leading-relaxed mb-4 text-base md:text-lg"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-wrap gap-2">
                    <span className="text-sm font-medium text-muted-foreground mr-2">Tags:</span>
                    {article.tags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="text-sm cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                        onClick={() => handleTagClick(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Source Link */}
            {article.sourceUrl && article.sourceUrl !== "#" && (
              <Card>
                <CardContent className="pt-6">
                  <Button
                    asChild
                    variant="outline"
                    className="w-full sm:w-auto"
                  >
                    <a
                      href={article.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      Read original article
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Related Articles */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-headline">Related Articles</CardTitle>
                  <CardDescription>
                    More news from {article.category} and {article.province}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {relatedArticles.length > 0 ? (
                    relatedArticles.map((relatedArticle) => {
                      const hasValidUrl = relatedArticle.sourceUrl && 
                        relatedArticle.sourceUrl !== "#" &&
                        (relatedArticle.sourceUrl.startsWith("http://") || 
                         relatedArticle.sourceUrl.startsWith("https://"));

                      const articleContent = (
                        <div className="space-y-2 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                          <div className="flex items-start gap-2">
                            <Badge
                              className={`${categoryColors[relatedArticle.category]} text-xs`}
                              variant="outline"
                            >
                              {relatedArticle.category}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {relatedArticle.province}
                            </Badge>
                          </div>
                          <h4 className="font-semibold text-sm line-clamp-2 leading-tight">
                            {relatedArticle.title}
                          </h4>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {relatedArticle.description}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{getTimeAgo(relatedArticle.publishedAt)}</span>
                          </div>
                        </div>
                      );

                      return hasValidUrl ? (
                        <a
                          key={relatedArticle.id}
                          href={relatedArticle.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block"
                        >
                          {articleContent}
                        </a>
                      ) : (
                        <Link
                          key={relatedArticle.id}
                          href={`/news/${relatedArticle.id}`}
                          className="block"
                        >
                          {articleContent}
                        </Link>
                      );
                    })
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No related articles found.
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Quick Stats Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-headline">Article Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Category</span>
                    <Badge
                      className={categoryColors[article.category]}
                      variant="outline"
                    >
                      {article.category}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Province</span>
                    <span className="font-medium">{article.province}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Published</span>
                    <span className="font-medium">{formatDate(article.publishedAt)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Source</span>
                    <span className="font-medium">{article.source}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
