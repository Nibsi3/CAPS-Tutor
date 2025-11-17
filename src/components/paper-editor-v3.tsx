'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Save, 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  Eye,
  Edit,
  Download,
  Upload
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Question types as per CAPS syllabus
export const QUESTION_TYPES = {
  multiple_choice: 'Multiple Choice',
  short_answer: 'Short Answer',
  long_answer: 'Long Answer / Essay',
  diagram: 'Diagram / Image-based',
  true_false: 'True/False',
  matching: 'Matching',
  calculation: 'Calculation',
  fill_in: 'Fill in the Blank'
} as const;

export type QuestionType = keyof typeof QUESTION_TYPES;

export interface Question {
  number: string;
  type: QuestionType;
  question: string;
  marks: number;
  options?: string[];
  answer?: string;
  hasImage: boolean;
  image?: string; // Data URI
  imageFilename?: string;
  page?: number;
}

export interface PaperMetadata {
  subject: string;
  grade: number;
  paper: string;
  year: number;
  isMemo?: boolean;
}

export interface ExtractedPaper {
  filename: string;
  metadata: PaperMetadata;
  questions: Question[];
  images?: Array<{
    filename: string;
    dataUri: string;
    page: number;
  }>;
  totalPages: number;
  totalQuestions: number;
  totalImages: number;
}

interface PaperEditorV3Props {
  initialData?: ExtractedPaper;
  onSave?: (paper: ExtractedPaper) => void;
  onExport?: (paper: ExtractedPaper) => void;
}

