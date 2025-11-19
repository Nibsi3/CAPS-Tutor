'use client';

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation";
import {
  BookOpen,
  Home,
  Target,
  Bot,
  Award,
  FileText,
  BarChart,
  User,
  Languages,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DashboardHeader } from "@/components/layout/DashboardHeader"
import { NotificationBell } from "@/components/notifications/NotificationBell"
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/language-provider";
import { translations } from "@/lib/translations";
import { useUser, useDoc, useDatabases, useMemoAppwrite } from '@/appwrite';
import { appwriteConfig } from '@/appwrite/config';
import { Loader } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { trackLogin } from '@/lib/achievement-tracking';
import { useFeatures } from '@/hooks/use-features';
import { ScrollToTop } from '@/components/ScrollToTop';
import { useIsAdmin } from '@/hooks/use-is-admin';
import { useAdminMode } from '@/hooks/use-admin-mode';


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lang = useLanguage();
  const t = translations[lang] || translations.en; // Fallback to English if lang is invalid
  const router = useRouter();
  
  const isSettingsPage = pathname === '/dashboard/settings';
  const activeSection = searchParams?.get('section') || 'personal';
  
  const { user, isUserLoading } = useUser();
  const databases = useDatabases();
  const { isAdmin, isLoading: isAdminLoading } = useIsAdmin();
  const { adminModeEnabled } = useAdminMode(isAdmin || false);
  
  // Redirect unauthenticated users to login
  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  // Redirect admins to admin dashboard if they're not in student mode
  useEffect(() => {
    if (!isUserLoading && !isAdminLoading && user && isAdmin && !adminModeEnabled) {
      router.push('/admin');
    }
  }, [user, isUserLoading, isAdmin, isAdminLoading, adminModeEnabled, router]);

  // Track login when user is authenticated
  useEffect(() => {
    if (user && databases && !isUserLoading) {
      trackLogin(databases, user.$id);
    }
  }, [user, databases, isUserLoading]);
  
  const userProfileRef = useMemoAppwrite(() => {
    if (!user) return null;
    return {
      databaseId: appwriteConfig.databaseId,
      collectionId: 'user',
      documentId: user.$id,
    };
  }, [user]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<{ gradeLevel?: number }>(userProfileRef);
  const { features } = useFeatures();
  
  // Show loading state while checking auth, loading profile, or checking admin status
  if (isUserLoading || !user || isProfileLoading || isAdminLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader className="h-16 w-16 animate-spin" />
      </div>
    );
  }
  const userGrade = userProfile?.gradeLevel || 0;
  
  // Only show past papers for Grade 12
  const showPastPapers = userGrade === 12;

  const allNavItems = [
    { href: "/dashboard", icon: Home, label: t.dashboard, description: "View your overview" },
    { href: "/dashboard/lessons", icon: BookOpen, label: t.lessons, description: "Browse and study lessons" },
    { href: "/dashboard/practice", icon: Target, label: t.practice, description: "Practice with questions", requireFeature: 'practiceQuestions' as const },
    { href: "/dashboard/past-papers", icon: FileText, label: t.pastPapers, description: "Grade 12 exam papers", requireGrade12: true, requireFeature: 'pastPapers' as const },
    { href: "/dashboard/tutor", icon: Bot, label: t.aiTutor, description: "Get AI-powered help", badge: "New", requireFeature: 'aiTutor' as const },
    { href: "/dashboard/achievements", icon: Award, label: t.achievements, description: "View your achievements", requireFeature: 'achievements' as const },
    { href: "/dashboard/progress", icon: BarChart, label: t.progress, description: "Track your progress", requireFeature: 'progressTracking' as const },
  ];

  // Filter nav items based on user's grade and feature flags
  const navItems = allNavItems.filter(item => {
    if (item.requireGrade12 && !showPastPapers) return false;
    if (item.requireFeature && !features[item.requireFeature]) return false;
    return true;
  });

  // Settings navigation items
  const settingsNavItems = [
    {
      id: 'personal',
      label: t.personalInformation,
      description: t.personalInformationDescription,
      icon: User,
    },
    {
      id: 'subjects',
      label: 'My Subjects',
      description: 'Choose CAPS subjects',
      icon: BookOpen,
    },
    {
      id: 'languages',
      label: t.languageSubjects,
      description: 'Manage language preferences',
      icon: Languages,
    },
  ];

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2 sticky top-0">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
               <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
                <path d="M16 3L3 9.75V22.25L16 29L29 22.25V9.75L16 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 10L16 17L29 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 17V29" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="font-headline">CAPS Tutor</span>
            </Link>
            <div className="ml-auto">
              <NotificationBell />
            </div>
          </div>
          <div className="flex-1">
            {isSettingsPage ? (
              <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                <Link
                  href={isAdmin && !adminModeEnabled ? "/admin" : "/dashboard"}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                  )}
                >
                  <Home className="h-4 w-4" />
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">{t.dashboard}</span>
                    <span className="text-xs font-normal text-muted-foreground">Back to overview</span>
                  </div>
                </Link>
                {settingsNavItems.map((item) => {
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        const params = new URLSearchParams(searchParams?.toString());
                        params.set('section', item.id);
                        router.push(`/dashboard/settings?${params.toString()}`);
                      }}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left transition",
                        isActive
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-transparent text-muted-foreground hover:border-muted hover:bg-muted/50"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold">{item.label}</span>
                        {item.description && (
                          <span className="text-xs text-muted-foreground">{item.description}</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </nav>
            ) : (
              <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                {navItems.map((item) => {
                  const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      prefetch={true}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left transition",
                        isActive
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-transparent text-muted-foreground hover:border-muted hover:bg-muted/50"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold">{item.label}</span>
                        {item.description && (
                          <span className="text-xs text-muted-foreground">{item.description}</span>
                        )}
                      </div>
                      {item.badge && (
                         <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
                           {item.badge}
                         </Badge>
                      )}
                    </Link>
                  )
                })}
              </nav>
            )}
          </div>
          <div className="mt-auto p-4">
            
          </div>
        </div>
      </div>
      <div className="flex flex-col relative isolate overflow-visible h-screen">
        {/* Top decorative element */}
        <div
          className="absolute left-[calc(50%-4rem)] top-10 -z-10 transform-gpu blur-3xl sm:left-[calc(50%-18rem)] lg:left-48 lg:top-[calc(50%-30rem)] xl:left-[calc(50%-24rem)]"
          aria-hidden="true"
        >
          <div
            className="aspect-[1108/632] w-[72.125rem] bg-gradient-to-r from-primary to-purple-500 opacity-20"
            style={{
              clipPath:
                'polygon(73.6% 51.7%, 91.7% 11.8%, 100% 46.4%, 97.4% 82.2%, 92.5% 84.9%, 75.7% 64.3%, 55.3% 47.5%, 46.5% 49.4%, 45% 62.9%, 50.3% 87.2%, 21.3% 64.1%, 0.1% 100%, 5.4% 51.1%, 21.4% 63.9%, 58.9% 0.2%, 73.6% 51.7%)',
            }}
          />
        </div>

        {/* Bottom-left decorative element */}
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

        {/* Bottom-right decorative element */}
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

        <DashboardHeader />
        <ScrollToTop />
        <main className="flex flex-1 flex-col overflow-y-auto p-4 lg:p-6 bg-muted/40">
          {children}
        </main>
      </div>
    </div>
  )
}
