'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { lessons, grades, placeholderLessons, subjectColors } from "@/lib/data";
import { BookOpen, BarChart, FileText, FlaskConical, Globe, Landmark, Calculator, Loader, UserCheck, Settings, MessageSquare, Heart, Sparkles, Users, TrendingUp, Clock, Cpu, Laptop, Plane, ShoppingBag, UtensilsCrossed, Ruler, Search } from "lucide-react";
import { cn } from '@/lib/utils';
import { useDoc, useUser, useDatabases, useMemoAppwrite } from '@/appwrite';
import { appwriteConfig } from '@/appwrite/config';
import { getSubjectsForGrade } from '@/components/home/AllSubjectsSection';
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
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useScrollRestore } from '@/hooks/use-scroll-restore';

  // Create a unique list of subjects from the available lessons
const allLessons = [...lessons, ...placeholderLessons];

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

  // Manual filters state - persist across reloads
  const [selectedGrade, setSelectedGrade] = useLocalStorage<string | null>("lessons-selected-grade", null);
  const [selectedSubject, setSelectedSubject] = useLocalStorage<string | null>("lessons-selected-subject", null);
  const [searchTerm, setSearchTerm] = useLocalStorage<string>("lessons-search-term", '');
  
  // Restore scroll position on reload
  useScrollRestore("lessons-page");

  // Determine the effective grade to use for filtering
  const effectiveGrade = selectedGrade || (userProfile?.gradeLevel ? userProfile.gradeLevel.toString() : null);
  
  // Get available subjects for the effective grade
  const availableSubjectsForGrade = effectiveGrade 
    ? getSubjectsForGrade(effectiveGrade).map(s => ({ value: s, label: s }))
    : [...new Set(allLessons.map(l => l.subject))].map(s => ({ value: s, label: s }));

  // Determine if profile filters should be used (only if no manual filters are active)
  const hasManualFilters = selectedGrade !== null || selectedSubject !== null;
  
  // Use profile filters if:
  // 1. No manual filters are active
  // 2. User has a grade level
  // 3. User has subjects selected (required for all grades 10-12)
  const useProfileFilters = !hasManualFilters && userProfile && userProfile.gradeLevel && 
    (userProfile.subjects && userProfile.subjects.length > 0);

  // Check if user is in senior grade (10-12)
  const isSeniorGrade = userProfile && userProfile.gradeLevel >= 10;

  const filteredLessons = allLessons.filter(lesson => {
    // First apply grade/subject filters
    let matchesFilters = false;
    if (useProfileFilters) {
      // Filter based on user profile settings
      // For grades 10-12: filter by both grade and selected subjects
      const gradeMatch = lesson.gradeLevel === userProfile.gradeLevel.toString();
      const subjectMatch = userProfile.subjects && userProfile.subjects.includes(lesson.subject);
      matchesFilters = gradeMatch && subjectMatch;
    } else {
      // Filter based on manual dropdowns
      const gradeMatch = !selectedGrade || lesson.gradeLevel === selectedGrade;
      const subjectMatch = !selectedSubject || lesson.subject === selectedSubject;
      matchesFilters = gradeMatch && subjectMatch;
    }

    // Then apply search filter
    if (!matchesFilters) return false;
    
    if (searchTerm.trim() === '') return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      lesson.subject.toLowerCase().includes(searchLower) ||
      lesson.topics.some(topic => topic.toLowerCase().includes(searchLower)) ||
      lesson.gradeLevel.toString().includes(searchLower)
    );
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
                  {isSeniorGrade && userProfile.subjects && userProfile.subjects.length > 0 ? (
                    <p className="text-sm text-muted-foreground">{t.yourSubjectsAre.replace('{subjects}', userProfile.subjects.join(', '))}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">Showing all subjects available for Grade {userProfile.gradeLevel}</p>
                  )}
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
              <Select onValueChange={(value) => {
                setSelectedGrade(value);
                // Clear subject when grade changes to ensure dropdown shows correct subjects
                setSelectedSubject(null);
              }} value={selectedGrade || ''}>
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
                  {availableSubjectsForGrade.map(subject => (
                    <SelectItem key={subject.value} value={subject.value}>{subject.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={() => { setSelectedGrade(null); setSelectedSubject(null); }} variant="outline">
                {t.clearFilters}
              </Button>
            </div>
          )}

          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t.searchLessons}
              className="pl-10 w-full md:w-1/2 lg:w-1/3"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

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
