'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from '@/components/ui/textarea';
import { Loader, Target, Bot, AlertTriangle, ArrowRight, ArrowLeft } from "lucide-react";
import { getInteractiveFeedback, InteractiveFeedbackOutput } from '@/ai/flows/interactive-feedback-explanation';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { Progress } from '@/components/ui/progress';

interface GeneratedQuestion {
    questionNumber: string;
    questionText: string;
    marks: number;
    answer: string;
    studentAnswer?: string;
    feedback?: InteractiveFeedbackOutput | null;
    isChecking?: boolean;
}

interface ProcessedPaper {
    id: string;
    subject: string;
    year: string;
    paperName: string;
    status: 'Processing' | 'Processed' | 'Failed';
    questionCount?: number;
    gradeLevel?: number;
    generatedQuestions?: GeneratedQuestion[];
}

export default function PastPaperPracticePage() {
    const params = useParams();
    const router = useRouter();
    const firestore = useFirestore();
    const { toast } = useToast();
    const { id } = params;

    const paperRef = useMemoFirebase(() => {
        if (!firestore || !id) return null;
        return doc(firestore, 'pastPapers', id as string);
    }, [firestore, id]);

    const { data: paper, isLoading: isPaperLoading } = useDoc<ProcessedPaper>(paperRef);

    const [questions, setQuestions] = useState<GeneratedQuestion[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);

    useEffect(() => {
        if (paper && paper.generatedQuestions) {
            setQuestions(paper.generatedQuestions);
        }
    }, [paper]);
    
    const handleAnswerChange = (index: number, answer: string) => {
        const newQuestions = [...questions];
        newQuestions[index].studentAnswer = answer;
        setQuestions(newQuestions);
    };

    const handleCheckAnswer = async (index: number) => {
        const question = questions[index];
        if (!question.studentAnswer) {
            toast({ variant: 'destructive', title: 'No answer provided', description: 'Please enter an answer before checking.' });
            return;
        }

        const newQuestions = [...questions];
        newQuestions[index].isChecking = true;
        setQuestions(newQuestions);

        try {
            const feedbackResult = await getInteractiveFeedback({
                question: question.questionText,
                studentAnswer: question.studentAnswer,
                gradeLevel: paper?.gradeLevel || 12,
                subject: paper?.subject || 'Unknown',
            });
            newQuestions[index].feedback = feedbackResult;
            if (feedbackResult.isCorrect && !question.feedback?.isCorrect) {
                setScore(s => s + 1);
            }
        } catch (error) {
            console.error("Feedback Error:", error);
            toast({ variant: "destructive", title: "Feedback Failed", description: "Could not get feedback for this answer." });
            newQuestions[index].feedback = null;
        } finally {
            newQuestions[index].isChecking = false;
            setQuestions(newQuestions);
        }
    };

    if (isPaperLoading) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <Loader className="h-12 w-12 animate-spin text-primary" />
                <p className="ml-4 text-muted-foreground">Loading Past Paper...</p>
            </div>
        );
    }
    
    if (!paper) {
        return (
             <Card>
                <CardHeader>
                    <CardTitle className='text-destructive flex items-center gap-2'><AlertTriangle /> Paper Not Found</CardTitle>
                    <CardDescription>
                        The past paper you are trying to access does not exist. It may have been deleted.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                     <Button asChild>
                        <Link href="/dashboard/past-papers">Go Back to Past Papers</Link>
                    </Button>
                </CardContent>
            </Card>
        )
    }

    if (paper.status !== 'Processed' || !paper.generatedQuestions || paper.generatedQuestions.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2'><AlertTriangle className="text-destructive" /> Paper Not Ready</CardTitle>
                    <CardDescription>
                        This past paper has not been processed by the AI yet, or no questions were found inside it.
                    </CardDescription>
                </CardHeader>
                 <CardContent>
                    <p className="mb-4 text-sm text-muted-foreground">
                        Please ask an administrator to process the paper from the admin panel.
                    </p>
                    <Button asChild>
                        <Link href="/dashboard/past-papers">Go Back</Link>
                    </Button>
                </CardContent>
            </Card>
        );
    }
    
    const questionsCount = questions.length;
    const currentQuestion = questions[currentQuestionIndex];
    const currentQuestionCorrect = !!currentQuestion?.feedback?.isCorrect;

    return (
        <div className="flex-1">
            <div className="grid grid-cols-1 gap-6 h-full">
                <Card className="flex flex-col">
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle className="font-headline text-3xl flex items-center gap-3">
                                    <Target className="w-8 h-8 text-primary" />
                                    {paper.subject} - {paper.year}
                                </CardTitle>
                                <CardDescription>
                                    Question {currentQuestionIndex + 1} of {questionsCount}
                                </CardDescription>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-muted-foreground">Score</p>
                                <p className="font-headline text-2xl font-bold">{score} / {questionsCount}</p>
                            </div>
                        </div>
                        <Progress value={((currentQuestionIndex + (currentQuestionCorrect ? 1 : 0)) / questionsCount) * 100} className="mt-4" />
                    </CardHeader>

                    <CardContent className="space-y-4 pt-6 flex-1">
                        {currentQuestion && (
                            <div className="rounded-xl border bg-card text-card-foreground shadow p-6 space-y-4">
                                <p className="font-semibold text-lg">Question {currentQuestion.questionNumber}: <span className="text-sm font-normal text-muted-foreground">({currentQuestion.marks} marks)</span></p>
                                <div className="text-base prose max-w-none"><ReactMarkdown>{currentQuestion.questionText}</ReactMarkdown></div>
                                
                                <Textarea 
                                    placeholder="Your answer..."
                                    value={currentQuestion.studentAnswer || ''}
                                    onChange={(e) => handleAnswerChange(currentQuestionIndex, e.target.value)}
                                    disabled={!!currentQuestion.feedback?.isCorrect}
                                    rows={4}
                                />
                                
                                <Button onClick={() => handleCheckAnswer(currentQuestionIndex)} disabled={!currentQuestion.studentAnswer || currentQuestion.isChecking || !!currentQuestion.feedback?.isCorrect}>
                                    {currentQuestion.isChecking && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                                    {currentQuestion.isChecking ? 'Checking...' : 'Check Answer'}
                                </Button>
                                
                                {currentQuestion.feedback && (
                                    <div className="mt-4 space-y-4 rounded-lg border p-4 text-left bg-muted/50">
                                        <h4 className="font-semibold flex items-center gap-2">
                                            <Bot className="w-5 h-5 text-primary" />
                                            AI Feedback:
                                        </h4>
                                        <p className={`font-semibold ${currentQuestion.feedback.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                                            {currentQuestion.feedback.isCorrect ? 'Correct! Excellent work.' : 'Not quite. Here is a step-by-step explanation:'}
                                        </p>
                                        <div className="prose prose-sm max-w-full text-muted-foreground prose-p:my-3 prose-li:my-1.5 prose-p:leading-relaxed">
                                            <ReactMarkdown>{currentQuestion.feedback.explanation}</ReactMarkdown>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                    <div className="p-4 border-t flex justify-between items-center">
                        <Button
                            variant="outline"
                            onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                            disabled={currentQuestionIndex === 0}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                        </Button>
                        <div className="text-sm text-muted-foreground">
                            {currentQuestionIndex + 1} / {questionsCount}
                        </div>
                        <Button
                            onClick={() => setCurrentQuestionIndex(prev => Math.min(questionsCount - 1, prev + 1))}
                            disabled={currentQuestionIndex === questionsCount - 1 || !currentQuestionCorrect}
                        >
                           Next <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
}
