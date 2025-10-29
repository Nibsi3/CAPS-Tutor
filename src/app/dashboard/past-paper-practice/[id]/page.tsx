
'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader, FileText, Clock, HelpCircle, ArrowRight, AlertTriangle, ArrowLeft, Bot } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Textarea } from '@/components/ui/textarea';
import { getInteractiveFeedback, InteractiveFeedbackOutput } from '@/ai/flows/interactive-feedback-explanation';
import { useToast } from '@/hooks/use-toast';
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

interface PastPaper {
    id: string;
    subject: string;
    year: string;
    paperName: string;
    status: 'Processing' | 'Processed' | 'Failed';
    questionCount?: number;
    generatedQuestions?: GeneratedQuestion[];
    gradeLevel?: number;
}


export default function PastPaperSessionPage() {
    const params = useParams();
    const paperId = params.id as string;
    const firestore = useFirestore();
    const { user } = useUser();
    const { toast } = useToast();

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [questions, setQuestions] = useState<GeneratedQuestion[]>([]);
    const [isSessionStarted, setIsSessionStarted] = useState(false);
    const [score, setScore] = useState(0);


    const paperRef = useMemoFirebase(() => {
        if (!firestore || !paperId) return null;
        return doc(firestore, 'pastPapers', paperId);
    }, [firestore, paperId]);

    const { data: paper, isLoading } = useDoc<PastPaper>(paperRef);

    const handleStartSession = () => {
        if (paper?.generatedQuestions) {
            setQuestions(paper.generatedQuestions);
            setIsSessionStarted(true);
        }
    }

    const handleAnswerChange = (index: number, answer: string) => {
        const newQuestions = [...questions];
        newQuestions[index].studentAnswer = answer;
        setQuestions(newQuestions);
    };

    const handleCheckAnswer = async (index: number) => {
        const question = questions[index];
        if (!question.studentAnswer) {
            toast({ variant: 'destructive', title: 'No answer provided' });
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
            toast({ variant: "destructive", title: "Feedback Failed", description: "Could not get feedback." });
        } finally {
            newQuestions[index].isChecking = false;
            setQuestions(newQuestions);
        }
    };
    
    const currentQuestion = questions[currentQuestionIndex];
    const currentQuestionCorrect = !!currentQuestion?.feedback?.isCorrect;


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
    
    if (!isSessionStarted) {
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
                        >
                            <ArrowRight className="mr-2 h-5 w-5" />
                            Start Timed Session
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
         <div className="flex-1 space-y-6">
             <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className="font-headline text-3xl">{paper.subject} - {paper.year}</CardTitle>
                            <CardDescription>
                                Question {currentQuestionIndex + 1} of {questions.length}
                            </CardDescription>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-muted-foreground">Score</p>
                            <p className="font-headline text-2xl font-bold">{score} / {questions.length}</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Progress value={(currentQuestionIndex + 1) / questions.length * 100} className="mb-6" />

                    <div className="rounded-xl border bg-card text-card-foreground shadow p-6 space-y-4">
                        <div className="flex justify-between items-start">
                            <h3 className="font-semibold text-lg">Question {currentQuestion.questionNumber}</h3>
                            <span className="font-bold text-primary">({currentQuestion.marks} marks)</span>
                        </div>
                        
                        <p className="text-base prose max-w-none">{currentQuestion.questionText}</p>
                        
                        <Textarea 
                            placeholder="Type your detailed answer here..."
                            value={currentQuestion.studentAnswer || ''}
                            onChange={(e) => handleAnswerChange(currentQuestionIndex, e.target.value)}
                            disabled={!!currentQuestion.feedback?.isCorrect}
                            rows={6}
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
                                {currentQuestion.feedback.isCorrect ? 'Correct! Well done.' : 'Not quite. Let\'s review the steps:'}
                                </p>
                                <div className="prose prose-sm max-w-full text-muted-foreground prose-p:my-3 prose-li:my-1.5 prose-p:leading-relaxed">
                                    <ReactMarkdown>{currentQuestion.feedback.explanation}</ReactMarkdown>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between items-center">
                    <Button
                        variant="outline"
                        onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                        disabled={currentQuestionIndex === 0}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                    </Button>
                    
                    <Button
                        onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
                        disabled={currentQuestionIndex === questions.length - 1 || !currentQuestionCorrect}
                    >
                        Next <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
