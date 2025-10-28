'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from '@/components/ui/textarea';
import { Loader, Target, Bot, Sparkles, AlertTriangle, User, ArrowRight, ArrowLeft } from "lucide-react";
import { generateAdaptiveExam, AdaptiveExamOutput } from '@/ai/flows/adaptive-exam-generation';
import { getInteractiveFeedback, InteractiveFeedbackOutput } from '@/ai/flows/interactive-feedback-explanation';
import { useUser, useDoc, useMemoFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { doc, getFirestore } from 'firebase/firestore';
import Link from 'next/link';
import { askAiTutor, AiTutorOutput } from '@/ai/flows/ai-tutor-flow';

// Correctly define the type for a single question
type ExamQuestion = AdaptiveExamOutput['examQuestions'][number];

interface QuestionWithFeedback extends ExamQuestion {
  studentAnswer?: string;
  feedback?: InteractiveFeedbackOutput | null;
  isChecking?: boolean;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
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
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  // AI Tutor State
  const [tutorMessages, setTutorMessages] = useState<Message[]>([]);
  const [tutorPrompt, setTutorPrompt] = useState('');
  const [isTutorLoading, setIsTutorLoading] = useState(false);
  const tutorChatEndRef = useRef<HTMLDivElement>(null);


  const userProfileRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, `users/${user.uid}`);
  }, [user, firestore]);
  const { data: userProfile } = useDoc(userProfileRef);

  const handleGenerateExam = useCallback(async (currentTopic:string, currentGrade:string, currentSubject:string) => {
    if (!user) {
      toast({ variant: "destructive", title: "Not Logged In", description: "You must be logged in to practice." });
      setIsInitialLoading(false);
      return;
    }
    if (!currentTopic && !userProfile) {
      toast({ variant: "destructive", title: "No Topic Selected", description: "Go to the lessons page to pick a topic to practice!" });
      setIsInitialLoading(false);
      return;
    }

    setIsLoading(true);
    setExam(null);
    setCurrentQuestionIndex(0);
    setTutorMessages([{ role: 'assistant', content: `Hi there! I'm ready to help you with any questions you have about **${currentTopic}**. Ask me anything!` }]);
    try {
      const result = await generateAdaptiveExam({
        studentId: user.uid,
        numQuestions: 25, // Changed to 25, but AI might be slow.
        topic: decodeURIComponent(currentTopic),
        gradeLevel: currentGrade ? parseInt(currentGrade) : userProfile?.gradeLevel,
        subject: decodeURIComponent(currentSubject),
      });
      if (result.examQuestions.length === 0) {
        toast({ variant: "destructive", title: "Generation Failed", description: "The AI couldn't generate questions for this topic. Please try another." });
      }
      setExam({ examQuestions: result.examQuestions.map(q => ({ ...q })) });
      toast({ title: "Practice Session Ready!", description: "Your 25 custom questions are prepared." });
    } catch (error) {
      console.error("Failed to generate exam:", error);
      toast({ variant: "destructive", title: "Generation Failed", description: "The AI failed to generate an exam. Please try again." });
    } finally {
      setIsLoading(false);
      setIsInitialLoading(false);
    }
  }, [user, userProfile, toast]);

  useEffect(() => {
    const topicParam = searchParams.get('topic');
    const gradeParam = searchParams.get('grade');
    const subjectParam = searchParams.get('subject');

    if (topicParam && gradeParam && subjectParam) {
      const decodedTopic = decodeURIComponent(topicParam);
      setTopic(decodedTopic);
      setGrade(gradeParam);
      setSubject(subjectParam);
      if (user && userProfile) {
        handleGenerateExam(topicParam, gradeParam, subjectParam);
      }
    } else {
      setIsInitialLoading(false);
    }
  }, [searchParams, user, userProfile, handleGenerateExam]);

  useEffect(() => {
    tutorChatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [tutorMessages]);


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
  
  const handleTutorSendMessage = async () => {
    const currentPrompt = tutorPrompt;
    if (!user || !userProfile || !topic || !currentPrompt.trim()) {
        toast({
            variant: "destructive",
            title: "Cannot send message",
            description: "Cannot send message right now.",
        });
        return;
    }

    const newMessages: Message[] = [...tutorMessages, { role: 'user', content: currentPrompt }];
    setTutorMessages(newMessages);
    setTutorPrompt('');
    setIsTutorLoading(true);
    
    try {
        const result = await askAiTutor({
            prompt: `In the context of the topic "${topic}", the user asked: "${currentPrompt}"`,
            gradeLevel: userProfile.gradeLevel,
            subjects: [subject || 'General'],
        });

        setTutorMessages([...newMessages, { role: 'assistant', content: result.response }]);

    } catch (error) {
        console.error("Failed to get response from AI tutor:", error);
        toast({
            variant: "destructive",
            title: "AI Tutor Error",
            description: "The AI failed to provide a response. Please try again.",
        });
    } finally {
        setIsTutorLoading(false);
    }
  };

  if (isInitialLoading && !exam) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">Preparing your practice session...</p>
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
            <Link href="/dashboard/lessons">Browse Lessons</Link>
          </Button>
        </CardContent>
      </Card>
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
                        Practice: {topic}
                    </CardTitle>
                    <CardDescription>
                        {exam ? `Question ${currentQuestionIndex + 1} of ${exam.examQuestions.length}` : 'Generating questions...'}
                    </CardDescription>
                    </div>
                </div>
                </CardHeader>
            </Card>

            {isLoading && (
                <Card className="flex-1 flex items-center justify-center">
                    <div className="text-center p-12">
                        <Loader className="mx-auto h-12 w-12 animate-spin text-primary mb-4" />
                        <p className="text-muted-foreground">Generating your practice questions...</p>
                    </div>
                </Card>
            )}

            {exam && exam.examQuestions.length > 0 && (
                <Card className="flex-1 flex flex-col">
                    <CardContent className="space-y-4 pt-6 flex-1">
                        
                        {exam.examQuestions.map((q, index) => (
                            <div key={index} className={currentQuestionIndex === index ? 'block' : 'hidden'}>
                                <div className="rounded-xl border bg-card text-card-foreground shadow p-6 space-y-4">
                                    <p className="font-semibold text-lg">Question {index + 1}: <span className="text-sm font-normal text-muted-foreground">({q.topic})</span></p>
                                    <p className="text-base">{q.question}</p>
                                    
                                    <Textarea 
                                    placeholder="Your answer..."
                                    value={q.studentAnswer || ''}
                                    onChange={(e) => handleAnswerChange(index, e.target.value)}
                                    disabled={!!q.feedback}
                                    rows={4}
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
                            </div>
                        ))}
                    </CardContent>
                    <div className="p-4 border-t flex justify-between items-center">
                        <Button
                            variant="outline"
                            onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                            disabled={currentQuestionIndex === 0}
                        >
                            <ArrowLeft className="mr-2" /> Previous
                        </Button>
                        <div className="text-sm text-muted-foreground">
                            {currentQuestionIndex + 1} / {exam.examQuestions.length}
                        </div>
                        <Button
                            onClick={() => setCurrentQuestionIndex(prev => Math.min(exam.examQuestions.length - 1, prev + 1))}
                            disabled={currentQuestionIndex === exam.examQuestions.length - 1}
                        >
                           Next <ArrowRight className="ml-2" />
                        </Button>
                    </div>
                </Card>
            )}

            {exam && exam.examQuestions.length === 0 && !isLoading && (
                    <Card className="flex-1 flex items-center justify-center">
                        <div className="text-center p-12 text-muted-foreground">
                            <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
                            <p className="font-semibold">Could not generate questions for "{topic}".</p>
                            <p>The AI might not have enough information for this specific topic yet. Please try a different one.</p>
                        </div>
                    </Card>
            )}
        </div>

        {/* AI Tutor Section */}
        <div className="lg:col-span-1 h-full">
             <Card className="flex-1 flex flex-col h-full max-h-[85vh]">
                <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2 font-headline text-2xl">
                    <Bot className="h-7 w-7" />
                    Topic Tutor
                </CardTitle>
                <CardDescription>
                    Stuck? Ask me anything about {topic}.
                </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col gap-4 overflow-y-auto p-4">
                <div className="flex-1 space-y-4">
                    {tutorMessages.map((message, index) => (
                    <div key={index} className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
                        {message.role === 'assistant' && <Bot className="w-6 h-6 flex-shrink-0 text-primary" />}
                        <div className={`rounded-lg p-3 max-w-[90%] text-sm ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                        <p className="whitespace-pre-wrap">{message.content}</p>
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
                        placeholder="e.g., Explain this in a different way..."
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
  )
}

    