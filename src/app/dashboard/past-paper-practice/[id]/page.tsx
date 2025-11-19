
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
import { useScrollRestore } from '@/hooks/use-scroll-restore';

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
  imageFileId?: string; // Appwrite Storage file ID
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
 * Checks if this question should show a large diagram or a small thumbnail.
 * All follow-up questions that share a diagram should show small thumbnails.
 * Only the first question with a diagram shows large.
 */
function shouldShowLargeDiagram(
    index: number, 
    currentQuestion: QuestionWithFeedback & { questionNumber?: string },
    allQuestions: QuestionWithFeedback[]
): boolean {
    if (!currentQuestion.imageUrl) return false;
    
    // Parse question number to check if it's a subquestion
    const parts = currentQuestion.questionNumber ? currentQuestion.questionNumber.split('.') : [];
    
    // If it's a subquestion (has 3+ parts like "1.3.1", "1.3.2"), always show small thumbnail
    if (parts.length >= 3) {
        return false; // Subquestion - show small thumbnail
    }
    
    // Check if there's ANY previous question with the same diagram
    // If so, this is a follow-up question and should show small thumbnail
    for (let i = 0; i < index; i++) {
        const prevQ = allQuestions[i];
        if (prevQ.imageUrl && prevQ.imageUrl === currentQuestion.imageUrl) {
            return false; // Follow-up question with same diagram - show small thumbnail
        }
    }
    
    // This is the first question with this diagram - show large
    return true;
}

/**
 * Detects if a question is asking for a true/false answer
 */
function isTrueFalseQuestion(questionText: string): boolean {
    const text = questionText.toLowerCase();
    // Check for explicit true/false patterns
    const trueFalsePatterns = [
        /true\s+or\s+false/i,
        /true\/false/i,
        /^true\s*$/i,
        /^false\s*$/i,
        /state\s+(whether|if).*(true|false)/i,
        /indicate\s+(whether|if).*(true|false)/i,
        /write\s+(true|false)/i,
        /circle\s+(true|false)/i,
        /tick\s+(true|false)/i,
        /mark\s+(true|false)/i,
        /select\s+(true|false)/i,
        /choose\s+(true|false)/i,
    ];
    
    return trueFalsePatterns.some(pattern => pattern.test(text));
}

/**
 * Checks if the question text references a diagram/graph/table below.
 * If so, the text should appear above the image.
 */
function referencesVisualBelow(questionText: string): boolean {
    const lowerText = questionText.toLowerCase();
    return lowerText.includes('diagram below') ||
           lowerText.includes('graph below') ||
           lowerText.includes('table below') ||
           lowerText.includes('chart below') ||
           lowerText.includes('figure below') ||
           lowerText.includes('picture below') ||
           lowerText.includes('image below') ||
           lowerText.includes('the diagram') ||
           lowerText.includes('the graph') ||
           lowerText.includes('the table') ||
           lowerText.includes('the chart') ||
           lowerText.includes('the figure');
}

/**
 * Checks if this is a parent question (e.g., "1.1", "1.2") or a subquestion (e.g., "1.1.1", "1.2.2").
 * Parent questions (2 parts) should not have answer boxes, only subquestions (3+ parts) should.
 * Exception: Multiple choice questions always show answer boxes.
 */
function isSubquestion(questionNumber: string | undefined): boolean {
    if (!questionNumber) return true; // Default to showing answer box if no number
    
    const parts = questionNumber.split('.');
    // If it has 3+ parts (like "1.1.1", "1.2.2"), it's a subquestion
    // If it has 2 parts (like "1.1", "1.2"), it's a parent question
    return parts.length >= 3;
}


