
'use client';

import { useEffect } from 'react';
import Link from "next/link"
import { usePathname } from "next/navigation";
import {
  Users,
  Settings,
  Loader,
  BarChart3,
  Settings2,
  FileText,
} from "lucide-react"
import { useUser } from '@/appwrite';
import { useRouter } from 'next/navigation';

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils";

import { DashboardHeader } from "@/components/layout/DashboardHeader"
import { NotificationBell } from "@/components/notifications/NotificationBell"
import { AppwriteClientProvider } from '@/appwrite/client-provider';
import { useIsAdmin } from '@/hooks/use-is-admin';
import { useAdminMode } from '@/hooks/use-admin-mode';

function AdminLayoutContent({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isUserLoading } = useUser();
  const { isAdmin, isLoading: isAdminLoading } = useIsAdmin();
  const { adminModeEnabled, isLoading: isAdminModeLoading } = useAdminMode(isAdmin || false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isUserLoading && !isAdminLoading && !isAdminModeLoading) {
      if (!user || !isAdmin) {
        router.push('/forbidden');
        return;
      }
      // If admin mode is disabled, redirect to student dashboard
      if (isAdmin && !adminModeEnabled) {
        router.push('/dashboard');
      }
    }
  }, [user, isUserLoading, isAdmin, isAdminLoading, isAdminModeLoading, adminModeEnabled, router]);

  if (isUserLoading || isAdminLoading || isAdminModeLoading || !user || !isAdmin) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader className="h-16 w-16 animate-spin" />
      </div>
    );
  }

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
              <span className="font-headline">CAPS Tutor Admin</span>
            </Link>
            <div className="ml-auto">
              <NotificationBell />
            </div>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              <Link
                href="/admin/monitor"
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left transition",
                  pathname === "/admin/monitor"
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-transparent text-muted-foreground hover:border-muted hover:bg-muted/50"
                )}
              >
                <BarChart3 className="h-4 w-4" />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">Monitor Dashboard</span>
                  <span className="text-xs text-muted-foreground">View analytics and metrics</span>
                </div>
              </Link>
              <Link
                href="/admin/content-control"
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left transition",
                  (pathname === "/admin/content-control" || pathname?.startsWith("/admin/content-control"))
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-transparent text-muted-foreground hover:border-muted hover:bg-muted/50"
                )}
              >
                <Settings2 className="h-4 w-4" />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">Content Control</span>
                  <span className="text-xs text-muted-foreground">Manage content and features</span>
                </div>
              </Link>
              <Link
                href="/admin/past-papers"
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left transition",
                  (pathname === "/admin/past-papers" || pathname?.startsWith("/admin/past-papers"))
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-transparent text-muted-foreground hover:border-muted hover:bg-muted/50"
                )}
              >
                <FileText className="h-4 w-4" />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">Past Papers</span>
                  <span className="text-xs text-muted-foreground">Manage exam papers</span>
                </div>
              </Link>
              <Link
                href="/admin/students"
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left transition",
                  pathname === "/admin/students"
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-transparent text-muted-foreground hover:border-muted hover:bg-muted/50"
                )}
              >
                <Users className="h-4 w-4" />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">Students</span>
                  <span className="text-xs text-muted-foreground">Manage student accounts</span>
                </div>
                <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
                  6
                </Badge>
              </Link>
              <Link
                href="/admin/settings"
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left transition",
                  pathname === "/admin/settings"
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-transparent text-muted-foreground hover:border-muted hover:bg-muted/50"
                )}
              >
                <Settings className="h-4 w-4" />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">Settings</span>
                  <span className="text-xs text-muted-foreground">System configuration</span>
                </div>
              </Link>
            </nav>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <DashboardHeader />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AppwriteClientProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AppwriteClientProvider>
  )
}
