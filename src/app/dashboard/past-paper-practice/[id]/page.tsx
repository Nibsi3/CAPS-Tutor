
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from '@/components/ui/textarea';
import { Loader, Target, Bot, ArrowRight, ArrowLeft, AlertTriangle, User, CheckCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { getInteractiveFeedback, InteractiveFeedbackOutput } from '@/ai/flows/interactive-feedback-explanation';
import { useToast } from '@/hooks/use-toast';
import { useUser, useDatabases, useDoc, useMemoAppwrite } from '@/appwrite';
import { appwriteConfig } from '@/appwrite/config';
import { Query, ID } from 'appwrite';
import { Question, allSubjectsForLookup } from '@/lib/questions';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { askAiTutor } from '@/ai/flows/ai-tutor-flow';
import { filterQuestionsByLiterature, shouldShowPaper2Questions, UserLiteratureSelection } from '@/lib/literature-filter';
import { TypingText } from '@/components/ui/typing-text';
import Image from 'next/image';

interface GeneratedQuestion {
    questionNumber: string;
    questionText: string;
    marks: number;
    answer: string;
    hasImage?: boolean;
    imageDataUri?: string;
}

interface PastPaperMeta {
    id: string;
    subject: string;
    year: string;
    gradeLevel?: number;
    paperName: string;
    generatedQuestions?: GeneratedQuestion[];
    questionCount?: number;
}

interface QuestionWithFeedback extends Question {
  studentAnswer?: string;
  feedback?: InteractiveFeedbackOutput | null;
  isChecking?: boolean;
  questionNumber?: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Extracts the base subject from a full paper title.
 * e.g., "Mathematics Paper 1" -> "Mathematics"
 */
function getBaseSubject(paperTitle: string): string | undefined {
    // Find the subject from the lookup list that is at the beginning of the paper title
    return allSubjectsForLookup.find(subj => paperTitle.toLowerCase().startsWith(subj.toLowerCase()));
}

/**
 * Checks if this is the first sub-question with a shared diagram.
 * For example, in "1.1", "1.2", "1.3" all with imageUrl, only 1.1 should show large.
 */
function isFirstSubQuestionWithSharedDiagram(
    index: number, 
    currentQuestion: QuestionWithFeedback & { questionNumber?: string },
    allQuestions: QuestionWithFeedback[]
): boolean {
    if (!currentQuestion.imageUrl) return false;
    if (!currentQuestion.questionNumber) return true; // Show large if no question number
    
    // Parse question number like "1.1", "2.3.1"
    const parts = currentQuestion.questionNumber.split('.');
    if (parts.length < 2) return true; // Not a sub-question format
    
    const mainQuestion = parts[0];
    
    // Check if there's a previous question with the same main question number and same image
    for (let i = 0; i < index; i++) {
        const prevQ = allQuestions[i];
        if (!prevQ.questionNumber) continue;
        const prevParts = prevQ.questionNumber.split('.');
        if (prevParts.length >= 2 && prevParts[0] === mainQuestion && prevQ.imageUrl === currentQuestion.imageUrl) {
            return false; // This is not the first one with this diagram
        }
    }
    
    return true; // This is the first sub-question with this diagram
}


export default function PastPaperPracticePage() {
    const { toast } = useToast();
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const paperId = Array.isArray(params.id) ? params.id[0] : params.id;
    
    const { user } = useUser();
    const databases = useDatabases();

    // Get initial question from query parameter (0-indexed, so subtract 1)
    const initialQuestionParam = searchParams.get('question');
    const initialQuestionIndex = initialQuestionParam ? Math.max(0, parseInt(initialQuestionParam) - 1) : 0;

    const [session, setSession] = useState<{ examQuestions: QuestionWithFeedback[] } | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(initialQuestionIndex);
    const [score, setScore] = useState(0);
    const [isFinishing, setIsFinishing] = useState(false);

    const [tutorMessages, setTutorMessages] = useState<Message[]>([]);
    const [tutorPrompt, setTutorPrompt] = useState('');
    const [isTutorLoading, setIsTutorLoading] = useState(false);
    const tutorChatEndRef = useRef<HTMLDivElement>(null);
    
    const [enlargedImageUrl, setEnlargedImageUrl] = useState<string | null>(null);

    // Check both old structure (pastPapers) and new structure (pastpapers)
    const paperRefOld = useMemoAppwrite(() => {
        if (!paperId) return null;
        const databaseId = appwriteConfig.databaseId;
        if (!databaseId || databaseId.trim() === '') return null;
        return {
            databaseId,
            collectionId: 'pastPapers',
            documentId: paperId as string,
        };
    }, [paperId]);

    const paperRefNew = useMemoAppwrite(() => {
        if (!paperId) return null;
        const databaseId = appwriteConfig.databaseId;
        if (!databaseId || databaseId.trim() === '') return null;
        return {
            databaseId,
            collectionId: 'pastpapers',
            documentId: paperId as string,
        };
    }, [paperId]);

    const { data: paperDataOld } = useDoc<PastPaperMeta>(paperRefOld);
    const { data: paperDataNew } = useDoc<PastPaperMeta>(paperRefNew);
    
    // Use new structure if available, otherwise fall back to old
    const paperData = paperDataNew || paperDataOld;
    const isPaperLoading = !paperDataNew && !paperDataOld;

    // Fetch user profile to get literature selections
    interface UserProfile {
        gradeLevel: number;
        subjects: string[];
        language?: string;
        literature?: UserLiteratureSelection;
    }
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

    // Helper function to extract topic from question text
    const extractTopicFromQuestion = (questionText: string, subject: string): string => {
        // Comprehensive topic keywords for different subjects (ordered by specificity)
        const topicKeywords: Record<string, Array<[string, string]>> = {
            'Mathematics': [
                ['sequences and series', 'Sequences and series'],
                ['financial mathematics', 'Financial mathematics'],
                ['calculus', 'Calculus (Differential)'],
                ['trigonometry', 'Trigonometry'],
                ['analytical geometry', 'Analytical geometry'],
                ['euclidean geometry', 'Euclidean geometry'],
                ['functions and inverses', 'Functions and inverses'],
                ['functions', 'Functions'],
                ['probability', 'Probability'],
                ['statistics', 'Statistics'],
                ['exponents and surds', 'Exponents and surds'],
                ['exponents', 'Exponents'],
                ['surds', 'Surds'],
                ['equations and inequalities', 'Equations and inequalities'],
                ['number patterns', 'Number patterns'],
                ['algebraic expressions', 'Algebraic expressions'],
                ['algebra', 'Algebra'],
                ['measurement', 'Measurement'],
            ],
            'Physical Sciences': [
                ['vertical projectile motion', 'Vertical projectile motion'],
                ['momentum and impulse', 'Momentum and impulse'],
                ['work, energy and power', 'Work, energy and power'],
                ['doppler effect', 'The Doppler effect'],
                ['photoelectric effect', 'Photoelectric effect'],
                ['electrodynamics', 'Electrodynamics'],
                ['electromagnetism', 'Electromagnetism'],
                ['electric circuits', 'Electric circuits'],
                ['electrostatics', 'Electrostatics'],
                ['waves and sound', 'Waves and sound'],
                ['light and optics', 'Light and optics'],
                ['electricity and magnetism', 'Electricity and magnetism'],
                ['mechanics', 'Mechanics (vectors, motion)'],
                ['chemical equilibrium', 'Chemical equilibrium'],
                ['rate and extent of reactions', 'Rate and extent of reactions'],
                ['acids and bases', 'Acids and bases'],
                ['electrochemical reactions', 'Electrochemical reactions'],
                ['chemical industry', 'The chemical industry'],
                ['stoichiometry', 'Stoichiometry'],
                ['intermolecular forces', 'Intermolecular forces'],
                ['ideal gases', 'Ideal gases'],
                ['energy and chemical change', 'Energy and chemical change'],
                ['types of reaction', 'Types of reaction'],
                ['the atom', 'The atom'],
                ['periodic table', 'The periodic table'],
                ['chemical bonding', 'Chemical bonding'],
                ['matter and materials', 'Matter and materials'],
            ],
            'Life Sciences': [
                ['dna: the code of life', 'DNA: The code of life'],
                ['genetics and inheritance', 'Genetics and inheritance'],
                ['meiosis', 'Meiosis'],
                ['mitosis', 'Mitosis'],
                ['evolution', 'Evolution'],
                ['homeostasis', 'Homeostasis'],
                ['endocrine system', 'Endocrine system'],
                ['human reproduction', 'Human reproduction'],
                ['responding to the environment', 'Responding to the environment (humans & plants)'],
                ['photosynthesis', 'Photosynthesis'],
                ['cellular respiration', 'Cellular respiration'],
                ['biodiversity', 'Biodiversity'],
                ['micro-organisms', 'Micro-organisms'],
                ['plant diversity', 'Plant diversity'],
                ['animal diversity', 'Animal diversity'],
                ['human impact on the environment', 'Human impact on the environment'],
                ['the chemistry of life', 'The chemistry of life'],
                ['cells: the basic unit of life', 'Cells: The basic unit of life'],
                ['plant and animal tissues', 'Plant and animal tissues'],
                ['support and transport systems', 'Support and transport systems in plants and animals'],
            ],
            'Accounting': [
                ['financial statements', 'Financial statements'],
                ['reconciliations', 'Reconciliations'],
                ['cost accounting', 'Cost accounting'],
                ['partnership', 'Financial statements of a partnership'],
                ['bookkeeping', 'Bookkeeping'],
                ['gaap principles', 'GAAP principles'],
                ['journals', 'Journals'],
                ['trial balance', 'Trial Balance'],
                ['vat concepts', 'VAT concepts'],
            ],
            'Business Studies': [
                ['business environments', 'Business environments'],
                ['marketing', 'Marketing'],
                ['management and leadership', 'Management and leadership'],
                ['forms of ownership', 'Forms of ownership'],
                ['human resources', 'Human resources'],
                ['business sectors', 'Business sectors'],
                ['business plan', 'Business plan'],
                ['ethics and professionalism', 'Ethics and professionalism'],
            ],
            'Geography': [
                ['climate and weather', 'Climate and weather'],
                ['geomorphology', 'Geomorphology'],
                ['rural and urban settlements', 'Rural and urban settlements'],
                ['economic geography', 'Economic geography of South Africa'],
                ['plate tectonics', 'Plate tectonics'],
                ['volcanoes and earthquakes', 'Volcanoes and earthquakes'],
                ['development geography', 'Development geography'],
            ],
            'History': [
                ['south african history', 'South African history'],
                ['world war', 'World War'],
                ['cold war', 'Cold War'],
                ['apartheid', 'Apartheid'],
                ['colonization', 'Colonization'],
            ],
        };
        
        const lowerQuestion = questionText.toLowerCase();
        const keywords = topicKeywords[subject] || [];
        
        // Check for most specific matches first
        for (const [keyword, topic] of keywords) {
            if (lowerQuestion.includes(keyword)) {
                return topic;
            }
        }
        
        // Default topic
        return subject;
    };

    useEffect(() => {
        if (!paperData || !firestore) return;
        
        const loadQuestions = async () => {
            const baseSubject = getBaseSubject(paperData.subject) || paperData.subject;
            let questions: Question[] = [];

            // Extract paper number from subject (e.g., "Mathematics Paper 1" -> "Paper 1")
            const paperNumberMatch = paperData.subject.match(/paper\s*(\d+)/i);
            const paperNumber = paperNumberMatch ? `Paper ${paperNumberMatch[1]}` : undefined;

            // Check if Paper 2 questions should be shown (literature paper)
            if (!shouldShowPaper2Questions(baseSubject, paperNumber, userProfile?.literature)) {
                // Don't show Paper 2 questions if user hasn't selected literature
                setSession({ examQuestions: [] });
                return;
            }

            // Check for questions in subcollection (new structure) first
            // Then fall back to generatedQuestions array (old structure)
            let questionsFromSubcollection: Question[] = [];
            
            // Try to fetch from subcollection if using new structure
            if (paperDataNew && paperId && databases) {
                try {
                    const questionsSnapshot = await databases.listDocuments(
                        appwriteConfig.databaseId,
                        'questions',
                        [Query.equal('paperId', paperId as string)]
                    );
                    
                    questionsFromSubcollection = questionsSnapshot.documents
                        .map(doc => {
                            const q = doc;
                            return {
                                id: `question-${q.number}`,
                                question: q.question || q.questionText || '',
                                topic: extractTopicFromQuestion(q.question || q.questionText || '', baseSubject),
                                answer: q.answer || null,
                                type: 'free-text' as const,
                                imageUrl: q.image && (q.image.startsWith('data:image/') || q.image.startsWith('data:application/pdf')) ? q.image : undefined,
                                questionNumber: q.number || q.questionNumber || '',
                                marks: q.marks || 0,
                            };
                        })
                        .sort((a, b) => {
                            // Sort by question number (handle "1.1", "1.2", "2.1", etc.)
                            const aParts = a.questionNumber.split('.').map(Number);
                            const bParts = b.questionNumber.split('.').map(Number);
                            for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
                                const aVal = aParts[i] || 0;
                                const bVal = bParts[i] || 0;
                                if (aVal !== bVal) return aVal - bVal;
                            }
                            return 0;
                        });
                } catch (e) {
                    console.warn('Could not fetch from subcollection:', e);
                }
            }
            
            // Use subcollection questions if available, otherwise use old structure
            if (questionsFromSubcollection.length > 0) {
                questions = questionsFromSubcollection;
            } else if (paperData.generatedQuestions && paperData.generatedQuestions.length > 0) {
                // Fall back to old structure
                questions = paperData.generatedQuestions.map((gq, idx) => ({
                    id: `generated-${idx}`,
                    question: gq.questionText,
                    topic: extractTopicFromQuestion(gq.questionText, baseSubject),
                    answer: gq.answer,
                    type: 'free-text' as const,
                    imageUrl: gq.hasImage && gq.imageDataUri && (gq.imageDataUri.startsWith('data:image/') || gq.imageDataUri.startsWith('data:application/pdf')) ? gq.imageDataUri : undefined,
                    questionNumber: gq.questionNumber,
                    marks: gq.marks,
                }));
            }
            
            // Filter questions by literature selections
            questions = filterQuestionsByLiterature(
                questions,
                baseSubject,
                userProfile?.literature
            );
            
            if (questions.length > 0) {
                setSession({
                    examQuestions: questions.map(q => ({ ...q, studentAnswer: '', feedback: null, isChecking: false }))
                });
                const tutorGradeLevel = userProfile?.gradeLevel || paperData?.gradeLevel;
                const gradeText = tutorGradeLevel ? ` (Grade ${tutorGradeLevel})` : '';
                setTutorMessages([{ role: 'assistant', content: `Hi there! I'm your Grade ${tutorGradeLevel} AI tutor. I'm ready to help you with any questions you have about this **${paperData.subject} (${paperData.year})** paper${gradeText}. Ask me anything!` }]);
            } else {
                setSession({ examQuestions: [] }); // Set to empty if no questions found
            }
        };
        
        loadQuestions();
    }, [paperData, paperDataNew, paperId, databases, userProfile?.literature, userProfile?.gradeLevel]);

    useEffect(() => {
        tutorChatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [tutorMessages]);

    // Validate and adjust question index when session loads
    useEffect(() => {
        if (!session || session.examQuestions.length === 0) return;
        
        // Ensure currentQuestionIndex is within bounds
        const maxIndex = session.examQuestions.length - 1;
        if (currentQuestionIndex > maxIndex) {
            setCurrentQuestionIndex(maxIndex);
        }
    }, [session, currentQuestionIndex]);

    // Track progress when question changes or session loads
    useEffect(() => {
        if (!user || !databases || !paperId || !session || session.examQuestions.length === 0) return;
        
        const currentQuestion = currentQuestionIndex + 1; // Convert to 1-indexed
        
        // Check if progress document exists, then update or create
        databases.getDocument(appwriteConfig.databaseId, 'pastPaperProgress', paperId)
            .then(() => {
                // Document exists, update it
                return databases.updateDocument(
                    appwriteConfig.databaseId,
                    'pastPaperProgress',
                    paperId,
                    {
                        paperId,
                        currentQuestion,
                        lastAccessed: new Date().toISOString(),
                    }
                );
            })
            .catch(() => {
                // Document doesn't exist, create it
                return databases.createDocument(
                    appwriteConfig.databaseId,
                    'pastPaperProgress',
                    paperId,
                    {
                        paperId,
                        currentQuestion,
                        lastAccessed: new Date().toISOString(),
                        userId: user.$id,
                    }
                );
            })
            .catch((error) => {
                console.error('Error saving progress:', error);
            });
    }, [user, databases, paperId, currentQuestionIndex, session]);

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
            const baseSubject = getBaseSubject(paperData.subject) || paperData.subject;
            const feedbackResult = await getInteractiveFeedback({
                question: question.question,
                studentAnswer: question.studentAnswer,
                gradeLevel: paperData.gradeLevel,
                subject: baseSubject,
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
            setSession({ examQuestions: newQuestions });
        }
    };

    const handleFinish = async () => {
        if (!session || !user || !databases || !paperData) return;

        setIsFinishing(true);

        try {
            const baseSubject = getBaseSubject(paperData.subject) || paperData.subject;
            const questionsCount = session.examQuestions.length;
            const percentageScore = questionsCount > 0 ? Math.round((score / questionsCount) * 100) : 0;

            // Save progress to Appwrite
            const progressData = {
                learningObjectiveId: `past-paper-${paperId}`,
                masteryLevel: percentageScore,
                completed: true,
                lastAccessed: new Date().toISOString(),
                topic: baseSubject,
                subject: baseSubject,
                gradeLevel: paperData.gradeLevel,
                paperTitle: paperData.subject,
                year: paperData.year,
                type: 'past-paper',
                userID: user.$id,
            };

            await databases.createDocument(
                appwriteConfig.databaseId,
                'userprogress',
                ID.unique(),
                progressData
            );

            toast({
                title: 'Progress Saved!',
                description: `Your score of ${score}/${questionsCount} (${percentageScore}%) has been saved.`,
            });

            // Navigate back to past papers page
            setTimeout(() => {
                router.push('/dashboard/past-papers');
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
        if (!currentPrompt.trim() || !paperData?.subject) return;

        // Prefer user profile grade level for personalized tutoring, fallback to paper grade level
        const tutorGradeLevel = userProfile?.gradeLevel || paperData?.gradeLevel;
        if (!tutorGradeLevel) {
            toast({ 
                variant: "destructive", 
                title: "Grade Level Required", 
                description: "Please set your grade level in settings to use the tutor." 
            });
            return;
        }

        const currentQuestion = session?.examQuestions[currentQuestionIndex];
        const contextPrompt = `Regarding the topic "${currentQuestion?.topic}" and specifically the question: "${currentQuestion?.question}", the student asks: "${currentPrompt}"`;
        const baseSubject = getBaseSubject(paperData.subject) || paperData.subject;

        const newMessages: Message[] = [...tutorMessages, { role: 'user', content: currentPrompt }];
        setTutorMessages(newMessages);
        setTutorPrompt('');
        setIsTutorLoading(true);
        
        try {
            const result = await askAiTutor({
                prompt: contextPrompt,
                gradeLevel: tutorGradeLevel,
                subjects: [baseSubject],
                language: userProfile?.language,
            });
            setTutorMessages([...newMessages, { role: 'assistant', content: result.response }]);
        } catch (error) {
            console.error("Failed to get response from AI tutor:", error);
            toast({ variant: "destructive", title: "AI Tutor Error", description: "The AI failed to provide a response." });
        } finally {
            setIsTutorLoading(false);
        }
    };

    const questionsCount = session?.examQuestions.length || 0;
    const completedQuestions = session?.examQuestions.filter(q => q.feedback !== null && q.feedback !== undefined).length || 0;
    const progressPercentage = questionsCount > 0 ? Math.round((completedQuestions / questionsCount) * 100) : 0;

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
                    <Card className="border-l-4 border-l-primary">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <CardTitle className="font-headline text-3xl flex items-center gap-3">
                                        <Target className="w-8 h-8 text-primary" />
                                        Practice: {paperData?.subject}
                                    </CardTitle>
                                    <CardDescription className="mt-2">
                                        {paperData?.year} - Grade {paperData?.gradeLevel}
                                    </CardDescription>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-muted-foreground">Score</p>
                                    <p className="font-headline text-2xl font-bold whitespace-nowrap">{score} / {questionsCount}</p>
                                </div>
                            </div>
                            <div className="mt-6 space-y-2">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="font-medium text-muted-foreground">Progress</span>
                                    <span className="font-semibold whitespace-nowrap">{completedQuestions} / {questionsCount} questions completed ({progressPercentage}%)</span>
                                </div>
                                <Progress value={progressPercentage} className="h-3" />
                            </div>
                        </CardHeader>
                    </Card>

                   {questionsCount > 0 ? (
                        <Card className="flex-1 flex flex-col">
                            <CardContent className="space-y-4 pt-6 flex-1">
                                {session.examQuestions.map((q, index) => {
                                    const qWithMarks = q as Question & { questionNumber?: string; marks?: number };
                                    const questionNumber = qWithMarks.questionNumber || `${index + 1}`;
                                    const isMultipleChoice = q.type === 'multiple-choice' || q.type === 'picture-multiple-choice';
                                    
                                    // Check if this is the first sub-question with a shared diagram
                                    const isFirstWithSharedDiagram = isFirstSubQuestionWithSharedDiagram(index, q, session.examQuestions);
                                    
                                    return (
                                    <div key={q.id} className={currentQuestionIndex === index ? 'block' : 'hidden'}>
                                        <div className="rounded-xl border bg-card text-card-foreground shadow p-6 space-y-4">
                                            <div className="flex justify-between items-start">
                                                <p className="font-semibold text-lg">Question {questionNumber}: <span className="text-sm font-normal text-muted-foreground">({q.topic})</span></p>
                                                {qWithMarks.marks && (
                                                    <span className="text-sm font-medium text-primary bg-primary/10 px-2 py-1 rounded">{qWithMarks.marks} marks</span>
                                                )}
                                            </div>
                                            
                                            {/* Display question image if available */}
                                            {q.imageUrl && (
                                                <div className={`${isFirstWithSharedDiagram ? 'my-4' : 'mb-3'}`}>
                                                    {isFirstWithSharedDiagram ? (
                                                        // First sub-question: show large image
                                                        <div className="flex justify-center">
                                                            {q.imageUrl && (q.imageUrl.startsWith('data:image') || q.imageUrl.startsWith('data:application/pdf')) ? (
                                                                <img 
                                                                    src={q.imageUrl} 
                                                                    alt="Question reference image" 
                                                                    className="max-w-full h-auto rounded-lg border border-border shadow-sm"
                                                                    style={{ maxHeight: '500px' }}
                                                                />
                                                            ) : q.imageUrl && q.imageUrl.startsWith('<svg') ? (
                                                                <div dangerouslySetInnerHTML={{ __html: q.imageUrl }} />
                                                            ) : q.imageUrl && (q.imageUrl.startsWith('http://') || q.imageUrl.startsWith('https://')) ? (
                                                                <Image 
                                                                    src={q.imageUrl} 
                                                                    alt="Question reference image" 
                                                                    width={800}
                                                                    height={600}
                                                                    className="rounded-lg border border-border shadow-sm"
                                                                />
                                                            ) : null}
                                                        </div>
                                                    ) : (
                                                        // Follow-up sub-question: show small clickable thumbnail at top
                                                        <div className="border-b border-border pb-3">
                                                            <button
                                                                onClick={() => setEnlargedImageUrl(q.imageUrl!)}
                                                                className="flex items-center gap-3 w-full hover:opacity-80 transition-opacity text-left group"
                                                            >
                                                                {q.imageUrl && (q.imageUrl.startsWith('data:image') || q.imageUrl.startsWith('data:application/pdf')) ? (
                                                                    <img 
                                                                        src={q.imageUrl} 
                                                                        alt="Click to enlarge diagram" 
                                                                        className="w-40 h-auto rounded-lg border border-border shadow-sm group-hover:border-primary transition-colors"
                                                                    />
                                                                ) : q.imageUrl && q.imageUrl.startsWith('<svg') ? (
                                                                    <div 
                                                                        dangerouslySetInnerHTML={{ __html: q.imageUrl }} 
                                                                        className="w-40 h-auto rounded-lg border border-border shadow-sm group-hover:border-primary transition-colors"
                                                                    />
                                                                ) : q.imageUrl && (q.imageUrl.startsWith('http://') || q.imageUrl.startsWith('https://')) ? (
                                                                    <Image 
                                                                        src={q.imageUrl} 
                                                                        alt="Click to enlarge diagram" 
                                                                        width={160}
                                                                        height={120}
                                                                        className="rounded-lg border border-border shadow-sm group-hover:border-primary transition-colors"
                                                                    />
                                                                ) : null}
                                                                <div className="flex-1">
                                                                    <p className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">Click to enlarge diagram</p>
                                                                    <p className="text-xs text-muted-foreground mt-1">Refer to the diagram shown above</p>
                                                                </div>
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            
                                            <div className="text-base prose max-w-none"><ReactMarkdown rehypePlugins={[rehypeRaw]}>{q.question.replace(/\\n/g, '<br>')}</ReactMarkdown></div>
                                            
                                            {isMultipleChoice && q.options && q.options.length > 0 ? (
                                                <div className="space-y-2">
                                                    {q.options.map((option, optIdx) => (
                                                        <button
                                                            key={optIdx}
                                                            onClick={() => handleAnswerChange(index, option.value)}
                                                            disabled={!!q.feedback?.isCorrect}
                                                            className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                                                                q.studentAnswer === option.value
                                                                    ? 'border-primary bg-primary/10'
                                                                    : 'border-muted hover:border-primary/50'
                                                            } ${q.feedback?.isCorrect ? 'opacity-70' : ''}`}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-medium">{String.fromCharCode(65 + optIdx)}.</span>
                                                                <span>{option.label}</span>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            ) : (
                                                <Textarea 
                                                    placeholder="Your answer..."
                                                    value={q.studentAnswer || ''}
                                                    onChange={(e) => handleAnswerChange(index, e.target.value)}
                                                    disabled={!!q.feedback?.isCorrect}
                                                    rows={4}
                                                />
                                            )}
                                            
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
                                    );
                                })}
                            </CardContent>
                            <div className="p-4 border-t bg-muted/30 flex justify-between items-center">
                                <Button
                                    variant="outline"
                                    onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                                    disabled={currentQuestionIndex === 0 || isFinishing}
                                    className="min-w-[120px]"
                                >
                                    <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                                </Button>
                                <div className="flex flex-col items-center">
                                    <div className="text-sm font-semibold whitespace-nowrap">
                                        Question {currentQuestionIndex + 1} of {questionsCount}
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                        {completedQuestions} completed
                                    </div>
                                </div>
                                {currentQuestionIndex === questionsCount - 1 ? (
                                    <Button
                                        onClick={handleFinish}
                                        disabled={isFinishing}
                                        className="min-w-[120px] bg-green-600 hover:bg-green-700"
                                    >
                                        {isFinishing ? (
                                            <>
                                                <Loader className="mr-2 h-4 w-4 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle className="mr-2 h-4 w-4" />
                                                Finish Paper
                                            </>
                                        )}
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                                        disabled={isFinishing}
                                        className="min-w-[120px]"
                                    >
                                        Next <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                )}
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
                                    Practice questions for this specific subject ({paperData?.subject}) and grade have not been pre-loaded into the app's library yet.
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
                    <Card className="flex-1 flex flex-col h-full max-h-[85vh] sticky top-0">
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
            
            {/* Image Enlargement Modal */}
            {enlargedImageUrl && (
                <div 
                    className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
                    onClick={() => setEnlargedImageUrl(null)}
                >
                    <div className="relative max-w-[90vw] max-h-[90vh] bg-white rounded-lg p-4">
                        <button
                            onClick={() => setEnlargedImageUrl(null)}
                            className="absolute top-2 right-2 bg-white/10 hover:bg-white/20 rounded-full p-2 text-white backdrop-blur-sm transition-colors"
                        >
                            ✕
                        </button>
                        {enlargedImageUrl && (enlargedImageUrl.startsWith('data:image') || enlargedImageUrl.startsWith('data:application/pdf')) ? (
                            <img 
                                src={enlargedImageUrl} 
                                alt="Enlarged diagram" 
                                className="max-w-full max-h-[90vh] object-contain"
                            />
                        ) : enlargedImageUrl && enlargedImageUrl.startsWith('<svg') ? (
                            <div dangerouslySetInnerHTML={{ __html: enlargedImageUrl }} />
                        ) : enlargedImageUrl && (enlargedImageUrl.startsWith('http://') || enlargedImageUrl.startsWith('https://')) ? (
                            <Image 
                                src={enlargedImageUrl} 
                                alt="Enlarged diagram" 
                                width={1200}
                                height={900}
                                className="max-w-full max-h-[90vh] object-contain"
                            />
                        ) : null}
                    </div>
                </div>
            )}
        </div>
    );
}
