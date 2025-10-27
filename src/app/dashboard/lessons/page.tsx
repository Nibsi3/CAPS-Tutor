'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { lessons, grades, subjects } from "@/lib/data";

export default function LessonsPage() {
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  const filteredLessons = lessons.filter(lesson => {
    const gradeMatch = !selectedGrade || lesson.gradeLevel === parseInt(selectedGrade);
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
            <Select onValueChange={setSelectedGrade}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by Grade" />
              </SelectTrigger>
              <SelectContent>
                {grades.map(grade => (
                  <SelectItem key={grade.value} value={grade.value}>{grade.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select onValueChange={setSelectedSubject}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by Subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map(subject => (
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
                    <CardTitle className="text-xl font-headline">{lesson.topic}</CardTitle>
                    <CardDescription>{lesson.subject} - Grade {lesson.gradeLevel}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm font-medium mb-2">Learning Objectives:</p>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                      {lesson.learningObjectives.map((obj, index) => (
                        <li key={index}>{obj}</li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full">Start Lesson</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No lessons found for the selected filters. Try clearing the filters to see all lessons.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
