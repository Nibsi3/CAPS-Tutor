'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from '@/components/ui/textarea';
import { Loader, Target, CheckCircle } from "lucide-react";
import { generateAdaptiveExam, AdaptiveExamOutput } from '@/ai/flows/adaptive-exam-generation';
import { getInteractiveFeedback, InteractiveFeedbackOutput } from '@/ai/flows/interactive-feedback-explanation';
import { useUser, useDoc, useMemoFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { doc, getFirestore } from 'firebase/firestore';

interface QuestionWithFeedback extends AdaptiveExamOutput['examQuestions'][0] {
  studentAnswer?: string;
  feedback?: InteractiveFeedbackOutput | null;
  isChecking?: boolean;
}

export default function PracticePage() {
  const { user } = useUser();
  const firestore = getFirestore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [exam, setExam] = useState<{ examQuestions: QuestionWithFeedback[] } | null>(null);

  const userProfileRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, `users/${user.uid}`);
  }, [user, firestore]);
  const { data: userProfile } = useDoc(userProfileRef);

  const handleGenerateExam = async () => {
    if (!user) {
        toast({
            variant: "destructive",
            title: "Not Logged In",
            description: "You must be logged in to generate an exam.",
        });
        return;
    }

    setIsLoading(true);
    setExam(null);
    try {
        const result = await generateAdaptiveExam({
            studentId: user.uid,
            numQuestions: 5,
        });
        setExam({ examQuestions: result.examQuestions.map(q => ({...q})) });
        toast({
            title: "Exam Generated!",
            description: "Your custom exam is ready.",
            icon: <CheckCircle className="h-5 w-5 text-green-500" />,
        });
    } catch (error) {
        console.error("Failed to generate exam:", error);
        toast({
            variant: "destructive",
            title: "Generation Failed",
            description: "The AI failed to generate an exam. Please try again.",
        });
    } finally {
        setIsLoading(false);
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
    question.isChecking = true;
    setExam({ examQuestions: newQuestions });

    try {
        const result = await getInteractiveFeedback({
            question: question.question,
            studentAnswer: question.studentAnswer || '',
            gradeLevel: parseInt(userProfile.gradeLevel),
            subject: question.topic, // Or a more general subject if available
        });
        newQuestions[index].feedback = result;
    } catch (error) {
        console.error("Feedback Error:", error);
        toast({
            variant: "destructive",
            title: "Feedback Failed",
            description: "Could not get feedback for this answer.",
        });
        newQuestions[index].feedback = null;
    } finally {
        newQuestions[index].isChecking = false;
        setExam({ examQuestions: newQuestions });
    }
  };

  return (
    <div className="flex-1 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Adaptive Exam Generator</CardTitle>
          <CardDescription>
            Test your knowledge with custom exams focused on your weak topics.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
            <div className="mx-auto bg-primary/10 rounded-full w-24 h-24 flex items-center justify-center mb-6">
                <Target className="w-12 h-12 text-primary" />
            </div>
          <h3 className="text-2xl font-bold font-headline mb-2">Ready for a challenge?</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            The AI will create a 5-question test based on your recent performance to help you improve.
          </p>
          <Button size="lg" onClick={handleGenerateExam} disabled={isLoading}>
            {isLoading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? 'Generating Exam...' : 'Generate Custom Exam'}
          </Button>
        </CardContent>
      </Card>
      
      {exam && (
        <Card>
            <CardHeader>
                <CardTitle>Your Custom Exam</CardTitle>
                <CardDescription>Answer the questions below and get instant feedback.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {exam.examQuestions.map((q, index) => (
                    <div key={index} className="rounded-xl border bg-card text-card-foreground shadow p-6 space-y-4">
                        <p className="font-semibold text-lg">Question {index + 1}: <span className="text-sm font-normal text-muted-foreground">({q.topic})</span></p>
                        <p className="text-base">{q.question}</p>
                        
                        <Textarea 
                          placeholder="Your answer..."
                          value={q.studentAnswer || ''}
                          onChange={(e) => handleAnswerChange(index, e.target.value)}
                        />
                        
                        <Button onClick={() => handleCheckAnswer(index)} disabled={!q.studentAnswer || q.isChecking}>
                            {q.isChecking && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                            {q.isChecking ? 'Checking...' : 'Check Answer'}
                        </Button>
                        
                        {q.feedback && (
                            <div className="mt-4 space-y-4 rounded-lg border p-4 text-left bg-muted/50">
                                <h4 className="font-semibold">Feedback:</h4>
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
            </CardContent>
        </Card>
      )}
    </div>
  )
}

    