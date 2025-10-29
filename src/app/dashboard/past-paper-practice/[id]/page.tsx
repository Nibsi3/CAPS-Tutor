
'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader, FileText, Clock, HelpCircle, ArrowRight, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface GeneratedQuestion {
    questionNumber: string;
    questionText: string;
    marks: number;
    answer: string;
}

interface PastPaper {
    id: string;
    subject: string;
    year: string;
    paperName: string;
    status: 'Processing' | 'Processed' | 'Failed';
    questionCount?: number;
    generatedQuestions?: GeneratedQuestion[];
}


export default function PastPaperSessionPage() {
    const params = useParams();
    const paperId = params.id as string;
    const firestore = useFirestore();
    const [isStartingSession, setIsStartingSession] = useState(false);

    const paperRef = useMemoFirebase(() => {
        if (!firestore || !paperId) return null;
        return doc(firestore, 'pastPapers', paperId);
    }, [firestore, paperId]);

    const { data: paper, isLoading } = useDoc<PastPaper>(paperRef);

    const handleStartSession = () => {
        setIsStartingSession(true);
        // Here you would navigate to the actual question interface
        // For now, we just simulate a loading state
        setTimeout(() => {
            alert("Let's begin the practice session!");
            setIsStartingSession(false);
        }, 1500);
    }

    if (isLoading) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <Loader className="h-12 w-12 animate-spin text-primary" />
                <p className="ml-4 text-muted-foreground">Loading Past Paper...</p>
            </div>
        );
    }

    if (!paper) {
        return (
             <div className="flex h-full w-full items-center justify-center">
                <Alert variant="destructive" className="max-w-lg">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                        The past paper you are looking for could not be found. It may have been removed or the link is incorrect.
                    </AlertDescription>
                </Alert>
            </div>
        )
    }

     if (paper.status !== 'Processed' || !paper.generatedQuestions || paper.generatedQuestions.length === 0) {
        return (
             <div className="flex h-full w-full items-center justify-center">
                <Alert className="max-w-lg">
                    <Loader className="h-4 w-4" />
                    <AlertTitle>Paper Not Ready</AlertTitle>
                    <AlertDescription>
                        This past paper has not been processed by the AI yet or no questions were found. Please check back later or ask an admin to process the paper.
                    </AlertDescription>
                </Alert>
            </div>
        )
    }


    return (
        <div className="flex-1 space-y-6">
            <Card className="max-w-3xl mx-auto">
                <CardHeader>
                    <CardTitle className="font-headline text-3xl flex items-center gap-3">
                        <FileText className="w-8 h-8 text-primary" />
                        Practice Session Ready
                    </CardTitle>
                    <CardDescription>
                        You are about to start a practice session for the following paper.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="rounded-lg border bg-muted/50 p-6 space-y-4">
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">Subject</p>
                            <p className="font-semibold text-lg">{paper.subject}</p>
                        </div>
                         <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">Year</p>
                            <p className="font-semibold text-lg">{paper.year}</p>
                        </div>
                         <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">Original File</p>
                            <p className="font-mono text-sm">{paper.paperName}</p>
                        </div>
                    </div>

                     <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="rounded-lg border p-4">
                            <h4 className="font-bold text-2xl text-primary">{paper.questionCount}</h4>
                            <p className="text-sm text-muted-foreground">Questions</p>
                        </div>
                        <div className="rounded-lg border p-4">
                            <h4 className="font-bold text-2xl text-primary">3 hours</h4>
                            <p className="text-sm text-muted-foreground">Time Limit</p>
                        </div>
                    </div>
                   
                    <Alert>
                        <Clock className="h-4 w-4" />
                        <AlertTitle>Timed Session</AlertTitle>
                        <AlertDescription>
                            This will be a timed practice session to simulate real exam conditions. Once you start, a timer will begin.
                        </AlertDescription>
                    </Alert>

                     <Button 
                        size="lg" 
                        className="w-full" 
                        onClick={handleStartSession}
                        disabled={isStartingSession}
                    >
                        {isStartingSession ? (
                            <Loader className="mr-2 h-5 w-5 animate-spin" />
                        ) : (
                            <ArrowRight className="mr-2 h-5 w-5" />
                        )}
                        {isStartingSession ? 'Starting...' : 'Start Timed Session'}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
