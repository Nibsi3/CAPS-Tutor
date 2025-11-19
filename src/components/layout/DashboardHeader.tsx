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
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Home, BookOpen, Target, BarChart, Bot, Award, FileText, CheckCircle } from "lucide-react"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { UserNav } from "./UserNav"
import { ThemeToggle } from "./ThemeToggle"
import { useLanguage } from "@/components/language-provider"
import { translations } from "@/lib/translations"
import { useUser, useDoc, useMemoAppwrite } from '@/appwrite';
import { appwriteConfig } from '@/appwrite/config';
import { lessons, placeholderLessons } from '@/lib/data';
import { useMemo, Fragment, useEffect } from 'react';
import { useAdminMode } from '@/hooks/use-admin-mode';
import { useIsAdmin } from '@/hooks/use-is-admin';
import { useRouter } from 'next/navigation';
import { useFeatures } from '@/hooks/use-features';

export function DashboardHeader() {
  const lang = useLanguage();
  const t = translations[lang] || translations.en; // Fallback to English if lang is invalid
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const { user, isUserLoading } = useUser();
  const { isAdmin, isLoading: isAdminLoading } = useIsAdmin();
  const { adminModeEnabled, toggleAdminMode } = useAdminMode(isAdmin);
  
  const userProfileRef = useMemoAppwrite(() => {
    if (!user) return null;
    return {
      databaseId: appwriteConfig.databaseId,
      collectionId: 'user',
      documentId: user.$id,
    };
  }, [user]);

  const { data: userProfile } = useDoc<{ gradeLevel?: number }>(userProfileRef);
  const userGrade = userProfile?.gradeLevel || 0;
  const { features } = useFeatures();
  
  // Only show past papers for grades 10-12
  const showPastPapers = userGrade >= 10;

  // Build breadcrumb items based on current pathname
  const breadcrumbItems = useMemo(() => {
    const items: Array<{ label: string; href?: string }> = [];
    
    // Always start with Dashboard (or Admin for admins not in student mode)
    const dashboardHref = isAdmin && !adminModeEnabled ? '/admin' : '/dashboard';
    items.push({ label: t.dashboard, href: dashboardHref });
    
    // Handle admin routes first
    if (pathname?.startsWith('/admin')) {
      if (pathname === '/admin' || pathname === '/admin/monitor') {
        items.push({ label: 'Monitor Dashboard' });
        return items;
      }
      
      // Handle admin past papers with ID: /admin/past-papers/[id]
      if (pathname?.startsWith('/admin/past-papers/')) {
        const pathAfterPastPapers = pathname.split('/admin/past-papers/')[1];
        items.push({ label: 'Past Papers', href: '/admin/past-papers' });
        
        if (pathAfterPastPapers === 'presets') {
          items.push({ label: 'Presets' });
        } else if (pathAfterPastPapers && !pathAfterPastPapers.includes('/')) {
          // It's a paper ID
          items.push({ label: 'Paper Details' });
        } else {
          items.push({ label: 'Past Papers' });
        }
        return items;
      }
      
      // Handle admin past-papers-v2 routes: /admin/past-papers-v2/editor/[id]
      if (pathname?.startsWith('/admin/past-papers-v2/')) {
        items.push({ label: 'Past Papers V2', href: '/admin/past-papers-v2' });
        if (pathname.includes('/editor/')) {
          const editorId = pathname.split('/editor/')[1];
          if (editorId) {
            items.push({ label: 'Paper Editor' });
          } else {
            items.push({ label: 'Editor' });
          }
        }
        return items;
      }
      
      // Handle admin content-control (and any sub-routes)
      if (pathname?.startsWith('/admin/content-control')) {
        items.push({ label: 'Content Control' });
        return items;
      }
      
      // Handle other admin routes
      const adminBreadcrumbMap: Record<string, string> = {
        '/admin/monitor': 'Monitor Dashboard',
        '/admin/content-control': 'Content Control',
        '/admin/past-papers': 'Past Papers',
        '/admin/past-papers-v2': 'Past Papers V2',
        '/admin/students': 'Students',
        '/admin/settings': 'Settings',
        '/admin/process-papers': 'Process Papers',
        '/admin/process-storage-papers': 'Process Storage Papers',
        '/admin/paper-editor-v3': 'Paper Editor',
        '/admin/syllabus': 'Syllabus',
      };
      
      const adminLabel = adminBreadcrumbMap[pathname || ''];
      if (adminLabel) {
        items.push({ label: adminLabel });
      } else {
        // For unknown admin routes, try to extract a readable name
        const routeParts = pathname?.split('/').filter(Boolean) || [];
        if (routeParts.length > 1) {
          const routeName = routeParts[routeParts.length - 1];
          // Convert kebab-case to Title Case
          const formattedName = routeName
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
          items.push({ label: formattedName });
        } else {
          items.push({ label: 'Overview' });
        }
      }
      return items;
    }
    
    // Handle student dashboard routes
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
  }, [pathname, searchParams, t, isAdmin, adminModeEnabled]);

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
              href={isAdmin && !adminModeEnabled ? "/admin" : "/dashboard"}
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
              href={isAdmin && !adminModeEnabled ? "/admin" : "/dashboard"}
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
            {features.practiceQuestions && (
              <Link
                href="/dashboard/practice"
                className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
              >
                <Target className="h-5 w-5" />
                {t.practice}
              </Link>
            )}
            {showPastPapers && features.pastPapers && (
              <Link
                href="/dashboard/past-papers"
                className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
              >
                <FileText className="h-5 w-5" />
                {t.pastPapers}
              </Link>
            )}
            {features.aiTutor && (
              <Link
                href="/dashboard/tutor"
                className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
              >
                <Bot className="h-5 w-5" />
                {t.aiTutor}
              </Link>
            )}
            {features.achievements && (
              <Link
                href="/dashboard/achievements"
                className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
              >
                <Award className="h-5 w-5" />
                {t.achievements}
              </Link>
            )}
            {features.progressTracking && (
              <Link
                href="/dashboard/progress"
                className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
              >
                <BarChart className="h-5 w-5" />
                {t.progress}
              </Link>
            )}
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
      <div className="ml-auto flex items-center gap-2">
        {/* Only show Admin/Student Mode button for admins - never for students */}
        {!isAdminLoading && isAdmin === true && (
          <button
            onClick={() => {
              const newMode = !adminModeEnabled;
              toggleAdminMode();
              // Navigate based on new mode (after toggle)
              if (newMode) {
                // Switching to admin mode, go to admin dashboard
                router.push('/admin');
              } else {
                // Switching to student mode, go to student dashboard
                router.push('/dashboard');
              }
            }}
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
      </div>
    </header>
  )
}
