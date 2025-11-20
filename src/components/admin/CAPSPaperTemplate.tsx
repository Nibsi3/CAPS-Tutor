'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Combobox } from '@/components/ui/combobox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { subjects } from '@/lib/data';
import { 
  Plus, 
  Trash2, 
  Image as ImageIcon,
  Table as TableIcon,
  BarChart3,
  Upload,
  X,
  Save,
  Eye,
  FileText,
  Sparkles,
  Shuffle,
} from 'lucide-react';
import { SafeImage } from '@/components/ui/safe-image';
import { PaperStructure, Question, SubQuestion, QuestionType, Section, QUESTION_TYPES, getFilteredQuestionTypesForSubject, getAllowedQuestionTypesForSubject } from '@/app/admin/past-papers/[id]/page';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/appwrite';
import { TABLE_TEMPLATES, getSubjects, getTableTypesForSubject, getTableTemplate } from '@/lib/table-templates';
import { getGraphSubjects, getGraphTypesForSubject, getGraphTemplate } from '@/lib/graph-templates';
import { TableCellEditor } from './TableCellEditor';
import { InteractiveGraphEditor } from './InteractiveGraphEditor';
import { CartesianCoordinateSystem } from './CartesianCoordinateSystem';
import { getPresetsForType, loadCustomPresetsForType, getAllPresetsForType, type QuestionPreset } from '@/lib/question-presets';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { generateCAPSQuestionSet } from '@/lib/caps-question-generator';

interface CAPSPaperTemplateProps {
  paperStructure: PaperStructure;
  paperId: string;
  paperName?: string; // Optional paper name for subject detection
  onUpdateStructure: (structure: PaperStructure) => void;
  onAddSection: () => void;
  onAddQuestion: (sectionId: string, presetData?: Partial<Question>) => void;
  onAddSubQuestion: (sectionId: string, questionId: string) => void;
  onUpdateSection: (sectionId: string, updates: Partial<Section>) => void;
  onUpdateQuestion: (sectionId: string, questionId: string, updates: Partial<Question>) => void;
  onUpdateSubQuestion: (sectionId: string, questionId: string, subQuestionId: string, updates: Partial<SubQuestion>) => void;
  onDeleteSection?: (sectionId: string) => void;
  onDeleteQuestion: (sectionId: string, questionId: string) => void;
  onDeleteSubQuestion: (sectionId: string, questionId: string, subQuestionId: string) => void;
  onSave: () => void;
  saving: boolean;
}

// Validate paperStructure prop
function validatePaperStructure(structure: PaperStructure | null | undefined): structure is PaperStructure {
  if (!structure) {
    console.error('[CAPSPaperTemplate] ❌ paperStructure is null or undefined');
    return false;
  }
  
  if (!structure.sections || !Array.isArray(structure.sections)) {
    console.error('[CAPSPaperTemplate] ❌ paperStructure.sections is missing or not an array');
    return false;
  }
  
  return true;
}

