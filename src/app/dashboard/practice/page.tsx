
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from '@/components/ui/textarea';
import { Loader, Target, Bot, Sparkles, AlertTriangle, User, ArrowRight, ArrowLeft, BrainCircuit, CheckCircle } from "lucide-react";
import { getInteractiveFeedback, InteractiveFeedbackOutput } from '@/ai/flows/interactive-feedback-explanation';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { askAiTutor } from '@/ai/flows/ai-tutor-flow';
import { getQuestionsForSubject, Question } from '@/lib/questions';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { TypingText } from '@/components/ui/typing-text';
import { Progress } from '@/components/ui/progress';
import { useUser, useDatabases, useDoc, useMemoAppwrite } from '@/appwrite';
import { appwriteConfig } from '@/appwrite/config';
import { ID } from 'appwrite';
import { filterQuestionsByLiterature, UserLiteratureSelection } from '@/lib/literature-filter';
import { useAdminMode } from '@/hooks/use-admin-mode';

interface QuestionWithFeedback extends Question {
  studentAnswer?: string;
  feedback?: InteractiveFeedbackOutput | null;
  isChecking?: boolean;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const strugglingTopics = [
    { name: "Algebraic expressions", subject: "Mathematics", grade: "10", mastery: 45 },
    { name: "Euclidean geometry", subject: "Mathematics", grade: "10", mastery: 52 },
    { name: "Chemical equilibrium", subject: "Physical Sciences", grade: "12", mastery: 60 },
];

const ADMIN_EMAIL = 'cameronfalck03@gmail.com';

interface UserProfile {
  gradeLevel: number;
  subjects: string[];
  language?: string;
  literature?: UserLiteratureSelection;
}

export default function PracticePage() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useUser();
  const databases = useDatabases();
  
  const isAdmin = user?.email === ADMIN_EMAIL;
  const { adminModeEnabled } = useAdminMode(isAdmin);