export default function PastPaperPracticePage() {
    const { toast } = useToast();
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const paperId = Array.isArray(params.id) ? params.id[0] : params.id;
    
    const { user } = useUser();
    const databases = useDatabases();

    // Restore scroll position on reload (use paperId to make it unique per paper)
    useScrollRestore(`past-paper-practice-${paperId || 'default'}`);

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
        return {
            databaseId: appwriteConfig.databaseId,
            collectionId: 'pastpapers',
            documentId: paperId as string,
        };
    }, [paperId]);

    const paperRefNew = useMemoAppwrite(() => {
        if (!paperId) return null;
        return {
            databaseId: appwriteConfig.databaseId,
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
        return {
            databaseId: appwriteConfig.databaseId,
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

    /**
     * Get image URL from Appwrite Storage file ID
     */
    const getImageUrlFromFileId = (fileId: string | null | undefined): string | undefined => {
      if (!fileId) return undefined;
      
      // Appwrite Storage preview URL format
      // Use appwriteConfig instead of environment variables (which may not be set)
      const endpoint = appwriteConfig.endpoint; // Already includes /v1
      const projectId = appwriteConfig.projectId;
      const bucketId = '690dafea0021f232399e'; // QUESTION_IMAGES_BUCKET_ID
      
      return `${endpoint}/storage/buckets/${bucketId}/files/${fileId}/view?project=${projectId}`;
    };

    /**
     * Parse MCQ options from questionText
     * Extracts options in format: "A. Option text\nB. Option text\nC. Option text\nD. Option text"
     */
    const parseMCQOptions = (questionText: string): { questionStem: string; options: Array<{ value: string; label: string }> } | null => {
        // Look for MCQ pattern: A. ... B. ... C. ... D. ...
        const mcqPattern = /(.*?)(?:\n|^)\s*([A-D])\.\s*([^\n]+)(?:\n|$)\s*([A-D])\.\s*([^\n]+)(?:\n|$)\s*([A-D])\.\s*([^\n]+)(?:\n|$)\s*([A-D])\.\s*([^\n]+)/i;
        const match = questionText.match(mcqPattern);
        
        if (match) {
            const questionStem = match[1].trim();
            const options = [
                { value: match[2].toUpperCase(), label: match[3].trim() },
                { value: match[4].toUpperCase(), label: match[5].trim() },
                { value: match[6].toUpperCase(), label: match[7].trim() },
                { value: match[8].toUpperCase(), label: match[9].trim() },
            ];
            return { questionStem, options };
        }
        
        // Try alternative pattern: lines starting with A. B. C. D.
        const lines = questionText.split('\n');
        const optionLines: Array<{ letter: string; text: string }> = [];
        let questionStem = '';
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            const optionMatch = line.match(/^([A-D])\.\s*(.+)$/i);
            if (optionMatch) {
                optionLines.push({ letter: optionMatch[1].toUpperCase(), text: optionMatch[2].trim() });
            } else if (line && optionLines.length === 0) {
                // This is part of the question stem
                questionStem += (questionStem ? '\n' : '') + line;
            }
        }
        
        if (optionLines.length >= 4) {
            return {
                questionStem: questionStem.trim(),
                options: optionLines.slice(0, 4).map(opt => ({ value: opt.letter, label: opt.text }))
            };
        }
        
        return null;
    };

    useEffect(() => {
        if (!paperData) return;
        
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
            
            // Try to fetch from questions collection if using new structure
            // Note: This collection may not exist yet - if so, we'll fall back to generatedQuestions
            if (paperDataNew && paperId && databases) {
                try {
                    const questionsSnapshot = await databases.listDocuments(
                        appwriteConfig.databaseId,
                        'questions',
                        [
                            Query.equal('paperId', paperId as string),
                            Query.orderAsc('order') // Sort by order field to maintain correct question sequence
                        ]
                    );
                    
                    if (questionsSnapshot.documents.length > 0) {
                        // DEBUG: Log order values and question text as they come from database (before any processing)
                        if (process.env.NODE_ENV === 'development') {
                            console.log('[Question Ordering] ========================================');
                            console.log('[Question Ordering] RAW DATABASE QUERY RESULTS (sorted by Query.orderAsc):');
                            questionsSnapshot.documents.forEach((doc, idx) => {
                                const order = (doc as any).order;
                                const orderStr = order !== undefined ? String(order) : 'MISSING';
                                const qNum = (doc as any).questionNumber || (doc as any).number || 'unknown';
                                const qText = (doc as any).question || (doc as any).questionText || '';
                                const textPreview = qText.length > 100 ? qText.substring(0, 100) + '...' : qText;
                                console.log(`  [${idx}] Q${qNum}:`);
                                console.log(`    - order: ${orderStr}`);
                                console.log(`    - text: "${textPreview}"`);
                                console.log(`    - full text length: ${qText.length}`);
                                console.log(`    - type: ${(doc as any).type || 'unknown'}`);
                                console.log(`    - hasImage: ${!!(doc as any).imageFileId}`);
                            });
                        }
                        
                        questionsFromSubcollection = questionsSnapshot.documents
                            .map(doc => {
                                const q = doc as any; // Type assertion to access all fields
                                const questionText = q.question || q.questionText || '';
                                
                                // DEBUG: Log all fields in the document to see what's available
                                if (process.env.NODE_ENV === 'development' && q.number === '2.2') {
                                    console.log('[DB Document Fields] Q2.2 document:', {
                                        allKeys: Object.keys(q),
                                        imageFileId: q.imageFileId,
                                        image_file_id: q.image_file_id,
                                        hasImage: q.hasImage,
                                        image: q.image,
                                        imageDataUri: q.imageDataUri ? 'present' : 'missing',
                                        type: q.type,
                                        number: q.number
                                    });
                                }
                                
                                // Check if it's MCQ by type field
                                const dbType = q.type || '';
                                const isMCQ = dbType === 'multiple-choice' || dbType === 'multiple_choice';
                                
                                // Check if it's true/false by type field OR by question text
                                const isTrueFalse = dbType === 'true-false' || dbType === 'true_false' || isTrueFalseQuestion(questionText);
                                
                                // Try to get options from database (stored as JSON string)
                                let options: Array<{ value: string; label: string }> | undefined = undefined;
                                if (isMCQ && q.options) {
                                    try {
                                        // Options are stored as JSON string in database
                                        const parsedOptions = typeof q.options === 'string' 
                                            ? JSON.parse(q.options) 
                                            : q.options;
                                        
                                        if (Array.isArray(parsedOptions)) {
                                            // Convert array of strings to { value, label } format
                                            options = parsedOptions.map((opt, idx) => ({
                                                value: String.fromCharCode(65 + idx), // A, B, C, D...
                                                label: typeof opt === 'string' ? opt : String(opt)
                                            }));
                                        }
                                    } catch (e) {
                                        console.warn(`Failed to parse options for question ${q.number}:`, e);
                                    }
                                }
                                
                                // Fallback: try parsing from question text if no options found in DB
                                const parsedMCQ = !options ? parseMCQOptions(questionText) : null;
                                
                                // Get imageFileId - try multiple possible field names
                                const imageFileId = q.imageFileId || q.image_file_id || (q as any).imageFileId;
                                
                                // Get image URL from file ID (preferred) or data URI (fallback)
                                // CRITICAL: Always generate URL from imageFileId if it exists
                                const imageUrl = imageFileId 
                                    ? getImageUrlFromFileId(imageFileId)
                                    : (q.image || q.imageDataUri || (q.hasImage && q.imageDataUri ? q.imageDataUri : undefined));
                                
                                // DEBUG: Log image loading
                                if (process.env.NODE_ENV === 'development') {
                                    if (imageFileId) {
                                        console.log(`[Image Load] Q${q.number}: imageFileId=${imageFileId}, generatedUrl=${imageUrl || 'FAILED'}`);
                                    } else if (q.hasImage) {
                                        console.warn(`[Image Load] Q${q.number}: hasImage=true but no imageFileId found!`, {
                                            allFields: Object.keys(q).filter(k => k.toLowerCase().includes('image'))
                                        });
                                    }
                                }
                                
                                // DEBUG: Log question text being loaded from database
                                if (process.env.NODE_ENV === 'development') {
                                    console.log(`[Question Text Load] Q${q.number}:`, {
                                        questionText: questionText.substring(0, 100),
                                        fullLength: questionText.length,
                                        dbField: q.question || q.questionText || 'MISSING',
                                        hasImage: !!imageFileId,
                                        imageFileId: imageFileId || 'none',
                                        rawImageFileId: q.imageFileId || 'none',
                                        rawImage_file_id: q.image_file_id || 'none'
                                    });
                                }
                                
                                // DEBUG: Log image information
                                if (process.env.NODE_ENV === 'development' && (imageFileId || imageUrl)) {
                                    const imageInfo = {
                                        questionNumber: q.number,
                                        imageFileId: imageFileId || 'none',
                                        imageUrl: imageUrl || 'none',
                                        hasImage: q.hasImage,
                                        generatedUrl: imageFileId ? getImageUrlFromFileId(imageFileId) : 'N/A'
                                    };
                                    console.log(`[Image Loading] Q${q.number}:`, imageInfo);
                                    // Also log individual fields for easier reading
                                    console.log(`  - imageFileId: ${imageInfo.imageFileId}`);
                                    console.log(`  - imageUrl: ${imageInfo.imageUrl}`);
                                    console.log(`  - generatedUrl: ${imageInfo.generatedUrl}`);
                                }
                                
                                
                                // If MCQ, use options from DB or parsed from text
                                if (isMCQ && (options || parsedMCQ)) {
                                    return {
                                        id: `question-${q.number}`,
                                        question: parsedMCQ ? parsedMCQ.questionStem : questionText,
                                        topic: extractTopicFromQuestion(parsedMCQ ? parsedMCQ.questionStem : questionText, baseSubject),
                                        answer: q.answer || null,
                                        type: 'multiple-choice' as const,
                                        options: options || parsedMCQ!.options,
                                        imageUrl,
                                        imageFileId: imageFileId, // Include imageFileId (using the resolved value)
                                        questionNumber: q.number || q.questionNumber || '',
                                        marks: q.marks || 0,
                                        order: q.order || 0, // Include order field for sorting
                                    };
                                }
                                
                                // Free-text or true-false question
                                const freeTextQuestion = {
                                    id: `question-${q.number}`,
                                    question: questionText,
                                    topic: extractTopicFromQuestion(questionText, baseSubject),
                                    answer: q.answer || null,
                                    type: (isTrueFalse ? 'true-false' : 'free-text') as const,
                                    imageUrl, // CRITICAL: This must be set from imageFileId
                                    imageFileId: imageFileId, // Include imageFileId (using the resolved value)
                                    questionNumber: q.number || q.questionNumber || '',
                                    marks: q.marks || 0,
                                    order: q.order || 0, // Include order field for sorting
                                };
                                
                                // DEBUG: Log question text being loaded
                                if (process.env.NODE_ENV === 'development') {
                                    console.log(`[Question Text Load] Q${q.number}:`, {
                                        questionText: questionText.substring(0, 100),
                                        fullLength: questionText.length,
                                        dbField: q.question || q.questionText || 'MISSING',
                                        hasImage: !!imageUrl,
                                        imageFileId: imageFileId || 'none'
                                    });
                                }
                                
                                return freeTextQuestion;
                            })
                            .map(q => {
                                // Include order field for MCQ questions too
                                const qWithOrder = q as any;
                                if (q.type === 'multiple-choice' && !qWithOrder.order) {
                                    qWithOrder.order = 0;
                                }
                                return q;
                            });
                        
                        // DEBUG: Log BEFORE sorting with question text
                        if (process.env.NODE_ENV === 'development') {
                            console.log('[Question Ordering] ========================================');
                            console.log('[Question Ordering] BEFORE SORT - Loaded from database:');
                            questionsFromSubcollection.forEach((q, idx) => {
                                const order = (q as any).order;
                                const orderStr = order !== undefined ? String(order) : 'MISSING';
                                const qText = q.question || '';
                                const textPreview = qText.length > 50 ? qText.substring(0, 50) + '...' : qText;
                                console.log(`  [${idx}] Q${(q as any).questionNumber}: order=${orderStr}, type=${q.type || 'unknown'}, hasImage=${!!q.imageUrl}, text="${textPreview}"`);
                            });
                        }
                        
                        // Now sort the questions
                        questionsFromSubcollection = questionsFromSubcollection.sort((a, b) => {
                                // PRIMARY: Sort by order field from database (most reliable)
                                const aOrder = (a as any).order || 0;
                                const bOrder = (b as any).order || 0;
                                
                                // DEBUG: Only log when order values are equal (potential issue)
                                if (process.env.NODE_ENV === 'development' && aOrder === bOrder && aOrder !== 0) {
                                    console.warn(`[Sort Compare] ⚠️ Q${(a as any).questionNumber} and Q${(b as any).questionNumber} have same order (${aOrder}), using question number fallback`);
                                }
                                
                                if (aOrder !== bOrder) {
                                    return aOrder - bOrder;
                                }
                                
                                // FALLBACK: If order is missing or equal, sort by question number
                                const aParts = (a as any).questionNumber.split('.').map(Number);
                                const bParts = (b as any).questionNumber.split('.').map(Number);
                                for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
                                    const aVal = aParts[i] || 0;
                                    const bVal = bParts[i] || 0;
                                    if (aVal !== bVal) {
                                        return aVal - bVal;
                                    }
                                }
                                return 0;
                            });
                        
                        // DEBUG: Log AFTER sorting with validation and question text
                        if (process.env.NODE_ENV === 'development') {
                            console.log('[Question Ordering] AFTER SORT - Final sequence:');
                            let hasOrderIssue = false;
                            questionsFromSubcollection.forEach((q, idx) => {
                                const order = (q as any).order;
                                const orderStr = order !== undefined ? String(order) : 'MISSING';
                                const prevOrder = idx > 0 ? (questionsFromSubcollection[idx - 1] as any).order : null;
                                let orderCheck = '';
                                if (prevOrder !== null && order !== undefined) {
                                    if (order < prevOrder) {
                                        orderCheck = '✗ INVALID ORDER (decreasing!)';
                                        hasOrderIssue = true;
                                    } else if (order === prevOrder) {
                                        orderCheck = '⚠ SAME ORDER (using fallback)';
                                    } else {
                                        orderCheck = '✓';
                                    }
                                }
                                const qText = q.question || '';
                                const textPreview = qText.length > 50 ? qText.substring(0, 50) + '...' : qText;
                                console.log(`  [${idx}] Q${(q as any).questionNumber}: order=${orderStr} ${orderCheck}, text="${textPreview}"`);
                            });
                            if (hasOrderIssue) {
                                console.error('[Question Ordering] ⚠️ WARNING: Detected decreasing order values! Sorting may be incorrect.');
                            }
                            console.log('[Question Ordering] ========================================');
                        }
                        
                        // After sorting, inherit diagrams from parent questions to subquestions
                        // If a subquestion doesn't have an imageUrl, check if its parent has one
                        const questionMap = new Map<string, Question>();
                        questionsFromSubcollection.forEach(q => {
                            if (q.questionNumber) {
                                questionMap.set(q.questionNumber, q);
                            }
                        });
                        
                        // Second pass: inherit diagrams from parents
                        questionsFromSubcollection = questionsFromSubcollection.map(q => {
                            // If this question already has an imageUrl, keep it
                            if (q.imageUrl) {
                                return q;
                            }
                            
                            // If no question number, can't find parent
                            if (!q.questionNumber) {
                                return q;
                            }
                            
                            // Parse question number to find parent
                            const parts = q.questionNumber.split('.');
                            
                            // Try to find parent questions at different levels
                            // e.g., for "1.3.1", try "1.3" then "1"
                            for (let i = parts.length - 1; i > 0; i--) {
                                const parentNumber = parts.slice(0, i).join('.');
                                const parentQ = questionMap.get(parentNumber);
                                
                                if (parentQ && parentQ.imageUrl) {
                                    // Found parent with diagram - inherit it
                                    return {
                                        ...q,
                                        imageUrl: parentQ.imageUrl
                                    };
                                }
                            }
                            
                            return q;
                        });
                    }
                } catch (e: any) {
                    // Collection doesn't exist, unauthorized, or other error - this is fine, we'll use fallback
                    const isCollectionNotFound = e?.code === 404 || 
                                                e?.message?.includes('Collection') || 
                                                e?.message?.includes('could not be found');
                    const isUnauthorized = e?.code === 401 || 
                                          e?.code === 403 ||
                                          e?.message?.includes('not authorized') ||
                                          e?.message?.includes('unauthorized');
                    
                    // Only log if it's not a "not found" or "unauthorized" error (expected fallback scenarios)
                    if (!isCollectionNotFound && !isUnauthorized) {
                        console.warn('Could not fetch from questions collection:', e);
                    }
                    // Silently fall back to generatedQuestions array
                }
            }
            
            // Use subcollection questions if available, otherwise use old structure
            if (questionsFromSubcollection.length > 0) {
                questions = questionsFromSubcollection;
            } else if (paperData.generatedQuestions && paperData.generatedQuestions.length > 0) {
                // Fall back to old structure
                questions = paperData.generatedQuestions.map((gq, idx) => {
                    const questionText = gq.questionText || '';
                    
                    // Check if it's MCQ by type field or by parsing questionText
                    const dbType = (gq as any).type || '';
                    const parsedMCQ = parseMCQOptions(questionText);
                    const isMCQ = dbType === 'multiple-choice' || parsedMCQ !== null;
                    
                    // If MCQ, extract options and use question stem only
                    if (isMCQ && parsedMCQ) {
                        return {
                            id: `generated-${idx}`,
                            question: parsedMCQ.questionStem,
                            topic: extractTopicFromQuestion(parsedMCQ.questionStem, baseSubject),
                            answer: gq.answer,
                            type: 'multiple-choice' as const,
                            options: parsedMCQ.options,
                            imageUrl: gq.hasImage && gq.imageDataUri && (gq.imageDataUri.startsWith('data:image/') || gq.imageDataUri.startsWith('data:application/pdf')) ? gq.imageDataUri : undefined,
                            questionNumber: gq.questionNumber,
                            marks: gq.marks,
                        };
                    }
                    
                    // Free-text question
                    return {
                        id: `generated-${idx}`,
                        question: questionText,
                        topic: extractTopicFromQuestion(questionText, baseSubject),
                        answer: gq.answer,
                        type: 'free-text' as const,
                        imageUrl: gq.hasImage && gq.imageDataUri && (gq.imageDataUri.startsWith('data:image/') || gq.imageDataUri.startsWith('data:application/pdf')) ? gq.imageDataUri : undefined,
                        questionNumber: gq.questionNumber,
                        marks: gq.marks,
                    };
                });
                
                // Also inherit diagrams for old structure
                const questionMap = new Map<string, Question>();
                questions.forEach(q => {
                    if (q.questionNumber) {
                        questionMap.set(q.questionNumber, q);
                    }
                });
                
                // Second pass: inherit diagrams from parents
                questions = questions.map(q => {
                    // If this question already has an imageUrl, keep it
                    if (q.imageUrl) {
                        return q;
                    }
                    
                    // If no question number, can't find parent
                    if (!q.questionNumber) {
                        return q;
                    }
                    
                    // Parse question number to find parent
                    const parts = q.questionNumber.split('.');
                    
                    // Try to find parent questions at different levels
                    // e.g., for "1.3.1", try "1.3" then "1"
                    for (let i = parts.length - 1; i > 0; i--) {
                        const parentNumber = parts.slice(0, i).join('.');
                        const parentQ = questionMap.get(parentNumber);
                        
                        if (parentQ && parentQ.imageUrl) {
                            // Found parent with diagram - inherit it
                            return {
                                ...q,
                                imageUrl: parentQ.imageUrl
                            };
                        }
                    }
                    
                    return q;
                });
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
        
        // Query for existing progress by userId and paperId
        databases.listDocuments(
            appwriteConfig.databaseId,
            'pastpaperprogress',
            [
                Query.equal('userId', user.$id),
                Query.equal('paperId', paperId),
                Query.limit(1),
            ]
        )
            .then((result) => {
                if (result.documents.length > 0) {
                    // Document exists, update it
                    const existingDoc = result.documents[0];
                    return databases.updateDocument(
                        appwriteConfig.databaseId,
                        'pastpaperprogress',
                        existingDoc.$id,
                        {
                            paperId,
                            currentQuestion,
                            lastAccessed: new Date().toISOString(),
                            userId: user.$id,
                        }
                    );
                } else {
                    // Document doesn't exist, create it with unique ID
                    return databases.createDocument(
                        appwriteConfig.databaseId,
                        'pastpaperprogress',
                        ID.unique(),
                        {
                            paperId,
                            currentQuestion,
                            lastAccessed: new Date().toISOString(),
                            userId: user.$id,
                        }
                    );
                }
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
                questionText: currentQuestion?.question,
                memoAnswer: currentQuestion?.answer || undefined,
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
                                    
                                    // Check if this should show large diagram or small thumbnail
                                    // All subquestions (follow-up questions) show small thumbnails
                                    const showLargeDiagram = shouldShowLargeDiagram(index, q, session.examQuestions);
                                    
                                    // DEBUG: Log rendering decisions with full question text comparison
                                    if (process.env.NODE_ENV === 'development') {
                                        console.log(`[Rendering Debug] Q${questionNumber}:`, {
                                            hasImageUrl: !!q.imageUrl,
                                            imageUrl: q.imageUrl?.substring(0, 80) || 'none',
                                            showLargeDiagram,
                                            questionText: q.question.substring(0, 100),
                                            fullQuestionText: q.question,
                                            questionTextLength: q.question.length,
                                            isSubquestion: isSubquestion(questionNumber),
                                            index: index,
                                            order: (q as any).order || 'MISSING'
                                        });
                                        
                                        // Compare with expected text from database
                                        const expectedText = session.examQuestions.find((eq, idx) => {
                                            const eqNum = (eq as Question & { questionNumber?: string }).questionNumber || `${idx + 1}`;
                                            return eqNum === questionNumber;
                                        })?.question || 'NOT FOUND';
                                        
                                        if (q.question !== expectedText) {
                                            console.error(`[TEXT MISMATCH] Q${questionNumber}:`);
                                            console.error(`  Current: "${q.question.substring(0, 100)}..."`);
                                            console.error(`  Expected: "${expectedText.substring(0, 100)}..."`);
                                        }
                                    }
                                    
                                    // Check if question text should appear above the image
                                    // Get image URL from imageFileId if imageUrl is not set
                                    // CRITICAL: Always check imageFileId first, then fall back to imageUrl
                                    const effectiveImageUrl = (q.imageFileId ? getImageUrlFromFileId(q.imageFileId) : undefined) || q.imageUrl;
                                    
                                    // DEBUG: Log image resolution
                                    if (process.env.NODE_ENV === 'development' && (q.imageFileId || q.imageUrl)) {
                                        console.log(`[Image Render] Q${questionNumber}:`, {
                                            hasImageFileId: !!q.imageFileId,
                                            imageFileId: q.imageFileId || 'none',
                                            hasImageUrl: !!q.imageUrl,
                                            imageUrl: q.imageUrl?.substring(0, 80) || 'none',
                                            effectiveImageUrl: effectiveImageUrl?.substring(0, 80) || 'none',
                                        });
                                    }
                                    
                                    const textAboveImage = effectiveImageUrl && referencesVisualBelow(q.question);
                                    
                                    // Check if this is a subquestion (should show answer box) or parent question (should not)
                                    // Parent questions (1.1, 1.2, etc.) should NEVER show answer boxes, even if multiple choice
                                    // Only subquestions (1.1.1, 1.2.1, etc.) should show answer boxes
                                    const isSubQ = isSubquestion(questionNumber);
                                    const shouldShowAnswerBox = isSubQ; // Only subquestions show answer boxes
                                    const isTrueFalse = q.type === 'true-false';
                                    
                                    return (
                                    <div key={q.id} className={currentQuestionIndex === index ? 'block' : 'hidden'}>
                                        <div className="rounded-xl border bg-card text-card-foreground shadow p-6 space-y-4">
                                            <div className="flex justify-between items-start">
                                                <p className="font-semibold text-lg">Question {questionNumber}: <span className="text-sm font-normal text-muted-foreground">({q.topic})</span></p>
                                                {qWithMarks.marks && (
                                                    <span className="text-sm font-medium text-primary bg-primary/10 px-2 py-1 rounded">{qWithMarks.marks} marks</span>
                                                )}
                                            </div>
                                            
                                            {/* Display question text above image if it references diagram/graph/table below */}
                                            {textAboveImage && (
                                                <div className="text-base prose max-w-none"><ReactMarkdown rehypePlugins={[rehypeRaw]}>{q.question.replace(/\\n/g, '<br>')}</ReactMarkdown></div>
                                            )}
                                            
                                            {/* Display question image if available */}
                                            {effectiveImageUrl ? (
                                                <div className={`${showLargeDiagram ? 'my-4' : 'mb-3'}`} data-question-number={questionNumber}>
                                                    {showLargeDiagram ? (
                                                        // First sub-question: show large image
                                                        <div className="flex justify-center">
                                                            {effectiveImageUrl && (effectiveImageUrl.startsWith('data:image') || effectiveImageUrl.startsWith('data:application/pdf')) ? (
                                                                <img 
                                                                    src={effectiveImageUrl} 
                                                                    alt="Question reference image" 
                                                                    className="max-w-full h-auto rounded-lg border border-border shadow-sm"
                                                                    style={{ maxHeight: '500px' }}
                                                                    onError={(e) => {
                                                                        console.error('[Image Error] Failed to load image for Q' + questionNumber + ':', {
                                                                            imageUrl: effectiveImageUrl,
                                                                            questionNumber: questionNumber,
                                                                            error: e
                                                                        });
                                                                        if (process.env.NODE_ENV === 'development') {
                                                                            console.error('[Image Error] Full image URL:', effectiveImageUrl);
                                                                        }
                                                                    }}
                                                                    onLoad={() => {
                                                                        if (process.env.NODE_ENV === 'development') {
                                                                            console.log('[Image Success] Loaded image for Q' + questionNumber + ':', effectiveImageUrl);
                                                                        }
                                                                    }}
                                                                />
                                                            ) : effectiveImageUrl && effectiveImageUrl.startsWith('<svg') ? (
                                                                <div dangerouslySetInnerHTML={{ __html: effectiveImageUrl }} />
                                                            ) : effectiveImageUrl && (effectiveImageUrl.startsWith('http://') || effectiveImageUrl.startsWith('https://')) ? (
                                                                // Use regular img tag for Appwrite URLs to avoid Next.js Image optimization issues
                                                                <img 
                                                                    src={effectiveImageUrl} 
                                                                    alt="Question reference image" 
                                                                    className="max-w-full h-auto rounded-lg border border-border shadow-sm"
                                                                    style={{ maxHeight: '500px', display: 'block' }}
                                                                    data-question-number={questionNumber}
                                                                    data-image-type="large"
                                                                    onError={(e) => {
                                                                        console.error('[Image Error] Failed to load image for Q' + questionNumber + ':', {
                                                                            imageUrl: effectiveImageUrl,
                                                                            questionNumber: questionNumber,
                                                                            error: e,
                                                                            target: e.currentTarget
                                                                        });
                                                                        if (process.env.NODE_ENV === 'development') {
                                                                            console.error('[Image Error] Full image URL:', effectiveImageUrl);
                                                                            // Add visual error indicator
                                                                            const target = e.currentTarget as HTMLImageElement;
                                                                            target.style.border = '3px solid red';
                                                                            target.style.backgroundColor = '#fee';
                                                                        }
                                                                    }}
                                                                    onLoad={(e) => {
                                                                        if (process.env.NODE_ENV === 'development') {
                                                                            console.log('[Image Success] Loaded image for Q' + questionNumber + ':', effectiveImageUrl);
                                                                            const target = e.currentTarget as HTMLImageElement;
                                                                            const dimensions = {
                                                                                width: target.naturalWidth,
                                                                                height: target.naturalHeight,
                                                                                display: window.getComputedStyle(target).display,
                                                                                visibility: window.getComputedStyle(target).visibility,
                                                                                opacity: window.getComputedStyle(target).opacity
                                                                            };
                                                                            console.log('[Image Success] Image dimensions:', dimensions);
                                                                        }
                                                                    }}
                                                                />
                                                            ) : effectiveImageUrl ? (
                                                                // Image URL exists but doesn't match expected formats - try to render anyway
                                                                <img 
                                                                    src={effectiveImageUrl} 
                                                                    alt="Question reference image" 
                                                                    className="max-w-full h-auto rounded-lg border border-border shadow-sm"
                                                                    style={{ maxHeight: '500px' }}
                                                                    onError={(e) => {
                                                                        console.error('[Image Error] Failed to load image for Q' + questionNumber + ':', {
                                                                            imageUrl: effectiveImageUrl,
                                                                            questionNumber: questionNumber,
                                                                            error: e
                                                                        });
                                                                        if (process.env.NODE_ENV === 'development') {
                                                                            console.error('[Image Error] Full image URL:', effectiveImageUrl);
                                                                        }
                                                                    }}
                                                                    onLoad={() => {
                                                                        if (process.env.NODE_ENV === 'development') {
                                                                            console.log('[Image Success] Loaded image for Q' + questionNumber + ':', effectiveImageUrl);
                                                                        }
                                                                    }}
                                                                />
                                                            ) : null}
                                                        </div>
                                                    ) : (
                                                        // Subquestion or follow-up question: show small clickable thumbnail
                                                        <div className="border-b border-border pb-3">
                                                            <button
                                                                onClick={() => setEnlargedImageUrl(effectiveImageUrl!)}
                                                                className="flex items-center gap-3 w-full hover:opacity-80 transition-opacity text-left group"
                                                            >
                                                                {effectiveImageUrl && (effectiveImageUrl.startsWith('data:image') || effectiveImageUrl.startsWith('data:application/pdf')) ? (
                                                                    <img 
                                                                        src={effectiveImageUrl} 
                                                                        alt="Click to enlarge diagram" 
                                                                        className="w-40 h-auto rounded-lg border border-border shadow-sm group-hover:border-primary transition-colors"
                                                                    />
                                                                ) : effectiveImageUrl && effectiveImageUrl.startsWith('<svg') ? (
                                                                    <div 
                                                                        dangerouslySetInnerHTML={{ __html: effectiveImageUrl }} 
                                                                        className="w-40 h-auto rounded-lg border border-border shadow-sm group-hover:border-primary transition-colors"
                                                                    />
                                                                ) : effectiveImageUrl && (effectiveImageUrl.startsWith('http://') || effectiveImageUrl.startsWith('https://')) ? (
                                                                    <img 
                                                                        src={effectiveImageUrl} 
                                                                        alt="Click to enlarge diagram" 
                                                                        className="w-40 h-auto rounded-lg border border-border shadow-sm group-hover:border-primary transition-colors"
                                                                        style={{ display: 'block' }}
                                                                        data-question-number={questionNumber}
                                                                        data-image-type="thumbnail"
                                                                        onError={(e) => {
                                                                            console.error('[Image Error] Failed to load thumbnail for Q' + questionNumber + ':', {
                                                                                imageUrl: effectiveImageUrl,
                                                                                questionNumber: questionNumber,
                                                                                target: e.currentTarget
                                                                            });
                                                                            if (process.env.NODE_ENV === 'development') {
                                                                                const target = e.currentTarget as HTMLImageElement;
                                                                                target.style.border = '3px solid red';
                                                                                target.style.backgroundColor = '#fee';
                                                                            }
                                                                        }}
                                                                        onLoad={(e) => {
                                                                            if (process.env.NODE_ENV === 'development') {
                                                                                console.log('[Image Success] Loaded thumbnail for Q' + questionNumber);
                                                                                const target = e.currentTarget as HTMLImageElement;
                                                                                const dimensions = {
                                                                                    width: target.naturalWidth,
                                                                                    height: target.naturalHeight,
                                                                                    display: window.getComputedStyle(target).display,
                                                                                    visibility: window.getComputedStyle(target).visibility,
                                                                                    opacity: window.getComputedStyle(target).opacity
                                                                                };
                                                                                console.log('[Image Success] Thumbnail dimensions:', dimensions);
                                                                            }
                                                                        }}
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
                                            ) : null}
                                            
                                            {/* Display question text below image if it doesn't reference diagram/graph/table below */}
                                            {!textAboveImage && (
                                                <div className="text-base prose max-w-none"><ReactMarkdown rehypePlugins={[rehypeRaw]}>{q.question.replace(/\\n/g, '<br>')}</ReactMarkdown></div>
                                            )}
                                            
                                            {/* Only show answer options/box for subquestions (1.1.1, 1.2.2, etc.) or multiple choice questions */}
                                            {shouldShowAnswerBox && (
                                                <>
                                                    {isTrueFalse ? (
                                                        <div className="space-y-2">
                                                            <button
                                                                onClick={() => handleAnswerChange(index, 'True')}
                                                                disabled={!!q.feedback?.isCorrect}
                                                                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                                                                    q.studentAnswer === 'True'
                                                                        ? 'border-primary bg-primary/10'
                                                                        : 'border-muted hover:border-primary/50'
                                                                } ${q.feedback?.isCorrect ? 'opacity-70' : ''}`}
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-semibold text-lg">True</span>
                                                                </div>
                                                            </button>
                                                            <button
                                                                onClick={() => handleAnswerChange(index, 'False')}
                                                                disabled={!!q.feedback?.isCorrect}
                                                                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                                                                    q.studentAnswer === 'False'
                                                                        ? 'border-primary bg-primary/10'
                                                                        : 'border-muted hover:border-primary/50'
                                                                } ${q.feedback?.isCorrect ? 'opacity-70' : ''}`}
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-semibold text-lg">False</span>
                                                                </div>
                                                            </button>
                                                        </div>
                                                    ) : isMultipleChoice && q.options && q.options.length > 0 ? (
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
                                                </>
                                            )}
                                            
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
