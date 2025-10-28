'use client';

import { useParams } from 'next/navigation';
import { lessons, placeholderLessons } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { ExternalLink, BookOpenCheck } from 'lucide-react';

export default function LessonDetailPage() {
  const params = useParams();
  const lessonId = params.id as string;

  const allLessons = [...lessons, ...placeholderLessons];
  const lesson = allLessons.find(l => l.id === lessonId);

  if (!lesson) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Lesson not found.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-headline flex items-center gap-4">
            <BookOpenCheck className="w-8 h-8 text-primary" />
            {lesson.subject}
          </CardTitle>
          <CardDescription>
            Curriculum for Grade {lesson.gradeLevel}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold text-lg mb-2">Key Topics (CAPS Aligned)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lesson.topics.map((topic, index) => (
                <div key={index} className="p-4 border rounded-lg bg-muted/50">
                    {topic}
                </div>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {(lesson as any).textbookLink && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">E-Textbook</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">Access the official Siyavula or DBE textbook.</p>
                  <Button asChild>
                    <a href={(lesson as any).textbookLink} target="_blank" rel="noopener noreferrer">
                      Open Textbook <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            )}

            {(lesson as any).pastPapersLink && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl">Past Exam Papers</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-4">Practice with official past exam papers from the DBE.</p>
                        <Button asChild>
                             <a href={(lesson as any).pastPapersLink} target="_blank" rel="noopener noreferrer">
                                View Past Papers <ExternalLink className="ml-2 h-4 w-4" />
                             </a>
                        </Button>
                    </CardContent>
                </Card>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
