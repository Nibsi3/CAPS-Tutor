"use client"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Search, Home, BookOpen, Target, BarChart, Settings, Bot, Award, FileText, CheckCircle } from "lucide-react"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { UserNav } from "./UserNav"
import { ThemeToggle } from "./ThemeToggle"
import { useLanguage } from "@/components/language-provider"
import { translations } from "@/lib/translations"
import { useUser, useDoc, useMemoAppwrite } from '@/appwrite';
import { appwriteConfig } from '@/appwrite/config';
import { lessons, placeholderLessons } from '@/lib/data';
import { useMemo, Fragment } from 'react';
import { useAdminMode } from '@/hooks/use-admin-mode';

const ADMIN_EMAIL = 'cameronfalck03@gmail.com';

export function DashboardHeader() {
  const lang = useLanguage();
  const t = translations[lang];
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const { user, isUserLoading } = useUser();
  
  const isAdmin = user?.email === ADMIN_EMAIL;
  const { adminModeEnabled, toggleAdminMode } = useAdminMode(isAdmin);
  
  const userProfileRef = useMemoAppwrite(() => {
    if (!user) return null;
    return {
      databaseId: appwriteConfig.databaseId,
      collectionId: 'users',
      documentId: user.$id,
    };
  }, [user]);

  const { data: userProfile } = useDoc<{ gradeLevel?: number }>(userProfileRef);
  const userGrade = userProfile?.gradeLevel || 0;
  
  // Only show past papers for grades 10-12
  const showPastPapers = userGrade >= 10;

  // Build breadcrumb items based on current pathname
  const breadcrumbItems = useMemo(() => {
    const items: Array<{ label: string; href?: string }> = [];
    
    // Always start with Dashboard
    items.push({ label: t.dashboard, href: '/dashboard' });
    
    if (pathname === '/dashboard') {
      items.push({ label: t.overview });
      return items;
    }
    
    // Handle lesson detail pages: /dashboard/lessons/[id]
    if (pathname?.startsWith('/dashboard/lessons/')) {
      const lessonId = pathname.split('/dashboard/lessons/')[1];
      if (lessonId) {
        const allLessons = [...lessons, ...placeholderLessons];
        const lesson = allLessons.find(l => l.id === lessonId);
        
        if (lesson) {
          items.push({ label: t.lessons, href: '/dashboard/lessons' });
          // Make subject clickable - links back to the lesson detail page
          items.push({ label: lesson.subject, href: `/dashboard/lessons/${lessonId}` });
          
          // Only show topic if there's a topic query parameter (when a specific topic is selected)
          const topicParam = searchParams?.get('topic');
          if (topicParam) {
            const decodedTopic = decodeURIComponent(topicParam);
            // Clean up the topic name for breadcrumb display
            const cleanTopic = decodedTopic.split('(')[0].trim() || decodedTopic;
            items.push({ label: cleanTopic });
          }
        } else {
          items.push({ label: t.lessons });
        }
      } else {
        items.push({ label: t.lessons });
      }
      return items;
    }
    
    // Handle practice page with topic query parameter
    if (pathname === '/dashboard/practice') {
      const topicParam = searchParams?.get('topic');
      const subjectParam = searchParams?.get('subject');
      const gradeParam = searchParams?.get('grade');
      
      if (topicParam && subjectParam) {
        items.push({ label: t.practice, href: '/dashboard/practice' });
        
        // Find the lesson by subject (and grade if available) to make it clickable
        const decodedSubject = decodeURIComponent(subjectParam);
        const allLessons = [...lessons, ...placeholderLessons];
        const lesson = allLessons.find(l => {
          const subjectMatch = l.subject === decodedSubject;
          if (gradeParam) {
            // Compare grade levels as strings
            return subjectMatch && String(l.gradeLevel) === String(gradeParam);
          }
          return subjectMatch;
        });
        
        // Make subject clickable - link back to lesson detail page
        if (lesson) {
          items.push({ label: decodedSubject, href: `/dashboard/lessons/${lesson.id}` });
        } else {
          items.push({ label: decodedSubject });
        }
        
        // Clean up the topic name for breadcrumb display
        const decodedTopic = decodeURIComponent(topicParam);
        let cleanTopic = decodedTopic.replace(/^Term \d+:\s*/i, '');
        cleanTopic = cleanTopic.split('(')[0].trim() || cleanTopic;
        items.push({ label: cleanTopic });
      } else {
        items.push({ label: t.practice });
      }
      return items;
    }
    
    // Handle other routes
    const breadcrumbMap: Record<string, string> = {
      '/dashboard/lessons': t.lessons,
      '/dashboard/practice': t.practice,
      '/dashboard/past-papers': t.pastPapers,
      '/dashboard/tutor': t.aiTutor,
      '/dashboard/achievements': t.achievements,
      '/dashboard/progress': t.progress,
      '/dashboard/settings': t.settings,
      '/dashboard/games': (t as any).games || 'Games',
    };
    
    // Handle past paper practice
    if (pathname?.startsWith('/dashboard/past-paper-practice/')) {
      items.push({ label: t.pastPapers, href: '/dashboard/past-papers' });
      items.push({ label: t.practice });
      return items;
    }
    
    const label = breadcrumbMap[pathname || ''] || t.overview;
    if (label !== t.overview || pathname !== '/dashboard') {
      items.push({ label });
    }
    
    return items;
  }, [pathname, searchParams, t]);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 sm:py-4">
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="sm:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="sm:max-w-xs">
          <nav className="grid gap-6 text-lg font-medium">
            <Link
              href="/dashboard"
              className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
            >
              <svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 3L3 9.75V22.25L16 29L29 22.25V9.75L16 3Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 10L16 17L29 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 17V29" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="sr-only">CAPS Tutor</span>
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
            >
              <Home className="h-5 w-5" />
              {t.dashboard}
            </Link>
            <Link
              href="/dashboard/lessons"
              className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
            >
              <BookOpen className="h-5 w-5" />
              {t.lessons}
            </Link>
            <Link
              href="/dashboard/practice"
              className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
            >
              <Target className="h-5 w-5" />
              {t.practice}
            </Link>
            {showPastPapers && (
              <Link
                href="/dashboard/past-papers"
                className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
              >
                <FileText className="h-5 w-5" />
                {t.pastPapers}
              </Link>
            )}
            <Link
              href="/dashboard/tutor"
              className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
            >
              <Bot className="h-5 w-5" />
              {t.aiTutor}
            </Link>
            <Link
              href="/dashboard/achievements"
              className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
            >
              <Award className="h-5 w-5" />
              {t.achievements}
            </Link>
            <Link
              href="/dashboard/progress"
              className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
            >
              <BarChart className="h-5 w-5" />
              {t.progress}
            </Link>
            <Link
              href="/dashboard/settings"
              className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
            >
              <Settings className="h-5 w-5" />
              {t.settings}
            </Link>
          </nav>
        </SheetContent>
      </Sheet>
      <Breadcrumb className="hidden md:flex">
        <BreadcrumbList>
          {breadcrumbItems.map((item, index) => {
            const isLast = index === breadcrumbItems.length - 1;
            return (
              <Fragment key={index}>
                <BreadcrumbItem>
                  {item.href ? (
                    <BreadcrumbLink asChild>
                      <Link href={item.href}>{item.label}</Link>
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
                {!isLast && <BreadcrumbSeparator />}
              </Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
      <div className="relative ml-auto flex-1 md:grow-0">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder={t.searchLessons}
          className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
        />
      </div>
      {isAdmin && (
        <button
          onClick={toggleAdminMode}
          className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md border transition-all cursor-pointer hover:opacity-80 ${
            adminModeEnabled
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-primary/10 border-primary/20 text-primary'
          }`}
          title={adminModeEnabled ? 'Click to switch to Student Mode' : 'Click to switch to Admin Mode'}
        >
          <CheckCircle className={`w-4 h-4 ${adminModeEnabled ? 'text-primary-foreground' : 'text-primary'}`} />
          <span className="text-sm font-semibold">
            {adminModeEnabled ? 'Admin Mode' : 'Student Mode'}
          </span>
        </button>
      )}
      <ThemeToggle />
      <UserNav />
    </header>
  )
}