  const [isLoading, setIsLoading] = useState(false);
  const [exam, setExam] = useState<{ examQuestions: QuestionWithFeedback[] } | null>(null);
  const [topic, setTopic] = useState<string | null>(null);
  const [grade, setGrade] = useState<string | null>(null);
  const [subject, setSubject] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isFinishing, setIsFinishing] = useState(false);
  
  // AI Tutor State
  const [tutorMessages, setTutorMessages] = useState<Message[]>([]);
  const [tutorPrompt, setTutorPrompt] = useState('');
  const [isTutorLoading, setIsTutorLoading] = useState(false);
  const tutorChatEndRef = useRef<HTMLDivElement>(null);

  // Fetch user profile to get literature selections
  const userProfileRef = useMemoAppwrite(() => {
    if (!user) return null;
    const databaseId = appwriteConfig.databaseId;
    if (!databaseId || databaseId.trim() === '') return null;
    return {
      databaseId,
      collectionId: 'user',
      documentId: user.$id,
    };
  }, [user]);
  const { data: userProfile } = useDoc<UserProfile>(userProfileRef);

  const loadQuestions = useCallback((currentTopic: string, currentGrade: string, currentSubject: string) => {
    setIsLoading(true);
    setExam(null);
    setCurrentQuestionIndex(0);
    setScore(0);
    
    // Set up the tutor's initial message
    const tutorGradeLevel = userProfile?.gradeLevel || (currentGrade ? parseInt(currentGrade) : null);
    const gradeText = tutorGradeLevel ? ` (Grade ${tutorGradeLevel})` : '';
    setTutorMessages([{ role: 'assistant', content: `Hi there! I'm your Grade ${tutorGradeLevel || currentGrade} AI tutor. I'm ready to help you with any questions you have about **${currentTopic}**${gradeText}. Ask me anything!` }]);
    
    // Get preloaded questions for the subject, then filter by topic
    let subjectQuestions = getQuestionsForSubject(currentSubject, parseInt(currentGrade));
    
    // Filter by topic - use flexible matching (exact match or contains)
    const normalizedTopic = currentTopic.toLowerCase().trim();
    let topicQuestions = subjectQuestions.filter(q => {
      const normalizedQuestionTopic = q.topic.toLowerCase().trim();
      // Exact match or topic contains the search term, or search term contains topic
      return normalizedQuestionTopic === normalizedTopic ||
             normalizedQuestionTopic.includes(normalizedTopic) ||
             normalizedTopic.includes(normalizedQuestionTopic);
    });
    
    // Debug logging (can be removed in production)
    if (topicQuestions.length === 0 && subjectQuestions.length > 0) {
      console.log('Topic matching debug:', {
        searchedTopic: currentTopic,
        availableTopics: [...new Set(subjectQuestions.map(q => q.topic))],
        totalQuestions: subjectQuestions.length
      });
    }
    
    // Filter by literature selections if this is a literature subject
    topicQuestions = filterQuestionsByLiterature(
      topicQuestions,
      currentSubject,
      userProfile?.literature
    );
    
    if (topicQuestions.length === 0) {
      toast({ variant: "destructive", title: "No Questions Found", description: "We don't have practice questions for this specific topic yet, or you haven't selected the required literature for this subject." });
      setExam({ examQuestions: [] });
    } else {
      setExam({ examQuestions: topicQuestions.map(q => ({ ...q, studentAnswer: '', feedback: null, isChecking: false })) });
    }
    
    setIsLoading(false);
    setIsInitialLoading(false);
  }, [toast, userProfile?.gradeLevel, userProfile?.literature]);


  useEffect(() => {
    const topicParam = searchParams.get('topic');
    const gradeParam = searchParams.get('grade');
    const subjectParam = searchParams.get('subject');

    if (topicParam && gradeParam && subjectParam) {
      const decodedTopic = decodeURIComponent(topicParam);
      setTopic(decodedTopic);
      setGrade(gradeParam);
      setSubject(subjectParam);
      // Load questions (filtering will handle undefined literature gracefully)
      loadQuestions(decodedTopic, gradeParam, subjectParam);
    } else {
      setIsInitialLoading(false);
    }
  }, [searchParams, loadQuestions]);

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
    if (!exam || !grade || !subject) return;

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
        gradeLevel: parseInt(grade),
        subject: subject,
      });

      // Only award points on the FIRST correct attempt
      if (feedbackResult.isCorrect && !question.feedback) {
        setScore(s => s + 1);
      }

      newQuestions[index].feedback = feedbackResult;
      
    } catch (error) {
      console.error("Feedback Error:", error);
      toast({ variant: "destructive", title: "Feedback Failed", description: "Could not get feedback for this answer." });
      newQuestions[index].feedback = null;
    } finally {
      question.isChecking = false;
      setExam({ examQuestions: newQuestions });
    }
  };

  const handleFinish = async () => {
    if (!exam || !user || !databases || !topic || !subject || !grade) return;

    setIsFinishing(true);

    try {
      const questionsCount = exam.examQuestions.length;
      const percentageScore = questionsCount > 0 ? Math.round((score / questionsCount) * 100) : 0;

      // Save progress to Firestore
      const progressData = {
        learningObjectiveId: `topic-${encodeURIComponent(topic)}`,
        masteryLevel: percentageScore,
        completed: true,
        lastAccessed: new Date().toISOString(),
        topic: topic,
        subject: subject,
        gradeLevel: parseInt(grade),
        type: 'practice',
      };

      const progressDataWithId = {
        ...progressData,
        userID: user.$id,
      };
      await databases.createDocument(
        appwriteConfig.databaseId,
        'userprogress',
        ID.unique(),
        progressDataWithId
      );

      toast({
        title: 'Progress Saved!',
        description: `Your score of ${score}/${questionsCount} (${percentageScore}%) has been saved.`,
      });

      // Navigate back to practice page
      setTimeout(() => {
        router.push('/dashboard/practice');
      }, 2000);

    } catch (error) {
      console.error("Error saving progress:", error);
      toast({
        variant: "destructive",
        title: "Error Saving Progress",
        description: "Could not save your progress. Please try again.",
      });
      setIsFinishing(false);
    }
  };
  
  const handleTutorSendMessage = async () => {
    const currentPrompt = tutorPrompt;
    if (!currentPrompt.trim() || !subject || !topic) return;

    // Prefer user profile grade level, fallback to URL param grade
    const tutorGradeLevel = userProfile?.gradeLevel || (grade ? parseInt(grade) : 10);
    if (!tutorGradeLevel) {
      toast({
        variant: "destructive",
        title: "Grade Level Required",
        description: "Please set your grade level in settings to use the tutor.",
      });
      return;
    }

    const currentQuestion = exam?.examQuestions[currentQuestionIndex]?.question;
    const contextPrompt = `Regarding the topic "${topic}" and specifically the question: "${currentQuestion}", the student asks: "${currentPrompt}"`;

    const newMessages: Message[] = [...tutorMessages, { role: 'user', content: currentPrompt }];
    setTutorMessages(newMessages);
    setTutorPrompt('');
    setIsTutorLoading(true);
    
    try {
      const result = await askAiTutor({
        prompt: contextPrompt,
        gradeLevel: tutorGradeLevel,
        subjects: [subject],
        language: userProfile?.language,
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
  
  const currentQuestionCorrect = !!exam?.examQuestions[currentQuestionIndex]?.feedback?.isCorrect;
  const questionsCount = exam?.examQuestions.length || 0;

  if (isInitialLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">Loading practice session...</p>
      </div>
    );
  }

  if (!topic) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Practice Zone</CardTitle>
          <CardDescription>
            Test your knowledge with custom quizzes. Start with a recommended topic or choose one from the lessons page.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
            <div className='space-y-4'>
                <h3 className="text-2xl font-bold font-headline flex items-center gap-3"><BrainCircuit className="w-8 h-8 text-primary"/> Recommended For You</h3>
                <p className="text-muted-foreground max-w-2xl">
                    Based on your recent activity, here are a few topics where some extra practice could be beneficial. Mastering these will boost your overall progress.
                </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {strugglingTopics.map(topic => (
                    <Link 
                        key={topic.name} 
                        href={`/dashboard/practice?topic=${encodeURIComponent(topic.name)}&grade=${topic.grade}&subject=${topic.subject}`}
                        className="block"
                    >
                        <Card className="h-full hover:border-primary hover:shadow-lg transition-all">
                            <CardHeader>
                                <CardTitle>{topic.name}</CardTitle>
                                <CardDescription>{topic.subject} - Grade {topic.grade}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className='space-y-2'>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="font-medium text-muted-foreground">Current Mastery</span>
                                        <span className="font-bold text-primary">{topic.mastery}%</span>
                                    </div>
                                    <Progress value={topic.mastery} />
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
             <div className="text-center py-6 bg-muted rounded-lg">
                <h4 className="text-xl font-bold font-headline mb-2">Or, Choose Your Own Topic</h4>
                <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                    Visit the "Lessons" page to choose any subject and topic you'd like to practice.
                </p>
                <Button size="lg" asChild>
                    <Link href="/dashboard/lessons">Browse Lessons</Link>
                </Button>
            </div>
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
                      <CardDescription className="whitespace-nowrap">
                          {exam ? `Question ${currentQuestionIndex + 1} of ${questionsCount}` : 'Loading questions...'}
                      </CardDescription>
                    </div>
                     {exam && (
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Score</p>
                        <p className="font-headline text-2xl font-bold whitespace-nowrap">{score} / {questionsCount}</p>
                      </div>
                    )}
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

            {exam && questionsCount > 0 && (
                <Card className="flex-1 flex flex-col">
                    <CardContent className="space-y-4 pt-6 flex-1">
                        
                        {exam.examQuestions.map((q, index) => (
                            <div key={q.id} className={currentQuestionIndex === index ? 'block' : 'hidden'}>
                                <div className="rounded-xl border bg-card text-card-foreground shadow p-6 space-y-4">
                                    <p className="font-semibold text-lg">Question {index + 1}: <span className="text-sm font-normal text-muted-foreground">({q.topic})</span></p>
                                    <div className="text-base prose max-w-none"><ReactMarkdown rehypePlugins={[rehypeRaw]}>{q.question.replace(/\\n/g, '<br>')}</ReactMarkdown></div>
                                    
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
                                                <TypingText
                                                    text={typeof q.feedback.explanation === 'string' 
                                                        ? q.feedback.explanation 
                                                        : String(q.feedback.explanation || '')}
                                                    markdown={true}
                                                    speed={10}
                                                    rehypePlugins={[rehypeRaw]}
                                                />
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
                            disabled={currentQuestionIndex === 0 || isFinishing}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                        </Button>
                        <div className="text-sm text-muted-foreground whitespace-nowrap">
                            {currentQuestionIndex + 1} / {questionsCount}
                        </div>
                        {currentQuestionIndex === questionsCount - 1 ? (
                            <Button
                                onClick={handleFinish}
                                disabled={isFinishing}
                            >
                                {isFinishing ? (
                                    <>
                                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Finished
                                    </>
                                )}
                            </Button>
                        ) : (
                            <Button
                                onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                                disabled={(!currentQuestionCorrect && !adminModeEnabled) || isFinishing}
                                variant={adminModeEnabled && !currentQuestionCorrect ? "outline" : "default"}
                                title={adminModeEnabled && !currentQuestionCorrect ? "Admin: Unlock next question" : ""}
                            >
                                Next <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </Card>
            )}

            {exam && questionsCount === 0 && !isLoading && (
                    <Card className="flex-1 flex items-center justify-center">
                        <div className="text-center p-12 text-muted-foreground">
                            <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
                            <p className="font-semibold">Could not find practice questions for "{topic}".</p>
                            <p>We are working on adding more topics. Please try a different one for now.</p>
                             <Button asChild className="mt-4">
                                <Link href="/dashboard/lessons">Browse Lessons</Link>
                            </Button>
                        </div>
                    </Card>
            )}
        </div>

        {/* AI Tutor Section */}
        <div className="lg:col-span-1 h-full">
             <Card className="flex-1 flex flex-col h-full max-h-[85vh] sticky top-0">
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
                        <div className="prose prose-sm max-w-full prose-p:my-3 prose-li:my-1.5 prose-p:leading-relaxed">
                            {message.role === 'assistant' ? (
                                <TypingText
                                    text={message.content}
                                    markdown={true}
                                    speed={10}
                                    rehypePlugins={[rehypeRaw]}
                                />
                            ) : (
                                <ReactMarkdown rehypePlugins={[rehypeRaw]}>{message.content}</ReactMarkdown>
                            )}
                        </div>
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
