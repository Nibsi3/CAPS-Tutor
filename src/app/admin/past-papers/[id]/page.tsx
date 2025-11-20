'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@/appwrite';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash2, 
  Edit, 
  Image as ImageIcon,
  List,
  Loader2,
  XCircle,
  Eye,
  FileText,
  Type,
  Table as TableIcon,
  BarChart3,
  X,
  GripVertical,
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { SafeImage } from '@/components/ui/safe-image';
import { CAPSPaperTemplate } from '@/components/admin/CAPSPaperTemplate';

// Question Types organized by category hierarchy
export const QUESTION_TYPES = {
  "Written": [
    "short-answer",
    "paragraph-long-answer",
    "reasoning-interpretation",
    "true-false-with-reason",
    "compare-evaluate-predict",
    "sequencing-ordering"
  ],
  "Objective": [
    "multiple-choice",
    "matching-pairing",
    "fill-in-blank"
  ],
  "Visual": [
    "diagram-interpretation",
    "diagram-labeling",
    "table-interpretation",
    "graph-interpretation",
    "map-cartoon",
    "data-set-analysis"
  ],
  "Extract-Based": [
    "extract-source",
    "case-study"
  ],
  "Calculation": [
    "numeric-calculation",
    "formula-based-calculation",
    "accounting-financial-calculation",
    "geography-scale-gradient",
    "biology-percentage-ratio"
  ]
} as const;

/**
 * Subject-specific question type restrictions
 * Maps subjects to allowed question types
 */
export const SUBJECT_QUESTION_TYPE_RESTRICTIONS: Record<string, QuestionType[]> = {
  'Life Science': [
    // Written
    'short-answer',
    'paragraph-long-answer',
    'reasoning-interpretation',
    'true-false-with-reason',
    'compare-evaluate-predict',
    'sequencing-ordering',
    // Objective
    'multiple-choice',
    'matching-pairing',
    'fill-in-blank',
    // Visual (no map-cartoon for Life Science)
    'diagram-interpretation',
    'diagram-labeling',
    'table-interpretation',
    'graph-interpretation',
    'data-set-analysis',
    // Extract-Based
    'extract-source',
    'case-study',
    // Calculation
    'numeric-calculation',
    'formula-based-calculation',
    'biology-percentage-ratio',
    // Legacy
    'normal',
    'diagram',
    'table',
    'graph',
    'extract',
  ],
  'Mathematics': [
    // Written
    'short-answer',
    'paragraph-long-answer',
    'reasoning-interpretation',
    'true-false-with-reason',
    'compare-evaluate-predict',
    'sequencing-ordering',
    // Objective
    'multiple-choice',
    'matching-pairing',
    'fill-in-blank',
    // Visual (no map-cartoon for Mathematics)
    'diagram-interpretation',
    'diagram-labeling',
    'table-interpretation',
    'graph-interpretation',
    'data-set-analysis',
    // Extract-Based
    'extract-source',
    'case-study',
    // Calculation
    'numeric-calculation',
    'formula-based-calculation',
    // Legacy
    'normal',
    'diagram',
    'table',
    'graph',
  ],
  'English': [
    // Written
    'short-answer',
    'paragraph-long-answer',
    'reasoning-interpretation',
    'true-false-with-reason',
    'compare-evaluate-predict',
    'sequencing-ordering',
    // Objective
    'multiple-choice',
    'matching-pairing',
    'fill-in-blank',
    // Visual (no map-cartoon, no diagram-labeling for English typically)
    'diagram-interpretation',
    'table-interpretation',
    'graph-interpretation',
    'data-set-analysis',
    // Extract-Based
    'extract-source',
    'case-study',
    // Legacy
    'normal',
    'table',
    'graph',
    'extract',
  ],
  'Geography': [
    // Written
    'short-answer',
    'paragraph-long-answer',
    'reasoning-interpretation',
    'true-false-with-reason',
    'compare-evaluate-predict',
    'sequencing-ordering',
    // Objective
    'multiple-choice',
    'matching-pairing',
    'fill-in-blank',
    // Visual (Geography uses maps)
    'diagram-interpretation',
    'diagram-labeling',
    'table-interpretation',
    'graph-interpretation',
    'map-cartoon',
    'data-set-analysis',
    // Extract-Based
    'extract-source',
    'case-study',
    // Calculation
    'geography-scale-gradient',
    // Legacy
    'normal',
    'diagram',
    'table',
    'graph',
    'extract',
  ],
  'Accounting': [
    // Written
    'short-answer',
    'paragraph-long-answer',
    'reasoning-interpretation',
    'true-false-with-reason',
    'compare-evaluate-predict',
    'sequencing-ordering',
    // Objective
    'multiple-choice',
    'matching-pairing',
    'fill-in-blank',
    // Visual
    'table-interpretation',
    'graph-interpretation',
    'data-set-analysis',
    // Extract-Based
    'extract-source',
    'case-study',
    // Calculation
    'numeric-calculation',
    'formula-based-calculation',
    'accounting-financial-calculation',
    // Legacy
    'normal',
    'table',
    'graph',
  ],
  'Physical Sciences': [
    // Written
    'short-answer',
    'paragraph-long-answer',
    'reasoning-interpretation',
    'true-false-with-reason',
    'compare-evaluate-predict',
    'sequencing-ordering',
    // Objective
    'multiple-choice',
    'matching-pairing',
    'fill-in-blank',
    // Visual
    'diagram-interpretation',
    'diagram-labeling',
    'table-interpretation',
    'graph-interpretation',
    'data-set-analysis',
    // Extract-Based
    'extract-source',
    'case-study',
    // Calculation
    'numeric-calculation',
    'formula-based-calculation',
    // Legacy
    'normal',
    'diagram',
    'table',
    'graph',
  ],
  'Life Sciences': [
    // Written
    'short-answer',
    'paragraph-long-answer',
    'reasoning-interpretation',
    'true-false-with-reason',
    'compare-evaluate-predict',
    'sequencing-ordering',
    // Objective
    'multiple-choice',
    'matching-pairing',
    'fill-in-blank',
    // Visual (no map-cartoon for Life Sciences)
    'diagram-interpretation',
    'diagram-labeling',
    'table-interpretation',
    'graph-interpretation',
    'data-set-analysis',
    // Extract-Based
    'extract-source',
    'case-study',
    // Calculation
    'numeric-calculation',
    'formula-based-calculation',
    'biology-percentage-ratio',
    // Legacy
    'normal',
    'diagram',
    'table',
    'graph',
    'extract',
  ],
  'Business Studies': [
    // Written
    'short-answer',
    'paragraph-long-answer',
    'reasoning-interpretation',
    'true-false-with-reason',
    'compare-evaluate-predict',
    'sequencing-ordering',
    // Objective
    'multiple-choice',
    'matching-pairing',
    'fill-in-blank',
    // Visual
    'table-interpretation',
    'graph-interpretation',
    'data-set-analysis',
    // Extract-Based
    'extract-source',
    'case-study',
    // Legacy
    'normal',
    'table',
    'graph',
    'extract',
  ],
  'Economics': [
    // Written
    'short-answer',
    'paragraph-long-answer',
    'reasoning-interpretation',
    'true-false-with-reason',
    'compare-evaluate-predict',
    'sequencing-ordering',
    // Objective
    'multiple-choice',
    'matching-pairing',
    'fill-in-blank',
    // Visual
    'table-interpretation',
    'graph-interpretation',
    'data-set-analysis',
    // Extract-Based
    'extract-source',
    'case-study',
    // Calculation
    'numeric-calculation',
    'formula-based-calculation',
    // Legacy
    'normal',
    'table',
    'graph',
    'extract',
  ],
  'History': [
    // Written
    'short-answer',
    'paragraph-long-answer',
    'reasoning-interpretation',
    'true-false-with-reason',
    'compare-evaluate-predict',
    'sequencing-ordering',
    // Objective
    'multiple-choice',
    'matching-pairing',
    'fill-in-blank',
    // Visual
    'diagram-interpretation',
    'table-interpretation',
    'graph-interpretation',
    'map-cartoon',
    'data-set-analysis',
    // Extract-Based
    'extract-source',
    'case-study',
    // Legacy
    'normal',
    'diagram',
    'table',
    'graph',
    'extract',
  ],
  'English Home Language': [
    // Written
    'short-answer',
    'paragraph-long-answer',
    'reasoning-interpretation',
    'true-false-with-reason',
    'compare-evaluate-predict',
    'sequencing-ordering',
    // Objective
    'multiple-choice',
    'matching-pairing',
    'fill-in-blank',
    // Visual
    'diagram-interpretation',
    'table-interpretation',
    'graph-interpretation',
    'data-set-analysis',
    // Extract-Based
    'extract-source',
    'case-study',
    // Legacy
    'normal',
    'table',
    'graph',
    'extract',
  ],
  'English First Additional Language': [
    // Written
    'short-answer',
    'paragraph-long-answer',
    'reasoning-interpretation',
    'true-false-with-reason',
    'compare-evaluate-predict',
    'sequencing-ordering',
    // Objective
    'multiple-choice',
    'matching-pairing',
    'fill-in-blank',
    // Visual
    'diagram-interpretation',
    'table-interpretation',
    'graph-interpretation',
    'data-set-analysis',
    // Extract-Based
    'extract-source',
    'case-study',
    // Legacy
    'normal',
    'table',
    'graph',
    'extract',
  ],
};

