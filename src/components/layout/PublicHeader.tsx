"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { useUser } from '@/appwrite';
import { useLanguage, useSetLanguage } from '@/components/language-provider';
import { appLanguages } from '@/lib/data';
import { translations } from '@/lib/translations';
import { Globe } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export function PublicHeader() {
  // Get user from Appwrite
  const { user } = useUser();
  const currentLang = useLanguage();
  const setLanguage = useSetLanguage();
  const t = translations[currentLang] || translations.en;
  
  // Get current language label
  const currentLanguageLabel = appLanguages.find(l => l.value === currentLang)?.label || 'English';

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
          {/* Language Selector */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Globe className="h-4 w-4" />
                <span className="hidden sm:inline text-xs sm:text-sm">{currentLanguageLabel}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-3" align="end">
              <div className="space-y-2">
                <p className="text-sm font-semibold mb-3">{t?.language || 'Language'}</p>
                {appLanguages.map((lang) => (
                  <button
                    key={lang.value}
                    type="button"
                    onClick={() => {
                      setLanguage(lang.value as keyof typeof translations);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      currentLang === lang.value
                        ? 'bg-primary text-primary-foreground font-medium'
                        : 'hover:bg-accent'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
          
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


