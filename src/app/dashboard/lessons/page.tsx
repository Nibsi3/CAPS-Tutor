'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { lessons, grades, placeholderLessons } from "@/lib/data";

// Create a unique list of subjects from the available lessons
const allLessons = [...lessons, ...placeholderLessons];
const availableSubjects = [...new Set(allLessons.map(l => l.subject))].map(s => ({ value: s, label: s}));

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
      <Card>
        <CardHeader>
          <CardTitle>Lesson Hub</CardTitle>
          <CardDescription>
            Browse and search for lessons. Use the filters to find content for your grade and subject.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
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
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredLessons.map(lesson => (
                <Card key={lesson.id}>
                  <CardHeader>
                    <CardTitle className="text-xl font-headline">{lesson.subject}</CardTitle>
                    <CardDescription>Grade {lesson.gradeLevel}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm font-medium mb-2">Key Topics:</p>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 h-32 overflow-y-auto">
                      {lesson.topics.map((obj, index) => (
                        <li key={index}>{obj}</li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button asChild className="w-full">
                        <Link href={`/dashboard/lessons/${lesson.id}`}>Explore Subject</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No lessons found for the selected filters. Please select a grade and subject.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