/**
 * Get allowed question types for a subject
 * If subject not found, returns all question types
 */
export function getAllowedQuestionTypesForSubject(subject?: string | null): QuestionType[] {
  if (!subject) {
    // Return all question types if no subject specified
    return Object.values(QUESTION_TYPES).flat() as QuestionType[];
  }
  
  // Normalize subject name
  const normalizedSubject = subject.toLowerCase().trim();
  
  // Check for exact matches first
  for (const [key, types] of Object.entries(SUBJECT_QUESTION_TYPE_RESTRICTIONS)) {
    if (key.toLowerCase() === normalizedSubject || 
        normalizedSubject.includes(key.toLowerCase()) ||
        key.toLowerCase().includes(normalizedSubject)) {
      return types;
    }
  }
  
  // Check for partial matches (more specific first)
  if (normalizedSubject.includes('life') && normalizedSubject.includes('science')) {
    return SUBJECT_QUESTION_TYPE_RESTRICTIONS['Life Sciences'] || SUBJECT_QUESTION_TYPE_RESTRICTIONS['Life Science'];
  }
  if (normalizedSubject.includes('physical') && normalizedSubject.includes('science')) {
    return SUBJECT_QUESTION_TYPE_RESTRICTIONS['Physical Sciences'];
  }
  if (normalizedSubject.includes('business') && normalizedSubject.includes('stud')) {
    return SUBJECT_QUESTION_TYPE_RESTRICTIONS['Business Studies'];
  }
  if (normalizedSubject.includes('english') && (normalizedSubject.includes('home') || normalizedSubject.includes('hl'))) {
    return SUBJECT_QUESTION_TYPE_RESTRICTIONS['English Home Language'];
  }
  if (normalizedSubject.includes('english') && (normalizedSubject.includes('first') || normalizedSubject.includes('additional') || normalizedSubject.includes('fal'))) {
    return SUBJECT_QUESTION_TYPE_RESTRICTIONS['English First Additional Language'];
  }
  if (normalizedSubject.includes('math') && !normalizedSubject.includes('literacy')) {
    return SUBJECT_QUESTION_TYPE_RESTRICTIONS['Mathematics'];
  }
  if (normalizedSubject.includes('english')) {
    return SUBJECT_QUESTION_TYPE_RESTRICTIONS['English Home Language'] || SUBJECT_QUESTION_TYPE_RESTRICTIONS['English'];
  }
  if (normalizedSubject.includes('geography') || normalizedSubject.includes('geo')) {
    return SUBJECT_QUESTION_TYPE_RESTRICTIONS['Geography'];
  }
  if (normalizedSubject.includes('accounting') || normalizedSubject.includes('account')) {
    return SUBJECT_QUESTION_TYPE_RESTRICTIONS['Accounting'];
  }
  if (normalizedSubject.includes('economic') && !normalizedSubject.includes('management')) {
    return SUBJECT_QUESTION_TYPE_RESTRICTIONS['Economics'];
  }
  if (normalizedSubject.includes('history') || normalizedSubject.includes('hist')) {
    return SUBJECT_QUESTION_TYPE_RESTRICTIONS['History'];
  }
  
  // Default: return all question types
  return Object.values(QUESTION_TYPES).flat() as QuestionType[];
}

/**
 * Filter QUESTION_TYPES object by allowed types for a subject
 */
export function getFilteredQuestionTypesForSubject(subject?: string | null) {
  const allowedTypes = getAllowedQuestionTypesForSubject(subject);
  const filtered: Record<string, QuestionType[]> = {
    "Written": [],
    "Objective": [],
    "Visual": [],
    "Extract-Based": [],
    "Calculation": []
  };
  
  Object.entries(QUESTION_TYPES).forEach(([category, types]) => {
    filtered[category] = types.filter(type => 
      allowedTypes.includes(type as QuestionType)
    ) as QuestionType[];
  });
  
  // Add legacy types if allowed
  const legacyTypes: QuestionType[] = ['normal', 'diagram', 'table', 'graph', 'extract'];
  const allowedLegacy = legacyTypes.filter(type => allowedTypes.includes(type));
  
  return { filtered, allowedLegacy };
}

// Flatten all question types into a single union type
export type QuestionType = 
  // Written
  | 'short-answer'
  | 'paragraph-long-answer'
  | 'reasoning-interpretation'
  | 'true-false-with-reason'
  | 'compare-evaluate-predict'
  | 'sequencing-ordering'
  // Objective
  | 'multiple-choice'
  | 'matching-pairing'
  | 'fill-in-blank'
  // Visual
  | 'diagram-interpretation'
  | 'diagram-labeling'
  | 'table-interpretation'
  | 'graph-interpretation'
  | 'map-cartoon'
  | 'data-set-analysis'
  // Extract-Based
  | 'extract-source'
  | 'case-study'
  // Calculation
  | 'numeric-calculation'
  | 'formula-based-calculation'
  | 'accounting-financial-calculation'
  | 'geography-scale-gradient'
  | 'biology-percentage-ratio'
  // Legacy types (for backward compatibility)
  | 'normal'
  | 'diagram'
  | 'table'
  | 'graph'
  | 'extract';

