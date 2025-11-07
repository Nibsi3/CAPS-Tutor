'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { lessons, grades, placeholderLessons, subjectColors } from "@/lib/data";
import { BookOpen, BarChart, FileText, FlaskConical, Globe, Landmark, Calculator, Loader, UserCheck, Settings, MessageSquare, Heart, Sparkles, Users, TrendingUp, Clock, Cpu, Laptop, Plane, ShoppingBag, UtensilsCrossed, Ruler } from "lucide-react";
import { cn } from '@/lib/utils';
import { useDoc, useUser, useDatabases, useMemoAppwrite } from '@/appwrite';
import { appwriteConfig } from '@/appwrite/config';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useLanguage } from '@/components/language-provider';
import { translations } from '@/lib/translations';

// Create a unique list of subjects from the available lessons
const allLessons = [...lessons, ...placeholderLessons];
const availableSubjects = [...new Set(allLessons.map(l => l.subject))].map(s => ({ value: s, label: s}));

const subjectIcons: Record<string, React.ElementType> = {
  "Mathematics": Calculator,
  "Mathematical Literacy": Calculator,
  "Physical Sciences": FlaskConical,
  "Life Sciences": BarChart,
  "Accounting": FileText,
  "Business Studies": Landmark,
  "Economics": TrendingUp,
  "Geography": Globe,
  "History": Clock,
  "English Home Language": MessageSquare,
  "English First Additional Language": MessageSquare,
  "Afrikaans Huistaal": MessageSquare,
  "Afrikaans Eerste Addisionele Taal": MessageSquare,
  "Life Skills": Heart,
  "Natural Sciences and Technology": Sparkles,
  "Social Sciences": Users,
  "Information Technology": Cpu,
  "Computer Applications Technology (CAT)": Laptop,
  "Tourism": Plane,
  "Consumer Studies": ShoppingBag,
  "Hospitality Studies": UtensilsCrossed,
  "Engineering Graphics & Design": Ruler,
  "Natural Sciences": Sparkles,
  "Technology": Cpu,
  "Economic & Management Sciences": TrendingUp,
  "Life Orientation": Heart,
  "Creative Arts": Sparkles,
};


