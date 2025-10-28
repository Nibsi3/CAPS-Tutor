'use client'

import { StatCards } from "@/components/dashboard/StatCards";
import { ProgressChart } from "@/components/dashboard/ProgressChart";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDoc, useUser, useMemoFirebase } from "@/firebase";
import { doc, getFirestore } from "firebase/firestore";
import Link from "next/link";
import { BookOpen, Settings } from "lucide-react";
import { Progress } from "@/components/ui/progress";


export default function DashboardPage() {
    const { user } = useUser();
    const firestore = getFirestore();

    const userProfileRef = useMemoFirebase(() => {
        if (!user) return null;
        return doc(firestore, `users/${user.uid}`);
    }, [user, firestore]);

    const { data: userProfile } = useDoc<{gradeLevel: number, subjects: string[]}>(userProfileRef);

    const hasCompletedSetup = userProfile && userProfile.subjects && userProfile.subjects.length > 0;

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="font-headline text-3xl font-bold tracking-tight">Welcome back, {user?.displayName?.split(' ')[0] || 'Student'}!</h1>
      </div>

      {hasCompletedSetup ? (
        <>
          <StatCards />
          <Card>
              <CardHeader>
                  <CardTitle>Your Subjects</CardTitle>
                  <CardDescription>Continue where you left off or start a new lesson.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {userProfile.subjects.map((subject: string) => (
                      <div key={subject} className="flex flex-col items-start gap-4 rounded-xl border bg-card p-6 text-card-foreground shadow">
                          <div className="flex w-full items-start justify-between">
                              <div className="flex items-center gap-4">
                                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                                      <BookOpen className="h-6 w-6 text-primary" />
                                  </div>
                                  <div>
                                      <p className="text-sm font-medium text-muted-foreground">Grade {userProfile.gradeLevel}</p>
                                      <h3 className="font-headline text-2xl font-bold">{subject}</h3>
                                  </div>
                              </div>
                              <Button variant="ghost" size="sm" asChild>
                                  <Link href={`/dashboard/lessons`}>View</Link>
                              </Button>
                          </div>
                      </div>
                  ))}
              </CardContent>
          </Card>
        </>
      ) : (
        <Card className="mt-6">
          <CardHeader>
              <CardTitle>Get Started</CardTitle>
              <CardDescription>
                  Let's personalize your learning experience. Please set your grade and subjects to see your customized lesson plan.
              </CardDescription>
          </CardHeader>
          <CardContent>
              <Button asChild>
                <Link href="/dashboard/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Go to Settings
                </Link>
              </Button>
          </CardContent>
        </Card>
      )}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="lg:col-span-4">
          <ProgressChart />
        </div>
        <div className="lg:col-span-3">
          <RecentActivity />
        </div>
      </div>
    </div>
  )
}
