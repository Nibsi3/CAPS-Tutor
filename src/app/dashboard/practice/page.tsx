'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader, Target, AlertTriangle, CheckCircle } from "lucide-react";
import { generateAdaptiveExam, AdaptiveExamOutput } from '@/ai/flows/adaptive-exam-generation';
import { useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';

export default function PracticePage() {
  const { user } = useUser();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [exam, setExam] = useState<AdaptiveExamOutput | null>(null);

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
        setExam(result);
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

  return (
    <div className="flex-1 space-y-4">
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
                <CardDescription>Answer the questions below.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {exam.examQuestions.map((q, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                        <p className="font-semibold mb-2">Question {index + 1}: <span className="text-sm font-normal text-muted-foreground">({q.topic})</span></p>
                        <p className="mb-4">{q.question}</p>
                        <div className="flex items-center gap-2">
                             <Button variant="outline">Show Answer</Button>
                             <div className="flex items-center gap-2 text-sm">
                                <Button variant="ghost" size="sm" className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-500" /> I got it right</Button>
                                <Button variant="ghost" size="sm" className="flex items-center gap-1"><AlertTriangle className="w-4 h-4 text-red-500" /> I got it wrong</Button>
                             </div>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
      )}
    </div>
  )
}
