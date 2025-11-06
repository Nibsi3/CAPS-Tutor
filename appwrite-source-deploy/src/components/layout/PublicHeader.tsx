"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { useUser } from '@/appwrite';

export function PublicHeader() {
  // Get user from Appwrite
  const { user } = useUser();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
            <path d="M16 3L3 9.75V22.25L16 29L29 22.25V9.75L16 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3 10L16 17L29 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 17V29" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="font-headline">CAPS Tutor</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/how-it-works" className="text-sm text-muted-foreground hover:text-primary">How It Works</Link>
          <Link href="/caps-syllabus" className="text-sm text-muted-foreground hover:text-primary">CAPS Syllabus</Link>
          <Link href="/news" className="text-sm text-muted-foreground hover:text-primary">News</Link>
          <Link href="/blog" className="text-sm text-muted-foreground hover:text-primary">Blog</Link>
          <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary">Contact us</Link>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <Button asChild size="sm"><Link href="/dashboard">Go to dashboard</Link></Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm"><Link href="/login">Log in</Link></Button>
              <Button asChild size="sm"><Link href="/register">Sign up</Link></Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}


