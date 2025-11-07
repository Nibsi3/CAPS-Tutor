'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { posts } from '@/lib/blog-posts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Image from 'next/image';
import { Search, Lock } from 'lucide-react';

const ITEMS_PER_PAGE = 12;

export default function BlogIndexPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title'>('newest');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = Array.from(new Set(posts.map(post => post.category))).sort();
    return cats;
  }, []);

  // Separate coming soon posts from regular posts
  const comingSoonPosts = useMemo(() => {
    return posts
      .filter(post => post.comingSoon)
      .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());
  }, []);

  // Filter and sort posts (excluding coming soon)
  const filteredAndSortedPosts = useMemo(() => {
    let filtered = [...posts].filter(post => !post.comingSoon);

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query) ||
        post.category.toLowerCase().includes(query) ||
        post.author.name.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(post => post.category === selectedCategory);
    }

    // Sort posts
    filtered.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.datetime).getTime() - new Date(a.datetime).getTime();
      } else if (sortBy === 'oldest') {
        return new Date(a.datetime).getTime() - new Date(b.datetime).getTime();
      } else if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

    return filtered;
  }, [searchQuery, sortBy, selectedCategory]);

  // Reset display count when filters change
  useEffect(() => {
    setDisplayCount(ITEMS_PER_PAGE);
  }, [searchQuery, sortBy, selectedCategory]);

  return (
    <main className="flex-1">
      <div className="relative isolate bg-background">
        {/* Decorative gradient background */}
        <div
          className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
          aria-hidden="true"
        >
          <div
            className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary to-purple-500 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
          />
        </div>

        <div className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            {/* Header Section */}
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl font-headline">
                From the CAPS Tutor Blog
              </h1>
              <p className="mt-6 text-lg leading-8 text-muted-foreground">
                Insights on AI in education, learning strategies, and the future of the South African classroom.
              </p>
            </div>

            {/* Search and Filter Controls */}
            <div className="mx-auto mt-12 max-w-4xl">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search Bar */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Search blog posts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Category Filter */}
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Sort Options */}
                <Select value={sortBy} onValueChange={(value: 'newest' | 'oldest' | 'title') => setSortBy(value)}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="title">Title A-Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Results count */}
              <div className="mt-4 text-sm text-muted-foreground">
                Showing {filteredAndSortedPosts.length} {filteredAndSortedPosts.length === 1 ? 'post' : 'posts'}
                {(searchQuery || selectedCategory !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                    }}
                    className="ml-2 text-primary hover:underline"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </div>

            {/* Coming Soon Posts Section - Compact horizontal layout */}
            {comingSoonPosts.length > 0 && !searchQuery && selectedCategory === 'all' && (
              <div className="mx-auto mt-12 max-w-7xl">
                <div className="mb-6">
                  <h2 className="text-2xl font-semibold text-foreground">Coming Soon</h2>
                  <p className="text-sm text-muted-foreground mt-1">Upcoming articles to look forward to</p>
                </div>
                <div className="coming-soon-scroll overflow-x-auto pb-4 -mx-6 px-6">
                  <div className="flex gap-4 min-w-max">
                    {comingSoonPosts.map((post) => (
                      <Card 
                        key={post.slug} 
                        className="w-80 flex-shrink-0 flex flex-col overflow-hidden border-2 rounded-xl opacity-75 border-muted-foreground/30 cursor-not-allowed"
                      >
                        {/* Locked overlay */}
                        <div className="relative">
                          <div className="absolute inset-0 z-10 bg-background/70 backdrop-blur-sm flex items-center justify-center">
                            <div className="text-center p-4">
                              <Lock className="h-6 w-6 mx-auto mb-1 text-muted-foreground" />
                              <p className="text-xs font-semibold text-foreground">Coming Soon</p>
                              <p className="text-xs text-muted-foreground mt-0.5">{post.date}</p>
                            </div>
                          </div>
                          {/* Image */}
                          <div className="relative w-full aspect-[16/9] overflow-hidden grayscale bg-muted">
                            <Image
                              src={post.imageUrl}
                              alt={post.title}
                              width={320}
                              height={180}
                              className="w-full h-full object-cover"
                              unoptimized={post.imageUrl.includes('pexels.com')}
                            />
                            <div className="absolute inset-0 ring-1 ring-inset ring-foreground/10" />
                          </div>
                        </div>

                        {/* Content */}
                        <CardHeader className="flex-1 p-4">
                          <div className="flex items-center gap-x-2 mb-2">
                            <Badge 
                              variant="outline" 
                              className="text-xs rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary border-primary/20"
                            >
                              {post.category}
                            </Badge>
                            <Badge 
                              variant="outline" 
                              className="text-xs rounded-full bg-amber-500/10 px-2 py-0.5 font-medium text-amber-600 dark:text-amber-400 border-amber-500/20"
                            >
                              Coming Soon
                            </Badge>
                          </div>
                          <CardTitle className="text-base font-semibold leading-5 text-muted-foreground line-clamp-2">
                            {post.title}
                          </CardTitle>
                          <CardDescription className="text-xs line-clamp-2 mt-2">
                            {post.excerpt}
                          </CardDescription>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Blog Posts Grid */}
            <div className="mx-auto mt-12 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
              {filteredAndSortedPosts.length > 0 ? (
                <>
                  {filteredAndSortedPosts.slice(0, displayCount).map((post) => (
                    <article key={post.slug} className="flex flex-col items-start justify-between group">
                      <Card className="w-full h-full flex flex-col overflow-hidden border-2 rounded-2xl shadow-lg hover:shadow-xl transition-shadow relative">
                        {/* Clickable overlay link */}
                        <Link 
                          href={`/blog/${post.slug}`} 
                          className="absolute inset-0 z-10" 
                          aria-label={`Read more: ${post.title}`}
                        />
                        
                        {/* Image */}
                        <div className="relative w-full aspect-[16/9] overflow-hidden bg-muted">
                          <Image
                            src={post.imageUrl}
                            alt={post.title}
                            width={800}
                            height={450}
                            className="w-full h-full object-cover"
                            unoptimized={post.imageUrl.includes('pexels.com')}
                          />
                          <div className="absolute inset-0 ring-1 ring-inset ring-foreground/10" />
                        </div>

                        {/* Content */}
                        <CardHeader className="flex-1 relative z-0">
                          {/* Date and Category */}
                          <div className="flex items-center gap-x-2 flex-wrap text-xs">
                            <time dateTime={post.datetime} className="text-muted-foreground">
                              {post.date}
                            </time>
                            <Badge 
                              variant="outline" 
                              className="relative z-20 rounded-full bg-primary/10 px-3 py-1.5 font-medium text-primary border-primary/20 pointer-events-none"
                            >
                              {post.category}
                            </Badge>
                          </div>

                          {/* Title */}
                          <CardTitle className="mt-3 text-lg font-semibold leading-6 text-foreground group-hover:text-primary/80 transition-colors pointer-events-none">
                            {post.title}
                          </CardTitle>

                          {/* Excerpt */}
                          <CardDescription className="mt-2 line-clamp-3 text-sm leading-6 pointer-events-none">
                            {post.excerpt}
                          </CardDescription>
                        </CardHeader>

                        {/* Author Footer */}
                        <CardFooter className="mt-auto relative z-0 pointer-events-none">
                          <div className="relative flex items-center gap-x-4">
                            <div className="text-sm leading-6">
                              <p className="font-semibold text-foreground">
                                {post.author.name}
                              </p>
                              <p className="text-muted-foreground">{post.author.role}</p>
                            </div>
                          </div>
                        </CardFooter>
                      </Card>
                    </article>
                  ))}
                </>
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-lg text-muted-foreground">No posts found matching your criteria.</p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                    }}
                    className="mt-4 text-primary hover:underline"
                  >
                    Clear filters and show all posts
                  </button>
                </div>
              )}
            </div>

            {/* Load More Button */}
            {filteredAndSortedPosts.length > displayCount && (
              <div className="flex justify-center mt-12">
                <Button
                  onClick={() => setDisplayCount(displayCount + ITEMS_PER_PAGE)}
                  variant="outline"
                  size="lg"
                >
                  Load More ({filteredAndSortedPosts.length - displayCount} remaining)
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Bottom decorative elements */}
        <div
          className="absolute bottom-0 left-0 -z-10 transform-gpu overflow-hidden blur-3xl"
          aria-hidden="true"
        >
          <div
            className="aspect-[1155/678] w-[72.1875rem] -translate-x-1/2 bg-gradient-to-tr from-[#1e40af] to-[#9333ea] opacity-30"
            style={{
              clipPath:
                'polygon(20% 65%, 0% 50%, 10% 20%, 40% 0%, 70% 20%, 90% 50%, 100% 65%, 80% 85%, 50% 100%, 30% 85%)',
            }}
          />
        </div>
        <div
          className="absolute bottom-0 right-0 -z-10 transform-gpu overflow-hidden blur-3xl"
          aria-hidden="true"
        >
          <div
            className="aspect-[1155/678] w-[72.1875rem] translate-x-1/2 bg-gradient-to-tl from-[#1e40af] to-[#9333ea] opacity-30"
            style={{
              clipPath:
                'polygon(80% 65%, 100% 50%, 90% 20%, 60% 0%, 30% 20%, 10% 50%, 0% 65%, 20% 85%, 50% 100%, 70% 85%)',
            }}
          />
        </div>
      </div>
    </main>
  );
}