export interface SubQuestion {
  id: string;
  number: string;
  text: string;
  marks: number;
  type: QuestionType;
  options?: string[]; // For multiple choice
  tableData?: { headers: string[]; rows: string[][]; description?: string; }; // For table questions
  hasDiagram?: boolean;
  diagramLabel?: string;
  imageFileId?: string;
  extractText?: string; // For extract blocks
  graphData?: {
    type?: string;
    description?: string;
    xAxisLabel?: string;
    yAxisLabel?: string;
    y2AxisLabel?: string;
    dataPoints?: Array<{ label: string; value: string | number; value2?: string | number; category?: string }>;
    showLegend?: boolean;
    showGrid?: boolean;
  };
}

export interface Question {
  id: string;
  number: string;
  text: string;
  instructionText?: string;
  marks: number;
  type: QuestionType;
  options?: string[]; // For multiple choice questions
  subQuestions: SubQuestion[];
  hasDiagram?: boolean;
  diagramLabel?: string;
  imageFileId?: string;
  extractText?: string;
  graphData?: {
    type?: string;
    description?: string;
    xAxisLabel?: string;
    yAxisLabel?: string;
    y2AxisLabel?: string;
    dataPoints?: Array<{ label: string; value: string | number; value2?: string | number; category?: string }>;
    showLegend?: boolean;
    showGrid?: boolean;
  };
  tableData?: { headers: string[]; rows: string[][]; description?: string; };
  tableSubject?: string;
  tableType?: string;
  graphSubject?: string;
  graphType?: string;
  coordinateSystem?: {
    xMin?: number;
    xMax?: number;
    yMin?: number;
    yMax?: number;
    gridStep?: number;
    showGrid?: boolean;
    showAxes?: boolean;
    showLabels?: boolean;
    points?: Array<{ id: string; x: number; y: number; label?: string; color?: string }>;
    lines?: Array<{ id: string; points: Array<{ x: number; y: number }>; color?: string; type: 'line' | 'curve' | 'arrow'; equation?: string; pointIds?: string[]; name?: string }>;
    annotations?: Array<{ id: string; type: 'text' | 'point' | 'line' | 'arrow'; x: number; y: number; text?: string; endX?: number; endY?: number; color?: string }>;
  };
}

export interface Section {
  id: string;
  label: string;
  number: number;
  questions: Question[];
  totalMarks: number;
}

export interface PaperStructure {
  sections: Section[];
  header: {
    subject: string;
    paperNumber: string;
    year: string;
    grade: number;
    date?: string;
    examBoard?: string;
    certificateType?: string; // SC/NSC
  };
  totalMarks: number;
}

interface PastPaper {
  $id: string;
  teacherId: string;
  gradeLevel: number;
  subject: string;
  year: string;
  paperName: string;
  memoName: string;
  status: string;
  questionCount: number;
  paperStructure?: PaperStructure;
}

