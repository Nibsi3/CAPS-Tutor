'use client'

import { StatCards } from "@/components/dashboard/StatCards";
import { ProgressChart } from "@/components/dashboard/ProgressChart";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDoc, useUser, useMemoFirebase } from "@/firebase";
import { doc, getFirestore } from "firebase/firestore";
import Link from "next/link";
import { BookOpen } from "lucide-react";


export default function DashboardPage() {
    const { user } = useUser();
    const firestore = getFirestore();

    const userProfileRef = useMemoFirebase(() => {
        if (!user) return null;
        return doc(firestore, `users/${user.uid}`);
    }, [user, firestore]);

    const { data: userProfile } = useDoc(userProfileRef);

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Welcome back, {user?.displayName?.split(' ')[0] || 'Student'}!</h1>
      </div>
      <StatCards />

        {userProfile && userProfile.subjects && userProfile.subjects.length > 0 && (
            <Card>
                <CardHeader>
                    <CardTitle>Your Subjects</CardTitle>
                    <CardDescription>Continue where you left off or start a new lesson.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {userProfile.subjects.map((subject: string) => (
                        <div key={subject} className="flex flex-col items-start gap-4 p-4 border rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="bg-primary/10 p-2 rounded-full">
                                    <BookOpen className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <p className="font-semibold">Grade {userProfile.gradeLevel}</p>
                                    <h3 className="text-xl font-bold font-headline">{subject}</h3>
                                </div>
                            </div>
                            <Button asChild className="w-full mt-auto">
                                <Link href="#">Resume Lesson</Link>
                            </Button>
                        </div>
                    ))}
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