export default function LessonsPage() {
  const { user } = useUser();
  const lang = useLanguage();
  const t = translations[lang] || translations.en; // Fallback to English if lang is invalid

  // Fetch user profile
  const userProfileRef = useMemoAppwrite(() => {
    if (!user) return null;
    return {
      databaseId: appwriteConfig.databaseId,
      collectionId: 'user',
      documentId: user.$id,
    };
  }, [user]);
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<{gradeLevel: number, subjects: string[]}>(userProfileRef);

  // Manual filters state
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  // Determine if profile filters should be used (only if no manual filters are active)
  const hasManualFilters = selectedGrade !== null || selectedSubject !== null;
  const useProfileFilters = !hasManualFilters && userProfile && userProfile.gradeLevel && userProfile.subjects && userProfile.subjects.length > 0;

  const filteredLessons = allLessons.filter(lesson => {
    if (useProfileFilters) {
      // Filter based on user profile settings
      const gradeMatch = lesson.gradeLevel === userProfile.gradeLevel.toString();
      const subjectMatch = userProfile.subjects.includes(lesson.subject);
      return gradeMatch && subjectMatch;
    } else {
      // Filter based on manual dropdowns
      const gradeMatch = !selectedGrade || lesson.gradeLevel === selectedGrade;
      const subjectMatch = !selectedSubject || lesson.subject === selectedSubject;
      return gradeMatch && subjectMatch;
    }
  });
  
  if (isProfileLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader className="h-12 w-12 animate-spin" />
      </div>
    );
  }


  return (
    <div className="flex-1 space-y-6">
      <Card className='overflow-hidden rounded-2xl'>
        <div className="bg-card p-6 border-b">
            <CardTitle className="font-headline text-3xl flex items-center gap-3"><BookOpen className='w-8 h-8' />{t.lessonHub}</CardTitle>
            <CardDescription className='pt-2'>
                {t.lessonHubDescription}
            </CardDescription>
        </div>
        <CardContent className='p-6'>
          {useProfileFilters ? (
            <div className="mb-8 p-4 rounded-lg bg-accent/50 border border-dashed flex items-center justify-between">
              <div className='flex items-center gap-3'>
                <UserCheck className="h-6 w-6 text-primary" />
                <div>
                  <p className="font-semibold">{t.showingLessonsFor.replace('{gradeLevel}', userProfile.gradeLevel.toString())}</p>
                  <p className="text-sm text-muted-foreground">{t.yourSubjectsAre.replace('{subjects}', userProfile.subjects.join(', '))}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/settings">
                  <Settings className='mr-2 h-4 w-4'/> {t.changeSettings}
                </Link>
              </Button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Select onValueChange={setSelectedGrade} value={selectedGrade || ''}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder={t.filterByGrade} />
                </SelectTrigger>
                <SelectContent>
                  {grades.map(grade => (
                    <SelectItem key={grade.value} value={grade.value}>{grade.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select onValueChange={setSelectedSubject} value={selectedSubject || ''}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder={t.filterBySubject} />
                </SelectTrigger>
                <SelectContent>
                  {availableSubjects.map(subject => (
                    <SelectItem key={subject.value} value={subject.value}>{subject.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={() => { setSelectedGrade(null); setSelectedSubject(null); }} variant="outline">
                {t.clearFilters}
              </Button>
            </div>
          )}


          {filteredLessons.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredLessons.map(lesson => {
                    const Icon = subjectIcons[lesson.subject] || BookOpen;
                    const colors = subjectColors[lesson.subject] || { bg: "bg-muted", text: "text-muted-foreground", border: "border-border" };

                    return (
                        <Card key={lesson.id} className="flex flex-col hover:shadow-lg transition-shadow duration-300 rounded-2xl">
                             <CardHeader className="flex-row items-center gap-4 space-y-0 pb-4">
                                <div className={cn("p-3 rounded-xl", colors.bg)}>
                                    <Icon className={cn("w-6 h-6", colors.text)} />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-headline">{lesson.subject}</CardTitle>
                                    <CardDescription className={cn("font-semibold", colors.text)}>Grade {lesson.gradeLevel}</CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1 space-y-4">
                                <p className="text-sm font-medium">{t.keyTopics}</p>
                                <div className="space-y-2 text-sm text-muted-foreground">
                                    {lesson.topics.slice(0, 5).map((topic, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary/50"></div>
                                            <span>{topic}</span>
                                        </div>
                                    ))}
                                    {lesson.topics.length > 5 && (
                                        <Dialog>
                                          <TooltipProvider>
                                            <Tooltip>
                                              <TooltipTrigger asChild>
                                                <DialogTrigger asChild>
                                                    <button className="text-xs font-semibold text-primary/80 pt-1 cursor-pointer hover:underline text-left">{t.andMore.replace('{count}', (lesson.topics.length - 5).toString())}</button>
                                                </DialogTrigger>
                                              </TooltipTrigger>
                                              <TooltipContent>
                                                <p>Click to see all {lesson.topics.length} topics</p>
                                              </TooltipContent>
                                            </Tooltip>
                                          </TooltipProvider>
                                            <DialogContent className="sm:max-w-md">
                                                <DialogHeader>
                                                    <DialogTitle>{t.allTopicsFor.replace('{subject}', lesson.subject).replace('{grade}', lesson.gradeLevel)}</DialogTitle>
                                                    <DialogDescription>
                                                        {t.allTopicsDescription}
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <ul className='list-disc list-inside mt-4 space-y-2 max-h-80 overflow-y-auto pr-4'>
                                                    {lesson.topics.map((topic, index) => (
                                                        <li key={index}>{topic}</li>
                                                    ))}
                                                </ul>
                                            </DialogContent>
                                        </Dialog>
                                    )}
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button asChild className="w-full">
                                    <Link href={`/dashboard/lessons/${lesson.id}`}>{t.exploreSubject}</Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    )
                  })}
                </div>
          ) : (
            <div className="text-center py-16 border-2 border-dashed rounded-lg">
              <h3 className='text-lg font-semibold'>{t.noLessonsFound}</h3>
              <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                {useProfileFilters 
                  ? t.noLessonsForProfile
                  : t.noLessonsForFilter
                }
              </p>
               {useProfileFilters && (
                  <Button variant="default" size="sm" asChild className="mt-4">
                    <Link href="/dashboard/settings">
                      <Settings className='mr-2 h-4 w-4'/> {t.goToSettings}
                    </Link>
                  </Button>
               )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