export function PaperEditorV3({ initialData, onSave, onExport }: PaperEditorV3Props) {
  const { toast } = useToast();
  const [paper, setPaper] = useState<ExtractedPaper | null>(initialData || null);
  const [selectedQuestion, setSelectedQuestion] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  // Load paper from JSON file
  const handleLoadJson = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        setPaper(json);
        toast({
          title: 'Paper Loaded',
          description: `Loaded ${json.totalQuestions} questions from ${json.filename}`
        });
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to parse JSON file'
        });
      }
    };
    reader.readAsText(file);
  };

  // Save paper
  const handleSave = () => {
    if (!paper) return;
    
    if (onSave) {
      onSave(paper);
    }
    
    toast({
      title: 'Paper Saved',
      description: 'All changes have been saved successfully'
    });
  };

  // Export paper as JSON
  const handleExport = () => {
    if (!paper) return;

    const json = JSON.stringify(paper, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${paper.filename.replace('.pdf', '')}_edited.json`;
    link.click();
    URL.revokeObjectURL(url);

    if (onExport) {
      onExport(paper);
    }

    toast({
      title: 'Paper Exported',
      description: 'Paper exported as JSON successfully'
    });
  };

  // Update metadata
  const updateMetadata = (field: keyof PaperMetadata, value: any) => {
    if (!paper) return;
    setPaper({
      ...paper,
      metadata: {
        ...paper.metadata,
        [field]: value
      }
    });
  };

  // Update question
  const updateQuestion = (index: number, updates: Partial<Question>) => {
    if (!paper) return;
    const newQuestions = [...paper.questions];
    newQuestions[index] = { ...newQuestions[index], ...updates };
    setPaper({
      ...paper,
      questions: newQuestions,
      totalQuestions: newQuestions.length
    });
  };

  // Add new question
  const addQuestion = () => {
    if (!paper) return;
    const newQuestion: Question = {
      number: `${paper.questions.length + 1}.1`,
      type: 'short_answer',
      question: '',
      marks: 1,
      hasImage: false
    };
    setPaper({
      ...paper,
      questions: [...paper.questions, newQuestion],
      totalQuestions: paper.questions.length + 1
    });
    setSelectedQuestion(paper.questions.length);
    setIsEditing(true);
  };

  // Delete question
  const deleteQuestion = (index: number) => {
    if (!paper) return;
    const newQuestions = paper.questions.filter((_, i) => i !== index);
    setPaper({
      ...paper,
      questions: newQuestions,
      totalQuestions: newQuestions.length
    });
    setSelectedQuestion(null);
  };

  // Add option to MCQ
  const addOption = (questionIndex: number) => {
    if (!paper) return;
    const question = paper.questions[questionIndex];
    const options = question.options || [];
    updateQuestion(questionIndex, {
      options: [...options, '']
    });
  };

  // Update option
  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    if (!paper) return;
    const question = paper.questions[questionIndex];
    const options = [...(question.options || [])];
    options[optionIndex] = value;
    updateQuestion(questionIndex, { options });
  };

  // Delete option
  const deleteOption = (questionIndex: number, optionIndex: number) => {
    if (!paper) return;
    const question = paper.questions[questionIndex];
    const options = (question.options || []).filter((_, i) => i !== optionIndex);
    updateQuestion(questionIndex, { options });
  };

  if (!paper) {
    return (
      <Card className="w-full max-w-4xl mx-auto mt-8">
        <CardHeader>
          <CardTitle>Paper Editor v3</CardTitle>
          <CardDescription>Load an extracted paper JSON to begin editing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Upload className="h-12 w-12 text-muted-foreground" />
            <Label htmlFor="json-upload" className="cursor-pointer">
              <div className="flex flex-col items-center space-y-2">
                <Button variant="outline">Load Paper JSON</Button>
                <span className="text-sm text-muted-foreground">
                  Select an extracted paper JSON file
                </span>
              </div>
            </Label>
            <Input
              id="json-upload"
              type="file"
              accept=".json"
              onChange={handleLoadJson}
              className="hidden"
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  const selectedQ = selectedQuestion !== null ? paper.questions[selectedQuestion] : null;

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Paper Editor v3</h1>
              <p className="text-sm text-muted-foreground">
                {paper.metadata.subject} • Grade {paper.metadata.grade} • {paper.metadata.paper} • {paper.metadata.year}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewMode(!previewMode)}
              >
                {previewMode ? <Edit className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                {previewMode ? 'Edit' : 'Preview'}
              </Button>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button size="sm" onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Question List */}
        <div className="w-80 border-r bg-card flex flex-col">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Questions ({paper.totalQuestions})</h2>
              <Button size="sm" variant="outline" onClick={addQuestion}>
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
            
            {/* Metadata Editor */}
            <div className="space-y-2 text-sm">
              <div>
                <Label className="text-xs">Subject</Label>
                <Input
                  value={paper.metadata.subject}
                  onChange={(e) => updateMetadata('subject', e.target.value)}
                  className="h-8"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Grade</Label>
                  <Input
                    type="number"
                    value={paper.metadata.grade}
                    onChange={(e) => updateMetadata('grade', parseInt(e.target.value))}
                    className="h-8"
                  />
                </div>
                <div>
                  <Label className="text-xs">Year</Label>
                  <Input
                    type="number"
                    value={paper.metadata.year}
                    onChange={(e) => updateMetadata('year', parseInt(e.target.value))}
                    className="h-8"
                  />
                </div>
              </div>
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-2">
              {paper.questions.map((question, index) => (
                <div
                  key={index}
                  className={`p-3 mb-2 rounded-lg cursor-pointer transition-colors ${
                    selectedQuestion === index
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                  onClick={() => {
                    setSelectedQuestion(index);
                    setIsEditing(false);
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{question.number}</span>
                        <Badge variant="outline" className="text-xs">
                          {question.marks}m
                        </Badge>
                        {question.hasImage && (
                          <ImageIcon className="h-3 w-3" />
                        )}
                      </div>
                      <p className="text-xs mt-1 line-clamp-2">
                        {question.question || '(empty question)'}
                      </p>
                      <span className="text-xs opacity-70 mt-1">
                        {QUESTION_TYPES[question.type]}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Main Content - Question Editor */}
        <div className="flex-1 overflow-auto">
          {selectedQ ? (
            <div className="container max-w-4xl mx-auto p-6">
              {previewMode ? (
                /* Preview Mode */
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Question {selectedQ.number}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge>{QUESTION_TYPES[selectedQ.type]}</Badge>
                        <Badge variant="outline">{selectedQ.marks} marks</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedQ.hasImage && selectedQ.image && (
                      <div className="rounded-lg border p-4 bg-muted">
                        <img 
                          src={selectedQ.image} 
                          alt="Question diagram"
                          className="max-w-full h-auto rounded"
                        />
                      </div>
                    )}
                    
                    <div className="prose prose-sm max-w-none">
                      <p className="whitespace-pre-wrap">{selectedQ.question}</p>
                    </div>

                    {selectedQ.type === 'multiple_choice' && selectedQ.options && (
                      <div className="space-y-2">
                        {selectedQ.options.map((option, idx) => (
                          <div key={idx} className="flex items-start gap-2 p-2 rounded border">
                            <span className="font-semibold">{String.fromCharCode(65 + idx)}.</span>
                            <span>{option}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {selectedQ.answer && (
                      <div className="mt-6 p-4 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                        <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">Answer:</h4>
                        <p className="text-green-800 dark:text-green-200 whitespace-pre-wrap">
                          {selectedQ.answer}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                /* Edit Mode */
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Edit Question {selectedQ.number}</CardTitle>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteQuestion(selectedQuestion)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>Question Number</Label>
                        <Input
                          value={selectedQ.number}
                          onChange={(e) => updateQuestion(selectedQuestion, { number: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Type</Label>
                        <Select
                          value={selectedQ.type}
                          onValueChange={(value) => updateQuestion(selectedQuestion, { type: value as QuestionType })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(QUESTION_TYPES).map(([key, label]) => (
                              <SelectItem key={key} value={key}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Marks</Label>
                        <Input
                          type="number"
                          value={selectedQ.marks}
                          onChange={(e) => updateQuestion(selectedQuestion, { marks: parseInt(e.target.value) || 1 })}
                        />
                      </div>
                    </div>

                    {/* Question Text */}
                    <div>
                      <Label>Question Text</Label>
                      <Textarea
                        value={selectedQ.question}
                        onChange={(e) => updateQuestion(selectedQuestion, { question: e.target.value })}
                        rows={6}
                        placeholder="Enter question text..."
                      />
                    </div>

                    {/* Multiple Choice Options */}
                    {selectedQ.type === 'multiple_choice' && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label>Options</Label>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => addOption(selectedQuestion)}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Option
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {(selectedQ.options || []).map((option, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <span className="font-semibold w-8">
                                {String.fromCharCode(65 + idx)}.
                              </span>
                              <Input
                                value={option}
                                onChange={(e) => updateOption(selectedQuestion, idx, e.target.value)}
                                placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                              />
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deleteOption(selectedQuestion, idx)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Image */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Label>Has Image/Diagram</Label>
                        <input
                          type="checkbox"
                          checked={selectedQ.hasImage}
                          onChange={(e) => updateQuestion(selectedQuestion, { hasImage: e.target.checked })}
                          className="rounded"
                        />
                      </div>
                      {selectedQ.hasImage && selectedQ.image && (
                        <div className="rounded-lg border p-4 bg-muted">
                          <img 
                            src={selectedQ.image} 
                            alt="Question diagram"
                            className="max-w-full h-auto rounded"
                          />
                          {selectedQ.imageFilename && (
                            <p className="text-sm text-muted-foreground mt-2">
                              {selectedQ.imageFilename}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Answer */}
                    <div>
                      <Label>Answer (Memo)</Label>
                      <Textarea
                        value={selectedQ.answer || ''}
                        onChange={(e) => updateQuestion(selectedQuestion, { answer: e.target.value })}
                        rows={4}
                        placeholder="Enter answer from memo..."
                      />
                    </div>

                    {/* Page Info */}
                    {selectedQ.page && (
                      <div className="text-sm text-muted-foreground">
                        Page {selectedQ.page} of {paper.totalPages}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a question to edit or preview</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - Statistics & Info */}
        <div className="w-64 border-l bg-card p-4">
          <h3 className="font-semibold mb-4">Paper Statistics</h3>
          <div className="space-y-4">
            <div>
              <Label className="text-xs text-muted-foreground">Total Questions</Label>
              <p className="text-2xl font-bold">{paper.totalQuestions}</p>
            </div>
            
            <Separator />
            
            <div>
              <Label className="text-xs text-muted-foreground">Total Marks</Label>
              <p className="text-2xl font-bold">
                {paper.questions.reduce((sum, q) => sum + q.marks, 0)}
              </p>
            </div>
            
            <Separator />
            
            <div>
              <Label className="text-xs text-muted-foreground">Total Images</Label>
              <p className="text-2xl font-bold">{paper.totalImages}</p>
            </div>
            
            <Separator />
            
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Question Types</Label>
              <div className="space-y-2">
                {Object.entries(
                  paper.questions.reduce((acc, q) => {
                    acc[q.type] = (acc[q.type] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)
                ).map(([type, count]) => (
                  <div key={type} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {QUESTION_TYPES[type as QuestionType]}
                    </span>
                    <span className="font-semibold">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaperEditorV3;
