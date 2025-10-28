'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight, BookOpen, BrainCircuit, Target } from 'lucide-react';
import { getInteractiveFeedback, InteractiveFeedbackOutput } from '@/ai/flows/interactive-feedback-explanation';
import { useToast } from '@/hooks/use-toast';
import { grades, mathQuestionsByGrade } from '@/lib/data';

export default function LandingPage() {
  const { toast } = useToast();
  const [selectedGrade, setSelectedGrade] = useState('8');
  const [studentAnswer, setStudentAnswer] = useState('');
  const [feedback, setFeedback] = useState<InteractiveFeedbackOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const currentQuestion = mathQuestionsByGrade[selectedGrade].question;

  const handleGradeChange = (grade: string) => {
    setSelectedGrade(grade);
    setStudentAnswer('');
    setFeedback(null);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setFeedback(null);
    try {
      const result = await getInteractiveFeedback({
        question: currentQuestion,
        studentAnswer: studentAnswer,
        gradeLevel: parseInt(selectedGrade),
        subject: 'Mathematics',
      });
      setFeedback(result);
    } catch (error) {
      console.error('AI feedback error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not get feedback from the AI tutor.',
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-primary"
            >
              <path
                d="M16 3L3 9.75V22.25L16 29L29 22.25V9.75L16 3Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M3 10L16 17L29 10"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path d="M16 17V29" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="font-headline text-xl font-bold">CAPS Tutor</span>
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/login">Log In</Link>
            </Button>
            <Button asChild>
              <Link href="/login">
                Sign Up <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="container mx-auto grid grid-cols-1 items-center gap-12 px-4 py-16 text-center md:grid-cols-2 md:py-24 md:text-left">
          <div className="space-y-6">
            <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
              Master the CAPS Curriculum with your AI-Powered Tutor
            </h1>
            <p className="max-w-[600px] text-lg text-muted-foreground md:text-xl">
              Interactive lessons, adaptive practice, and instant feedback to help you excel in your studies.
              Tailored for the South African syllabus.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row md:justify-start">
              <Button size="lg" asChild>
                <Link href="/login">Get Started for Free</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#interactive-demo">See it in Action</Link>
              </Button>
            </div>
          </div>
          <div className="relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="w-64 h-64 bg-primary/20 rounded-full blur-3xl"></div>
                <div className="w-48 h-48 bg-accent/20 rounded-full blur-3xl absolute -bottom-16 -right-16"></div>
            </div>
            <Card className="relative z-10 animate-fade-in-up">
              <CardHeader>
                <CardTitle>Try the AI Tutor!</CardTitle>
                <CardDescription>Select your grade to get a sample question.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select value={selectedGrade} onValueChange={handleGradeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {grades.map(grade => (
                      <SelectItem key={grade.value} value={grade.value}>
                        {grade.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="space-y-2 rounded-lg bg-muted p-4 text-left">
                  <p className="text-sm font-medium">Question:</p>
                  <p>{currentQuestion}</p>
                </div>

                <Textarea
                  placeholder="Type your answer here..."
                  value={studentAnswer}
                  onChange={(e) => setStudentAnswer(e.target.value)}
                />
                <Button onClick={handleSubmit} disabled={isLoading} className="w-full">
                  {isLoading ? 'Checking...' : 'Submit Answer'}
                </Button>

                {feedback && (
                  <div className="mt-4 space-y-4 rounded-lg border p-4 text-left">
                    <h4 className="font-semibold">Feedback:</h4>
                    <p className={feedback.isCorrect ? 'text-green-600' : 'text-red-600'}>
                      {feedback.isCorrect ? 'Correct! Well done.' : 'Not quite. Here is a hint:'}
                    </p>
                    <div className="prose prose-sm max-w-full text-muted-foreground">
                      <p>{feedback.explanation}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </section>
        
        <section id="features" className="bg-muted/50 py-16 md:py-24">
            <div className="container mx-auto px-4">
                <div className="mx-auto max-w-3xl text-center">
                    <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl">Features Designed for Success</h2>
                    <p className="mt-4 text-lg text-muted-foreground">Everything you need to conquer the CAPS syllabus.</p>
                </div>
                <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
                    <div className="flex flex-col items-center space-y-4 text-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <BookOpen className="h-8 w-8" />
                        </div>
                        <h3 className="font-headline text-xl font-bold">Comprehensive Lessons</h3>
                        <p className="text-muted-foreground">Full coverage of all CAPS subjects, with e-textbooks and official resources at your fingertips.</p>
                    </div>
                    <div className="flex flex-col items-center space-y-4 text-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <BrainCircuit className="h-8 w-8" />
                        </div>
                        <h3 className="font-headline text-xl font-bold">Adaptive Practice</h3>
                        <p className="text-muted-foreground">The AI generates custom exams focusing on your weak spots, helping you improve faster.</p>
                    </div>
                     <div className="flex flex-col items-center space-y-4 text-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <Target className="h-8 w-8" />
                        </div>
                        <h3 className="font-headline text-xl font-bold">Progress Tracking</h3>
                        <p className="text-muted-foreground">Visualize your learning journey with milestones and detailed dashboards for every subject.</p>
                    </div>
                </div>
            </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row md:px-6">
            <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} CAPS Tutor. All rights reserved.</p>
            <nav className="flex gap-4 sm:gap-6">
                <Link href="#" className="text-sm hover:underline">Terms of Service</Link>
                <Link href="#" className="text-sm hover:underline">Privacy Policy</Link>
            </nav>
        </div>
      </footer>
    </div>
  );
}

    