export function CAPSPaperTemplate({
  paperStructure,
  paperId,
  paperName,
  onUpdateStructure,
  onAddSection,
  onAddQuestion,
  onAddSubQuestion,
  onUpdateSection,
  onUpdateQuestion,
  onUpdateSubQuestion,
  onDeleteSection,
  onDeleteQuestion,
  onDeleteSubQuestion,
  onSave,
  saving,
}: CAPSPaperTemplateProps) {
  const { toast } = useToast();
  const { user } = useUser();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<string>('');
  const [editingValue, setEditingValue] = useState<string>('');
  const [presetDialogOpen, setPresetDialogOpen] = useState(false);
  const [presetDialogSectionId, setPresetDialogSectionId] = useState<string | null>(null);
  const [selectedPresetType, setSelectedPresetType] = useState<QuestionType>('short-answer');
  const [presetApplyToQuestionId, setPresetApplyToQuestionId] = useState<string | null>(null);
  const [customPresets, setCustomPresets] = useState<QuestionPreset[]>([]);
  const [loadingCustomPresets, setLoadingCustomPresets] = useState(false);
  const [randomizeDialogOpen, setRandomizeDialogOpen] = useState(false);
  const [isRandomizing, setIsRandomizing] = useState(false);

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 12 }, (_, index) => (currentYear + 1 - index).toString());
  const paperNumberOptions = ['1', '2', '3'];
  const gradeOptions = ['10', '11', '12'];

  const getResolvedGradeValue = (grade?: number) => {
    const candidate = grade?.toString();
    if (candidate && gradeOptions.includes(candidate)) {
      return candidate;
    }
    return '12';
  };

  // Handler to open preset dialog
  const handleOpenPresetDialog = (sectionId: string, questionId?: string, type?: QuestionType) => {
    setPresetDialogSectionId(sectionId);
    setPresetApplyToQuestionId(questionId || null);
    setSelectedPresetType(type || 'short-answer');
    setPresetDialogOpen(true);
  };

  // Load custom presets when dialog opens or preset type changes
  useEffect(() => {
    if (presetDialogOpen && user) {
      const subject = paperStructure?.header?.subject || paperName;
      const loadPresets = async () => {
        setLoadingCustomPresets(true);
        try {
          const custom = await loadCustomPresetsForType(selectedPresetType, user.$id, subject);
          setCustomPresets(custom);
        } catch (error) {
          console.error('Error loading custom presets:', error);
        } finally {
          setLoadingCustomPresets(false);
        }
      };
      loadPresets();
    }
  }, [presetDialogOpen, selectedPresetType, user, paperStructure?.header?.subject, paperName]);

  // Handler to show randomize confirmation dialog
  const handleRandomizeQuestions = () => {
    const subject = paperStructure?.header?.subject || paperName;
    if (!subject) {
      toast({
        variant: 'destructive',
        title: 'Subject Required',
        description: 'Please select a subject before randomizing questions.',
      });
      return;
    }
    setRandomizeDialogOpen(true);
  };

  // Actually perform the randomization after confirmation
  const performRandomization = async () => {
    const subject = paperStructure?.header?.subject || paperName;
    if (!subject || !user) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Subject and user information required.',
      });
      return;
    }

    setIsRandomizing(true);
    setRandomizeDialogOpen(false);

    try {
      // Load all custom presets for the subject
      const allCustomPresets: QuestionPreset[] = [];
      const questionTypes: QuestionType[] = ['multiple-choice', 'short-answer', 'paragraph-long-answer', 'numeric-calculation', 'formula-based-calculation', 'diagram-labeling', 'diagram-interpretation', 'table-interpretation', 'graph-interpretation', 'data-set-analysis', 'matching-pairing', 'fill-in-blank', 'reasoning-interpretation', 'compare-evaluate-predict', 'case-study', 'extract-source', 'map-cartoon', 'sequencing-ordering', 'accounting-financial-calculation'];
      
      for (const type of questionTypes) {
        try {
          const custom = await loadCustomPresetsForType(type, user.$id, subject);
          allCustomPresets.push(...custom);
        } catch (error) {
          console.error(`Error loading custom presets for ${type}:`, error);
        }
      }

      // Generate new structure with custom presets and paper metadata
      const newStructure = generateCAPSQuestionSet(
        subject,
        paperStructure.header.grade || 12,
        paperStructure.header.year || new Date().getFullYear().toString(),
        allCustomPresets
      );
      
      // Preserve the current header (subject, year, paper number, etc.)
      newStructure.header = {
        ...newStructure.header,
        subject: paperStructure.header.subject || subject,
        paperNumber: paperStructure.header.paperNumber || '1',
        year: paperStructure.header.year || new Date().getFullYear().toString(),
        grade: paperStructure.header.grade || 12,
        examBoard: paperStructure.header.examBoard || 'DBE',
        certificateType: paperStructure.header.certificateType || 'SC/NSC',
      };

      // Completely replace the paper structure
      onUpdateStructure(newStructure);
      
      toast({
        title: 'Questions Randomized',
        description: `Generated a complete CAPS-compliant question set for ${subject} with ${newStructure.sections.length} sections and ${newStructure.totalMarks} total marks.`,
      });
    } catch (error: any) {
      console.error('Error randomizing questions:', error);
      toast({
        variant: 'destructive',
        title: 'Randomization Failed',
        description: error.message || 'Failed to generate questions. Please try again.',
      });
    } finally {
      setIsRandomizing(false);
    }
  };

  // Validate and log props
  if (!validatePaperStructure(paperStructure)) {
    console.error('[CAPSPaperTemplate] ❌ Invalid paperStructure prop received');
    return (
      <div className="p-8 text-center">
        <p className="text-destructive">Error: Invalid paper structure. Please refresh the page.</p>
      </div>
    );
  }

  // Debug logging
  const totalQuestions = paperStructure.sections.reduce((sum, s) => sum + (s.questions?.length || 0), 0);
  console.log('[CAPSPaperTemplate] ✅ Rendering with valid structure:', {
    sectionCount: paperStructure.sections.length,
    totalQuestions: totalQuestions,
    sectionDetails: paperStructure.sections.map(s => ({
      id: s.id,
      label: s.label,
      questionCount: s.questions?.length || 0,
      questionsArray: s.questions ? 'exists' : 'MISSING',
      firstQuestionNumber: s.questions?.[0]?.number || 'none',
      firstQuestionText: s.questions?.[0]?.text?.substring(0, 50) || 'none',
      firstQuestionId: s.questions?.[0]?.id || 'none',
    })),
  });

  const getImageUrl = (imageFileId?: string) => {
    if (!imageFileId) return null;
    const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1';
    const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '';
    const bucketId = '690dafea0021f232399e';
    return `${endpoint}/storage/buckets/${bucketId}/files/${imageFileId}/view?project=${projectId}`;
  };

  const handleImageUpload = async (file: File, questionId: string) => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('paperId', paperId);
      formData.append('questionId', questionId);

      const response = await fetch(`/api/admin/past-papers/${paperId}/questions/upload-image`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: 'Success',
          description: 'Image uploaded successfully',
        });
        return data.fileId;
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to upload image',
      });
    }
    return null;
  };

  const startEditing = (id: string, field: string, currentValue: string) => {
    setEditingId(id);
    setEditingField(field);
    setEditingValue(currentValue);
  };

  const saveEdit = (sectionId: string, questionId?: string, subQuestionId?: string) => {
    if (subQuestionId && questionId) {
      onUpdateSubQuestion(sectionId, questionId, subQuestionId, { [editingField]: editingValue });
    } else if (questionId) {
      onUpdateQuestion(sectionId, questionId, { [editingField]: editingValue });
    } else {
      onUpdateSection(sectionId, { [editingField]: editingValue });
    }
    setEditingId(null);
    setEditingField('');
    setEditingValue('');
  };

  // Helper function to render question type selector with hierarchy
  const renderQuestionTypeSelector = (
    value: QuestionType,
    onValueChange: (value: QuestionType) => void,
    className?: string
  ) => {
    // Map question types to display names
    const typeDisplayNames: Record<string, string> = {
      // Written
      'short-answer': 'Short Answer',
      'paragraph-long-answer': 'Paragraph / Long Answer',
      'reasoning-interpretation': 'Reasoning / Interpretation',
      'true-false-with-reason': 'True or False (With Reason)',
      'compare-evaluate-predict': 'Compare / Evaluate / Predict',
      'sequencing-ordering': 'Sequencing / Ordering',
      // Objective
      'multiple-choice': 'Multiple Choice',
      'matching-pairing': 'Matching / Pairing',
      'fill-in-blank': 'Fill in the Blank',
      // Visual
      'diagram-interpretation': 'Diagram Interpretation',
      'diagram-labeling': 'Diagram Labeling',
      'table-interpretation': 'Table Interpretation',
      'graph-interpretation': 'Graph Interpretation',
      'map-cartoon': 'Map / Cartoon',
      'data-set-analysis': 'Data Set Analysis',
      // Extract-Based
      'extract-source': 'Extract / Source',
      'case-study': 'Case Study',
      // Calculation
      'numeric-calculation': 'Numeric Calculation',
      'formula-based-calculation': 'Formula-Based Calculation',
      'accounting-financial-calculation': 'Accounting / Financial Calculation',
      'geography-scale-gradient': 'Geography Scale / Gradient',
      'biology-percentage-ratio': 'Biology Percentage / Ratio',
      // Legacy types
      'normal': 'Normal',
      'diagram': 'Diagram',
      'table': 'Table',
      'graph': 'Graph',
      'extract': 'Extract',
    };

    // Get filtered question types based on subject
    const subject = paperStructure?.header?.subject || paperName;
    const { filtered, allowedLegacy } = getFilteredQuestionTypesForSubject(subject);
    
    return (
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className={className || "h-7 w-48 text-xs"}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="max-h-[400px]">
          {Object.entries(filtered).map(([category, types]) => {
            // Only show category if it has types
            if (!types || types.length === 0) return null;
            
            return (
              <div key={category}>
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {category}
                </div>
                {types.map((type) => (
                  <SelectItem key={type} value={type} className="pl-6">
                    {typeDisplayNames[type] || type}
                  </SelectItem>
                ))}
              </div>
            );
          })}
          {/* Legacy types section - only show if allowed */}
          {allowedLegacy.length > 0 && (
            <div className="border-t mt-1 pt-1">
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Legacy
              </div>
              {allowedLegacy.map((type) => (
                <SelectItem key={type} value={type} className="pl-6">
                  {typeDisplayNames[type] || type}
                </SelectItem>
              ))}
            </div>
          )}
        </SelectContent>
      </Select>
    );
  };

  // Handle preset selection
  const handlePresetSelect = (preset: QuestionPreset) => {
    if (!presetDialogSectionId) return;
    
    // If applying to existing question
    if (presetApplyToQuestionId) {
      const presetQuestionData: Partial<Question> = {
        text: preset.text,
        instructionText: preset.instructionText,
        marks: preset.marks,
        type: preset.type,
        options: preset.options,
        tableData: preset.tableData,
        graphData: preset.graphData,
        extractText: preset.extractText,
        diagramLabel: preset.diagramLabel,
        hasDiagram: preset.hasDiagram || false,
      };
      
      onUpdateQuestion(presetDialogSectionId, presetApplyToQuestionId, presetQuestionData);
      
      setPresetDialogOpen(false);
      setPresetDialogSectionId(null);
      setPresetApplyToQuestionId(null);
      
      toast({
        title: 'Preset Applied',
        description: `Question updated with preset: ${preset.name}`,
      });
      return;
    }
    
    // Create new question from preset with all features
    const presetQuestionData: Partial<Question> = {
      text: preset.text,
      instructionText: preset.instructionText,
      marks: preset.marks,
      type: preset.type,
      options: preset.options,
      tableData: preset.tableData,
      graphData: preset.graphData,
      extractText: preset.extractText,
      diagramLabel: preset.diagramLabel,
      hasDiagram: preset.hasDiagram || false,
      subQuestions: [],
    };
    
    // Add question with preset data
    onAddQuestion(presetDialogSectionId, presetQuestionData);
    
    setPresetDialogOpen(false);
    setPresetDialogSectionId(null);
    toast({
      title: 'Preset Applied',
      description: `Question created from preset: ${preset.name}`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Preset Selection Dialog */}
      <Dialog open={presetDialogOpen} onOpenChange={setPresetDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Select Question Preset</DialogTitle>
            <DialogDescription>
              Choose a preset template for your question. Each preset includes appropriate features for the question type.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Question Type Selector */}
            <div>
              <label className="text-sm font-medium mb-2 block">Question Type</label>
              {renderQuestionTypeSelector(
                selectedPresetType,
                (value) => setSelectedPresetType(value),
                "w-full"
              )}
            </div>
            
            {/* Preset List */}
            <ScrollArea className="h-[400px]">
              {(() => {
                // Combine built-in and custom presets
                const allPresets = getAllPresetsForType(
                  selectedPresetType, 
                  paperStructure.header.subject || paperName,
                  customPresets
                );
                const presets = allPresets;
                
                if (presets.length === 0) {
                  const subjectText = paperStructure.header.subject || paperName || 'the subject field';
                  return (
                    <div className="p-8 text-center text-muted-foreground">
                      <p className="text-sm mb-2">
                        No presets available for this question type.
                      </p>
                      <p className="text-xs">
                        {!paperStructure.header.subject && !paperName ? (
                          <>Please set the subject in the paper header to see subject-specific presets.</>
                        ) : (
                          <>Could not detect a supported subject from "{subjectText}". 
                          <br />Supported subjects: Life Science, Mathematics, English</>
                        )}
                      </p>
                    </div>
                  );
                }
                
                return (
                  <div className="grid grid-cols-1 gap-2">
                    {presets.map((preset) => (
                      <div
                        key={preset.id}
                        onClick={() => handlePresetSelect(preset)}
                        className="p-4 border rounded-lg cursor-pointer hover:bg-accent transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold">{preset.name}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{preset.description}</p>
                            <p className="text-sm mt-2 line-clamp-2">{preset.text}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span>{preset.marks} {preset.marks === 1 ? 'mark' : 'marks'}</span>
                              {preset.options && <span>{preset.options.length} options</span>}
                              {preset.tableData && <span>Table with {preset.tableData.rows.length} rows</span>}
                              {preset.graphData && <span>Graph with {preset.graphData.dataPoints?.length || 0} points</span>}
                              {preset.hasDiagram && <span>Includes diagram</span>}
                              {preset.extractText && <span>Includes extract</span>}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePresetSelect(preset);
                            }}
                          >
                            Use
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      {/* Randomize Questions Confirmation Dialog */}
      <AlertDialog open={randomizeDialogOpen} onOpenChange={setRandomizeDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Randomize Questions?</AlertDialogTitle>
            <AlertDialogDescription>
              This will completely replace all current questions, sub-questions, and sections in this past paper with randomly generated CAPS-compliant questions based on the paper's subject, grade, and year.
              <br /><br />
              <strong className="text-destructive">Warning: All current progress will be lost and cannot be undone.</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRandomizing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={performRandomization}
              disabled={isRandomizing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isRandomizing ? 'Randomizing...' : 'Yes, Randomize Paper'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Paper Header Card - Enhanced */}
      <Card className="border-2 shadow-lg">
        <CardHeader>
            <div>
              <h2 className="text-2xl font-bold">Paper Information</h2>
              <p className="text-sm text-muted-foreground mt-1">CAPS-aligned past paper details</p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Subject</label>
              <Combobox
                options={subjects.map(s => ({ value: s.value, label: s.label }))}
                value={paperStructure.header.subject || ''}
                onValueChange={(value) =>
                  onUpdateStructure({
                    ...paperStructure,
                    header: { ...paperStructure.header, subject: value },
                  })
                }
                placeholder="Select subject..."
                searchPlaceholder="Search subjects..."
                emptyText="No subjects found."
                className="text-lg font-semibold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Paper Number</label>
              <Select
                value={paperStructure.header.paperNumber || undefined}
                onValueChange={(value) =>
                  onUpdateStructure({
                    ...paperStructure,
                    header: { ...paperStructure.header, paperNumber: value },
                  })
                }
              >
                <SelectTrigger className="text-lg font-semibold">
                  <SelectValue placeholder="Choose paper number" />
                </SelectTrigger>
                <SelectContent>
                  {paperNumberOptions.map((number) => (
                    <SelectItem key={number} value={number}>
                      Paper {number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Year</label>
              <Select
                value={paperStructure.header.year || undefined}
                onValueChange={(value) =>
                  onUpdateStructure({
                    ...paperStructure,
                    header: { ...paperStructure.header, year: value },
                  })
                }
              >
                <SelectTrigger className="text-lg font-semibold">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {yearOptions.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Grade</label>
              <Select
                value={getResolvedGradeValue(paperStructure.header.grade)}
                onValueChange={(value) =>
                  onUpdateStructure({
                    ...paperStructure,
                    header: { ...paperStructure.header, grade: parseInt(value, 10) },
                  })
                }
              >
                <SelectTrigger className="text-lg font-semibold">
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                  {gradeOptions.map((grade) => (
                    <SelectItem key={grade} value={grade}>
                      Grade {grade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Total Questions: {paperStructure.sections.reduce((sum, s) => 
                  sum + (s.questions?.length || 0) + (s.questions || []).reduce((subSum, q) => subSum + (q.subQuestions?.length || 0), 0)
                , 0)}
              </div>
              <Badge variant="secondary" className="text-lg font-bold px-4 py-2">
                Total Marks: {paperStructure.totalMarks || 0}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Full-Width Preview Mode */}
      <div className="flex-1 flex flex-col">
        <div className="mb-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Paper Editor</h3>
              <p className="text-sm text-muted-foreground">Edit and preview your CAPS paper</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRandomizeQuestions}
                className="gap-2"
                disabled={(!paperStructure?.header?.subject && !paperName) || isRandomizing}
              >
                <Shuffle className={`h-4 w-4 ${isRandomizing ? 'animate-spin' : ''}`} />
                {isRandomizing ? 'Randomizing...' : 'Randomize Questions'}
              </Button>
              <Badge variant="outline" className="gap-2">
                <Eye className="h-3 w-3" />
                Preview Mode
              </Badge>
            </div>
          </div>
        </div>
          <ScrollArea className="flex-1">
          <div className="p-6">
            {/* Paper Header - Enhanced and Editable */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b group/header gap-6 flex-wrap">
              <div className="text-left space-y-2 min-w-[260px] flex-1">
                {/* Subject and Paper Number */}
                <div className="flex items-center gap-2 flex-wrap max-w-full">
                  <Combobox
                    options={subjects.map(s => ({ value: s.value, label: s.label }))}
                    value={paperStructure.header.subject || ''}
                    onValueChange={(value) => {
                      onUpdateStructure({
                        ...paperStructure,
                        header: { ...paperStructure.header, subject: value }
                      });
                    }}
                    placeholder="Select subject..."
                    searchPlaceholder="Search subjects..."
                    emptyText="No subjects found."
                    className="font-bold text-xl h-auto py-1 min-w-[240px] max-w-[520px] flex-grow"
                  />
                  <span className="font-bold text-xl text-foreground flex-shrink-0">/</span>
                  <Select
                    value={paperStructure.header.paperNumber || undefined}
                    onValueChange={(value) =>
                      onUpdateStructure({
                        ...paperStructure,
                        header: { ...paperStructure.header, paperNumber: value }
                      })
                    }
                  >
                    <SelectTrigger className="font-bold text-xl h-auto py-1 w-28 flex-shrink-0">
                      <SelectValue placeholder="Paper" />
                    </SelectTrigger>
                    <SelectContent>
                      {paperNumberOptions.map((number) => (
                        <SelectItem key={number} value={number}>
                          Paper {number}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-fit">
                  <div className="text-xs text-muted-foreground mb-1">Grade</div>
                  <Select
                    value={getResolvedGradeValue(paperStructure.header.grade)}
                    onValueChange={(value) =>
                      onUpdateStructure({
                        ...paperStructure,
                        header: { ...paperStructure.header, grade: parseInt(value, 10) }
                      })
                    }
                  >
                    <SelectTrigger className="text-xs h-8 w-28">
                      <SelectValue placeholder="Grade" />
                    </SelectTrigger>
                    <SelectContent>
                      {gradeOptions.map((grade) => (
                        <SelectItem key={grade} value={grade}>
                          Grade {grade}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="text-center space-y-1">
                {/* SC/NSC - Editable */}
                {editingId === 'header-certificateType' && editingField === 'certificateType' ? (
                  <Input
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    onBlur={() => {
                      onUpdateStructure({
                        ...paperStructure,
                        header: { ...paperStructure.header, certificateType: editingValue }
                      });
                      saveEdit('header');
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        onUpdateStructure({
                          ...paperStructure,
                          header: { ...paperStructure.header, certificateType: editingValue }
                        });
                        saveEdit('header');
                      }
                    }}
                    autoFocus
                    className="text-sm font-semibold bg-background border-border h-auto py-1 w-24 text-center"
                    placeholder="SC/NSC"
                  />
                ) : (
                  <div
                    onClick={() => startEditing('header-certificateType', 'certificateType', paperStructure.header.certificateType || 'SC/NSC')}
                    className="text-sm font-semibold text-foreground cursor-text hover:bg-muted/30 px-2 py-1 rounded transition-colors"
                  >
                    {paperStructure.header.certificateType || 'SC/NSC'}
                  </div>
                )}
                <div className="text-xs text-muted-foreground">NATIONAL SENIOR CERTIFICATE</div>
              </div>
              <div className="text-right space-y-2 min-w-[220px]">
                {/* Exam Board and Year */}
                <div className="flex items-center gap-2 justify-end flex-wrap">
                  {editingId === 'header-examBoard' && editingField === 'examBoard' ? (
                    <Input
                      value={editingValue}
                      onChange={(e) => setEditingValue(e.target.value)}
                      onBlur={() => {
                        onUpdateStructure({
                          ...paperStructure,
                          header: { ...paperStructure.header, examBoard: editingValue }
                        });
                        saveEdit('header');
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          onUpdateStructure({
                            ...paperStructure,
                            header: { ...paperStructure.header, examBoard: editingValue }
                          });
                          saveEdit('header');
                        }
                      }}
                      autoFocus
                      className="text-sm font-semibold bg-background border-border h-auto py-1 w-20 text-right"
                      placeholder="DBE"
                    />
                  ) : (
                    <div
                      onClick={() => startEditing('header-examBoard', 'examBoard', paperStructure.header.examBoard || 'DBE')}
                      className="text-sm font-semibold text-foreground cursor-text hover:bg-muted/30 px-2 py-1 rounded transition-colors"
                    >
                      {paperStructure.header.examBoard || 'DBE'}
                    </div>
                  )}
                  <span className="text-sm font-semibold text-foreground">/</span>
                  <span className="text-sm font-semibold text-foreground">November</span>
                  <Select
                    value={paperStructure.header.year || undefined}
                    onValueChange={(value) =>
                      onUpdateStructure({
                        ...paperStructure,
                        header: { ...paperStructure.header, year: value }
                      })
                    }
                  >
                    <SelectTrigger className="text-sm font-semibold h-auto py-1 w-24">
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {yearOptions.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="text-xs text-muted-foreground">Marks: {paperStructure.totalMarks || 0}</div>
              </div>
            </div>

            {/* Sections */}
            <div>
              {paperStructure.sections && paperStructure.sections.length > 0 ? (
                paperStructure.sections.map((section, sectionIndex) => {
                  // Defensive check: ensure section has questions array
                  const questions = section.questions || [];
                  console.log(`[CAPSPaperTemplate] Rendering section ${section.label}:`, {
                    sectionId: section.id,
                    questionCount: questions.length,
                    questionsArrayExists: !!section.questions,
                    isArray: Array.isArray(section.questions),
                    firstQuestion: questions[0] ? {
                      id: questions[0].id,
                      number: questions[0].number,
                      textLength: questions[0].text?.length || 0,
                    } : 'none',
                  });
                  
                  return (
                    <div key={section.id} className={sectionIndex < paperStructure.sections.length - 1 ? "mb-12" : ""}>
                      <SectionPreview
                        section={section}
                        sectionIndex={sectionIndex}
                        paperId={paperId}
                        paperStructure={paperStructure}
                        paperName={paperName}
                        getImageUrl={getImageUrl}
                        onUpdateSection={onUpdateSection}
                        onUpdateQuestion={onUpdateQuestion}
                        onUpdateSubQuestion={onUpdateSubQuestion}
                        onAddQuestion={onAddQuestion}
                        onAddSubQuestion={onAddSubQuestion}
                        onDeleteQuestion={onDeleteQuestion}
                        onDeleteSubQuestion={onDeleteSubQuestion}
                        onDeleteSection={onDeleteSection}
                        onImageUpload={handleImageUpload}
                        editingId={editingId}
                        editingField={editingField}
                        editingValue={editingValue}
                        startEditing={startEditing}
                        saveEdit={saveEdit}
                        setEditingId={setEditingId}
                        setEditingValue={setEditingValue}
                        setEditingField={setEditingField}
                        renderQuestionTypeSelector={renderQuestionTypeSelector}
                        onOpenPresetDialog={handleOpenPresetDialog}
                      />
                </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <p>No sections found in paper structure.</p>
                </div>
              )}
              
              {/* Add Section Button */}
              <div className="pt-4">
                  <Button
                    onClick={onAddSection}
                    variant="outline"
                    className="w-full gap-2 border-dashed"
                    size="lg"
                  >
                    <Plus className="h-4 w-4" />
                    Add New Section
                  </Button>
              </div>
            </div>

            {/* Total Marks - Enhanced */}
            <div className="mt-12 pt-6 border-t">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Total Questions: {paperStructure.sections.reduce((sum, s) => 
                  sum + (s.questions?.length || 0) + (s.questions || []).reduce((subSum, q) => subSum + (q.subQuestions?.length || 0), 0)
                , 0)}</div>
                <div className="font-bold text-2xl text-foreground">
                  GRAND TOTAL: {paperStructure.totalMarks || 0} MARKS
                </div>
              </div>
            </div>

            {/* Footer - Enhanced */}
            <div className="mt-8 pt-6 border-t flex items-center justify-between text-xs text-muted-foreground">
              <div className="font-medium">© Copyright reserved</div>
              <Button
                onClick={async () => {
                  try {
                    const response = await fetch('/api/admin/content/past-papers', {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ paperId, status: 'Processed' }),
                    });
                    const data = await response.json();
                    if (data.success) {
                      toast({
                        title: 'Success',
                        description: 'Paper published successfully',
                      });
                    } else {
                      throw new Error(data.error || 'Failed to publish paper');
                    }
                  } catch (error: any) {
                    toast({
                      variant: 'destructive',
                      title: 'Error',
                      description: error.message || 'Failed to publish paper',
                    });
                  }
                }}
                className="h-8"
                size="sm"
              >
                <Save className="h-4 w-4 mr-2" />
                Publish
              </Button>
            </div>
            </div>
          </ScrollArea>
      </div>
    </div>
  );
}

interface SectionPreviewProps {
  section: Section;
  sectionIndex: number;
  paperId: string;
  paperStructure: PaperStructure;
  paperName?: string;
  getImageUrl: (imageFileId?: string) => string | null;
  onUpdateSection: (sectionId: string, updates: Partial<Section>) => void;
  onUpdateQuestion: (sectionId: string, questionId: string, updates: Partial<Question>) => void;
  onUpdateSubQuestion: (sectionId: string, questionId: string, subQuestionId: string, updates: Partial<SubQuestion>) => void;
  onAddQuestion: (sectionId: string) => void;
  onAddSubQuestion: (sectionId: string, questionId: string) => void;
  onDeleteQuestion: (sectionId: string, questionId: string) => void;
  onDeleteSubQuestion: (sectionId: string, questionId: string, subQuestionId: string) => void;
  onDeleteSection?: (sectionId: string) => void;
  onImageUpload: (file: File, questionId: string) => Promise<string | null>;
  editingId: string | null;
  editingField: string;
  editingValue: string;
  startEditing: (id: string, field: string, currentValue: string) => void;
  saveEdit: (sectionId: string, questionId?: string, subQuestionId?: string) => void;
  setEditingId: (id: string | null) => void;
  setEditingValue: (value: string) => void;
  setEditingField: (field: string) => void;
  renderQuestionTypeSelector: (value: QuestionType, onValueChange: (value: QuestionType) => void, className?: string) => JSX.Element;
  onOpenPresetDialog: (sectionId: string, questionId?: string, type?: QuestionType) => void;
}

function SectionPreview({
  section,
  sectionIndex,
  paperId,
  paperStructure,
  paperName,
  getImageUrl,
  onUpdateSection,
  onUpdateQuestion,
  onUpdateSubQuestion,
  onAddQuestion,
  onAddSubQuestion,
  onDeleteQuestion,
  onDeleteSubQuestion,
  onDeleteSection,
  onImageUpload,
  editingId,
  editingField,
  editingValue,
  startEditing,
  saveEdit,
  setEditingId,
  setEditingValue,
  setEditingField,
  renderQuestionTypeSelector,
  onOpenPresetDialog,
}: SectionPreviewProps) {
  const sectionEditId = `section-${section.id}`;
  
  return (
    <div className="relative group">
      {/* Section Header with Edit and Delete */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex-1">
          {editingId === sectionEditId && editingField === 'label' ? (
            <Input
              value={editingValue}
              onChange={(e) => setEditingValue(e.target.value)}
              onBlur={() => {
                onUpdateSection(section.id, { label: editingValue });
                saveEdit(section.id);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onUpdateSection(section.id, { label: editingValue });
                  saveEdit(section.id);
                }
              }}
              autoFocus
              className="text-2xl font-bold bg-background border-border h-auto py-2"
            />
          ) : (
            <h2 
              className="text-2xl font-bold mb-2 cursor-text hover:bg-muted/30 px-2 py-1 rounded transition-colors"
              onClick={() => startEditing(sectionEditId, 'label', section.label)}
            >
              {section.label}
            </h2>
          )}
        </div>
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {onDeleteSection && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDeleteSection(section.id)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Section
            </Button>
          )}
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-8 ml-4">
        {(() => {
          // Defensive check: ensure questions array exists and is valid
          const questions = section.questions;
          
          if (!questions) {
            console.warn(`[SectionPreview] ⚠️ Section ${section.label} has no questions array`);
            return (
              <div className="text-muted-foreground text-sm italic p-4">
                No questions array found in section
              </div>
            );
          }
          
          if (!Array.isArray(questions)) {
            console.error(`[SectionPreview] ❌ Section ${section.label} questions is not an array:`, typeof questions, questions);
            return (
              <div className="text-destructive text-sm italic p-4">
                Error: Questions is not an array
              </div>
            );
          }
          
          if (questions.length === 0) {
            console.log(`[SectionPreview] Section ${section.label} has empty questions array`);
            return (
              <div className="text-muted-foreground text-sm italic p-4">
                No questions in this section
              </div>
            );
          }
          
          console.log(`[SectionPreview] ✅ Rendering ${questions.length} questions in ${section.label}`);
          
          return questions.map((question, qIndex) => {
            // Validate question object
            if (!question || !question.id) {
              console.error(`[SectionPreview] ❌ Invalid question at index ${qIndex}:`, question);
              return null;
            }
            
            console.log(`[SectionPreview] Rendering question ${question.number} (${qIndex + 1}/${questions.length}) in ${section.label}:`, {
              id: question.id,
              number: question.number,
              textLength: question.text?.length || 0,
              textPreview: question.text?.substring(0, 50) || 'NO TEXT',
              type: question.type,
              hasSubQuestions: question.subQuestions?.length || 0,
            });
            
            return (
          <QuestionPreview
            key={question.id}
            question={question}
            section={section}
            paperId={paperId}
            paperStructure={paperStructure}
            paperName={paperName}
            getImageUrl={getImageUrl}
            onUpdateQuestion={onUpdateQuestion}
            onUpdateSubQuestion={onUpdateSubQuestion}
            onAddSubQuestion={onAddSubQuestion}
            onDeleteQuestion={onDeleteQuestion}
            onDeleteSubQuestion={onDeleteSubQuestion}
            onImageUpload={onImageUpload}
            editingId={editingId}
            editingField={editingField}
            editingValue={editingValue}
            startEditing={startEditing}
            saveEdit={saveEdit}
            setEditingId={setEditingId}
            setEditingValue={setEditingValue}
            setEditingField={setEditingField}
            renderQuestionTypeSelector={renderQuestionTypeSelector}
            onOpenPresetDialog={onOpenPresetDialog}
          />
            );
          }).filter(Boolean); // Remove any null entries from invalid questions
        })()}
      </div>

      {/* Add Question Button */}
      <div className="mt-6 ml-4 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onOpenPresetDialog(section.id)}
          className="gap-2"
        >
          <Sparkles className="h-4 w-4" />
          Add Question from Preset
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onAddQuestion(section.id)}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Empty Question
        </Button>
      </div>

      {/* Section Total */}
      <div className="mt-8 pt-4 text-right text-sm font-semibold border-t">
        TOTAL {section.label}: {section.totalMarks || 0} marks
      </div>
    </div>
  );
}

interface QuestionPreviewProps {
  question: Question;
  section: Section;
  paperId: string;
  paperStructure: PaperStructure;
  paperName?: string;
  getImageUrl: (imageFileId?: string) => string | null;
  onUpdateQuestion: (sectionId: string, questionId: string, updates: Partial<Question>) => void;
  onUpdateSubQuestion: (sectionId: string, questionId: string, subQuestionId: string, updates: Partial<SubQuestion>) => void;
  onAddSubQuestion: (sectionId: string, questionId: string) => void;
  onDeleteQuestion: (sectionId: string, questionId: string) => void;
  onDeleteSubQuestion: (sectionId: string, questionId: string, subQuestionId: string) => void;
  onImageUpload: (file: File, questionId: string) => Promise<string | null>;
  editingId: string | null;
  editingField: string;
  editingValue: string;
  startEditing: (id: string, field: string, currentValue: string) => void;
  saveEdit: (sectionId: string, questionId?: string, subQuestionId?: string) => void;
  setEditingId: (id: string | null) => void;
  setEditingValue: (value: string) => void;
  setEditingField: (field: string) => void;
  renderQuestionTypeSelector: (value: QuestionType, onValueChange: (value: QuestionType) => void, className?: string) => JSX.Element;
  onOpenPresetDialog: (sectionId: string, questionId?: string, type?: QuestionType) => void;
}

function QuestionPreview({
  question,
  section,
  paperId,
  paperStructure,
  paperName,
  getImageUrl,
  onUpdateQuestion,
  onUpdateSubQuestion,
  onAddSubQuestion,
  onDeleteQuestion,
  onDeleteSubQuestion,
  onImageUpload,
  editingId,
  editingField,
  editingValue,
  startEditing,
  saveEdit,
  setEditingId,
  setEditingValue,
  setEditingField,
  renderQuestionTypeSelector,
  onOpenPresetDialog,
}: QuestionPreviewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const questionEditId = `question-${question.id}`;

  // Render sub-question based on its own type
  const renderSubQuestionContent = (subQ: SubQuestion, subQIndex: number) => {
    const subQType = subQ.type || 'normal';
    const currentSubject = paperStructure?.header?.subject || paperName || '';
    
    switch (subQType) {
      // Objective types
      case 'multiple-choice': {
        const options = subQ.options || [];
        const optionsWithDefaults = options.length > 0 ? options : ['', '', '', ''];
        
        return (
          <div className="ml-16 space-y-2 mt-3">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-muted-foreground">Multiple Choice Options</label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newOptions = [...optionsWithDefaults, ''];
                  onUpdateSubQuestion(section.id, question.id, subQ.id, { options: newOptions });
                }}
                className="h-6 text-xs"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Option
              </Button>
              </div>
            
            <div className="space-y-2">
              {optionsWithDefaults.map((option, optIndex) => {
                const optionEditId = `${subQ.id}-option-${optIndex}`;
                return (
                  <div key={optIndex} className="flex items-center gap-2 group">
                    <span className="font-medium min-w-[24px] text-muted-foreground text-sm">
                      {String.fromCharCode(65 + optIndex)}.
                    </span>
                    {editingId === optionEditId && editingField === 'option' ? (
                      <Input
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        onBlur={() => {
                          const newOptions = [...optionsWithDefaults];
                          newOptions[optIndex] = editingValue;
                          onUpdateSubQuestion(section.id, question.id, subQ.id, { options: newOptions });
                          saveEdit(section.id, question.id, subQ.id);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const newOptions = [...optionsWithDefaults];
                            newOptions[optIndex] = editingValue;
                            onUpdateSubQuestion(section.id, question.id, subQ.id, { options: newOptions });
                            saveEdit(section.id, question.id, subQ.id);
                          }
                        }}
                        autoFocus
                        className="flex-1 bg-background border-border h-8"
                        placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                      />
                    ) : (
                      <div
                        onClick={() => startEditing(optionEditId, 'option', option)}
                        className="flex-1 cursor-text hover:bg-muted/50 p-2 rounded border border-transparent hover:border-border transition-colors min-h-[32px] flex items-center"
                      >
                        <span className="text-foreground">
                          {option || <span className="text-muted-foreground italic">Click to add option {String.fromCharCode(65 + optIndex)}</span>}
                        </span>
                      </div>
                    )}
                    {optionsWithDefaults.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newOptions = optionsWithDefaults.filter((_, i) => i !== optIndex);
                          onUpdateSubQuestion(section.id, question.id, subQ.id, { options: newOptions });
                        }}
                        className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
            
            {optionsWithDefaults.length === 0 && (
              <p className="text-xs text-muted-foreground italic text-center py-2">
                No options yet. Click "Add Option" to add choices.
              </p>
            )}
          </div>
        );
      }
      
      case 'matching-pairing': {
        // Matching/Pairing uses full interactive table editor
        const tableData = subQ.tableData || { headers: ['Column A', 'Column B'], rows: [['', ''], ['', ''], ['', '']], description: 'Match each item in Column A with its corresponding item in Column B.' };
        
        return (
          <div className="ml-16 space-y-3 mt-3">
            <div className="border border-border rounded p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <TableIcon className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-xs">Matching Pairs</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const numCols = tableData.headers.length;
                      onUpdateSubQuestion(section.id, question.id, subQ.id, {
                        tableData: { ...tableData, rows: [...tableData.rows, Array(numCols).fill('')] }
                      });
                    }}
                    className="h-6 text-xs"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Pair
                  </Button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-border text-xs">
                  <thead>
                    <tr className="bg-muted/10">
                      {tableData.headers.map((header, colIndex) => (
                        <th key={colIndex} className="border border-border p-2 relative group">
                          <div className="flex items-center gap-1">
                            <div className="flex-1">
                              <TableCellEditor
                                value={header}
                                onChange={(newValue) => {
                                  const newHeaders = [...tableData.headers];
                                  newHeaders[colIndex] = newValue;
                                  onUpdateSubQuestion(section.id, question.id, subQ.id, {
                                    tableData: { ...tableData, headers: newHeaders }
                                  });
                                }}
                                isHeader={true}
                                placeholder={colIndex === 0 ? 'Column A' : 'Column B'}
                              />
                            </div>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.rows.map((row, rowIndex) => (
                      <tr key={rowIndex} className="hover:bg-muted/10 transition-colors group">
                        {row.map((cell, colIndex) => (
                          <td key={colIndex} className="border border-border p-1">
                            <TableCellEditor
                              value={cell}
                              onChange={(newValue) => {
                                const newRows = [...tableData.rows];
                                newRows[rowIndex] = [...newRows[rowIndex]];
                                newRows[rowIndex][colIndex] = newValue;
                                onUpdateSubQuestion(section.id, question.id, subQ.id, {
                                  tableData: { ...tableData, rows: newRows }
                                });
                              }}
                              placeholder={colIndex === 0 ? 'Item A' : 'Item B'}
                            />
                          </td>
                        ))}
                        <td className="border border-border p-1 w-8">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newRows = tableData.rows.filter((_, i) => i !== rowIndex);
                              onUpdateSubQuestion(section.id, question.id, subQ.id, {
                                tableData: { ...tableData, rows: newRows }
                              });
                            }}
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-2 w-2" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      }
      
      case 'fill-in-blank': {
        return (
          <div className="ml-16 space-y-2 mt-3">
            <div className="text-xs text-muted-foreground">Fill in the Blank question - Edit question text and mark blanks with [___]</div>
          </div>
        );
      }
      
      // Visual types
      case 'diagram-interpretation':
      case 'diagram-labeling':
      case 'diagram': {
        // Create a unique file input ID for this sub-question
        const subQFileInputId = `subq-file-${subQ.id}`;
                return (
          <div className="ml-16 space-y-3 mt-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Diagram Description or Title</label>
              {editingId === `${subQ.id}-diagramDesc` && editingField === 'diagramLabel' ? (
                          <Textarea
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                  onBlur={() => {
                    onUpdateSubQuestion(section.id, question.id, subQ.id, { diagramLabel: editingValue });
                    saveEdit(section.id, question.id, subQ.id);
                  }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && e.ctrlKey) {
                      onUpdateSubQuestion(section.id, question.id, subQ.id, { diagramLabel: editingValue });
                                saveEdit(section.id, question.id, subQ.id);
                              }
                            }}
                            autoFocus
                  rows={3}
                  className="bg-background border-border"
                  placeholder="Describe the diagram or provide diagram title..."
                          />
                        ) : (
                          <div
                  onClick={() => startEditing(`${subQ.id}-diagramDesc`, 'diagramLabel', subQ.diagramLabel || '')}
                  className="cursor-text hover:bg-muted/50 p-3 rounded border border-transparent hover:border-border transition-colors min-h-[60px]"
                          >
                  {subQ.diagramLabel || <span className="text-muted-foreground italic">Click to add description or title</span>}
                          </div>
                        )}
                      </div>
            
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center relative group hover:border-primary/50 transition-colors">
              {subQ.hasDiagram && subQ.imageFileId && getImageUrl(subQ.imageFileId) ? (
                <div className="relative">
                  <SafeImage
                    src={getImageUrl(subQ.imageFileId)!}
                    alt="Diagram"
                    width={600}
                    height={400}
                    className="mx-auto rounded shadow-md"
                  />
                      <Button
                        variant="ghost"
                        size="sm"
                    onClick={() => document.getElementById(subQFileInputId)?.click()}
                    className="absolute top-2 right-2 bg-background/80 hover:bg-background backdrop-blur-sm"
                      >
                    <Upload className="h-4 w-4" />
                      </Button>
                    </div>
              ) : (
                <div className="space-y-4">
                  <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground" />
                  <div>
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById(subQFileInputId)?.click()}
                      className="hover:bg-muted transition-colors"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Diagram
                    </Button>
                  </div>
                </div>
              )}
              <input
                id={subQFileInputId}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const fileId = await onImageUpload(file, question.id);
                    if (fileId) {
                      onUpdateSubQuestion(section.id, question.id, subQ.id, { imageFileId: fileId, hasDiagram: true });
                    }
                  }
                }}
              />
            </div>
          </div>
        );
      }
      
      case 'table-interpretation':
      case 'table': {
        // Full interactive table editor for sub-questions
        const tableData = subQ.tableData || { headers: ['Column 1', 'Column 2'], rows: [['', ''], ['', '']], description: '' };
        
        return (
          <div className="ml-16 space-y-3 mt-3">
            <div className="border border-border rounded p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <TableIcon className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-xs">Table Data</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newHeaders = [...tableData.headers, `Column ${tableData.headers.length + 1}`];
                      onUpdateSubQuestion(section.id, question.id, subQ.id, {
                        tableData: { ...tableData, headers: newHeaders, rows: tableData.rows.map(row => [...row, '']) }
                      });
                    }}
                    className="h-6 text-xs"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Column
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const numCols = tableData.headers.length;
                      onUpdateSubQuestion(section.id, question.id, subQ.id, {
                        tableData: { ...tableData, rows: [...tableData.rows, Array(numCols).fill('')] }
                      });
                    }}
                    className="h-6 text-xs"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Row
                  </Button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-border text-xs">
                  <thead>
                    <tr className="bg-muted/10">
                      {tableData.headers.map((header, colIndex) => (
                        <th key={colIndex} className="border border-border p-2 relative group">
                          <div className="flex items-center gap-1">
                            <div className="flex-1">
                              <TableCellEditor
                                value={header}
                                onChange={(newValue) => {
                                  const newHeaders = [...tableData.headers];
                                  newHeaders[colIndex] = newValue;
                                  onUpdateSubQuestion(section.id, question.id, subQ.id, {
                                    tableData: { ...tableData, headers: newHeaders }
                                  });
                                }}
                                isHeader={true}
                                placeholder={`Column ${colIndex + 1}`}
                              />
                            </div>
                            {tableData.headers.length > 1 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const newHeaders = tableData.headers.filter((_, i) => i !== colIndex);
                                  const newRows = tableData.rows.map(row => row.filter((_, i) => i !== colIndex));
                                  onUpdateSubQuestion(section.id, question.id, subQ.id, {
                                    tableData: { headers: newHeaders, rows: newRows }
                                  });
                                }}
                                className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                              >
                                <X className="h-2 w-2" />
                              </Button>
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.rows.map((row, rowIndex) => (
                      <tr key={rowIndex} className="hover:bg-muted/10 transition-colors group">
                        {row.map((cell, colIndex) => (
                          <td key={colIndex} className="border border-border p-1">
                            <TableCellEditor
                              value={cell}
                              onChange={(newValue) => {
                                const newRows = [...tableData.rows];
                                newRows[rowIndex] = [...newRows[rowIndex]];
                                newRows[rowIndex][colIndex] = newValue;
                                onUpdateSubQuestion(section.id, question.id, subQ.id, {
                                  tableData: { ...tableData, rows: newRows }
                                });
                              }}
                              placeholder="Cell"
                            />
                          </td>
                        ))}
                        <td className="border border-border p-1 w-8">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newRows = tableData.rows.filter((_, i) => i !== rowIndex);
                              onUpdateSubQuestion(section.id, question.id, subQ.id, {
                                tableData: { ...tableData, rows: newRows }
                              });
                            }}
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-2 w-2" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      }
      
      case 'graph-interpretation':
      case 'graph': {
        // Full interactive graph editor for sub-questions
        const currentGraphSubject = currentSubject;
        const availableGraphSubjects = getGraphSubjects();
        const availableGraphTypes = currentGraphSubject ? getGraphTypesForSubject(currentGraphSubject) : [];
        
        let graphData = subQ.graphData;
        if (!graphData || !graphData.type) {
          graphData = { 
            type: 'line',
            description: '', 
            dataPoints: [],
            xAxisLabel: '',
            yAxisLabel: '',
            showLegend: false,
            showGrid: true,
          };
        }
        
        const safeGraphData = {
          type: graphData.type || 'line',
          description: graphData.description || '',
          xAxisLabel: graphData.xAxisLabel || '',
          yAxisLabel: graphData.yAxisLabel || '',
          y2AxisLabel: graphData.y2AxisLabel || '',
          dataPoints: graphData.dataPoints || [],
          showLegend: graphData.showLegend !== undefined ? graphData.showLegend : true,
          showGrid: graphData.showGrid !== undefined ? graphData.showGrid : true,
        };
        
        return (
          <div className="ml-16 space-y-3 mt-3">
            <div className="border border-border rounded p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-xs">Graph</span>
                </div>
              </div>
              
              {/* Graph Type Selector */}
              <div className="mb-3">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Graph Type</label>
                <Select
                  value={safeGraphData.type}
                  onValueChange={(value) => {
                    onUpdateSubQuestion(section.id, question.id, subQ.id, {
                      graphData: { ...safeGraphData, type: value as any }
                    });
                  }}
                >
                  <SelectTrigger className="h-7 text-xs bg-background border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="line">Line Graph</SelectItem>
                    <SelectItem value="bar">Bar Chart</SelectItem>
                    <SelectItem value="pie">Pie Chart</SelectItem>
                    <SelectItem value="scatter">Scatter Plot</SelectItem>
                    <SelectItem value="dual-axis">Dual-Axis Graph</SelectItem>
                    {currentGraphSubject && (currentGraphSubject.toLowerCase().includes('math') || currentGraphSubject.toLowerCase().includes('mathematics')) && (
                      <SelectItem value="cartesian">Cartesian Coordinate System</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Graph Editor */}
              <div className="border border-border rounded p-3 bg-muted/5">
                <InteractiveGraphEditor
                  graphData={safeGraphData}
                  onUpdate={(updates) => {
                    onUpdateSubQuestion(section.id, question.id, subQ.id, {
                      graphData: { ...safeGraphData, ...updates }
                    });
                  }}
                />
              </div>
            </div>
          </div>
        );
      }
      
      case 'map-cartoon': {
        // Map/Cartoon uses diagram structure
        const subQFileInputId = `subq-file-${subQ.id}`;
        return (
          <div className="ml-16 space-y-3 mt-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Map / Cartoon Description</label>
              {editingId === `${subQ.id}-mapDesc` && editingField === 'diagramLabel' ? (
                <Textarea
                  value={editingValue}
                  onChange={(e) => setEditingValue(e.target.value)}
                  onBlur={() => {
                    onUpdateSubQuestion(section.id, question.id, subQ.id, { diagramLabel: editingValue });
                    saveEdit(section.id, question.id, subQ.id);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.ctrlKey) {
                      onUpdateSubQuestion(section.id, question.id, subQ.id, { diagramLabel: editingValue });
                      saveEdit(section.id, question.id, subQ.id);
                    }
                  }}
                  autoFocus
                  rows={3}
                  className="bg-background border-border"
                  placeholder="Describe the map or cartoon..."
                />
              ) : (
                <div
                  onClick={() => startEditing(`${subQ.id}-mapDesc`, 'diagramLabel', subQ.diagramLabel || '')}
                  className="cursor-text hover:bg-muted/50 p-3 rounded border border-transparent hover:border-border transition-colors min-h-[60px]"
                >
                  {subQ.diagramLabel || <span className="text-muted-foreground italic">Click to add description</span>}
                </div>
              )}
            </div>
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center relative group hover:border-primary/50 transition-colors">
              {subQ.hasDiagram && subQ.imageFileId && getImageUrl(subQ.imageFileId) ? (
                <div className="relative">
                  <SafeImage
                    src={getImageUrl(subQ.imageFileId)!}
                    alt="Map or Cartoon"
                    width={600}
                    height={400}
                    className="mx-auto rounded shadow-md"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => document.getElementById(subQFileInputId)?.click()}
                    className="absolute top-2 right-2 bg-background/80 hover:bg-background backdrop-blur-sm"
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground" />
                  <div>
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById(subQFileInputId)?.click()}
                      className="hover:bg-muted transition-colors"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Map/Cartoon
                    </Button>
                  </div>
                </div>
              )}
              <input
                id={subQFileInputId}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const fileId = await onImageUpload(file, question.id);
                    if (fileId) {
                      onUpdateSubQuestion(section.id, question.id, subQ.id, { imageFileId: fileId, hasDiagram: true });
                    }
                  }
                }}
              />
            </div>
          </div>
        );
      }
      
      case 'data-set-analysis': {
        // Data Set Analysis - use full table editor (can be extended to support graphs too)
        const tableData = subQ.tableData || { headers: ['Variable 1', 'Variable 2', 'Result'], rows: [['', '', ''], ['', '', '']], description: 'Analyze the data set provided.' };
        
        return (
          <div className="ml-16 space-y-3 mt-3">
            <div className="border border-border rounded p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <TableIcon className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-xs">Data Set</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newHeaders = [...tableData.headers, `Variable ${tableData.headers.length + 1}`];
                      onUpdateSubQuestion(section.id, question.id, subQ.id, {
                        tableData: { ...tableData, headers: newHeaders, rows: tableData.rows.map(row => [...row, '']) }
                      });
                    }}
                    className="h-6 text-xs"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Column
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const numCols = tableData.headers.length;
                      onUpdateSubQuestion(section.id, question.id, subQ.id, {
                        tableData: { ...tableData, rows: [...tableData.rows, Array(numCols).fill('')] }
                      });
                    }}
                    className="h-6 text-xs"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Row
                  </Button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-border text-xs">
                  <thead>
                    <tr className="bg-muted/10">
                      {tableData.headers.map((header, colIndex) => (
                        <th key={colIndex} className="border border-border p-2 relative group">
                          <div className="flex items-center gap-1">
                            <div className="flex-1">
                              <TableCellEditor
                                value={header}
                                onChange={(newValue) => {
                                  const newHeaders = [...tableData.headers];
                                  newHeaders[colIndex] = newValue;
                                  onUpdateSubQuestion(section.id, question.id, subQ.id, {
                                    tableData: { ...tableData, headers: newHeaders }
                                  });
                                }}
                                isHeader={true}
                                placeholder={`Variable ${colIndex + 1}`}
                              />
                            </div>
                            {tableData.headers.length > 1 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const newHeaders = tableData.headers.filter((_, i) => i !== colIndex);
                                  const newRows = tableData.rows.map(row => row.filter((_, i) => i !== colIndex));
                                  onUpdateSubQuestion(section.id, question.id, subQ.id, {
                                    tableData: { headers: newHeaders, rows: newRows }
                                  });
                                }}
                                className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                              >
                                <X className="h-2 w-2" />
                              </Button>
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.rows.map((row, rowIndex) => (
                      <tr key={rowIndex} className="hover:bg-muted/10 transition-colors group">
                        {row.map((cell, colIndex) => (
                          <td key={colIndex} className="border border-border p-1">
                            <TableCellEditor
                              value={cell}
                              onChange={(newValue) => {
                                const newRows = [...tableData.rows];
                                newRows[rowIndex] = [...newRows[rowIndex]];
                                newRows[rowIndex][colIndex] = newValue;
                                onUpdateSubQuestion(section.id, question.id, subQ.id, {
                                  tableData: { ...tableData, rows: newRows }
                                });
                              }}
                              placeholder="Data"
                            />
                          </td>
                        ))}
                        <td className="border border-border p-1 w-8">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newRows = tableData.rows.filter((_, i) => i !== rowIndex);
                              onUpdateSubQuestion(section.id, question.id, subQ.id, {
                                tableData: { ...tableData, rows: newRows }
                              });
                            }}
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-2 w-2" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      }
      
      // Extract-Based types
      case 'extract-source':
      case 'extract': {
        return (
          <div className="ml-16 space-y-3 mt-3">
            <div className="border border-border rounded p-4">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Extract Text</label>
              {editingId === `${subQ.id}-extract` && editingField === 'extractText' ? (
                <Textarea
                  value={editingValue}
                  onChange={(e) => setEditingValue(e.target.value)}
                  onBlur={() => {
                    onUpdateSubQuestion(section.id, question.id, subQ.id, { extractText: editingValue });
                    saveEdit(section.id, question.id, subQ.id);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.ctrlKey) {
                      onUpdateSubQuestion(section.id, question.id, subQ.id, { extractText: editingValue });
                      saveEdit(section.id, question.id, subQ.id);
                    }
                  }}
                  autoFocus
                  rows={4}
                  className="bg-background border-border"
                />
              ) : (
                <div
                  onClick={() => startEditing(`${subQ.id}-extract`, 'extractText', subQ.extractText || '')}
                  className="cursor-text hover:bg-muted/50 p-3 rounded border border-transparent hover:border-border transition-colors min-h-[80px]"
                >
                  {subQ.extractText || <span className="text-muted-foreground italic">Click to add extract text</span>}
                </div>
              )}
            </div>
          </div>
        );
      }
      
      case 'case-study': {
        // Case Study uses extract structure with longer text
        return (
          <div className="ml-16 space-y-3 mt-3">
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Case Study Text</label>
            {editingId === `${subQ.id}-caseStudy` && editingField === 'extractText' ? (
              <Textarea
                value={editingValue}
                onChange={(e) => setEditingValue(e.target.value)}
                onBlur={() => {
                  onUpdateSubQuestion(section.id, question.id, subQ.id, { extractText: editingValue });
                  saveEdit(section.id, question.id, subQ.id);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.ctrlKey) {
                    onUpdateSubQuestion(section.id, question.id, subQ.id, { extractText: editingValue });
                    saveEdit(section.id, question.id, subQ.id);
                  }
                }}
                autoFocus
                rows={8}
                className="bg-background border-border"
                placeholder="Enter case study text..."
              />
            ) : (
              <div
                onClick={() => startEditing(`${subQ.id}-caseStudy`, 'extractText', subQ.extractText || '')}
                className="cursor-text hover:bg-muted/50 p-4 rounded border border-transparent hover:border-border transition-colors min-h-[120px] bg-muted/20"
              >
                {subQ.extractText || <span className="text-muted-foreground italic">Click to add case study text</span>}
              </div>
            )}
          </div>
        );
      }
      
      // Written types - all render as normal text questions
      case 'short-answer':
      case 'paragraph-long-answer':
      case 'reasoning-interpretation':
      case 'true-false-with-reason':
      case 'compare-evaluate-predict':
      case 'sequencing-ordering':
      // Calculation types - all render as normal text questions
      case 'numeric-calculation':
      case 'formula-based-calculation':
      case 'accounting-financial-calculation':
      case 'geography-scale-gradient':
      case 'biology-percentage-ratio':
      // Legacy
      default: // 'normal'
        return null;
    }
  };

  const renderQuestionContent = () => {
    switch (question.type) {
      case 'multiple-choice': {
        // Multiple-choice question: show text, options, then sub-questions
        const options = (question as any).options || [];
        const optionsWithDefaults = options.length > 0 ? options : ['', '', '', ''];
        
        return (
          <div className="space-y-4">
            {/* Main Question Text */}
            <div className="mb-4">
              {editingId === questionEditId && editingField === 'text' ? (
                <Textarea
                  value={editingValue}
                  onChange={(e) => setEditingValue(e.target.value)}
                  onBlur={() => {
                    onUpdateQuestion(section.id, question.id, { text: editingValue });
                    saveEdit(section.id, question.id);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.ctrlKey) {
                      onUpdateQuestion(section.id, question.id, { text: editingValue });
                      saveEdit(section.id, question.id);
                    }
                  }}
                  autoFocus
                  rows={4}
                  className="min-h-[100px] bg-background border-border"
                  placeholder="Enter question text..."
                />
              ) : (
                <div
                  onClick={() => startEditing(questionEditId, 'text', question.text || '')}
                  className="cursor-text hover:bg-muted/50 p-4 rounded border border-transparent hover:border-border transition-colors min-h-[100px]"
                >
                  {question.text ? (
                    <p className="text-foreground whitespace-pre-wrap">{question.text}</p>
                  ) : (
                    <span className="text-muted-foreground italic">Click to add question text</span>
                  )}
                </div>
              )}
            </div>
            
            {/* Multiple Choice Options */}
            <div className="mb-4 space-y-2">
                      <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-muted-foreground">Multiple Choice Options</label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newOptions = [...optionsWithDefaults, ''];
                    onUpdateQuestion(section.id, question.id, { options: newOptions } as any);
                          }}
                  className="h-7 text-xs"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add Option
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                {optionsWithDefaults.map((option: string, optIndex: number) => {
                  const optionEditId = `${questionEditId}-option-${optIndex}`;
                          return (
                            <div key={optIndex} className="flex items-center gap-2 group">
                              <span className="font-medium min-w-[24px] text-muted-foreground text-sm">
                                {String.fromCharCode(65 + optIndex)}.
                              </span>
                              {editingId === optionEditId && editingField === 'option' ? (
                                <Input
                                  value={editingValue}
                                  onChange={(e) => setEditingValue(e.target.value)}
                                  onBlur={() => {
                                    const newOptions = [...optionsWithDefaults];
                                    newOptions[optIndex] = editingValue;
                            onUpdateQuestion(section.id, question.id, { options: newOptions } as any);
                            saveEdit(section.id, question.id);
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      const newOptions = [...optionsWithDefaults];
                                      newOptions[optIndex] = editingValue;
                              onUpdateQuestion(section.id, question.id, { options: newOptions } as any);
                              saveEdit(section.id, question.id);
                                    }
                                  }}
                                  autoFocus
                                  className="flex-1 bg-background border-border h-8"
                                  placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                                />
                              ) : (
                                <div
                                  onClick={() => startEditing(optionEditId, 'option', option)}
                                  className="flex-1 cursor-text hover:bg-muted/50 p-2 rounded border border-transparent hover:border-border transition-colors min-h-[32px] flex items-center"
                                >
                                  <span className="text-foreground">
                                    {option || <span className="text-muted-foreground italic">Click to add option {String.fromCharCode(65 + optIndex)}</span>}
                                  </span>
                                </div>
                              )}
                              {optionsWithDefaults.length > 1 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                            const newOptions = optionsWithDefaults.filter((_: string, i: number) => i !== optIndex);
                            onUpdateQuestion(section.id, question.id, { options: newOptions } as any);
                                  }}
                                  className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          );
                        })}
              </div>
                      </div>
                      
            {/* Sub-questions */}
            {(question.subQuestions?.length || 0) === 0 ? (
              <div className="text-center py-4 text-muted-foreground text-sm border border-dashed border-border rounded-lg p-4">
                No sub-questions. Add a sub-question to continue.
              </div>
            ) : (
              (question.subQuestions || []).map((subQ, subQIndex) => {
                const subQType = subQ.type || 'normal';
                return (
                  <div key={`${section.id}-${question.id}-${subQ.id}-${subQIndex}`} className="mb-4 p-3 border border-border rounded group">
                    {/* Sub-Question Header with Type Selector */}
                    <div className="flex items-start gap-3 mb-3">
                      <span className="font-medium min-w-[60px]">{subQ.number}</span>
                      <div className="flex-1">
                        {editingId === subQ.id && editingField === 'text' ? (
                          <Textarea
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            onBlur={() => saveEdit(section.id, question.id, subQ.id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && e.ctrlKey) {
                                saveEdit(section.id, question.id, subQ.id);
                              }
                            }}
                            autoFocus
                            rows={2}
                            className="min-h-[60px] bg-background border-border"
                          />
                        ) : (
                          <div
                            onClick={() => startEditing(subQ.id, 'text', subQ.text)}
                            className="cursor-text hover:bg-muted/50 p-2 rounded min-h-[60px] border border-transparent hover:border-border transition-colors"
                          >
                            {subQ.text || <span className="text-muted-foreground italic">Click to edit question text</span>}
                          </div>
                      )}
                    </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {renderQuestionTypeSelector(
                          subQType,
                          (value: QuestionType) => {
                            const updates: any = { type: value };
                            // Initialize type-specific data structures
                            if (value === 'multiple-choice' && !subQ.options) {
                              updates.options = ['', '', '', ''];
                            }
                            if ((value === 'table' || value === 'table-interpretation') && !subQ.tableData) {
                              updates.tableData = { headers: ['', ''], rows: [['', '']] };
                            }
                            if ((value === 'graph' || value === 'graph-interpretation') && !subQ.graphData) {
                              updates.graphData = { type: 'line', dataPoints: [], xAxisLabel: '', yAxisLabel: '', showLegend: false, showGrid: true };
                            }
                            if ((value === 'diagram-interpretation' || value === 'diagram-labeling' || value === 'diagram') && !subQ.hasDiagram) {
                              updates.hasDiagram = true;
                            }
                            if ((value === 'extract-source' || value === 'extract') && !subQ.extractText) {
                              updates.extractText = '';
                            }
                            if (value === 'matching-pairing' && !subQ.tableData) {
                              updates.tableData = { headers: ['Column A', 'Column B'], rows: [['', ''], ['', '']] };
                            }
                            onUpdateSubQuestion(section.id, question.id, subQ.id, updates);
                          },
                          "h-7 w-48 text-xs"
                        )}
                        <span className="text-sm font-medium">({typeof subQ.marks === 'number' ? subQ.marks : parseInt(String(subQ.marks)) || 0} {(typeof subQ.marks === 'number' ? subQ.marks : parseInt(String(subQ.marks)) || 0) === 1 ? 'mark' : 'marks'})</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteSubQuestion(section.id, question.id, subQ.id)}
                          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Render sub-question content based on its type */}
                    {renderSubQuestionContent(subQ, subQIndex)}
                  </div>
                );
              })
            )}
          </div>
        );
      }
      
      // Visual types - DIAGRAM
      case 'diagram-interpretation':
      case 'diagram-labeling':
      case 'diagram': {
        const fileInputId = `file-${question.id}`;
        return (
          <div className="space-y-4">
            {/* Main Question Text */}
            <div className="mb-4">
              {editingId === questionEditId && editingField === 'text' ? (
                <Textarea
                  value={editingValue}
                  onChange={(e) => setEditingValue(e.target.value)}
                  onBlur={() => {
                    onUpdateQuestion(section.id, question.id, { text: editingValue });
                    saveEdit(section.id, question.id);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.ctrlKey) {
                      onUpdateQuestion(section.id, question.id, { text: editingValue });
                      saveEdit(section.id, question.id);
                    }
                  }}
                  autoFocus
                  rows={4}
                  className="min-h-[100px] bg-background border-border"
                  placeholder="Enter question text..."
                />
              ) : (
                <div
                  onClick={() => startEditing(questionEditId, 'text', question.text || '')}
                  className="cursor-text hover:bg-muted/50 p-4 rounded border border-transparent hover:border-border transition-colors min-h-[100px]"
                >
                  {question.text ? (
                    <p className="text-foreground whitespace-pre-wrap">{question.text}</p>
                  ) : (
                    <span className="text-muted-foreground italic">Click to add question text</span>
                  )}
                </div>
              )}
            </div>
            
            {/* Diagram Label */}
            <div className="mb-4">
              <label className="text-sm font-medium text-muted-foreground mb-1 block">Diagram Description or Title</label>
              {editingId === `${questionEditId}-diagramDesc` && editingField === 'diagramLabel' ? (
                <Textarea
                  value={editingValue}
                  onChange={(e) => setEditingValue(e.target.value)}
                  onBlur={() => {
                    onUpdateQuestion(section.id, question.id, { diagramLabel: editingValue });
                    saveEdit(section.id, question.id);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.ctrlKey) {
                      onUpdateQuestion(section.id, question.id, { diagramLabel: editingValue });
                      saveEdit(section.id, question.id);
                    }
                  }}
                  autoFocus
                  rows={3}
                  className="bg-background border-border"
                  placeholder="Describe the diagram or provide diagram title..."
                />
              ) : (
                <div
                  onClick={() => startEditing(`${questionEditId}-diagramDesc`, 'diagramLabel', question.diagramLabel || '')}
                  className="cursor-text hover:bg-muted/50 p-3 rounded border border-transparent hover:border-border transition-colors min-h-[60px]"
                >
                  {question.diagramLabel || <span className="text-muted-foreground italic">Click to add description or title</span>}
                </div>
              )}
            </div>
            
            {/* Diagram Upload */}
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center relative group hover:border-primary/50 transition-colors">
              {question.hasDiagram && question.imageFileId && getImageUrl(question.imageFileId) ? (
                <div className="relative">
                  <SafeImage
                    src={getImageUrl(question.imageFileId)!}
                    alt="Diagram"
                    width={600}
                    height={400}
                    className="mx-auto rounded shadow-md"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => document.getElementById(fileInputId)?.click()}
                    className="absolute top-2 right-2 bg-background/80 hover:bg-background backdrop-blur-sm"
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground" />
                  <div>
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById(fileInputId)?.click()}
                      className="hover:bg-muted transition-colors"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Diagram
                    </Button>
                  </div>
                </div>
              )}
              <input
                id={fileInputId}
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const fileId = await onImageUpload(file, question.id);
                    if (fileId) {
                      onUpdateQuestion(section.id, question.id, { imageFileId: fileId, hasDiagram: true });
                    }
                  }
                }}
              />
            </div>
            
            {/* Sub-questions */}
            {(question.subQuestions?.length || 0) === 0 ? (
              <div className="text-center py-4 text-muted-foreground text-sm border border-dashed border-border rounded-lg p-4 mt-4">
                No sub-questions. Add a sub-question to continue.
              </div>
            ) : (
              (question.subQuestions || []).map((subQ, subQIndex) => {
                const subQType = subQ.type || 'normal';
                return (
                  <div key={`${section.id}-${question.id}-${subQ.id}-${subQIndex}`} className="mb-4 p-3 border border-border rounded group mt-4">
                    <div className="flex items-start gap-3 mb-3">
                      <span className="font-medium min-w-[60px]">{subQ.number}</span>
                      <div className="flex-1">
                        {editingId === subQ.id && editingField === 'text' ? (
                          <Textarea
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            onBlur={() => saveEdit(section.id, question.id, subQ.id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && e.ctrlKey) {
                                saveEdit(section.id, question.id, subQ.id);
                              }
                            }}
                            autoFocus
                            rows={2}
                            className="min-h-[60px] bg-background border-border"
                          />
                        ) : (
                          <div
                            onClick={() => startEditing(subQ.id, 'text', subQ.text)}
                            className="cursor-text hover:bg-muted/50 p-2 rounded min-h-[60px] border border-transparent hover:border-border transition-colors"
                          >
                            {subQ.text || <span className="text-muted-foreground italic">Click to edit question text</span>}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {renderQuestionTypeSelector(
                          subQType,
                          (value: QuestionType) => {
                            const updates: any = { type: value };
                            if (value === 'multiple-choice' && !subQ.options) {
                              updates.options = ['', '', '', ''];
                            }
                            if ((value === 'table' || value === 'table-interpretation') && !subQ.tableData) {
                              updates.tableData = { headers: ['', ''], rows: [['', '']] };
                            }
                            if ((value === 'graph' || value === 'graph-interpretation') && !subQ.graphData) {
                              updates.graphData = { type: 'line', dataPoints: [], xAxisLabel: '', yAxisLabel: '', showLegend: false, showGrid: true };
                            }
                            if ((value === 'diagram-interpretation' || value === 'diagram-labeling' || value === 'diagram') && !subQ.hasDiagram) {
                              updates.hasDiagram = true;
                            }
                            if ((value === 'extract-source' || value === 'extract') && !subQ.extractText) {
                              updates.extractText = '';
                            }
                            if (value === 'matching-pairing' && !subQ.tableData) {
                              updates.tableData = { headers: ['Column A', 'Column B'], rows: [['', ''], ['', '']] };
                            }
                            onUpdateSubQuestion(section.id, question.id, subQ.id, updates);
                          },
                          "h-7 w-48 text-xs"
                        )}
                        <span className="text-sm font-medium">({typeof subQ.marks === 'number' ? subQ.marks : parseInt(String(subQ.marks)) || 0} {(typeof subQ.marks === 'number' ? subQ.marks : parseInt(String(subQ.marks)) || 0) === 1 ? 'mark' : 'marks'})</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteSubQuestion(section.id, question.id, subQ.id)}
                          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    {renderSubQuestionContent(subQ, subQIndex)}
                  </div>
                );
              })
            )}
          </div>
        );
      }
      
      // Visual types - MAP/CARTOON
      case 'map-cartoon': {
        // Similar to diagram but for maps/cartoons
        const fileInputId = `file-${question.id}`;
        return (
          <div className="space-y-4">
            {/* Main Question Text */}
            <div className="mb-4">
              {editingId === questionEditId && editingField === 'text' ? (
                <Textarea
                  value={editingValue}
                  onChange={(e) => setEditingValue(e.target.value)}
                  onBlur={() => {
                    onUpdateQuestion(section.id, question.id, { text: editingValue });
                    saveEdit(section.id, question.id);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.ctrlKey) {
                      onUpdateQuestion(section.id, question.id, { text: editingValue });
                      saveEdit(section.id, question.id);
                    }
                  }}
                  autoFocus
                  rows={4}
                  className="min-h-[100px] bg-background border-border"
                  placeholder="Enter question text..."
                />
              ) : (
                <div
                  onClick={() => startEditing(questionEditId, 'text', question.text || '')}
                  className="cursor-text hover:bg-muted/50 p-4 rounded border border-transparent hover:border-border transition-colors min-h-[100px]"
                >
                  {question.text ? (
                    <p className="text-foreground whitespace-pre-wrap">{question.text}</p>
                  ) : (
                    <span className="text-muted-foreground italic">Click to add question text</span>
                  )}
                </div>
              )}
            </div>
            
            {/* Map/Cartoon Label */}
            <div className="mb-4">
              <label className="text-sm font-medium text-muted-foreground mb-1 block">Map / Cartoon Description</label>
              {editingId === `${questionEditId}-mapDesc` && editingField === 'diagramLabel' ? (
                <Textarea
                  value={editingValue}
                  onChange={(e) => setEditingValue(e.target.value)}
                  onBlur={() => {
                    onUpdateQuestion(section.id, question.id, { diagramLabel: editingValue });
                    saveEdit(section.id, question.id);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.ctrlKey) {
                      onUpdateQuestion(section.id, question.id, { diagramLabel: editingValue });
                      saveEdit(section.id, question.id);
                    }
                  }}
                  autoFocus
                  rows={3}
                  className="bg-background border-border"
                  placeholder="Describe the map or cartoon..."
                />
              ) : (
                <div
                  onClick={() => startEditing(`${questionEditId}-mapDesc`, 'diagramLabel', question.diagramLabel || '')}
                  className="cursor-text hover:bg-muted/50 p-3 rounded border border-transparent hover:border-border transition-colors min-h-[60px]"
                >
                  {question.diagramLabel || <span className="text-muted-foreground italic">Click to add description</span>}
                </div>
              )}
            </div>
            
            {/* Map/Cartoon Upload */}
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center relative group hover:border-primary/50 transition-colors">
              {question.hasDiagram && question.imageFileId && getImageUrl(question.imageFileId) ? (
                <div className="relative">
                  <SafeImage
                    src={getImageUrl(question.imageFileId)!}
                    alt="Map or Cartoon"
                    width={600}
                    height={400}
                    className="mx-auto rounded shadow-md"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => document.getElementById(fileInputId)?.click()}
                    className="absolute top-2 right-2 bg-background/80 hover:bg-background backdrop-blur-sm"
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground" />
                  <div>
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById(fileInputId)?.click()}
                      className="hover:bg-muted transition-colors"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Map/Cartoon
                    </Button>
                  </div>
                </div>
              )}
              <input
                id={fileInputId}
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const fileId = await onImageUpload(file, question.id);
                    if (fileId) {
                      onUpdateQuestion(section.id, question.id, { imageFileId: fileId, hasDiagram: true });
                    }
                  }
                }}
              />
            </div>
            
            {/* Sub-questions */}
            {(question.subQuestions?.length || 0) === 0 ? (
              <div className="text-center py-4 text-muted-foreground text-sm border border-dashed border-border rounded-lg p-4 mt-4">
                No sub-questions. Add a sub-question to continue.
              </div>
            ) : (
              (question.subQuestions || []).map((subQ, subQIndex) => {
                const subQType = subQ.type || 'normal';
                return (
                  <div key={`${section.id}-${question.id}-${subQ.id}-${subQIndex}`} className="mb-4 p-3 border border-border rounded group mt-4">
                    <div className="flex items-start gap-3 mb-3">
                      <span className="font-medium min-w-[60px]">{subQ.number}</span>
                      <div className="flex-1">
                        {editingId === subQ.id && editingField === 'text' ? (
                          <Textarea
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            onBlur={() => saveEdit(section.id, question.id, subQ.id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && e.ctrlKey) {
                                saveEdit(section.id, question.id, subQ.id);
                              }
                            }}
                            autoFocus
                            rows={2}
                            className="min-h-[60px] bg-background border-border"
                          />
                        ) : (
                          <div
                            onClick={() => startEditing(subQ.id, 'text', subQ.text)}
                            className="cursor-text hover:bg-muted/50 p-2 rounded min-h-[60px] border border-transparent hover:border-border transition-colors"
                          >
                            {subQ.text || <span className="text-muted-foreground italic">Click to edit question text</span>}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {renderQuestionTypeSelector(
                          subQType,
                          (value: QuestionType) => {
                            const updates: any = { type: value };
                            if (value === 'multiple-choice' && !subQ.options) {
                              updates.options = ['', '', '', ''];
                            }
                            if ((value === 'table' || value === 'table-interpretation') && !subQ.tableData) {
                              updates.tableData = { headers: ['', ''], rows: [['', '']] };
                            }
                            if ((value === 'graph' || value === 'graph-interpretation') && !subQ.graphData) {
                              updates.graphData = { type: 'line', dataPoints: [], xAxisLabel: '', yAxisLabel: '', showLegend: false, showGrid: true };
                            }
                            if ((value === 'diagram-interpretation' || value === 'diagram-labeling' || value === 'diagram') && !subQ.hasDiagram) {
                              updates.hasDiagram = true;
                            }
                            if ((value === 'extract-source' || value === 'extract') && !subQ.extractText) {
                              updates.extractText = '';
                            }
                            if (value === 'matching-pairing' && !subQ.tableData) {
                              updates.tableData = { headers: ['Column A', 'Column B'], rows: [['', ''], ['', '']] };
                            }
                            onUpdateSubQuestion(section.id, question.id, subQ.id, updates);
                          },
                          "h-7 w-48 text-xs"
                        )}
                        <span className="text-sm font-medium">({typeof subQ.marks === 'number' ? subQ.marks : parseInt(String(subQ.marks)) || 0} {(typeof subQ.marks === 'number' ? subQ.marks : parseInt(String(subQ.marks)) || 0) === 1 ? 'mark' : 'marks'})</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteSubQuestion(section.id, question.id, subQ.id)}
                          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    {renderSubQuestionContent(subQ, subQIndex)}
                  </div>
                );
              })
            )}
          </div>
        );
      }
      
      // Visual types - DATA SET ANALYSIS
      case 'data-set-analysis': {
        // Data Set Analysis uses table structure
        const tableData = question.tableData || { headers: ['Variable 1', 'Variable 2', 'Result'], rows: [['', '', ''], ['', '', '']], description: 'Analyze the data set provided.' };
        
        return (
          <div className="space-y-4">
            {/* Main Question Text */}
            <div className="mb-4">
              {editingId === questionEditId && editingField === 'text' ? (
                <Textarea
                  value={editingValue}
                  onChange={(e) => setEditingValue(e.target.value)}
                  onBlur={() => {
                    onUpdateQuestion(section.id, question.id, { text: editingValue });
                    saveEdit(section.id, question.id);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.ctrlKey) {
                      onUpdateQuestion(section.id, question.id, { text: editingValue });
                      saveEdit(section.id, question.id);
                    }
                  }}
                  autoFocus
                  rows={4}
                  className="min-h-[100px] bg-background border-border"
                  placeholder="Enter question text..."
                />
              ) : (
                <div
                  onClick={() => startEditing(questionEditId, 'text', question.text || '')}
                  className="cursor-text hover:bg-muted/50 p-4 rounded border border-transparent hover:border-border transition-colors min-h-[100px]"
                >
                  {question.text ? (
                    <p className="text-foreground whitespace-pre-wrap">{question.text}</p>
                  ) : (
                    <span className="text-muted-foreground italic">Click to add question text</span>
                  )}
                </div>
              )}
            </div>
            
            {/* Data Set Table Editor - Reuse table editor code */}
            <div className="border border-border rounded p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <TableIcon className="h-5 w-5 text-primary" />
                  <span className="font-semibold text-sm">Data Set</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newHeaders = [...tableData.headers, `Variable ${tableData.headers.length + 1}`];
                      onUpdateQuestion(section.id, question.id, {
                        tableData: { ...tableData, headers: newHeaders, rows: tableData.rows.map(row => [...row, '']) }
                      });
                    }}
                    className="h-7 text-xs"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Column
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const numCols = tableData.headers.length;
                      onUpdateQuestion(section.id, question.id, {
                        tableData: { ...tableData, rows: [...tableData.rows, Array(numCols).fill('')] }
                      });
                    }}
                    className="h-7 text-xs"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Row
                  </Button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-border">
                  <thead>
                    <tr className="bg-muted/10">
                      {tableData.headers.map((header, colIndex) => (
                        <th key={colIndex} className="border border-border p-2 relative group">
                          <div className="flex items-center gap-1">
                            <div className="flex-1">
                              <TableCellEditor
                                value={header}
                                onChange={(newValue) => {
                                  const newHeaders = [...tableData.headers];
                                  newHeaders[colIndex] = newValue;
                                  onUpdateQuestion(section.id, question.id, {
                                    tableData: { ...tableData, headers: newHeaders }
                                  });
                                }}
                                isHeader={true}
                                placeholder={`Variable ${colIndex + 1}`}
                              />
                            </div>
                            {tableData.headers.length > 1 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const newHeaders = tableData.headers.filter((_, i) => i !== colIndex);
                                  const newRows = tableData.rows.map(row => row.filter((_, i) => i !== colIndex));
                                  onUpdateQuestion(section.id, question.id, {
                                    tableData: { headers: newHeaders, rows: newRows }
                                  });
                                }}
                                className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.rows.map((row, rowIndex) => (
                      <tr key={rowIndex} className="hover:bg-muted/10 transition-colors group">
                        {row.map((cell, colIndex) => (
                          <td key={colIndex} className="border border-border p-1">
                            <TableCellEditor
                              value={cell}
                              onChange={(newValue) => {
                                const newRows = [...tableData.rows];
                                newRows[rowIndex] = [...newRows[rowIndex]];
                                newRows[rowIndex][colIndex] = newValue;
                                onUpdateQuestion(section.id, question.id, {
                                  tableData: { ...tableData, rows: newRows }
                                });
                              }}
                              placeholder="Data"
                            />
                          </td>
                        ))}
                        <td className="border border-border p-1 w-8">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newRows = tableData.rows.filter((_, i) => i !== rowIndex);
                              onUpdateQuestion(section.id, question.id, {
                                tableData: { ...tableData, rows: newRows }
                              });
                            }}
                            className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Sub-questions */}
            {(question.subQuestions?.length || 0) === 0 ? (
              <div className="text-center py-4 text-muted-foreground text-sm border border-dashed border-border rounded-lg p-4 mt-4">
                No sub-questions. Add a sub-question to continue.
              </div>
            ) : (
              (question.subQuestions || []).map((subQ, subQIndex) => {
                const subQType = subQ.type || 'normal';
                return (
                  <div key={`${section.id}-${question.id}-${subQ.id}-${subQIndex}`} className="mb-4 p-3 border border-border rounded group mt-4">
                    <div className="flex items-start gap-3 mb-3">
                      <span className="font-medium min-w-[60px]">{subQ.number}</span>
                      <div className="flex-1">
                        {editingId === subQ.id && editingField === 'text' ? (
                          <Textarea
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            onBlur={() => saveEdit(section.id, question.id, subQ.id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && e.ctrlKey) {
                                saveEdit(section.id, question.id, subQ.id);
                              }
                            }}
                            autoFocus
                            rows={2}
                            className="min-h-[60px] bg-background border-border"
                          />
                        ) : (
                          <div
                            onClick={() => startEditing(subQ.id, 'text', subQ.text)}
                            className="cursor-text hover:bg-muted/50 p-2 rounded min-h-[60px] border border-transparent hover:border-border transition-colors"
                          >
                            {subQ.text || <span className="text-muted-foreground italic">Click to edit question text</span>}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {renderQuestionTypeSelector(
                          subQType,
                          (value: QuestionType) => {
                            const updates: any = { type: value };
                            if (value === 'multiple-choice' && !subQ.options) {
                              updates.options = ['', '', '', ''];
                            }
                            if ((value === 'table' || value === 'table-interpretation') && !subQ.tableData) {
                              updates.tableData = { headers: ['', ''], rows: [['', '']] };
                            }
                            if ((value === 'graph' || value === 'graph-interpretation') && !subQ.graphData) {
                              updates.graphData = { type: 'line', dataPoints: [], xAxisLabel: '', yAxisLabel: '', showLegend: false, showGrid: true };
                            }
                            if ((value === 'diagram-interpretation' || value === 'diagram-labeling' || value === 'diagram') && !subQ.hasDiagram) {
                              updates.hasDiagram = true;
                            }
                            if ((value === 'extract-source' || value === 'extract') && !subQ.extractText) {
                              updates.extractText = '';
                            }
                            if (value === 'matching-pairing' && !subQ.tableData) {
                              updates.tableData = { headers: ['Column A', 'Column B'], rows: [['', ''], ['', '']] };
                            }
                            onUpdateSubQuestion(section.id, question.id, subQ.id, updates);
                          },
                          "h-7 w-48 text-xs"
                        )}
                        <span className="text-sm font-medium">({typeof subQ.marks === 'number' ? subQ.marks : parseInt(String(subQ.marks)) || 0} {(typeof subQ.marks === 'number' ? subQ.marks : parseInt(String(subQ.marks)) || 0) === 1 ? 'mark' : 'marks'})</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteSubQuestion(section.id, question.id, subQ.id)}
                          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    {renderSubQuestionContent(subQ, subQIndex)}
                  </div>
                );
              })
            )}
          </div>
        );
      }
      
      // Written types - all render as normal text questions
      case 'short-answer':
      case 'paragraph-long-answer':
      case 'reasoning-interpretation':
      case 'true-false-with-reason':
      case 'compare-evaluate-predict':
      case 'sequencing-ordering':
      // Objective types (except multiple-choice which is handled above)
      case 'matching-pairing':
      case 'fill-in-blank':
      // Calculation types - all render as normal text questions
      case 'numeric-calculation':
      case 'formula-based-calculation':
      case 'accounting-financial-calculation':
      case 'geography-scale-gradient':
      case 'biology-percentage-ratio':
      // Legacy
      case 'normal':
        // For all other question types, render main question text first, then sub-questions
        return (
          <div className="space-y-4">
            {/* Main Question Text */}
            <div className="mb-4">
              {editingId === questionEditId && editingField === 'text' ? (
                <Textarea
                  value={editingValue}
                  onChange={(e) => setEditingValue(e.target.value)}
                  onBlur={() => {
                    onUpdateQuestion(section.id, question.id, { text: editingValue });
                    saveEdit(section.id, question.id);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.ctrlKey) {
                      onUpdateQuestion(section.id, question.id, { text: editingValue });
                      saveEdit(section.id, question.id);
                    }
                  }}
                  autoFocus
                  rows={4}
                  className="min-h-[100px] bg-background border-border"
                  placeholder="Enter question text..."
                />
              ) : (
                <div
                  onClick={() => startEditing(questionEditId, 'text', question.text || '')}
                  className="cursor-text hover:bg-muted/50 p-4 rounded border border-transparent hover:border-border transition-colors min-h-[100px]"
                >
                  {question.text ? (
                    <p className="text-foreground whitespace-pre-wrap">{question.text}</p>
                  ) : (
                    <span className="text-muted-foreground italic">Click to add question text</span>
                  )}
                </div>
              )}
            </div>
            
            {/* Sub-questions */}
            {(question.subQuestions?.length || 0) === 0 ? (
              <div className="text-center py-4 text-muted-foreground text-sm border border-dashed border-border rounded-lg p-4">
                No sub-questions. Add a sub-question to continue.
              </div>
            ) : (
              (question.subQuestions || []).map((subQ, subQIndex) => {
                const subQType = subQ.type || 'normal';
                return (
                  <div key={`${section.id}-${question.id}-${subQ.id}-${subQIndex}`} className="mb-4 p-3 border border-border rounded group">
                    {/* Sub-Question Header with Type Selector */}
                    <div className="flex items-start gap-3 mb-3">
                      <span className="font-medium min-w-[60px]">{subQ.number}</span>
                      <div className="flex-1">
                        {editingId === subQ.id && editingField === 'text' ? (
                          <Textarea
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            onBlur={() => saveEdit(section.id, question.id, subQ.id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && e.ctrlKey) {
                                saveEdit(section.id, question.id, subQ.id);
                              }
                            }}
                            autoFocus
                            rows={2}
                            className="min-h-[60px] bg-background border-border"
                          />
                        ) : (
                          <div
                            onClick={() => startEditing(subQ.id, 'text', subQ.text)}
                            className="cursor-text hover:bg-muted/50 p-2 rounded min-h-[60px] border border-transparent hover:border-border transition-colors"
                          >
                            {subQ.text || <span className="text-muted-foreground italic">Click to edit question text</span>}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {renderQuestionTypeSelector(
                          subQType,
                          (value: QuestionType) => {
                            const updates: any = { type: value };
                            // Initialize type-specific data structures
                            if (value === 'multiple-choice' && !subQ.options) {
                              updates.options = ['', '', '', ''];
                            }
                            if ((value === 'table' || value === 'table-interpretation') && !subQ.tableData) {
                              updates.tableData = { headers: ['', ''], rows: [['', '']] };
                            }
                            if ((value === 'graph' || value === 'graph-interpretation') && !subQ.graphData) {
                              updates.graphData = { type: 'line', dataPoints: [], xAxisLabel: '', yAxisLabel: '', showLegend: false, showGrid: true };
                            }
                            if ((value === 'diagram-interpretation' || value === 'diagram-labeling' || value === 'diagram') && !subQ.hasDiagram) {
                              updates.hasDiagram = true;
                            }
                            if ((value === 'extract-source' || value === 'extract') && !subQ.extractText) {
                              updates.extractText = '';
                            }
                            if (value === 'matching-pairing' && !subQ.tableData) {
                              updates.tableData = { headers: ['Column A', 'Column B'], rows: [['', ''], ['', '']] };
                            }
                            onUpdateSubQuestion(section.id, question.id, subQ.id, updates);
                          },
                          "h-7 w-48 text-xs"
                        )}
                        <span className="text-sm font-medium">({typeof subQ.marks === 'number' ? subQ.marks : parseInt(String(subQ.marks)) || 0} {(typeof subQ.marks === 'number' ? subQ.marks : parseInt(String(subQ.marks)) || 0) === 1 ? 'mark' : 'marks'})</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteSubQuestion(section.id, question.id, subQ.id)}
                          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Render sub-question content based on its type */}
                    {renderSubQuestionContent(subQ, subQIndex)}
                  </div>
                );
              })
            )}
          </div>
        );

      case 'diagram-interpretation':
      case 'diagram-labeling':
      case 'diagram':
        return (
          <div className="space-y-4">
            {/* Diagram Description/Title */}
            <div className="border border-border rounded p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-primary" />
                  <span className="font-semibold text-sm">Diagram</span>
                </div>
              </div>
              
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Diagram Description or Title</label>
                {editingId === `${questionEditId}-diagramDesc` && editingField === 'diagramDescription' ? (
                  <Textarea
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    onBlur={() => {
                      onUpdateQuestion(section.id, question.id, {
                        diagramLabel: editingValue
                      });
                      saveEdit(section.id, question.id);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.ctrlKey) {
                        onUpdateQuestion(section.id, question.id, {
                          diagramLabel: editingValue
                        });
                        saveEdit(section.id, question.id);
                      }
                    }}
                    autoFocus
                    rows={3}
                    className="bg-background border-border"
                    placeholder="Describe the diagram or provide diagram title..."
                  />
                ) : (
                  <div
                    onClick={() => startEditing(`${questionEditId}-diagramDesc`, 'diagramDescription', question.diagramLabel || '')}
                    className="cursor-text hover:bg-muted/50 p-3 rounded border border-transparent hover:border-border transition-colors min-h-[60px]"
                  >
                    {question.diagramLabel || <span className="text-muted-foreground italic">Click to add description or title</span>}
                  </div>
                )}
              </div>
            </div>
            
            {question.instructionText && (
              <div className="mb-4">
                {editingId === questionEditId && editingField === 'instructionText' ? (
                  <Textarea
                    value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                    onBlur={() => saveEdit(section.id, question.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.ctrlKey) {
                        saveEdit(section.id, question.id);
                      }
                    }}
                    autoFocus
                    rows={2}
                    className="bg-background border-border"
                  />
                ) : (
                  <div
                    onClick={() => startEditing(questionEditId, 'instructionText', question.instructionText || '')}
                    className="cursor-text hover:bg-muted/50 p-2 rounded border border-transparent hover:border-border transition-colors"
                  >
                    {question.instructionText || <span className="text-muted-foreground italic">Click to add instruction text</span>}
                  </div>
                )}
              </div>
            )}
            
            {/* Diagram Placeholder */}
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center relative group hover:border-primary/50 transition-colors">
              {question.hasDiagram && question.imageFileId && getImageUrl(question.imageFileId) ? (
                <div className="relative">
                  <SafeImage
                    src={getImageUrl(question.imageFileId)!}
                    alt="Diagram"
                    width={600}
                    height={400}
                    className="mx-auto rounded shadow-md"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute top-2 right-2 bg-background/80 hover:bg-background backdrop-blur-sm"
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground" />
                  <div>
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="hover:bg-muted transition-colors"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Diagram
                    </Button>
                  </div>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const fileId = await onImageUpload(file, question.id);
                    if (fileId) {
                      onUpdateQuestion(section.id, question.id, { imageFileId: fileId, hasDiagram: true });
                    }
                  }
                }}
              />
            </div>

            {/* Sub-questions - using unified rendering */}
            <div className="space-y-4 mt-4">
              {(question.subQuestions?.length || 0) === 0 ? (
                <div className="text-center py-4 text-muted-foreground text-sm border border-dashed border-border rounded-lg p-4">
                  No sub-questions. Add a sub-question to continue.
                </div>
              ) : (
                (question.subQuestions || []).map((subQ, subQIndex) => {
                  const subQType = subQ.type || 'normal';
                  return (
                    <div key={`${section.id}-${question.id}-${subQ.id}-${subQIndex}`} className="mb-4 p-3 border border-border rounded group">
                      {/* Sub-Question Header with Type Selector */}
                      <div className="flex items-start gap-3 mb-3">
                        <span className="font-medium min-w-[60px]">{subQ.number}</span>
                  <div className="flex-1">
                    {editingId === subQ.id && editingField === 'text' ? (
                      <Textarea
                        value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                        onBlur={() => saveEdit(section.id, question.id, subQ.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && e.ctrlKey) {
                            saveEdit(section.id, question.id, subQ.id);
                          }
                        }}
                        autoFocus
                        rows={2}
                              className="min-h-[60px] bg-background border-border"
                      />
                    ) : (
                      <div
                        onClick={() => startEditing(subQ.id, 'text', subQ.text)}
                              className="cursor-text hover:bg-muted/50 p-2 rounded min-h-[60px] border border-transparent hover:border-border transition-colors"
                      >
                              {subQ.text || <span className="text-muted-foreground italic">Click to edit question text</span>}
                      </div>
                    )}
                  </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {renderQuestionTypeSelector(
                          subQType,
                          (value: QuestionType) => {
                            const updates: any = { type: value };
                            // Initialize type-specific data structures
                            if (value === 'multiple-choice' && !subQ.options) {
                              updates.options = ['', '', '', ''];
                            }
                            if ((value === 'table' || value === 'table-interpretation') && !subQ.tableData) {
                              updates.tableData = { headers: ['', ''], rows: [['', '']] };
                            }
                            if ((value === 'graph' || value === 'graph-interpretation') && !subQ.graphData) {
                              updates.graphData = { type: 'line', dataPoints: [], xAxisLabel: '', yAxisLabel: '', showLegend: false, showGrid: true };
                            }
                            if ((value === 'diagram-interpretation' || value === 'diagram-labeling' || value === 'diagram') && !subQ.hasDiagram) {
                              updates.hasDiagram = true;
                            }
                            if ((value === 'extract-source' || value === 'extract') && !subQ.extractText) {
                              updates.extractText = '';
                            }
                            if (value === 'matching-pairing' && !subQ.tableData) {
                              updates.tableData = { headers: ['Column A', 'Column B'], rows: [['', ''], ['', '']] };
                            }
                            onUpdateSubQuestion(section.id, question.id, subQ.id, updates);
                          },
                          "h-7 w-48 text-xs"
                        )}
                          <span className="text-sm font-medium">({typeof subQ.marks === 'number' ? subQ.marks : parseInt(String(subQ.marks)) || 0} {(typeof subQ.marks === 'number' ? subQ.marks : parseInt(String(subQ.marks)) || 0) === 1 ? 'mark' : 'marks'})</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDeleteSubQuestion(section.id, question.id, subQ.id)}
                            className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                </div>
                      </div>
                      
                      {/* Render sub-question content based on its type */}
                      {renderSubQuestionContent(subQ, subQIndex)}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );

      case 'extract-source':
      case 'extract':
      case 'case-study':
        return (
          <div className="space-y-4">
            {/* Extract Block */}
            <div className="border border-border rounded p-4">
              {editingId === questionEditId && editingField === 'extractText' ? (
                <Textarea
                  value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                  onBlur={() => saveEdit(section.id, question.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.ctrlKey) {
                      saveEdit(section.id, question.id);
                    }
                  }}
                  autoFocus
                  rows={6}
                  className="bg-background border-border min-h-[120px]"
                />
              ) : (
                <div
                  onClick={() => startEditing(questionEditId, 'extractText', question.extractText || '')}
                  className="cursor-text hover:bg-muted/50 p-3 rounded border border-transparent hover:border-border transition-colors min-h-[120px]"
                >
                  {question.extractText || <span className="text-muted-foreground italic">Click to add extract text</span>}
                </div>
              )}
            </div>

            {/* Sub-questions - using unified rendering */}
            <div className="space-y-4 mt-4">
              {(question.subQuestions?.length || 0) === 0 ? (
                <div className="text-center py-4 text-muted-foreground text-sm border border-dashed border-border rounded-lg p-4">
                  No sub-questions. Add a sub-question to continue.
                </div>
              ) : (
                (question.subQuestions || []).map((subQ, subQIndex) => {
                  const subQType = subQ.type || 'normal';
                  return (
                    <div key={`${section.id}-${question.id}-${subQ.id}-${subQIndex}`} className="mb-4 p-3 border border-border rounded group">
                      {/* Sub-Question Header with Type Selector */}
                      <div className="flex items-start gap-3 mb-3">
                        <span className="font-medium min-w-[60px]">{subQ.number}</span>
                  <div className="flex-1">
                    {editingId === subQ.id && editingField === 'text' ? (
                      <Textarea
                        value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                        onBlur={() => saveEdit(section.id, question.id, subQ.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && e.ctrlKey) {
                            saveEdit(section.id, question.id, subQ.id);
                          }
                        }}
                        autoFocus
                        rows={2}
                              className="min-h-[60px] bg-background border-border"
                      />
                    ) : (
                      <div
                        onClick={() => startEditing(subQ.id, 'text', subQ.text)}
                              className="cursor-text hover:bg-muted/50 p-2 rounded min-h-[60px] border border-transparent hover:border-border transition-colors"
                      >
                              {subQ.text || <span className="text-muted-foreground italic">Click to edit question text</span>}
                      </div>
                    )}
                  </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {renderQuestionTypeSelector(
                          subQType,
                          (value: QuestionType) => {
                            const updates: any = { type: value };
                            // Initialize type-specific data structures
                            if (value === 'multiple-choice' && !subQ.options) {
                              updates.options = ['', '', '', ''];
                            }
                            if ((value === 'table' || value === 'table-interpretation') && !subQ.tableData) {
                              updates.tableData = { headers: ['', ''], rows: [['', '']] };
                            }
                            if ((value === 'graph' || value === 'graph-interpretation') && !subQ.graphData) {
                              updates.graphData = { type: 'line', dataPoints: [], xAxisLabel: '', yAxisLabel: '', showLegend: false, showGrid: true };
                            }
                            if ((value === 'diagram-interpretation' || value === 'diagram-labeling' || value === 'diagram') && !subQ.hasDiagram) {
                              updates.hasDiagram = true;
                            }
                            if ((value === 'extract-source' || value === 'extract') && !subQ.extractText) {
                              updates.extractText = '';
                            }
                            if (value === 'matching-pairing' && !subQ.tableData) {
                              updates.tableData = { headers: ['Column A', 'Column B'], rows: [['', ''], ['', '']] };
                            }
                            onUpdateSubQuestion(section.id, question.id, subQ.id, updates);
                          },
                          "h-7 w-48 text-xs"
                        )}
                          <span className="text-sm font-medium">({typeof subQ.marks === 'number' ? subQ.marks : parseInt(String(subQ.marks)) || 0} {(typeof subQ.marks === 'number' ? subQ.marks : parseInt(String(subQ.marks)) || 0) === 1 ? 'mark' : 'marks'})</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDeleteSubQuestion(section.id, question.id, subQ.id)}
                            className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                </div>
                      </div>
                      
                      {/* Render sub-question content based on its type */}
                      {renderSubQuestionContent(subQ, subQIndex)}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );

      case 'table-interpretation':
      case 'table':
        const currentSubject = question.tableSubject || '';
        const currentTableType = question.tableType || '';
        const availableSubjects = getSubjects();
        const availableTableTypes = currentSubject ? getTableTypesForSubject(currentSubject) : [];
        
        // Initialize tableData: use existing, or apply template if subject/type is set, or use default
        let tableData = question.tableData;
        if (!tableData || !tableData.headers || !tableData.rows) {
          if (currentSubject && currentTableType) {
            // Try to apply template if subject and type are set
            const template = getTableTemplate(currentSubject, currentTableType);
            if (template) {
              tableData = {
                headers: [...template.headers],
                rows: template.rows.map(row => [...row]),
                description: template.description || ''
              };
            } else {
              // Fallback to default
              tableData = { headers: ['Column 1', 'Column 2'], rows: [['', ''], ['', '']], description: '' };
            }
          } else {
            // Default table structure
            tableData = { headers: ['Column 1', 'Column 2'], rows: [['', ''], ['', '']], description: '' };
          }
        } else {
          // Ensure headers and rows are arrays even if they exist
          tableData = {
            ...tableData,
            headers: Array.isArray(tableData.headers) ? tableData.headers : ['Column 1', 'Column 2'],
            rows: Array.isArray(tableData.rows) ? tableData.rows : [['', ''], ['', '']]
          };
        }
        
        return (
          <div className="space-y-4">
            {/* Table Description/Title */}
            <div className="border border-border rounded p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <TableIcon className="h-5 w-5 text-primary" />
                  <span className="font-semibold text-sm">Table</span>
                </div>
              </div>
              
              {/* Subject and Table Type Selectors */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Subject</label>
                  <Select
                    value={currentSubject}
                    onValueChange={(value) => {
                      // Reset table type when subject changes
                      onUpdateQuestion(section.id, question.id, {
                        tableSubject: value,
                        tableType: '',
                        tableData: { headers: ['Column 1', 'Column 2'], rows: [['', ''], ['', '']], description: '' }
                      });
                    }}
                  >
                    <SelectTrigger className="h-8 text-xs bg-background border-border">
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSubjects.map((subject) => (
                        <SelectItem key={subject} value={subject}>
                          {subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {currentSubject && (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Table Type</label>
                    <Select
                      value={currentTableType}
                      onValueChange={(value) => {
                        const template = getTableTemplate(currentSubject, value);
                        if (template) {
                          // Apply template when table type is selected
                          onUpdateQuestion(section.id, question.id, {
                            tableType: value,
                            tableData: {
                              headers: [...template.headers],
                              rows: template.rows.map(row => [...row]),
                              description: template.description || ''
                            }
                          });
                        } else {
                          onUpdateQuestion(section.id, question.id, {
                            tableType: value
                          });
                        }
                      }}
                    >
                      <SelectTrigger className="h-8 text-xs bg-background border-border">
                        <SelectValue placeholder="Select table type" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableTableTypes.map((tableType) => (
                          <SelectItem key={tableType} value={tableType}>
                            {tableType}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Table Description or Title</label>
                {editingId === `${questionEditId}-tableDesc` && editingField === 'tableDescription' ? (
                  <Textarea
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    onBlur={() => {
                      onUpdateQuestion(section.id, question.id, {
                        tableData: { ...tableData, description: editingValue } as { headers: string[]; rows: string[][]; description?: string; }
                      });
                      saveEdit(section.id, question.id);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.ctrlKey) {
                        onUpdateQuestion(section.id, question.id, {
                          tableData: { ...tableData, description: editingValue } as { headers: string[]; rows: string[][]; description?: string; }
                        });
                        saveEdit(section.id, question.id);
                      }
                    }}
                    autoFocus
                    rows={3}
                    className="bg-background border-border"
                    placeholder="Describe the table or provide table title..."
                  />
                ) : (
                  <div
                    onClick={() => startEditing(`${questionEditId}-tableDesc`, 'tableDescription', (tableData as any).description || '')}
                    className="cursor-text hover:bg-muted/50 p-3 rounded border border-transparent hover:border-border transition-colors min-h-[60px]"
                  >
                    {(tableData as any).description || <span className="text-muted-foreground italic">Click to add description or title</span>}
                  </div>
                )}
              </div>
            </div>
            
            {question.instructionText && (
              <div className="mb-4">
                {editingId === questionEditId && editingField === 'instructionText' ? (
                  <Textarea
                    value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                    onBlur={() => saveEdit(section.id, question.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.ctrlKey) {
                        saveEdit(section.id, question.id);
                      }
                    }}
                    autoFocus
                    rows={2}
                    className="bg-background border-border"
                  />
                ) : (
                  <div
                    onClick={() => startEditing(questionEditId, 'instructionText', question.instructionText || '')}
                    className="cursor-text hover:bg-muted/50 p-2 rounded border border-transparent hover:border-border transition-colors"
                  >
                    {question.instructionText || <span className="text-muted-foreground italic">Click to add instruction</span>}
                  </div>
                )}
              </div>
            )}
            
            {/* Table Editor */}
            <div className="border border-border rounded p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <TableIcon className="h-5 w-5 text-primary" />
                  <span className="font-semibold text-sm">Table Data</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newHeaders = [...tableData.headers, `Column ${tableData.headers.length + 1}`];
                      onUpdateQuestion(section.id, question.id, {
                        tableData: { ...tableData, headers: newHeaders, rows: tableData.rows.map(row => [...row, '']) }
                      });
                    }}
                    className="h-7 text-xs"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Column
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const numCols = tableData.headers.length;
                      onUpdateQuestion(section.id, question.id, {
                        tableData: { ...tableData, rows: [...tableData.rows, Array(numCols).fill('')] }
                      });
                    }}
                    className="h-7 text-xs"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Row
                  </Button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-border">
                  <thead>
                    <tr className="bg-muted/10">
                      {tableData.headers.map((header, colIndex) => (
                        <th key={colIndex} className="border border-border p-2 relative group">
                          <div className="flex items-center gap-1">
                            <div className="flex-1">
                              <TableCellEditor
                                value={header}
                                onChange={(newValue) => {
                                  const newHeaders = [...tableData.headers];
                                  newHeaders[colIndex] = newValue;
                                  onUpdateQuestion(section.id, question.id, {
                                    tableData: { ...tableData, headers: newHeaders }
                                  });
                                }}
                                isHeader={true}
                                placeholder={`Column ${colIndex + 1}`}
                              />
                            </div>
                            {tableData.headers.length > 1 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const newHeaders = tableData.headers.filter((_, i) => i !== colIndex);
                                  const newRows = tableData.rows.map(row => row.filter((_, i) => i !== colIndex));
                                  onUpdateQuestion(section.id, question.id, {
                                    tableData: { headers: newHeaders, rows: newRows }
                                  });
                                }}
                                className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                          {/* Resize handle */}
                          <div
                            className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/50 opacity-0 group-hover:opacity-100 transition-opacity"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              const startX = e.clientX;
                              const startWidth = e.currentTarget.parentElement?.offsetWidth || 0;
                              const th = e.currentTarget.parentElement as HTMLTableCellElement;
                              
                              const handleMouseMove = (moveEvent: MouseEvent) => {
                                const diff = moveEvent.clientX - startX;
                                const newWidth = Math.max(50, startWidth + diff);
                                th.style.width = `${newWidth}px`;
                                th.style.minWidth = `${newWidth}px`;
                              };
                              
                              const handleMouseUp = () => {
                                document.removeEventListener('mousemove', handleMouseMove);
                                document.removeEventListener('mouseup', handleMouseUp);
                              };
                              
                              document.addEventListener('mousemove', handleMouseMove);
                              document.addEventListener('mouseup', handleMouseUp);
                            }}
                          />
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.rows.map((row, rowIndex) => (
                      <tr key={rowIndex} className="hover:bg-muted/10 transition-colors group">
                        {row.map((cell, colIndex) => (
                          <td key={colIndex} className="border border-border p-1">
                            <TableCellEditor
                              value={cell}
                              onChange={(newValue) => {
                                const newRows = [...tableData.rows];
                                newRows[rowIndex] = [...newRows[rowIndex]];
                                newRows[rowIndex][colIndex] = newValue;
                                onUpdateQuestion(section.id, question.id, {
                                  tableData: { ...tableData, rows: newRows }
                                });
                              }}
                              placeholder="Cell"
                            />
                          </td>
                        ))}
                        <td className="border border-border p-1 w-8">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newRows = tableData.rows.filter((_, i) => i !== rowIndex);
                              onUpdateQuestion(section.id, question.id, {
                                tableData: { ...tableData, rows: newRows }
                              });
                            }}
                            className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Sub-questions - using unified rendering */}
            <div className="space-y-4 mt-4">
              {(question.subQuestions?.length || 0) === 0 ? (
                <div className="text-center py-4 text-muted-foreground text-sm border border-dashed border-border rounded-lg p-4">
                  No sub-questions. Add a sub-question to continue.
                </div>
              ) : (
                (question.subQuestions || []).map((subQ, subQIndex) => {
                  const subQType = subQ.type || 'normal';
                  return (
                    <div key={`${section.id}-${question.id}-${subQ.id}-${subQIndex}`} className="mb-4 p-3 border border-border rounded group">
                      {/* Sub-Question Header with Type Selector */}
                      <div className="flex items-start gap-3 mb-3">
                        <span className="font-medium min-w-[60px]">{subQ.number}</span>
                  <div className="flex-1">
                    {editingId === subQ.id && editingField === 'text' ? (
                      <Textarea
                        value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                        onBlur={() => saveEdit(section.id, question.id, subQ.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && e.ctrlKey) {
                            saveEdit(section.id, question.id, subQ.id);
                          }
                        }}
                        autoFocus
                        rows={2}
                              className="min-h-[60px] bg-background border-border"
                      />
                    ) : (
                      <div
                        onClick={() => startEditing(subQ.id, 'text', subQ.text)}
                              className="cursor-text hover:bg-muted/50 p-2 rounded min-h-[60px] border border-transparent hover:border-border transition-colors"
                      >
                              {subQ.text || <span className="text-muted-foreground italic">Click to edit question text</span>}
                      </div>
                    )}
                  </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {renderQuestionTypeSelector(
                          subQType,
                          (value: QuestionType) => {
                            const updates: any = { type: value };
                            // Initialize type-specific data structures
                            if (value === 'multiple-choice' && !subQ.options) {
                              updates.options = ['', '', '', ''];
                            }
                            if ((value === 'table' || value === 'table-interpretation') && !subQ.tableData) {
                              updates.tableData = { headers: ['', ''], rows: [['', '']] };
                            }
                            if ((value === 'graph' || value === 'graph-interpretation') && !subQ.graphData) {
                              updates.graphData = { type: 'line', dataPoints: [], xAxisLabel: '', yAxisLabel: '', showLegend: false, showGrid: true };
                            }
                            if ((value === 'diagram-interpretation' || value === 'diagram-labeling' || value === 'diagram') && !subQ.hasDiagram) {
                              updates.hasDiagram = true;
                            }
                            if ((value === 'extract-source' || value === 'extract') && !subQ.extractText) {
                              updates.extractText = '';
                            }
                            if (value === 'matching-pairing' && !subQ.tableData) {
                              updates.tableData = { headers: ['Column A', 'Column B'], rows: [['', ''], ['', '']] };
                            }
                            onUpdateSubQuestion(section.id, question.id, subQ.id, updates);
                          },
                          "h-7 w-48 text-xs"
                        )}
                          <span className="text-sm font-medium">({typeof subQ.marks === 'number' ? subQ.marks : parseInt(String(subQ.marks)) || 0} {(typeof subQ.marks === 'number' ? subQ.marks : parseInt(String(subQ.marks)) || 0) === 1 ? 'mark' : 'marks'})</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDeleteSubQuestion(section.id, question.id, subQ.id)}
                            className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                </div>
                      </div>
                      
                      {/* Render sub-question content based on its type */}
                      {renderSubQuestionContent(subQ, subQIndex)}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );

      case 'graph-interpretation':
      case 'graph':
        const currentGraphSubject = question.graphSubject || '';
        const currentGraphType = question.graphType || '';
        const availableGraphSubjects = getGraphSubjects();
        const availableGraphTypes = currentGraphSubject ? getGraphTypesForSubject(currentGraphSubject) : [];
        // Check if Math subject (handle both 'Math' and 'Mathematics')
        const isMathSubject = currentGraphSubject === 'Math' || 
                             currentGraphSubject === 'Mathematics' || 
                             currentGraphSubject.toLowerCase() === 'math' ||
                             currentGraphSubject.toLowerCase() === 'mathematics';
        const isCartesianGraphType = currentGraphType === 'Cartesian Coordinate System';
        
        // Initialize graphData: use existing, or apply template if subject/type is set but no data exists
        let graphData = question.graphData;
        
        // If we have a subject and type but no graphData, try to load template
        // Otherwise, if graphData exists but is missing fields, ensure it has defaults
        if (!graphData || !graphData.type) {
          if (currentGraphSubject && currentGraphType) {
            // Try to apply template if subject and type are set
            const template = getGraphTemplate(currentGraphSubject, currentGraphType);
            if (template) {
              graphData = {
                type: template.type,
                description: template.description || '',
                xAxisLabel: template.xAxisLabel || '',
                yAxisLabel: template.yAxisLabel || '',
                y2AxisLabel: template.y2AxisLabel || '',
                dataPoints: template.dataPoints.map(dp => ({ 
                  label: String(dp.label || ''),
                  value: dp.value !== undefined && dp.value !== null ? dp.value : '',
                  value2: dp.value2 !== undefined && dp.value2 !== null ? dp.value2 : undefined,
                })),
                showLegend: template.showLegend !== undefined ? template.showLegend : true,
                showGrid: template.showGrid !== undefined ? template.showGrid : true,
              };
            } else {
              // Fallback to default
              graphData = { 
                type: 'line',
                description: '', 
                dataPoints: [],
                xAxisLabel: '',
                yAxisLabel: '',
                showLegend: false,
                showGrid: true,
              };
            }
          } else {
            // Default graph structure
            graphData = { 
              type: 'line',
              description: '', 
              dataPoints: [],
              xAxisLabel: '',
              yAxisLabel: '',
              showLegend: false,
              showGrid: true,
            };
          }
        }
        
        // Ensure graphData has all required fields
        const safeGraphData = {
          type: graphData.type || 'line',
          description: graphData.description || '',
          xAxisLabel: graphData.xAxisLabel || '',
          yAxisLabel: graphData.yAxisLabel || '',
          y2AxisLabel: graphData.y2AxisLabel || '',
          dataPoints: graphData.dataPoints || [],
          showLegend: graphData.showLegend !== undefined ? graphData.showLegend : true,
          showGrid: graphData.showGrid !== undefined ? graphData.showGrid : true,
        };
        
        const isDualAxis = safeGraphData.type === 'dual-axis';
        
        return (
          <div className="space-y-4">
            {/* Graph Editor */}
            <div className="border border-border rounded p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <span className="font-semibold text-sm">Graph</span>
                </div>
              </div>
              
              {/* Subject and Graph Type Selectors */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Subject</label>
                  <Select
                    value={currentGraphSubject}
                    onValueChange={(value) => {
                      // Reset graph type when subject changes
                      onUpdateQuestion(section.id, question.id, {
                        graphSubject: value,
                        graphType: '',
                        graphData: { 
                          type: 'line',
                          description: '', 
                          dataPoints: [],
                          xAxisLabel: '',
                          yAxisLabel: '',
                          showLegend: false,
                          showGrid: true,
                        }
                      });
                    }}
                  >
                    <SelectTrigger className="h-8 text-xs bg-background border-border">
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableGraphSubjects.map((subject) => (
                        <SelectItem key={subject} value={subject}>
                          {subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {currentGraphSubject && (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Graph Type</label>
                    <Select
                      value={currentGraphType}
                      onValueChange={(value) => {
                        const template = getGraphTemplate(currentGraphSubject, value);
                        if (template) {
                          // Apply template when graph type is selected
                          onUpdateQuestion(section.id, question.id, {
                            graphType: value,
                            graphData: {
                              type: template.type,
                              description: template.description || '',
                              xAxisLabel: template.xAxisLabel || '',
                              yAxisLabel: template.yAxisLabel || '',
                              y2AxisLabel: template.y2AxisLabel || '',
                              dataPoints: template.dataPoints.map(dp => ({ ...dp })),
                              showLegend: template.showLegend !== undefined ? template.showLegend : true,
                              showGrid: template.showGrid !== undefined ? template.showGrid : true,
                            }
                          });
                        } else {
                          onUpdateQuestion(section.id, question.id, {
                            graphType: value
                          });
                        }
                      }}
                    >
                      <SelectTrigger className="h-8 text-xs bg-background border-border">
                        <SelectValue placeholder="Select graph type" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableGraphTypes.map((graphType) => (
                          <SelectItem key={graphType} value={graphType}>
                            {graphType}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Graph Description</label>
                  {editingId === `${questionEditId}-graphDesc` && editingField === 'graphDescription' ? (
                    <Textarea
                      value={editingValue}
                      onChange={(e) => setEditingValue(e.target.value)}
                      onBlur={() => {
                        onUpdateQuestion(section.id, question.id, {
                          graphData: { ...safeGraphData, description: editingValue }
                        });
                        saveEdit(section.id, question.id);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.ctrlKey) {
                          onUpdateQuestion(section.id, question.id, {
                            graphData: { ...safeGraphData, description: editingValue }
                          });
                          saveEdit(section.id, question.id);
                        }
                      }}
                      autoFocus
                      rows={3}
                      className="bg-background border-border"
                      placeholder="Describe the graph or provide graph instructions..."
                    />
                  ) : (
                    <div
                      onClick={() => startEditing(`${questionEditId}-graphDesc`, 'graphDescription', safeGraphData.description || '')}
                      className="cursor-text hover:bg-muted/50 p-3 rounded border border-transparent hover:border-border transition-colors min-h-[60px]"
                    >
                      {safeGraphData.description || <span className="text-muted-foreground italic">Click to add graph description or instructions</span>}
                    </div>
                  )}
                </div>
                
                {/* Axes Labels */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">X-Axis Label</label>
                    <Input
                      value={safeGraphData.xAxisLabel}
                      onChange={(e) => {
                        onUpdateQuestion(section.id, question.id, {
                          graphData: { ...safeGraphData, xAxisLabel: e.target.value }
                        });
                      }}
                      className="bg-background border-border text-sm h-8"
                      placeholder="X-axis label"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Y-Axis Label</label>
                    <Input
                      value={safeGraphData.yAxisLabel}
                      onChange={(e) => {
                        onUpdateQuestion(section.id, question.id, {
                          graphData: { ...safeGraphData, yAxisLabel: e.target.value }
                        });
                      }}
                      className="bg-background border-border text-sm h-8"
                      placeholder="Y-axis label"
                    />
                  </div>
                </div>
                
                {isDualAxis && (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Y2-Axis Label (Right)</label>
                    <Input
                      value={safeGraphData.y2AxisLabel || ''}
                      onChange={(e) => {
                        onUpdateQuestion(section.id, question.id, {
                          graphData: { ...safeGraphData, y2AxisLabel: e.target.value }
                        });
                      }}
                      className="bg-background border-border text-sm h-8"
                      placeholder="Y2-axis label"
                    />
                  </div>
                )}
                
                {/* Graph Type Selector */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Graph Type</label>
                  <Select
                    value={safeGraphData.type}
                    onValueChange={(value) => {
                      onUpdateQuestion(section.id, question.id, {
                        graphData: { ...safeGraphData, type: value as any }
                      });
                    }}
                  >
                    <SelectTrigger className="h-8 text-xs bg-background border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="line">Line Graph</SelectItem>
                      <SelectItem value="bar">Bar Chart</SelectItem>
                      <SelectItem value="pie">Pie Chart</SelectItem>
                      <SelectItem value="scatter">Scatter Plot</SelectItem>
                      <SelectItem value="dual-axis">Dual-Axis Graph</SelectItem>
                      {isMathSubject && (
                        <SelectItem value="cartesian">Cartesian Coordinate System</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            {/* Cartesian Coordinate System - Only show when selected as graph type */}
            {isMathSubject && isCartesianGraphType && (
              <div className="border-2 border-primary/50 rounded-lg p-4 bg-primary/5 mt-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    <span className="font-semibold text-base">Cartesian Coordinate System</span>
                  </div>
                </div>
                
                {(() => {
                  const coordinateData = question.coordinateSystem || {
                    xMin: -10,
                    xMax: 10,
                    yMin: -10,
                    yMax: 10,
                    gridStep: 1,
                    showGrid: true,
                    showAxes: true,
                    showLabels: true,
                    points: [],
                    lines: [],
                    annotations: [],
                  };

                  return (
                    <CartesianCoordinateSystem
                      data={coordinateData}
                      onUpdate={(updatedData) => {
                        onUpdateQuestion(section.id, question.id, {
                          coordinateSystem: updatedData,
                        });
                      }}
                      width={600}
                      height={600}
                    />
                  );
                })()}
              </div>
            )}

            {/* Interactive Graph Visualization - Hide for Cartesian Coordinate System */}
            {!isCartesianGraphType && (
              <div className="border border-border rounded p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    <span className="font-semibold text-sm">Interactive Graph Editor</span>
                  </div>
                </div>
                
                <InteractiveGraphEditor
                  graphData={safeGraphData}
                  onUpdate={(updates) => {
                    onUpdateQuestion(section.id, question.id, {
                      graphData: { ...safeGraphData, ...updates }
                    });
                  }}
                />
              </div>
            )}
            
            {/* Data Points Editor - Hide for Cartesian Coordinate System */}
            {!isCartesianGraphType && (
            <div className="border border-border rounded p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <span className="font-semibold text-sm">Data Points</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newDataPoint: any = { label: '', value: '' };
                    if (isDualAxis) {
                      newDataPoint.value2 = '';
                    }
                    const newDataPoints = [...(safeGraphData.dataPoints || []), newDataPoint];
                    onUpdateQuestion(section.id, question.id, {
                      graphData: { ...safeGraphData, dataPoints: newDataPoints }
                    });
                  }}
                  className="h-6 text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Point
                </Button>
              </div>
              
              <div className="space-y-2 max-h-40 overflow-y-auto">
                    {(safeGraphData.dataPoints || []).map((point: any, index: number) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          value={point.label || ''}
                          onChange={(e) => {
                            const newDataPoints = [...(safeGraphData.dataPoints || [])];
                            newDataPoints[index] = { ...newDataPoints[index], label: e.target.value };
                            onUpdateQuestion(section.id, question.id, {
                              graphData: { ...safeGraphData, dataPoints: newDataPoints }
                            });
                          }}
                          className="bg-background border-border text-sm h-7 flex-1"
                          placeholder="Label"
                        />
                        <Input
                          type="number"
                          value={point.value || ''}
                          onChange={(e) => {
                            const newDataPoints = [...(safeGraphData.dataPoints || [])];
                            const value = e.target.value === '' ? '' : (isNaN(Number(e.target.value)) ? e.target.value : Number(e.target.value));
                            newDataPoints[index] = { ...newDataPoints[index], value };
                            onUpdateQuestion(section.id, question.id, {
                              graphData: { ...safeGraphData, dataPoints: newDataPoints }
                            });
                          }}
                          className="bg-background border-border text-sm h-7 w-20"
                          placeholder="Value"
                        />
                        {isDualAxis && (
                          <Input
                            type="number"
                            value={point.value2 || ''}
                            onChange={(e) => {
                              const newDataPoints = [...(safeGraphData.dataPoints || [])];
                              const value2 = e.target.value === '' ? '' : (isNaN(Number(e.target.value)) ? e.target.value : Number(e.target.value));
                              newDataPoints[index] = { ...newDataPoints[index], value2 };
                              onUpdateQuestion(section.id, question.id, {
                                graphData: { ...safeGraphData, dataPoints: newDataPoints }
                              });
                            }}
                            className="bg-background border-border text-sm h-7 w-20"
                            placeholder="Value 2"
                          />
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newDataPoints = (safeGraphData.dataPoints || []).filter((_: any, i: number) => i !== index);
                            onUpdateQuestion(section.id, question.id, {
                              graphData: { ...safeGraphData, dataPoints: newDataPoints }
                            });
                          }}
                          className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    {(safeGraphData.dataPoints || []).length === 0 && (
                      <p className="text-xs text-muted-foreground italic text-center py-2">
                        No data points. Click "Add Point" to add graph data.
                      </p>
                    )}
              </div>
            </div>
            )}
            
            {question.instructionText && (
              <div className="mb-4">
                {editingId === questionEditId && editingField === 'instructionText' ? (
                  <Textarea
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    onBlur={() => saveEdit(section.id, question.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.ctrlKey) {
                        saveEdit(section.id, question.id);
                      }
                    }}
                    autoFocus
                    rows={2}
                    className="bg-background border-border"
                  />
                ) : (
                  <div
                    onClick={() => startEditing(questionEditId, 'instructionText', question.instructionText || '')}
                    className="cursor-text hover:bg-muted/50 p-2 rounded border border-transparent hover:border-border transition-colors"
                  >
                    {question.instructionText || <span className="text-muted-foreground italic">Click to add instruction</span>}
                  </div>
                )}
              </div>
            )}

            {/* Sub-questions - using unified rendering */}
            <div className="space-y-4 mt-4">
              {(question.subQuestions?.length || 0) === 0 ? (
                <div className="text-center py-4 text-muted-foreground text-sm border border-dashed border-border rounded-lg p-4">
                  No sub-questions. Add a sub-question to continue.
                </div>
              ) : (
                (question.subQuestions || []).map((subQ, subQIndex) => {
                  const subQType = subQ.type || 'normal';
                  return (
                    <div key={`${section.id}-${question.id}-${subQ.id}-${subQIndex}`} className="mb-4 p-3 border border-border rounded group">
                      {/* Sub-Question Header with Type Selector */}
                      <div className="flex items-start gap-3 mb-3">
                        <span className="font-medium min-w-[60px]">{subQ.number}</span>
                  <div className="flex-1">
                    {editingId === subQ.id && editingField === 'text' ? (
                      <Textarea
                        value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                        onBlur={() => saveEdit(section.id, question.id, subQ.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && e.ctrlKey) {
                            saveEdit(section.id, question.id, subQ.id);
                          }
                        }}
                        autoFocus
                        rows={2}
                              className="min-h-[60px] bg-background border-border"
                      />
                    ) : (
                      <div
                        onClick={() => startEditing(subQ.id, 'text', subQ.text)}
                              className="cursor-text hover:bg-muted/50 p-2 rounded min-h-[60px] border border-transparent hover:border-border transition-colors"
                      >
                              {subQ.text || <span className="text-muted-foreground italic">Click to edit question text</span>}
                      </div>
                    )}
                  </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {renderQuestionTypeSelector(
                          subQType,
                          (value: QuestionType) => {
                            const updates: any = { type: value };
                            // Initialize type-specific data structures
                            if (value === 'multiple-choice' && !subQ.options) {
                              updates.options = ['', '', '', ''];
                            }
                            if ((value === 'table' || value === 'table-interpretation') && !subQ.tableData) {
                              updates.tableData = { headers: ['', ''], rows: [['', '']] };
                            }
                            if ((value === 'graph' || value === 'graph-interpretation') && !subQ.graphData) {
                              updates.graphData = { type: 'line', dataPoints: [], xAxisLabel: '', yAxisLabel: '', showLegend: false, showGrid: true };
                            }
                            if ((value === 'diagram-interpretation' || value === 'diagram-labeling' || value === 'diagram') && !subQ.hasDiagram) {
                              updates.hasDiagram = true;
                            }
                            if ((value === 'extract-source' || value === 'extract') && !subQ.extractText) {
                              updates.extractText = '';
                            }
                            if (value === 'matching-pairing' && !subQ.tableData) {
                              updates.tableData = { headers: ['Column A', 'Column B'], rows: [['', ''], ['', '']] };
                            }
                            onUpdateSubQuestion(section.id, question.id, subQ.id, updates);
                          },
                          "h-7 w-48 text-xs"
                        )}
                          <span className="text-sm font-medium">({typeof subQ.marks === 'number' ? subQ.marks : parseInt(String(subQ.marks)) || 0} {(typeof subQ.marks === 'number' ? subQ.marks : parseInt(String(subQ.marks)) || 0) === 1 ? 'mark' : 'marks'})</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDeleteSubQuestion(section.id, question.id, subQ.id)}
                            className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                </div>
                      </div>
                      
                      {/* Render sub-question content based on its type */}
                      {renderSubQuestionContent(subQ, subQIndex)}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-3">
            {question.instructionText && (
              <div className="mb-2">
                {editingId === questionEditId && editingField === 'instructionText' ? (
                  <Textarea
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    onBlur={() => saveEdit(section.id, question.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.ctrlKey) {
                        saveEdit(section.id, question.id);
                      }
                    }}
                    autoFocus
                    rows={2}
                    className="bg-background border-border"
                  />
                ) : (
                  <div
                    onClick={() => startEditing(questionEditId, 'instructionText', question.instructionText || '')}
                    className="cursor-text hover:bg-muted p-2 rounded border border-transparent hover:border-border"
                  >
                    {question.instructionText || <span className="text-muted-foreground italic">Click to add instruction</span>}
                  </div>
                )}
              </div>
            )}
            {/* Sub-questions - using unified rendering */}
            <div className="space-y-4 mt-4">
              {(question.subQuestions?.length || 0) === 0 ? (
                <div className="text-center py-4 text-muted-foreground text-sm border border-dashed border-border rounded-lg p-4">
                  No sub-questions. Add a sub-question to continue.
                </div>
              ) : (
                (question.subQuestions || []).map((subQ, subQIndex) => {
                  const subQType = subQ.type || 'normal';
                  return (
                    <div key={`${section.id}-${question.id}-${subQ.id}-${subQIndex}`} className="mb-4 p-3 border border-border rounded group">
                      {/* Sub-Question Header with Type Selector */}
                      <div className="flex items-start gap-3 mb-3">
                        <span className="font-medium min-w-[60px]">{subQ.number}</span>
                <div className="flex-1">
                  {editingId === subQ.id && editingField === 'text' ? (
                    <Textarea
                      value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                      onBlur={() => saveEdit(section.id, question.id, subQ.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.ctrlKey) {
                          saveEdit(section.id, question.id, subQ.id);
                        }
                      }}
                      autoFocus
                              rows={2}
                              className="min-h-[60px] bg-background border-border"
                    />
                  ) : (
                    <div
                      onClick={() => startEditing(subQ.id, 'text', subQ.text)}
                              className="cursor-text hover:bg-muted/50 p-2 rounded min-h-[60px] border border-transparent hover:border-border transition-colors"
                    >
                      {subQ.text || <span className="text-muted-foreground italic">Click to edit question text</span>}
                    </div>
                  )}
                </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {renderQuestionTypeSelector(
                          subQType,
                          (value: QuestionType) => {
                            const updates: any = { type: value };
                            // Initialize type-specific data structures
                            if (value === 'multiple-choice' && !subQ.options) {
                              updates.options = ['', '', '', ''];
                            }
                            if ((value === 'table' || value === 'table-interpretation') && !subQ.tableData) {
                              updates.tableData = { headers: ['', ''], rows: [['', '']] };
                            }
                            if ((value === 'graph' || value === 'graph-interpretation') && !subQ.graphData) {
                              updates.graphData = { type: 'line', dataPoints: [], xAxisLabel: '', yAxisLabel: '', showLegend: false, showGrid: true };
                            }
                            if ((value === 'diagram-interpretation' || value === 'diagram-labeling' || value === 'diagram') && !subQ.hasDiagram) {
                              updates.hasDiagram = true;
                            }
                            if ((value === 'extract-source' || value === 'extract') && !subQ.extractText) {
                              updates.extractText = '';
                            }
                            if (value === 'matching-pairing' && !subQ.tableData) {
                              updates.tableData = { headers: ['Column A', 'Column B'], rows: [['', ''], ['', '']] };
                            }
                            onUpdateSubQuestion(section.id, question.id, subQ.id, updates);
                          },
                          "h-7 w-48 text-xs"
                        )}
                          <span className="text-sm font-medium">({typeof subQ.marks === 'number' ? subQ.marks : parseInt(String(subQ.marks)) || 0} {(typeof subQ.marks === 'number' ? subQ.marks : parseInt(String(subQ.marks)) || 0) === 1 ? 'mark' : 'marks'})</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteSubQuestion(section.id, question.id, subQ.id)}
                            className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
                      
                      {/* Render sub-question content based on its type */}
                      {renderSubQuestionContent(subQ, subQIndex)}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      }
    };

  return (
    <div className="relative mb-6 group pl-4 py-2 hover:bg-muted/10 rounded transition-colors">
      {/* Question Header with Controls */}
      <div className="flex items-start gap-4 mb-2">
        <div className="flex items-center gap-2 min-w-[100px]">
          <span className="text-lg font-bold">{question.number}</span>
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-2">
              {renderQuestionTypeSelector(
                question.type,
                (value: QuestionType) => {
                  const updates: any = { type: value };
                  // Initialize type-specific data structures with proper defaults
                  if (value === 'multiple-choice' && !question.options) {
                    updates.options = ['', '', '', ''];
                  }
                  if ((value === 'table' || value === 'table-interpretation') && !question.tableData) {
                    updates.tableData = { headers: ['Column 1', 'Column 2'], rows: [['', ''], ['', '']], description: '' };
                  }
                  if ((value === 'graph' || value === 'graph-interpretation') && !question.graphData) {
                    updates.graphData = { 
                      type: 'line', 
                      dataPoints: [
                        { label: 'Point 1', value: 10 },
                        { label: 'Point 2', value: 20 },
                      ], 
                      xAxisLabel: 'X Axis', 
                      yAxisLabel: 'Y Axis', 
                      showLegend: true, 
                      showGrid: true 
                    };
                  }
                  if ((value === 'diagram-interpretation' || value === 'diagram-labeling' || value === 'diagram') && !question.hasDiagram) {
                    updates.hasDiagram = true;
                    updates.diagramLabel = updates.diagramLabel || 'Study the diagram carefully';
                  }
                  if ((value === 'extract-source' || value === 'extract' || value === 'case-study') && !question.extractText) {
                    updates.extractText = 'Read the extract below and answer the questions that follow.';
                  }
                  if (value === 'matching-pairing' && !question.tableData) {
                    updates.tableData = { headers: ['Column A', 'Column B'], rows: [['', ''], ['', ''], ['', '']], description: 'Match each item in Column A with its corresponding item in Column B.' };
                  }
                  if (value === 'data-set-analysis' && !question.tableData) {
                    updates.tableData = { headers: ['Variable 1', 'Variable 2', 'Result'], rows: [['', '', ''], ['', '', '']], description: 'Analyze the data set provided.' };
                  }
                  onUpdateQuestion(section.id, question.id, updates);
                },
                "h-7 w-48 text-xs"
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenPresetDialog(section.id, question.id, question.type)}
                className="h-7 w-7 p-0"
                title="Apply preset to this question"
              >
                <Sparkles className="h-3 w-3" />
              </Button>
            </div>
            {/* Editable Marks */}
            {editingId === `${questionEditId}-marks` && editingField === 'marks' ? (
              <Input
                type="number"
                value={editingValue}
                onChange={(e) => setEditingValue(e.target.value)}
                onBlur={() => {
                  const marksValue = parseInt(editingValue) || 0;
                  onUpdateQuestion(section.id, question.id, { marks: marksValue });
                  saveEdit(section.id, question.id);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const marksValue = parseInt(editingValue) || 0;
                    onUpdateQuestion(section.id, question.id, { marks: marksValue });
                    saveEdit(section.id, question.id);
                  }
                }}
                autoFocus
                className="w-16 h-7 bg-background border-border text-xs"
                min="0"
              />
            ) : (
              <span
                onClick={() => startEditing(`${questionEditId}-marks`, 'marks', (typeof question.marks === 'number' ? question.marks : parseInt(String(question.marks)) || 0).toString())}
                className="text-sm font-medium cursor-text hover:bg-muted/50 px-2 py-1 rounded border border-transparent hover:border-border transition-colors"
              >
                ({(typeof question.marks === 'number' ? question.marks : parseInt(String(question.marks)) || 0)} {(typeof question.marks === 'number' ? question.marks : parseInt(String(question.marks)) || 0) === 1 ? 'mark' : 'marks'})
              </span>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDeleteQuestion(section.id, question.id)}
              className="h-7 w-7 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Question Content */}
      <div className="ml-4">{renderQuestionContent()}</div>

      {/* Add Sub-Question Button */}
      <div className="ml-4 mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onAddSubQuestion(section.id, question.id)}
          className="h-8 px-4 text-sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Sub-Question
        </Button>
      </div>

      {/* Question Total Marks */}
      {(question.subQuestions?.length || 0) > 0 && (
        <div className="ml-4 mt-2 text-right text-sm text-muted-foreground">
          Question Total: {((typeof question.marks === 'number' ? question.marks : parseInt(String(question.marks)) || 0) + (question.subQuestions || []).reduce((sum, sq) => sum + (typeof sq.marks === 'number' ? sq.marks : parseInt(String(sq.marks)) || 0), 0))} marks
        </div>
      )}
    </div>
  );
}
