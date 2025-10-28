'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from '@/components/ui/textarea';
import { Loader, Target, Bot, Sparkles } from "lucide-react";
import { generateAdaptiveExam, AdaptiveExamOutput } from '@/ai/flows/adaptive-exam-generation';
import { getInteractiveFeedback, InteractiveFeedbackOutput } from '@/ai/flows/interactive-feedback-explanation';
import { useUser, useDoc, useMemoFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { doc, getFirestore } from 'firebase/firestore';

// Correctly define the type for a single question
type ExamQuestion = AdaptiveExamOutput['examQuestions'][number];

interface QuestionWithFeedback extends ExamQuestion {
  studentAnswer?: string;
  feedback?: InteractiveFeedbackOutput | null;
  isChecking?: boolean;
}

export default function PracticePage() {
  const { user } = useUser();
  const firestore = getFirestore();
  const { toast } = useToast();
  const searchParams = useSearchParams();

  const [isLoading, setIsLoading] = useState(false);
  const [exam, setExam] = useState<{ examQuestions: QuestionWithFeedback[] } | null>(null);
  const [topic, setTopic] = useState<string | null>(null);
  const [grade, setGrade] = useState<string | null>(null);
  const [subject, setSubject] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const userProfileRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, `users/${user.uid}`);
  }, [user, firestore]);
  const { data: userProfile } = useDoc(userProfileRef);

  useEffect(() => {
    const topicParam = searchParams.get('topic');
    const gradeParam = searchParams.get('grade');
    const subjectParam = searchParams.get('subject');

    if (topicParam) {
      setTopic(decodeURIComponent(topicParam));
      setGrade(gradeParam);
      setSubject(subjectParam);
    } else {
        setIsInitialLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    if (topic && user) {
        handleGenerateExam();
    }
  }, [topic, user]);


  const handleGenerateExam = async () => {
    if (!user) {
        toast({ variant: "destructive", title: "Not Logged In", description: "You must be logged in to practice." });
        return;
    }
    if (!topic && !userProfile) {
        toast({ variant: "destructive", title: "No Topic Selected", description: "Go to the lessons page to pick a topic to practice!" });
        return;
    }

    setIsLoading(true);
    setExam(null);
    try {
        const result = await generateAdaptiveExam({
            studentId: user.uid,
            numQuestions: 5,
            topic: topic || undefined,
            gradeLevel: grade ? parseInt(grade) : userProfile?.gradeLevel,
            subject: subject || userProfile?.subjects?.[0]
        });
        if (result.examQuestions.length === 0) {
            toast({ variant: "destructive", title: "Generation Failed", description: "The AI couldn't generate questions for this topic. Please try another." });
        }
        setExam({ examQuestions: result.examQuestions.map(q => ({...q})) });
        toast({ title: "Practice Session Ready!", description: "Your custom questions are prepared." });
    } catch (error) {
        console.error("Failed to generate exam:", error);
        toast({ variant: "destructive", title: "Generation Failed", description: "The AI failed to generate an exam. Please try again." });
    } finally {
        setIsLoading(false);
        setIsInitialLoading(false);
    }
  };

  const handleAnswerChange = (index: number, answer: string) => {
    if (!exam) return;
    const newQuestions = [...exam.examQuestions];
    newQuestions[index].studentAnswer = answer;
    setExam({ examQuestions: newQuestions });
  };

  const handleCheckAnswer = async (index: number) => {
    if (!exam || !userProfile) return;

    const newQuestions = [...exam.examQuestions];
    const question = newQuestions[index];
    
    if (!question.studentAnswer) {
        toast({ variant: 'destructive', title: 'No answer provided', description: 'Please enter an answer before checking.' });
        return;
    }
    
    question.isChecking = true;
    setExam({ examQuestions: newQuestions });

    try {
        const feedbackResult = await getInteractiveFeedback({
            question: question.question,
            studentAnswer: question.studentAnswer,
            gradeLevel: grade ? parseInt(grade) : userProfile.gradeLevel,
            subject: subject || question.topic,
        });
        newQuestions[index].feedback = feedbackResult;
    } catch (error) {
        console.error("Feedback Error:", error);
        toast({ variant: "destructive", title: "Feedback Failed", description: "Could not get feedback for this answer." });
        newQuestions[index].feedback = null;
    } finally {
        newQuestions[index].isChecking = false;
        setExam({ examQuestions: newQuestions });
    }
  };
  
    if (isInitialLoading) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <Loader className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    if (!topic) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-3xl">Practice Zone</CardTitle>
                    <CardDescription>
                        Test your knowledge with custom quizzes on any topic.
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center py-12">
                    <div className="mx-auto bg-primary/10 rounded-full w-24 h-24 flex items-center justify-center mb-6">
                        <Sparkles className="w-12 h-12 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold font-headline mb-2">Select a Topic to Start</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                       Visit the "Lessons" page to choose a subject and topic you'd like to practice.
                    </p>
                    <Button size="lg" asChild>
                       <a href="/dashboard/lessons">Browse Lessons</a>
                    </Button>
                </CardContent>
            </Card>
        );
    }

  return (
    <div className="flex-1 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="font-headline text-3xl flex items-center gap-3">
                <Target className="w-8 h-8 text-primary" />
                Practice: {topic}
              </CardTitle>
              <CardDescription>
                Answer the questions below and get instant AI feedback.
              </CardDescription>
            </div>
            <Button size="sm" onClick={handleGenerateExam} disabled={isLoading}>
                {isLoading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                Regenerate Questions
            </Button>
          </div>
        </CardHeader>
      </Card>
      
      {isLoading && !exam && (
          <div className="text-center p-12">
            <Loader className="mx-auto h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Generating your practice questions...</p>
          </div>
      )}

      {exam && (
        <Card>
            <CardContent className="space-y-6 pt-6">
                {exam.examQuestions.map((q, index) => (
                    <div key={index} className="rounded-xl border bg-card text-card-foreground shadow p-6 space-y-4">
                        <p className="font-semibold text-lg">Question {index + 1}: <span className="text-sm font-normal text-muted-foreground">({q.topic})</span></p>
                        <p className="text-base">{q.question}</p>
                        
                        <Textarea 
                          placeholder="Your answer..."
                          value={q.studentAnswer || ''}
                          onChange={(e) => handleAnswerChange(index, e.target.value)}
                          disabled={!!q.feedback}
                          rows={3}
                        />
                        
                        <Button onClick={() => handleCheckAnswer(index)} disabled={!q.studentAnswer || q.isChecking || !!q.feedback}>
                            {q.isChecking && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                            {q.isChecking ? 'Checking...' : 'Check Answer'}
                        </Button>
                        
                        {q.feedback && (
                            <div className="mt-4 space-y-4 rounded-lg border p-4 text-left bg-muted/50">
                                <h4 className="font-semibold flex items-center gap-2">
                                  <Bot className="w-5 h-5 text-primary" />
                                  AI Feedback:
                                </h4>
                                <p className={`font-semibold ${q.feedback.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                                {q.feedback.isCorrect ? 'Correct! Excellent work.' : 'Not quite. Here is a step-by-step explanation:'}
                                </p>
                                <div className="prose prose-sm max-w-full text-muted-foreground">
                                    <p>{q.feedback.explanation}</p>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
                {exam.examQuestions.length === 0 && !isLoading && (
                     <div className="text-center p-12 text-muted-foreground">
                        <p>The AI could not generate questions for "{topic}".</p>
                        <p>Please try a different topic from the lessons page.</p>
                    </div>
                )}
            </CardContent>
        </Card>
      )}
    </div>
  )
}
