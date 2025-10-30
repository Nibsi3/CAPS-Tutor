'use client';

import Link from "next/link"
import { usePathname } from "next/navigation";
import {
  Bell,
  BookOpen,
  Home,
  Settings,
  Target,
  Bot,
  Award,
  FileText,
  BarChart,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DashboardHeader } from "@/components/layout/DashboardHeader"
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/language-provider";
import { translations } from "@/lib/translations";


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  const lang = useLanguage();
  const t = translations[lang];

  const navItems = [
    { href: "/dashboard", icon: Home, label: t.dashboard },
    { href: "/dashboard/lessons", icon: BookOpen, label: t.lessons },
    { href: "/dashboard/practice", icon: Target, label: t.practice },
    { href: "/dashboard/past-papers", icon: FileText, label: t.pastPapers },
    { href: "/dashboard/tutor", icon: Bot, label: t.aiTutor, badge: "New" },
    { href: "/dashboard/achievements", icon: Award, label: t.achievements },
    { href: "/dashboard/progress", icon: BarChart, label: t.progress },
    { href: "/dashboard/settings", icon: Settings, label: t.settings },
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
            <Button variant="outline" size="icon" className="ml-auto h-8 w-8">
              <Bell className="h-4 w-4" />
              <span className="sr-only">Toggle notifications</span>
            </Button>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch={true}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                      isActive && "bg-accent text-primary"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                    {item.badge && (
                       <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
                         {item.badge}
                       </Badge>
                    )}
                  </Link>
                )
              })}
            </nav>
          </div>
          <div className="mt-auto p-4">
            
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <DashboardHeader />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-muted/40">
          {children}
        </main>
      </div>
    </div>
  )
}
