'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser, useDoc, useCollection, useMemoFirebase } from "@/firebase";
import { doc, collection, query, where, getFirestore } from "firebase/firestore";
import { Progress } from "@/components/ui/progress";
import { Loader, BarChart2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface StudentProgress {
  learningObjectiveId: string;
  masteryLevel: number;
  completed: boolean;
  lastAccessed: string;
  topic?: string; // Will be added after fetching
}

// Mock mapping from objective ID to topic for demo purposes
const objectiveToTopicMap: Record<string, string> = {
  "algebra-1": "Algebra",
  "geometry-1": "Geometry",
  "trig-1": "Trigonometry",
  "calculus-1": "Calculus",
  "prob-1": "Probability",
};

export default function ProgressPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const userProfileRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);
  const { data: userProfile, isLoading: isProfileLoading } = useDoc(userProfileRef);

  const progressQuery = useMemoFirebase(() => {
    if (!user) return null;
    // In a real app, you might add more complex queries, e.g., for a specific subject
    return query(collection(firestore, `users/${user.uid}/studentProgress`));
  }, [user, firestore]);

  const { data: progressData, isLoading: isProgressLoading } = useCollection<StudentProgress>(progressQuery);
  
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  const processedProgress = useMemoFirebase(() => {
    if (!progressData) return {};
    
    const progressByTopic: Record<string, { totalMastery: number, count: number }> = {};
    
    progressData.forEach(item => {
      const topic = objectiveToTopicMap[item.learningObjectiveId] || "General";
      if (!progressByTopic[topic]) {
        progressByTopic[topic] = { totalMastery: 0, count: 0 };
      }
      progressByTopic[topic].totalMastery += item.masteryLevel;
      progressByTopic[topic].count++;
    });

    const averagedProgress: Record<string, number> = {};
    for (const topic in progressByTopic) {
        averagedProgress[topic] = progressByTopic[topic].totalMastery / progressByTopic[topic].count;
    }
    return averagedProgress;

  }, [progressData]);

  const overallMastery = useMemoFirebase(() => {
    if (!processedProgress || Object.keys(processedProgress).length === 0) return 0;
    const topics = Object.values(processedProgress);
    const total = topics.reduce((sum, level) => sum + level, 0);
    return total / topics.length;
  }, [processedProgress]);


  if (isUserLoading || isProfileLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline text-3xl">
            <BarChart2 className="h-8 w-8" />
            Your Progress Dashboard
          </CardTitle>
          <CardDescription>
            A detailed view of your learning journey and mastery levels.
          </CardDescription>
        </CardHeader>
      </Card>
      
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Overall Mastery</CardTitle>
             <CardDescription>Average across all topics.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center gap-4">
            <div className="relative h-40 w-40">
                <svg className="h-full w-full" viewBox="0 0 36 36">
                    <path
                        className="stroke-current text-muted"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        strokeWidth="3"
                    />
                    <path
                        className="stroke-current text-primary"
                        strokeDasharray={`${overallMastery}, 100`}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        strokeWidth="3"
                        strokeLinecap="round"
                        transform="rotate(90 18 18)"
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-headline text-4xl font-bold">{Math.round(overallMastery)}%</span>
                </div>
            </div>
            <p className="text-center text-muted-foreground">You are doing great! Keep up the consistent effort.</p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Topic Mastery</CardTitle>
                  <CardDescription>Your mastery level for each topic.</CardDescription>
                </div>
                 {userProfile?.subjects && (
                    <Select onValueChange={setSelectedSubject} defaultValue={selectedSubject || undefined}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by subject" />
                        </SelectTrigger>
                        <SelectContent>
                            {userProfile.subjects.map((s:string) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                    </Select>
                 )}
              </div>
            </CardHeader>
            <CardContent>
              {isProgressLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="space-y-2">
                       <div className="h-4 w-1/4 animate-pulse rounded-md bg-muted"></div>
                       <div className="h-6 w-full animate-pulse rounded-md bg-muted"></div>
                    </div>
                  ))}
                </div>
              ) : Object.keys(processedProgress).length > 0 ? (
                <div className="space-y-6">
                  {Object.entries(processedProgress).map(([topic, masteryLevel]) => (
                    <div key={topic} className="space-y-2">
                      <div className="flex justify-between font-medium">
                        <span>{topic}</span>
                        <span>{Math.round(masteryLevel)}%</span>
                      </div>
                      <Progress value={masteryLevel} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">No progress data found yet. Complete some practice questions to see your mastery levels!</p>
                </div>
              )}
            </CardContent>
        </Card>
      </div>
    </div>
  )
}

    