export default function EditPastPaperPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const { toast } = useToast();
  const paperId = params.id as string;

  const [paper, setPaper] = useState<PastPaper | null>(null);
  const [paperStructure, setPaperStructure] = useState<PaperStructure | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [processedCount, setProcessedCount] = useState(0);
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [deployDialogOpen, setDeployDialogOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<'Draft' | 'Processed' | null>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialLoadRef = useRef(true);

  useEffect(() => {
    if (paperId) {
      fetchPaper();
    }
  }, [paperId]);

  // Debug: Log paperStructure changes
  useEffect(() => {
    console.log('[Editor] paperStructure state changed:', {
      hasStructure: !!paperStructure,
      sectionCount: paperStructure?.sections?.length || 0,
      totalQuestions: paperStructure?.sections?.reduce((sum, s) => sum + (s.questions?.length || 0), 0) || 0,
      sections: paperStructure?.sections?.map(s => ({
        label: s.label,
        questionCount: s.questions?.length || 0,
        questionIds: s.questions?.map((q: any) => q.id).slice(0, 3) || [],
      })) || [],
    });
  }, [paperStructure]);

  // Auto-save function (debounced)
  const autoSaveStructure = useCallback(async (structure: PaperStructure, silent: boolean = true) => {
    if (!structure || !paperId) return;

    try {
      setAutoSaving(true);
      calculateSectionMarks(structure);

      const response = await fetch(`/api/admin/past-papers/${paperId}/structure`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(structure),
      });

      const data = await response.json();
      if (data.success) {
        setLastSaved(new Date());
        setHasUnsavedChanges(false);
        if (!silent) {
          toast({
            title: 'Auto-saved',
            description: 'Changes saved automatically',
          });
        }
      } else {
        console.error('Auto-save failed:', data.error);
        setHasUnsavedChanges(true);
      }
    } catch (error) {
      console.error('Error auto-saving structure:', error);
      setHasUnsavedChanges(true);
    } finally {
      setAutoSaving(false);
    }
  }, [paperId, toast]);

  // Debounced auto-save effect
  useEffect(() => {
    if (!paperStructure || !paperId) return;

    // Skip auto-save on initial load
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
      setHasUnsavedChanges(false);
      return;
    }

    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Set hasUnsavedChanges flag
    setHasUnsavedChanges(true);

    // Debounce auto-save: wait 2 seconds after last change
    autoSaveTimeoutRef.current = setTimeout(() => {
      autoSaveStructure(paperStructure, true);
    }, 2000);

    // Cleanup on unmount
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [paperStructure, paperId, autoSaveStructure]);

  const fetchPaper = async () => {
    try {
      setLoading(true);
      
      // Fetch paper data and structure in parallel
      const [paperResponse, structureResponse] = await Promise.all([
        fetch(`/api/admin/content/past-papers?paperId=${paperId}`),
        fetch(`/api/admin/past-papers/${paperId}/structure`)
      ]);
      
      const paperData = await paperResponse.json();
      
      // Check if structure response is OK
      if (!structureResponse.ok) {
        console.error(`[Editor] ❌ Structure API returned error: ${structureResponse.status} ${structureResponse.statusText}`);
      }
      
      const structureData = await structureResponse.json();
      
      // Log raw API response
      console.log(`[Editor] 🔍 Raw structure API response:`, {
        success: structureData.success,
        hasPaperStructure: !!structureData.paperStructure,
        responseKeys: Object.keys(structureData),
        structureType: typeof structureData.paperStructure,
        structureString: structureData.paperStructure ? JSON.stringify(structureData.paperStructure).substring(0, 1000) : 'null',
        sectionsInResponse: structureData.paperStructure?.sections?.length || 0,
        sectionAQuestions: structureData.paperStructure?.sections?.[0]?.questions?.length || 0,
      });
      
      if (paperData.success) {
        setPaper(paperData.paper);
        
        // Initialize paper structure from structure endpoint or create default
        if (structureData.success && structureData.paperStructure) {
          // Ensure all marks are numbers, not strings
          const structure = structureData.paperStructure;
          
          console.log(`[Editor] 📥 Received structure from API:`, {
            hasStructure: !!structure,
            hasSections: !!structure.sections,
            sectionCount: structure.sections?.length || 0,
            structureKeys: Object.keys(structure),
          });
          
          // Validate structure has sections
          if (structure.sections && Array.isArray(structure.sections)) {
            // Check if structure has any questions
            const totalQuestions = structure.sections.reduce((sum: number, s: any) => {
              const qCount = s.questions && Array.isArray(s.questions) ? s.questions.length : 0;
              return sum + qCount;
            }, 0);

            console.log(`[Editor] Loaded structure with ${totalQuestions} total questions across ${structure.sections.length} sections`);

            // Log detailed question breakdown
            structure.sections.forEach((section: any, sectionIdx: number) => {
              const sectionQuestionCount = section.questions && Array.isArray(section.questions) ? section.questions.length : 0;
              console.log(`[Editor] Section ${section.label} (${sectionIdx}):`, {
                questionCount: sectionQuestionCount,
                questionsArrayExists: !!section.questions,
                isArray: Array.isArray(section.questions),
                firstQuestion: section.questions?.[0] ? {
                  number: section.questions[0].number,
                  textLength: section.questions[0].text?.length || 0,
                  id: section.questions[0].id,
                } : 'none',
              });
            });

            if (totalQuestions > 0) {
              // Structure has questions - normalize and use it
              structure.sections.forEach((section: any) => {
                // Ensure questions array exists and is an array
                if (!section.questions || !Array.isArray(section.questions)) {
                  console.warn(`[Editor] ⚠️ Section ${section.label} has invalid questions, initializing empty array`);
                  section.questions = [];
                }
                
                section.questions.forEach((q: any) => {
                  q.marks = typeof q.marks === 'number' ? q.marks : parseInt(String(q.marks)) || 0;
                  
                  // Ensure text field exists
                  if (!q.text || q.text.trim() === '') {
                    console.warn(`[Editor] ⚠️ Question ${q.number} has empty text in structure`);
                  }
                  
                  // Ensure id exists
                  if (!q.id) {
                    console.warn(`[Editor] ⚠️ Question ${q.number} missing id, generating one`);
                    q.id = `question-${q.number}-${Date.now()}`;
                  }
                  
                  if (q.subQuestions && Array.isArray(q.subQuestions)) {
                    q.subQuestions.forEach((sq: any) => {
                      sq.marks = typeof sq.marks === 'number' ? sq.marks : parseInt(String(sq.marks)) || 0;
                    });
                  } else {
                    q.subQuestions = q.subQuestions || [];
                  }
                });
              });
              
              calculateSectionMarks(structure);
              
              // Deep clone to ensure React detects the change
              const clonedStructure = JSON.parse(JSON.stringify(structure));
              
              setPaperStructure(clonedStructure);
              console.log(`[Editor] ✅ Set paper structure with ${totalQuestions} questions (deep cloned)`);
              
              // Verify structure was set correctly
              console.log(`[Editor] ✅ Structure verification:`, {
                sectionCount: clonedStructure.sections?.length || 0,
                totalQuestionsInState: clonedStructure.sections?.reduce((sum: number, s: any) => sum + (s.questions?.length || 0), 0) || 0,
                sectionDetails: clonedStructure.sections?.map((s: any) => ({
                  label: s.label,
                  questionCount: s.questions?.length || 0,
                  firstQuestion: s.questions?.[0]?.number || 'none',
                  questionsArrayType: Array.isArray(s.questions) ? 'array' : typeof s.questions,
                })) || [],
              });
            } else {
              // Structure exists but has no questions - create empty structure (no default questions)
              console.log(`[Editor] ⚠️ Structure exists but has no questions - creating empty structure`);
              const emptyStructure = createDefaultStructure(paperData.paper);
              emptyStructure.sections.forEach(s => s.questions = []);
              emptyStructure.totalMarks = 0;
              setPaperStructure(emptyStructure);
            }
          } else {
            // Structure exists but has no sections - create default
            console.log(`[Editor] ⚠️ Structure exists but has no sections - creating default`);
            const defaultStructure = createDefaultStructure(paperData.paper);
            setPaperStructure(defaultStructure);
          }
        } else {
          // No structure found - create empty structure (no default questions)
          console.log(`[Editor] ⚠️ No structure found in API response - creating empty structure`);
          console.log(`[Editor] API response:`, {
            success: structureData.success,
            hasPaperStructure: !!structureData.paperStructure,
            responseKeys: Object.keys(structureData),
          });
          const emptyStructure = createDefaultStructure(paperData.paper);
          emptyStructure.sections.forEach(s => s.questions = []);
          emptyStructure.totalMarks = 0;
          setPaperStructure(emptyStructure);
        }
      }
    } catch (error) {
      console.error('Error fetching paper:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch paper',
      });
    } finally {
      setLoading(false);
    }
  };

  const createDefaultQuestion = (sectionNum: number, questionNum: number): Question => {
    return {
      id: `q-${sectionNum}-${questionNum}`,
      number: `${sectionNum}.${questionNum}`,
      text: '',
      instructionText: '',
      marks: 0,
      type: 'short-answer' as QuestionType,
      subQuestions: [
        {
          id: `sq-${sectionNum}-${questionNum}-1`,
          number: `${sectionNum}.${questionNum}.1`,
          text: '',
          marks: 1,
          type: 'short-answer' as QuestionType,
        },
      ],
      hasDiagram: false,
    };
  };

  const createDefaultStructure = (paper: any): PaperStructure => {
    return {
      sections: [
        {
          id: `section-1`,
          label: 'SECTION A',
          number: 1,
          questions: [
            createDefaultQuestion(1, 1),
            createDefaultQuestion(1, 2),
            createDefaultQuestion(1, 3),
          ],
          totalMarks: 0,
        },
        {
          id: `section-2`,
          label: 'SECTION B',
          number: 2,
          questions: [
            createDefaultQuestion(2, 1),
            createDefaultQuestion(2, 2),
            createDefaultQuestion(2, 3),
          ],
          totalMarks: 0,
        },
        {
          id: `section-3`,
          label: 'SECTION C',
          number: 3,
          questions: [
            createDefaultQuestion(3, 1),
            createDefaultQuestion(3, 2),
            createDefaultQuestion(3, 3),
          ],
          totalMarks: 0,
        },
      ],
      header: {
        subject: paper.subject?.split(' ')[0] || paper.subject || '',
        paperNumber: paper.subject?.includes('Paper') ? paper.subject.split('Paper')[1]?.trim() || '1' : '1',
        year: paper.year || '',
        grade: paper.gradeLevel || 12,
        examBoard: 'DBE',
        certificateType: 'SC/NSC',
      },
      totalMarks: 0,
    };
  };

  const calculateSectionMarks = (structure: PaperStructure) => {
    structure.sections.forEach(section => {
      let total = 0;
      section.questions.forEach(q => {
        // Ensure marks are numbers, not strings
        const questionMarks = typeof q.marks === 'number' ? q.marks : parseInt(String(q.marks)) || 0;
        total += questionMarks;
        q.subQuestions.forEach(sq => {
          // Ensure marks are numbers, not strings
          const subQMarks = typeof sq.marks === 'number' ? sq.marks : parseInt(String(sq.marks)) || 0;
          total += subQMarks;
        });
      });
      section.totalMarks = total;
    });
    structure.totalMarks = structure.sections.reduce((sum, s) => sum + (s.totalMarks || 0), 0);
  };

  const handlePdfUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user || !paper) return;

    // Check if it's a JSON file
    const isJson = file.name.toLowerCase().endsWith('.json') || file.type === 'application/json';

    try {
      setUploading(true);
      setProcessingStatus(isJson ? 'Processing JSON...' : 'Uploading PDF...');
      setProcessedCount(0);

      // JSON files are handled by the separate JSON upload section
      // This handler is only for PDF files

      // Initialize paper structure with EMPTY sections (no default questions)
      // This ensures questions from PDF can be added one by one in real-time
      setPaperStructure((prev) => {
        if (!prev) {
          const defaultStructure = createDefaultStructure(paper);
          // Clear all default questions - we'll add real ones from PDF
          defaultStructure.sections.forEach(section => {
            section.questions = [];
          });
          defaultStructure.totalMarks = 0;
          return defaultStructure;
        }
        // Ensure sections exist
        if (!prev.sections || prev.sections.length === 0) {
          const defaultStructure = createDefaultStructure(paper);
          // Clear all default questions
          defaultStructure.sections.forEach(section => {
            section.questions = [];
          });
          return {
            ...prev,
            sections: defaultStructure.sections,
            header: prev.header || defaultStructure.header,
            totalMarks: 0,
          };
        }
        // Clear existing questions when starting new upload
        const cleared = JSON.parse(JSON.stringify(prev));
        cleared.sections.forEach((section: any) => {
          section.questions = [];
          section.totalMarks = 0;
        });
        cleared.totalMarks = 0;
        return cleared;
      });

      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('subject', paper.subject || '');
      formData.append('year', paper.year || '');
      formData.append('grade', paper.gradeLevel?.toString() || '12');
      formData.append('userId', user.$id);
      formData.append('paperId', paperId); // Include paperId so we use existing paper

      // Use fetch with streaming
      const response = await fetch('/api/admin/past-papers/upload-pdf', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload PDF');
      }

      // Read stream
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      let buffer = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        
        // Keep the last incomplete line in buffer
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine) continue;
          
          // Handle Server-Sent Events format
          if (trimmedLine.startsWith('data: ')) {
            try {
              const jsonStr = trimmedLine.substring(6);
              const data = JSON.parse(jsonStr);

              console.log('Received event:', data.type, data);

              if (data.type === 'start') {
                setProcessingStatus(data.message || 'Processing PDF...');
              } else if (data.type === 'paper_created') {
                console.log('Paper created:', data.paperId);
              } else if (data.type === 'question') {
                console.log('📥 Received question event:', data);
                console.log('📝 Question data:', data.question);
                
                // Add question to structure in real-time
                setPaperStructure((prev) => {
                  // Initialize structure if it doesn't exist
                  if (!prev || !prev.sections || prev.sections.length === 0) {
                    console.log('🔧 Initializing structure...');
                    const defaultStructure = createDefaultStructure(paper!);
                    // Clear default questions
                    defaultStructure.sections.forEach(s => s.questions = []);
                    prev = defaultStructure;
                  }

                  // Create completely new object structure to force React re-render
                  const question = data.question;

                  if (!question || !question.number) {
                    console.error('❌ Invalid question data:', question);
                    return prev;
                  }

                  console.log(`➕ Adding question ${question.number} to structure`);

                  // Determine which section to add to based on question number
                  const qNum = parseInt(question.number) || 1;
                  let targetSectionIndex = 0;
                  
                  if (qNum > 40 && prev.sections.length > 2) {
                    targetSectionIndex = 2; // Section C
                  } else if (qNum > 20 && prev.sections.length > 1) {
                    targetSectionIndex = 1; // Section B
                  } else {
                    targetSectionIndex = 0; // Section A
                  }

                  // Create new structure with new object references
                  const updated = {
                    ...prev,
                    sections: prev.sections.map((section, idx) => {
                      if (idx === targetSectionIndex) {
                        // This is the target section - create new section object
                        const currentQuestions = section.questions || [];
                        
                        // Check if question already exists
                        const existingIndex = currentQuestions.findIndex(
                          (q: any) => q.number === question.number
                        );

                        let newQuestions: any[];
                        if (existingIndex >= 0) {
                          // Update existing question
                          console.log(`🔄 Updating existing question ${question.number}`);
                          newQuestions = [...currentQuestions];
                          newQuestions[existingIndex] = question;
                        } else {
                          // Add new question - create new array
                          console.log(`✨ Adding new question ${question.number} to ${section.label}`);
                          newQuestions = [...currentQuestions, question];
                        }

                        // Sort questions by number
                        newQuestions.sort((a: any, b: any) => {
                          const aNum = parseFloat(a.number) || 0;
                          const bNum = parseFloat(b.number) || 0;
                          return aNum - bNum;
                        });

                        // Return new section object
                        return {
                          ...section,
                          questions: newQuestions,
                        };
                      }
                      // Return other sections as-is (but create new object reference)
                      return { ...section };
                    }),
                  };

                  // Recalculate marks
                  calculateSectionMarks(updated);
                  
                  const targetSection = updated.sections[targetSectionIndex];
                  console.log(`✅ Updated structure - ${targetSection.label} now has ${targetSection.questions.length} questions`);
                  console.log(`📊 Total marks: ${updated.totalMarks}`);
                  
                  setProcessedCount(data.total || 0);
                  setProcessingStatus(`Processed ${data.total} questions...`);
                  
                  // Return completely new structure object
                  return updated;
                });
              } else if (data.type === 'complete') {
                setProcessingStatus(`Complete! Processed ${data.total} questions.`);
                setProcessedCount(data.total || 0);
              } else if (data.type === 'done') {
                setProcessingStatus('Done!');
                toast({
                  title: 'Success',
                  description: `Successfully processed ${data.total} questions from PDF. Please review and save through the editor.`,
                });
                // Don't refresh - keep the questions in the editor for review
                // User can save when ready
              } else if (data.type === 'error') {
                console.error('Stream error:', data.message);
                throw new Error(data.message || 'Processing error');
              }
            } catch (parseError) {
              console.error('Error parsing stream data:', parseError, 'Line:', trimmedLine);
            }
          } else if (trimmedLine && !trimmedLine.startsWith(':')) {
            // Try to parse as direct JSON (in case it's not SSE format)
            try {
              const data = JSON.parse(trimmedLine);
              console.log('Received direct JSON:', data);
              
              if (data.type === 'question') {
                // Handle as question event
                const eventData = { type: 'question', question: data.data || data.question };
                // Process it by creating a fake SSE line
                const fakeLine = `data: ${JSON.stringify(eventData)}`;
                // Recursively process (but limit depth)
                if (trimmedLine.length < 10000) {
                  // Process it
                }
              }
            } catch (e) {
              // Not JSON, skip
            }
          }
        }
      }
      
      // Process any remaining buffer
      if (buffer.trim()) {
        const trimmedLine = buffer.trim();
        if (trimmedLine.startsWith('data: ')) {
          try {
            const data = JSON.parse(trimmedLine.substring(6));
            console.log('Processing final buffer:', data);
          } catch (e) {
            console.error('Error parsing final buffer:', e);
          }
        }
      }
    } catch (error: any) {
      console.error('Error uploading PDF:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to upload PDF',
      });
    } finally {
      setUploading(false);
      setProcessingStatus('');
      // Reset file input
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const handleJsonUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user || !paper) return;

    try {
      setUploading(true);
      setProcessingStatus('Reading JSON file...');
      setProcessedCount(0);
      
      // Initialize paper structure with EMPTY sections
      setPaperStructure((prev) => {
        if (!prev) {
          const defaultStructure = createDefaultStructure(paper);
          defaultStructure.sections.forEach(section => {
            section.questions = [];
          });
          defaultStructure.totalMarks = 0;
          return defaultStructure;
        }
        const cleared = JSON.parse(JSON.stringify(prev));
        cleared.sections.forEach((section: any) => {
          section.questions = [];
          section.totalMarks = 0;
        });
        cleared.totalMarks = 0;
        return cleared;
      });

      // Process JSON and send to API endpoint (with auto-detection)
      const formData = new FormData();
      formData.append('file', file);
      formData.append('subject', paper.subject || '');
      formData.append('year', paper.year || '');
      formData.append('grade', paper.gradeLevel?.toString() || '12');
      formData.append('userId', user.$id);
      formData.append('paperId', paperId);
      formData.append('autoDetect', 'true'); // Enable auto-detection

      const response = await fetch('/api/admin/past-papers/upload-json', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process JSON file');
      }

      // Read stream (same format as PDF upload)
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      let buffer = '';
      let questionCount = 0;
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine) continue;
          
          if (trimmedLine.startsWith('data: ')) {
            try {
              const jsonStr = trimmedLine.substring(6);
              const data = JSON.parse(jsonStr);

              if (data.type === 'start') {
                setProcessingStatus(data.message || 'Processing JSON...');
              } else if (data.type === 'question') {
                questionCount++;
                
                // Add question to structure in real-time (same logic as PDF upload)
                setPaperStructure((prev) => {
                  if (!prev || !prev.sections || prev.sections.length === 0) {
                    const defaultStructure = createDefaultStructure(paper!);
                    defaultStructure.sections.forEach(s => s.questions = []);
                    prev = defaultStructure;
                  }

                  const question = data.question;

                  if (!question || !question.number) {
                    return prev;
                  }

                  const qNum = parseInt(question.number) || 1;
                  let targetSectionIndex = 0;
                  
                  if (qNum > 40 && prev.sections.length > 2) {
                    targetSectionIndex = 2;
                  } else if (qNum > 20 && prev.sections.length > 1) {
                    targetSectionIndex = 1;
                  } else {
                    targetSectionIndex = 0;
                  }

                  const updated = {
                    ...prev,
                    sections: prev.sections.map((section, idx) => {
                      if (idx === targetSectionIndex) {
                        const currentQuestions = section.questions || [];
                        const existingIndex = currentQuestions.findIndex(
                          (q: any) => q.number === question.number
                        );

                        let newQuestions: any[];
                        if (existingIndex >= 0) {
                          newQuestions = [...currentQuestions];
                          newQuestions[existingIndex] = question;
                        } else {
                          newQuestions = [...currentQuestions, question];
                        }

                        newQuestions.sort((a: any, b: any) => {
                          const aNum = parseFloat(a.number) || 0;
                          const bNum = parseFloat(b.number) || 0;
                          return aNum - bNum;
                        });

                        return {
                          ...section,
                          questions: newQuestions,
                        };
                      }
                      return { ...section };
                    }),
                  };

                  calculateSectionMarks(updated);
                  setProcessedCount(questionCount);
                  setProcessingStatus(`Processed ${questionCount} questions...`);
                  
                  return updated;
                });
              } else if (data.type === 'complete') {
                setProcessingStatus(`Complete! Processed ${data.total} questions.`);
                setProcessedCount(data.total || 0);
              } else if (data.type === 'done') {
                setProcessingStatus('Done!');
                toast({
                  title: 'Success',
                  description: `Successfully processed ${data.total} questions from JSON. Please review and save through the editor.`,
                });
              } else if (data.type === 'error') {
                throw new Error(data.message || 'Processing error');
              }
            } catch (parseError) {
              console.error('Error parsing stream data:', parseError);
            }
          }
        }
      }
    } catch (error: any) {
      console.error('Error processing JSON:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to process JSON file',
      });
    } finally {
      setUploading(false);
      setProcessingStatus('');
      // Reset file input
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const persistPaperStructure = async (): Promise<boolean> => {
    if (!paperStructure) return false;

    try {
      setSaving(true);
      
      // Cancel any pending auto-save
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
        autoSaveTimeoutRef.current = null;
      }

      // If auto-save is in progress, wait for it to finish
      if (autoSaving) {
        // Wait up to 5 seconds for auto-save to complete
        let waitCount = 0;
        while (autoSaving && waitCount < 50) {
          await new Promise(resolve => setTimeout(resolve, 100));
          waitCount++;
        }
      }

      // Final save to ensure everything is saved
      calculateSectionMarks(paperStructure);

      const response = await fetch(`/api/admin/past-papers/${paperId}/structure`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paperStructure),
      });

      const data = await response.json();
      if (data.success) {
        setLastSaved(new Date());
        setHasUnsavedChanges(false);
        toast({
          title: 'Success',
          description: 'Paper structure saved successfully',
        });
        // Also sync questions to database
        await syncQuestionsToDatabase();
        return true;
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: data.error || 'Failed to save paper structure',
        });
        return false;
      }
    } catch (error) {
      console.error('Error saving structure:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save paper structure',
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const updatePaperStatus = async (targetStatus: 'Draft' | 'Processed'): Promise<boolean> => {
    try {
      const response = await fetch('/api/admin/content/past-papers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paperId, status: targetStatus }),
      });

      const data = await response.json();
      if (!data.success) {
        toast({
          variant: 'destructive',
          title: 'Status update failed',
          description: data.error || 'Unable to update paper status.',
        });
        return false;
      }

      setPaper((prev) => (prev ? { ...prev, status: targetStatus } : prev));
      toast({
        title: targetStatus === 'Processed' ? 'Paper deployed' : 'Saved as draft',
        description:
          targetStatus === 'Processed'
            ? 'Learners can now access this paper.'
            : 'Paper kept in drafts. Deploy it whenever you are ready.',
      });
      return true;
    } catch (error) {
      console.error('Error updating paper status:', error);
      toast({
        variant: 'destructive',
        title: 'Status update failed',
        description: 'Something went wrong while updating the paper status.',
      });
      return false;
    }
  };

  const handleSaveWithStatus = async (targetStatus: 'Draft' | 'Processed') => {
    if (!paperStructure) return;
    setPendingStatus(targetStatus);

    const saved = await persistPaperStructure();
    if (!saved) {
      setPendingStatus(null);
      return;
    }

    const statusUpdated = await updatePaperStatus(targetStatus);
    if (statusUpdated) {
      setDeployDialogOpen(false);
    }
    setPendingStatus(null);
  };

  const handleSaveButtonClick = () => {
    setDeployDialogOpen(true);
  };

  const syncQuestionsToDatabase = async () => {
    if (!paperStructure) return;

    try {
      // Convert paper structure to flat list of questions for database
      const questionsToSync: any[] = [];
      
      paperStructure.sections.forEach(section => {
        section.questions.forEach(question => {
          // Add main question if it has text
          if (question.text || question.instructionText) {
            questionsToSync.push({
              number: question.number,
              question: question.instructionText || question.text,
              marks: question.marks,
              type: question.type === 'multiple-choice' ? 'multiple-choice' : 'free-text',
              answer: '',
              hasImage: question.hasDiagram || false,
              imageFileId: question.imageFileId,
            });
          }

          // Add sub-questions
          question.subQuestions.forEach(subQ => {
            let questionText = subQ.text;
            if (subQ.type === 'multiple-choice' && subQ.options) {
              questionText += '\n' + subQ.options.map((opt, i) => 
                `${String.fromCharCode(65 + i)}. ${opt}`
              ).join('\n');
            }

            questionsToSync.push({
              number: subQ.number,
              question: questionText,
              marks: subQ.marks,
              type: subQ.type === 'multiple-choice' ? 'multiple-choice' : 'free-text',
              answer: '',
              hasImage: subQ.hasDiagram || false,
              imageFileId: subQ.imageFileId,
            });
          });
        });
      });

      // Sync each question to database
      for (const q of questionsToSync) {
        try {
          const response = await fetch(`/api/admin/past-papers/${paperId}/questions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ...q,
              paperId,
            }),
          });
          // Continue even if some fail
        } catch (error) {
          console.error('Error syncing question:', error);
        }
      }
    } catch (error) {
      console.error('Error syncing questions:', error);
    }
  };

  const addSection = () => {
    if (!paperStructure) return;
    
    const newSectionNum = paperStructure.sections.length + 1;
    const newSection: Section = {
      id: `section-${newSectionNum}`,
      label: `SECTION ${String.fromCharCode(64 + newSectionNum)}`,
      number: newSectionNum,
      questions: [
        createDefaultQuestion(newSectionNum, 1),
        createDefaultQuestion(newSectionNum, 2),
        createDefaultQuestion(newSectionNum, 3),
      ],
      totalMarks: 0,
    };
    
    const updatedStructure = {
      ...paperStructure,
      sections: [...paperStructure.sections, newSection],
    };
    
    // Renumber all sections and questions after adding
    renumberQuestions(updatedStructure);
    calculateSectionMarks(updatedStructure);
    setPaperStructure(updatedStructure);
  };

  const addQuestion = (sectionId: string, presetData?: Partial<Question>) => {
    if (!paperStructure) return;
    
    const section = paperStructure.sections.find(s => s.id === sectionId);
    if (!section) return;
    
    const newQuestionNum = section.questions.length + 1;
    const newQuestion = presetData 
      ? {
          ...createDefaultQuestion(section.number, newQuestionNum),
          ...presetData,
          id: `q-${section.number}-${newQuestionNum}-${Date.now()}`,
          number: `${section.number}.${newQuestionNum}`,
        }
      : createDefaultQuestion(section.number, newQuestionNum);
    
    const updatedStructure = {
      ...paperStructure,
      sections: paperStructure.sections.map(s =>
        s.id === sectionId
          ? { ...s, questions: [...s.questions, newQuestion] }
          : s
      ),
    };
    
    // Renumber questions after adding
    renumberQuestions(updatedStructure);
    calculateSectionMarks(updatedStructure);
    setPaperStructure(updatedStructure);
  };

  const addSubQuestion = (sectionId: string, questionId: string) => {
    if (!paperStructure) return;
    
    const updatedStructure = {
      ...paperStructure,
      sections: paperStructure.sections.map(section =>
        section.id === sectionId
          ? {
              ...section,
              questions: section.questions.map(q => {
                if (q.id === questionId) {
                  const subQNum = q.subQuestions.length + 1;
                  const questionNumParts = q.number.split('.');
                  
                  // Default to 'short-answer' type - users can change it via the type selector
                  const newSubQuestion: SubQuestion = {
                    id: `sq-${questionId}-${subQNum}`,
                    number: `${q.number}.${subQNum}`,
                    text: '',
                    marks: 1, // Ensure marks is a number
                    type: 'short-answer' as QuestionType,
                  };
                  
                  return {
                    ...q,
                    subQuestions: [
                      ...q.subQuestions,
                      newSubQuestion,
                    ],
                  };
                }
                return q;
              }),
            }
          : section
      ),
    };
    
    // Renumber sub-questions after adding
    renumberQuestions(updatedStructure);
    calculateSectionMarks(updatedStructure);
    setPaperStructure(updatedStructure);
  };

  const updateSection = (sectionId: string, updates: Partial<Section>) => {
    if (!paperStructure) return;
    
    const updatedStructure = {
      ...paperStructure,
      sections: paperStructure.sections.map(s =>
        s.id === sectionId ? { ...s, ...updates } : s
      ),
    };
    
    // Recalculate marks if section was updated
    calculateSectionMarks(updatedStructure);
    setPaperStructure(updatedStructure);
  };

  const updateQuestion = (sectionId: string, questionId: string, updates: Partial<Question>) => {
    if (!paperStructure) return;
    
    const updatedStructure = {
      ...paperStructure,
      sections: paperStructure.sections.map(section =>
        section.id === sectionId
          ? {
              ...section,
              questions: section.questions.map(q => {
                if (q.id === questionId) {
                  const updatedQuestion = { ...q, ...updates };
                  
                  // If type changed to multiple-choice, initialize options for all subQuestions
                  if (updates.type === 'multiple-choice') {
                    updatedQuestion.subQuestions = q.subQuestions.map(sq => ({
                      ...sq,
                      options: sq.options && sq.options.length > 0 ? sq.options : ['', '', '', ''],
                      type: 'multiple-choice' as QuestionType,
                    }));
                  }
                  // Initialize type-specific data structures when type changes
                  if (updates.type === 'matching-pairing' && !updatedQuestion.tableData) {
                    updatedQuestion.tableData = { headers: ['Column A', 'Column B'], rows: [['', ''], ['', '']] };
                  }
                  if ((updates.type === 'table' || updates.type === 'table-interpretation') && !updatedQuestion.tableData) {
                    updatedQuestion.tableData = { headers: ['', ''], rows: [['', '']] };
                  }
                  if ((updates.type === 'graph' || updates.type === 'graph-interpretation') && !updatedQuestion.graphData) {
                    updatedQuestion.graphData = { type: 'line', dataPoints: [], xAxisLabel: '', yAxisLabel: '', showLegend: false, showGrid: true };
                  }
                  if ((updates.type === 'diagram-interpretation' || updates.type === 'diagram-labeling' || updates.type === 'diagram') && !updatedQuestion.hasDiagram) {
                    updatedQuestion.hasDiagram = true;
                  }
                  if ((updates.type === 'extract-source' || updates.type === 'extract' || updates.type === 'case-study') && !updatedQuestion.extractText) {
                    updatedQuestion.extractText = '';
                  }
                  
                  return updatedQuestion;
                }
                return q;
              }),
            }
          : section
      ),
    };
    
    // Recalculate marks after update
    calculateSectionMarks(updatedStructure);
    setPaperStructure(updatedStructure);
  };

  const updateSubQuestion = (
    sectionId: string,
    questionId: string,
    subQuestionId: string,
    updates: Partial<SubQuestion>
  ) => {
    if (!paperStructure) return;
    
    // Ensure marks is always a number
    const subQuestionUpdates = { ...updates };
    if (subQuestionUpdates.marks !== undefined) {
      subQuestionUpdates.marks = typeof subQuestionUpdates.marks === 'number' 
        ? subQuestionUpdates.marks 
        : parseInt(String(subQuestionUpdates.marks)) || 0;
    }
    
    const updatedStructure = {
      ...paperStructure,
      sections: paperStructure.sections.map(section =>
        section.id === sectionId
          ? {
              ...section,
              questions: section.questions.map(q => {
                if (q.id === questionId) {
                  return {
                    ...q,
                    subQuestions: q.subQuestions.map(sq =>
                      sq.id === subQuestionId ? { ...sq, ...subQuestionUpdates } : sq
                    ),
                  };
                }
                return q;
              }),
            }
          : section
      ),
    };
    
    // Recalculate marks after update
    calculateSectionMarks(updatedStructure);
    setPaperStructure(updatedStructure);
  };

  const deleteSection = (sectionId: string) => {
    if (!paperStructure) return;
    if (paperStructure.sections.length <= 1) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Cannot delete the last section',
      });
      return;
    }
    
    const updatedStructure = {
      ...paperStructure,
      sections: paperStructure.sections.filter(s => s.id !== sectionId),
    };
    
    // Renumber all sections and questions after deletion
    renumberQuestions(updatedStructure);
    calculateSectionMarks(updatedStructure);
    setPaperStructure(updatedStructure);
  };

  const renumberQuestions = (structure: PaperStructure) => {
    structure.sections.forEach((section, sectionIndex) => {
      section.number = sectionIndex + 1;
      section.questions.forEach((question, questionIndex) => {
        const newQuestionNumber = `${section.number}.${questionIndex + 1}`;
        question.number = newQuestionNumber;
        question.subQuestions.forEach((subQ, subQIndex) => {
          subQ.number = `${newQuestionNumber}.${subQIndex + 1}`;
        });
      });
    });
  };

  const deleteQuestion = (sectionId: string, questionId: string) => {
    if (!paperStructure) return;
    
    const section = paperStructure.sections.find(s => s.id === sectionId);
    if (section && section.questions.length <= 1) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Cannot delete the last question in a section',
      });
      return;
    }
    
    const updatedStructure = {
      ...paperStructure,
      sections: paperStructure.sections.map(section =>
        section.id === sectionId
          ? {
              ...section,
              questions: section.questions.filter(q => q.id !== questionId),
            }
          : section
      ),
    };
    
    // Renumber all questions after deletion
    renumberQuestions(updatedStructure);
    calculateSectionMarks(updatedStructure);
    setPaperStructure(updatedStructure);
  };

  const deleteSubQuestion = (sectionId: string, questionId: string, subQuestionId: string) => {
    if (!paperStructure) return;
    
    const updatedStructure = {
      ...paperStructure,
      sections: paperStructure.sections.map(section =>
        section.id === sectionId
          ? {
              ...section,
              questions: section.questions.map(q => {
                if (q.id === questionId && q.subQuestions.length <= 1) {
                  toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: 'Cannot delete the last sub-question',
                  });
                  return q;
                }
                if (q.id === questionId) {
                  return {
                    ...q,
                    subQuestions: q.subQuestions.filter(sq => sq.id !== subQuestionId),
                  };
                }
                return q;
              }),
            }
          : section
      ),
    };
    
    // Renumber sub-questions after deletion
    renumberQuestions(updatedStructure);
    calculateSectionMarks(updatedStructure);
    setPaperStructure(updatedStructure);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!paper) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <XCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Paper not found</p>
            <Link href="/admin/past-papers">
              <Button variant="outline" className="mt-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Past Papers
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Ensure paperStructure is always defined - create default if null
  if (!paperStructure) {
    console.warn('[Editor] ⚠️ paperStructure is null, creating default structure');
    const defaultStructure = createDefaultStructure(paper);
    defaultStructure.sections.forEach(s => s.questions = []);
    setPaperStructure(defaultStructure);
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 text-muted-foreground mb-4 animate-spin" />
            <p className="text-muted-foreground">Loading paper structure...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/past-papers">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{paper.subject} - {paper.year}</h1>
              <Badge 
                variant={paper.status === 'Processed' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {paper.status}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Grade {paper.gradeLevel} | {paperStructure?.totalMarks || 0} total marks | {paperStructure?.sections?.reduce((sum, s) => sum + (s.questions?.length || 0), 0) || 0} questions
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {uploading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{processingStatus || `Processing... (${processedCount} questions)`}</span>
            </div>
          )}
          <div className="flex items-center gap-3">
            {/* Auto-save status indicator */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {autoSaving ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>Auto-saving...</span>
                </>
              ) : hasUnsavedChanges ? (
                <>
                  <div className="h-2 w-2 rounded-full bg-yellow-500" />
                  <span>Unsaved changes</span>
                </>
              ) : lastSaved ? (
                <>
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span>Saved {lastSaved.toLocaleTimeString()}</span>
                </>
              ) : null}
            </div>
            <Button onClick={handleSaveButtonClick} disabled={saving || autoSaving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Paper
              </>
            )}
          </Button>
          </div>
        </div>
      </div>

      <CAPSPaperTemplate
        paperStructure={paperStructure}
        paperId={paperId}
        paperName={paper?.paperName}
        onUpdateStructure={setPaperStructure}
        onAddSection={addSection}
        onAddQuestion={addQuestion}
        onAddSubQuestion={addSubQuestion}
        onUpdateSection={updateSection}
        onUpdateQuestion={updateQuestion}
        onUpdateSubQuestion={updateSubQuestion}
        onDeleteSection={deleteSection}
        onDeleteQuestion={deleteQuestion}
        onDeleteSubQuestion={deleteSubQuestion}
        onSave={handleSaveButtonClick}
        saving={saving}
      />

      <AlertDialog
        open={deployDialogOpen}
        onOpenChange={(open) => {
          if (!pendingStatus) {
            setDeployDialogOpen(open);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deploy this past paper?</AlertDialogTitle>
            <AlertDialogDescription>
              Choose &ldquo;Deploy now&rdquo; to make it live for students. Press &ldquo;No&rdquo; to keep it in drafts so you can deploy later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <AlertDialogCancel disabled={pendingStatus !== null}>Keep editing</AlertDialogCancel>
            <Button
              variant="outline"
              onClick={() => handleSaveWithStatus('Draft')}
              disabled={pendingStatus !== null}
            >
              {pendingStatus === 'Draft' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving draft...
                </>
              ) : (
                'No, save to drafts'
              )}
            </Button>
            <AlertDialogAction
              asChild
            >
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={() => handleSaveWithStatus('Processed')}
                disabled={pendingStatus !== null}
              >
                {pendingStatus === 'Processed' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deploying...
                  </>
                ) : (
                  'Yes, deploy now'
                )}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
