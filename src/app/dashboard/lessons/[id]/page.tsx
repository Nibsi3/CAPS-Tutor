'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { lessons, placeholderLessons } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from "@/components/ui/progress";
import { ExternalLink, BookOpenCheck, Bot, Search } from 'lucide-react';
import Link from 'next/link';

export default function LessonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = params.id as string;
  const [searchTerm, setSearchTerm] = useState('');
  const [topicProgress, setTopicProgress] = useState<Record<string, number>>({});

  const allLessons = [...lessons, ...placeholderLessons];
  const lesson = allLessons.find(l => l.id === lessonId);

  useEffect(() => {
    if (lesson) {
      const initialProgress: Record<string, number> = {};
      lesson.topics.forEach(topic => {
        initialProgress[topic] = Math.floor(Math.random() * 100);
      });
      setTopicProgress(initialProgress);
    }
  }, [lesson]);


  if (!lesson) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Lesson not found.</p>
      </div>
    );
  }

  const filteredTopics = lesson.topics.filter(topic =>
    topic.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTopicClick = (topic: string) => {
    // Navigate to the practice page with the topic as a query parameter
    const encodedTopic = encodeURIComponent(topic);
    router.push(`/dashboard/practice?topic=${encodedTopic}&grade=${lesson.gradeLevel}&subject=${lesson.subject}`);
  };


  return (
    <div className="flex-1 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-3xl font-headline flex items-center gap-4">
                <BookOpenCheck className="w-8 h-8 text-primary" />
                {lesson.subject}
              </CardTitle>
              <CardDescription>
                Curriculum for Grade {lesson.gradeLevel}
              </CardDescription>
            </div>
            <Button asChild>
              <Link href="/dashboard/tutor">
                <Bot className="mr-2 h-4 w-4" /> Ask AI Tutor
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold text-lg mb-4">Key Topics (CAPS Aligned)</h3>
            <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                    type="search"
                    placeholder="Search topics..."
                    className="pl-10 w-full md:w-1/2 lg:w-1/3"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTopics.map((topic, index) => {
                const progress = topicProgress[topic] ?? 0; // Use progress from state
                return (
                 <button 
                    key={index} 
                    onClick={() => handleTopicClick(topic)}
                    className="group text-left p-4 border rounded-lg bg-card hover:bg-muted transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary flex flex-col justify-between h-32"
                >
                    <span className="font-medium mb-2">{topic}</span>
                    <div className="mt-auto w-full">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-muted-foreground">Progress</span>
                            <span className="text-xs font-bold text-primary">{progress}%</span>
                        </div>
                        <Progress value={progress} indicatorClassName="bg-gradient-to-r from-blue-400 to-purple-500" />
                    </div>
                </button>
              )})}
            </div>
             {filteredTopics.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                    <p>No topics found matching "{searchTerm}".</p>
                </div>
            )}
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
