'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { lessons, grades, placeholderLessons } from "@/lib/data";
import { BookOpen, BarChart, FileText, FlaskConical, Globe, Landmark, Calculator } from "lucide-react";
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// Create a unique list of subjects from the available lessons
const allLessons = [...lessons, ...placeholderLessons];
const availableSubjects = [...new Set(allLessons.map(l => l.subject))].map(s => ({ value: s, label: s}));

const subjectIcons: Record<string, React.ElementType> = {
  "Mathematics": Calculator,
  "Physical Sciences": FlaskConical,
  "Life Sciences": BarChart,
  "Accounting": FileText,
  "Business Studies": Landmark,
  "Geography": Globe,
  // Add more icons for other subjects if needed
};

const subjectColors: Record<string, { bg: string, text: string }> = {
    "Mathematics": {
      bg: "bg-blue-100 dark:bg-blue-900/30",
      text: "text-blue-600 dark:text-blue-400"
    },
    "Physical Sciences": {
      bg: "bg-purple-100 dark:bg-purple-900/30",
      text: "text-purple-600 dark:text-purple-400"
    },
    "Life Sciences": {
      bg: "bg-green-100 dark:bg-green-900/30",
      text: "text-green-600 dark:text-green-400"
    },
    "Geography": {
      bg: "bg-orange-100 dark:bg-orange-900/30",
      text: "text-orange-600 dark:text-orange-400"
    },
    "Accounting": {
      bg: "bg-indigo-100 dark:bg-indigo-900/30",
      text: "text-indigo-600 dark:text-indigo-400"
    },
    "Business Studies": {
      bg: "bg-pink-100 dark:bg-pink-900/30",
      text: "text-pink-600 dark:text-pink-400"
    },
};


export default function LessonsPage() {
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  const filteredLessons = allLessons.filter(lesson => {
    const gradeMatch = !selectedGrade || lesson.gradeLevel === selectedGrade;
    const subjectMatch = !selectedSubject || lesson.subject === selectedSubject;
    return gradeMatch && subjectMatch;
  });


  return (
    <div className="flex-1 space-y-6">
      <Card className='overflow-hidden rounded-2xl'>
        <div className="bg-card p-6 border-b">
            <CardTitle className="font-headline text-3xl flex items-center gap-3"><BookOpen className='w-8 h-8' />Lesson Hub</CardTitle>
            <CardDescription className='pt-2'>
                Browse and search for lessons. Use the filters to find content for your grade and subject.
            </CardDescription>
        </div>
        <CardContent className='p-6'>
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <Select onValueChange={setSelectedGrade} value={selectedGrade || ''}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by Grade" />
              </SelectTrigger>
              <SelectContent>
                {grades.map(grade => (
                  <SelectItem key={grade.value} value={grade.value}>{grade.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select onValueChange={setSelectedSubject} value={selectedSubject || ''}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by Subject" />
              </SelectTrigger>
              <SelectContent>
                {availableSubjects.map(subject => (
                  <SelectItem key={subject.value} value={subject.value}>{subject.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
             <Button onClick={() => { setSelectedGrade(null); setSelectedSubject(null); }} variant="outline">
              Clear Filters
            </Button>
          </div>

          {filteredLessons.length > 0 ? (
             <TooltipProvider>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredLessons.map(lesson => {
                    const Icon = subjectIcons[lesson.subject] || BookOpen;
                    const colors = subjectColors[lesson.subject] || { bg: "bg-muted", text: "text-muted-foreground" };

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
                                <p className="text-sm font-medium">Key Topics:</p>
                                <div className="space-y-2 text-sm text-muted-foreground">
                                    {lesson.topics.slice(0, 5).map((topic, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary/50"></div>
                                            <span>{topic}</span>
                                        </div>
                                    ))}
                                    {lesson.topics.length > 5 && (
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div className="text-xs font-semibold text-primary/80 pt-1 cursor-pointer hover:underline">...and {lesson.topics.length - 5} more</div>
                                            </TooltipTrigger>
                                            <TooltipContent className="max-w-xs">
                                                <p className='font-medium'>Additional Topics:</p>
                                                <ul className='list-disc list-inside mt-2 space-y-1'>
                                                    {lesson.topics.slice(5).map((topic, index) => (
                                                        <li key={index}>{topic}</li>
                                                    ))}
                                                </ul>
                                            </TooltipContent>
                                        </Tooltip>
                                    )}
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button asChild className="w-full">
                                    <Link href={`/dashboard/lessons/${lesson.id}`}>Explore Subject</Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    )
                  })}
                </div>
            </TooltipProvider>
          ) : (
            <div className="text-center py-16 border-2 border-dashed rounded-lg">
              <h3 className='text-lg font-semibold'>No Lessons Found</h3>
              <p className="text-muted-foreground mt-2">No lessons matched your filter criteria. Please try different options.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
