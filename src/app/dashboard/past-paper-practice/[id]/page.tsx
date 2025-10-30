
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from '@/components/ui/textarea';
import { Loader, Target, Bot, ArrowRight, ArrowLeft, AlertTriangle, User } from "lucide-react";
import { getInteractiveFeedback, InteractiveFeedbackOutput } from '@/ai/flows/interactive-feedback-explanation';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { getQuestionsForTopic, Question } from '@/lib/questions';
import ReactMarkdown from 'react-markdown';
import { askAiTutor } from '@/ai/flows/ai-tutor-flow';

interface PastPaperMeta {
    id: string;
    subject: string;
    year: string;
    gradeLevel?: number;
    paperName: string;
}

interface QuestionWithFeedback extends Question {
  studentAnswer?: string;
  feedback?: InteractiveFeedbackOutput | null;
  isChecking?: boolean;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function PastPaperPracticePage() {
    const { toast } = useToast();
    const params = useParams();
    const router = useRouter();
    const { id: paperId } = params;
    
    const { user } = useUser();
    const firestore = useFirestore();

    const [session, setSession] = useState<{ examQuestions: QuestionWithFeedback[] } | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);

    const [tutorMessages, setTutorMessages] = useState<Message[]>([]);
    const [tutorPrompt, setTutorPrompt] = useState('');
    const [isTutorLoading, setIsTutorLoading] = useState(false);
    const tutorChatEndRef = useRef<HTMLDivElement>(null);

    const paperRef = useMemoFirebase(() => {
        if (!firestore || !paperId) return null;
        return doc(firestore, 'pastPapers', paperId as string);
    }, [firestore, paperId]);

    const { data: paperData, isLoading: isPaperLoading } = useDoc<PastPaperMeta>(paperRef);

    useEffect(() => {
        if (paperData) {
            // THE FIX: Use subject from paperData to get preloaded questions
            // from the static library.
            const topicForQuestions = paperData.subject.replace(/ Paper \d/, '');
            const questions = getQuestionsForTopic(topicForQuestions, paperData.gradeLevel || 12);

            if (questions.length > 0) {
                setSession({
                    examQuestions: questions.map(q => ({ ...q, studentAnswer: '', feedback: null, isChecking: false }))
                });
                setTutorMessages([{ role: 'assistant', content: `Hi there! I'm ready to help you with any questions you have about this **${paperData.subject} (${paperData.year})** paper. Ask me anything!` }]);
            } else {
                 setSession({ examQuestions: [] });
            }
        }
    }, [paperData]);

