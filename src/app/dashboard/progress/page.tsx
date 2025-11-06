'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser, useDoc, useCollection, useMemoAppwrite } from "@/appwrite";
import { appwriteConfig } from "@/appwrite/config";
import { Query } from "appwrite";
import { Progress } from "@/components/ui/progress";
import { Loader, BarChart2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface StudentProgress {
  learningObjectiveId: string;
  masteryLevel: number;
  completed: boolean;
  lastAccessed: string | Date;
  topic?: string;
  subject?: string;
  gradeLevel?: number;
  type?: string;
}

const topicColors = [
  "bg-chart-1",
  "bg-chart-2",
  "bg-chart-3",
  "bg-chart-4",
  "bg-chart-5",
];

export default function ProgressPage() {
  const { user, isUserLoading } = useUser();

  const userProfileRef = useMemoAppwrite(() => {
    if (!user) return null;
    return {
      databaseId: appwriteConfig.databaseId,
      collectionId: 'user',
      documentId: user.$id,
    };
  }, [user]);
  const { data: userProfile, isLoading: isProfileLoading } = useDoc(userProfileRef);

  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  const progressQuery = useMemoAppwrite(() => {
    if (!user) return null;
    
    const queries = [Query.equal('userID', user.$id)];
    
    // Filter by subject if one is selected
    if (selectedSubject) {
      queries.push(Query.equal('subject', selectedSubject));
    }
    
    return {
      databaseId: appwriteConfig.databaseId,
      collectionId: 'userprogress',
      queries,
    };
  }, [user, selectedSubject]);

  const { data: progressData, isLoading: isProgressLoading } = useCollection<StudentProgress>(progressQuery);

  const processedProgress = useMemo(() => {
    if (!progressData || progressData.length === 0) return {};
    
    const progressByTopic: Record<string, { totalMastery: number, count: number }> = {};
    
    progressData.forEach(item => {
      // Use topic field directly if available, otherwise extract from learningObjectiveId or use subject
      let topic = item.topic;
      
      if (!topic) {
        // Try to extract topic from learningObjectiveId (e.g., "topic-Algebra" -> "Algebra")
        if (item.learningObjectiveId.startsWith('topic-')) {
          topic = decodeURIComponent(item.learningObjectiveId.replace('topic-', ''));
        } else if (item.subject) {
          topic = item.subject;
        } else {
          topic = "General";
        }
      }
      
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

  const overallMastery = useMemo(() => {
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
                 {userProfile?.subjects && userProfile.subjects.length > 0 && (
                    <Select 
                      onValueChange={(value) => setSelectedSubject(value === 'all' ? null : value)} 
                      value={selectedSubject || 'all'}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by subject" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Subjects</SelectItem>
                            {(userProfile.subjects as string[]).map((s:string) => (
                              <SelectItem key={s} value={s}>{s}</SelectItem>
                            ))}
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
                       <Skeleton className="h-4 w-1/4 rounded-md" />
                       <Skeleton className="h-6 w-full rounded-md" />
                    </div>
                  ))}
                </div>
              ) : Object.keys(processedProgress).length > 0 ? (
                <div className="space-y-6">
                  {Object.entries(processedProgress).map(([topic, masteryLevel], index) => (
                    <div key={topic} className="space-y-2">
                      <div className="flex justify-between font-medium">
                        <span>{topic}</span>
                        <span>{Math.round(masteryLevel)}%</span>
                      </div>
                      <Progress value={masteryLevel} indicatorClassName={cn(topicColors[index % topicColors.length])} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 space-y-4">
                  <p className="text-muted-foreground">Complete some practice questions to see your mastery levels here.</p>
                  <div className="space-y-4 px-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="space-y-2">
                        <div className='flex justify-between items-center'>
                          <Skeleton className="h-4 w-1/4 rounded-md" />
                          <Skeleton className="h-4 w-1/6 rounded-md" />
                        </div>
                        <Skeleton className="h-6 w-full rounded-md" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
        </Card>
      </div>
    </div>
  )
}