    useEffect(() => {
        tutorChatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [tutorMessages]);

    const handleAnswerChange = (index: number, answer: string) => {
        if (!session) return;
        const newQuestions = [...session.examQuestions];
        newQuestions[index].studentAnswer = answer;
        setSession({ examQuestions: newQuestions });
    };

    const handleCheckAnswer = async (index: number) => {
        if (!session || !paperData?.gradeLevel || !paperData?.subject) return;

        const newQuestions = [...session.examQuestions];
        const question = newQuestions[index];

        if (!question.studentAnswer) {
            toast({ variant: 'destructive', title: 'No answer provided', description: 'Please enter an answer before checking.' });
            return;
        }

        question.isChecking = true;
        setSession({ examQuestions: newQuestions });

        try {
            const feedbackResult = await getInteractiveFeedback({
                question: question.question,
                studentAnswer: question.studentAnswer,
                gradeLevel: paperData.gradeLevel,
                subject: paperData.subject.replace(/ Paper \d/, ''),
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
            question.isChecking = false;
            setSession({ examQuestions: newQuestions });
        }
    };
    
    const handleTutorSendMessage = async () => {
        const currentPrompt = tutorPrompt;
        if (!currentPrompt.trim() || !paperData?.gradeLevel || !paperData?.subject) return;

        const currentQuestion = session?.examQuestions[currentQuestionIndex];
        const contextPrompt = `Regarding the topic "${currentQuestion?.topic}" and specifically the question: "${currentQuestion?.question}", the student asks: "${currentPrompt}"`;

        const newMessages: Message[] = [...tutorMessages, { role: 'user', content: currentPrompt }];
        setTutorMessages(newMessages);
        setTutorPrompt('');
        setIsTutorLoading(true);
        
        try {
            const result = await askAiTutor({
                prompt: contextPrompt,
                gradeLevel: paperData.gradeLevel,
                subjects: [paperData.subject.replace(/ Paper \d/, '')],
            });
            setTutorMessages([...newMessages, { role: 'assistant', content: result.response }]);
        } catch (error) {
            console.error("Failed to get response from AI tutor:", error);
            toast({ variant: "destructive", title: "AI Tutor Error", description: "The AI failed to provide a response." });
        } finally {
            setIsTutorLoading(false);
        }
    };

    const currentQuestionCorrect = !!session?.examQuestions[currentQuestionIndex]?.feedback?.isCorrect;
    const questionsCount = session?.examQuestions.length || 0;

    if (isPaperLoading || !session) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <Loader className="h-12 w-12 animate-spin text-primary" />
                <p className="ml-4 text-muted-foreground">Loading practice session...</p>
            </div>
        );
    }

    return (
        <div className="flex-1">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                {/* Quiz Section */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle className="font-headline text-3xl flex items-center gap-3">
                                        <Target className="w-8 h-8 text-primary" />
                                        Practice: {paperData?.subject}
                                    </CardTitle>
                                    <CardDescription>
                                        {paperData?.year} - Question {currentQuestionIndex + 1} of {questionsCount}
                                    </CardDescription>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-muted-foreground">Score</p>
                                    <p className="font-headline text-2xl font-bold">{score} / {questionsCount}</p>
                                </div>
                            </div>
                        </CardHeader>
                    </Card>

                   {questionsCount > 0 ? (
                        <Card className="flex-1 flex flex-col">
                            <CardContent className="space-y-4 pt-6 flex-1">
                                {session.examQuestions.map((q, index) => (
                                    <div key={q.id} className={currentQuestionIndex === index ? 'block' : 'hidden'}>
                                        <div className="rounded-xl border bg-card text-card-foreground shadow p-6 space-y-4">
                                            <p className="font-semibold text-lg">Question {index + 1}: <span className="text-sm font-normal text-muted-foreground">({q.topic})</span></p>
                                            <div className="text-base prose max-w-none"><ReactMarkdown>{q.question}</ReactMarkdown></div>
                                            
                                            <Textarea 
                                                placeholder="Your answer..."
                                                value={q.studentAnswer || ''}
                                                onChange={(e) => handleAnswerChange(index, e.target.value)}
                                                disabled={!!q.feedback?.isCorrect}
                                                rows={4}
                                            />
                                            
                                            <Button onClick={() => handleCheckAnswer(index)} disabled={!q.studentAnswer || q.isChecking || !!q.feedback?.isCorrect}>
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
                                                    <div className="prose prose-sm max-w-full text-muted-foreground prose-p:my-3 prose-li:my-1.5 prose-p:leading-relaxed">
                                                        <ReactMarkdown>{q.feedback.explanation}</ReactMarkdown>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
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
                    ) : (
                         <Card>
                            <CardHeader>
                                <CardTitle className="font-headline text-2xl flex items-center gap-2">
                                    <AlertTriangle className="text-destructive"/> Content Not Ready
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">
                                    Practice questions for this specific subject and grade have not been pre-loaded into the app's library yet.
                                </p>
                                <p className="mt-2 text-muted-foreground">
                                    I am actively working on adding more subjects. Please check back later.
                                </p>
                                <Button onClick={() => router.back()} className="mt-6">Go Back</Button>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* AI Tutor Section */}
                <div className="lg:col-span-1 h-full">
                    <Card className="flex-1 flex flex-col h-full max-h-[85vh]">
                        <CardHeader className="border-b">
                            <CardTitle className="flex items-center gap-2 font-headline text-2xl">
                                <Bot className="h-7 w-7" />
                                Paper Tutor
                            </CardTitle>
                            <CardDescription>
                                Stuck? Ask for a hint or explanation.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col gap-4 overflow-y-auto p-4">
                            <div className="flex-1 space-y-4">
                                {tutorMessages.map((message, index) => (
                                <div key={index} className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
                                    {message.role === 'assistant' && <Bot className="w-6 h-6 flex-shrink-0 text-primary" />}
                                    <div className={`rounded-lg p-3 max-w-[90%] text-sm ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                        <div className="prose prose-sm max-w-full prose-p:my-3 prose-li:my-1.5 prose-p:leading-relaxed"><ReactMarkdown>{message.content}</ReactMarkdown></div>
                                    </div>
                                    {message.role === 'user' && <User className="w-6 h-6 flex-shrink-0" />}
                                </div>
                                ))}
                                {isTutorLoading && (
                                <div className="flex items-start gap-3">
                                    <Bot className="w-6 h-6 flex-shrink-0 text-primary" />
                                    <div className="rounded-lg p-3 bg-muted">
                                        <Loader className="w-4 h-4 animate-spin" />
                                    </div>
                                </div>
                                )}
                                <div ref={tutorChatEndRef} />
                            </div>
                        </CardContent>
                        <div className="p-4 border-t">
                            <div className="relative">
                                <Textarea
                                    placeholder="e.g., Explain the first step..."
                                    className="pr-20"
                                    rows={2}
                                    value={tutorPrompt}
                                    onChange={(e) => setTutorPrompt(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleTutorSendMessage();
                                        }
                                    }}
                                    disabled={isTutorLoading}
                                />
                                <Button
                                    type="submit"
                                    size="sm"
                                    className="absolute right-2 top-1/2 -translate-y-1/2"
                                    onClick={handleTutorSendMessage}
                                    disabled={isTutorLoading || !tutorPrompt.trim()}
                                >
                                    Send
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
