'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Loader, FileText, Image as ImageIcon, Save, Upload, Eye, Edit2, X, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface ExtractedPage {
  page: number;
  text: string;
  images: ExtractedImage[];
}

interface ExtractedImage {
  path: string;
  filename: string;
  dataUri: string;
  width: number;
  height: number;
  rect: [number, number, number, number];
  label?: string | null;
}

interface ExtractedPaper {
  pdf: string;
  subject: string;
  grade: number;
  paper: string;
  year: number;
  pages: ExtractedPage[];
}

interface Question {
  number: string;
  type: 'short' | 'long' | 'multiple_choice' | 'fill_in' | 'diagram' | 'true_false' | 'matching';
  question: string;
  options?: string[];
  answer?: string | null;
  image?: string | null;
  image_label?: string | null;
  marks?: number;
}

interface ProcessedPaper {
  subject: string;
  grade: number;
  paper: string;
  year: number;
  questions: Question[];
}

export default function PaperEditorV3Page() {
  const { toast } = useToast();
  const [extractedPaper, setExtractedPaper] = useState<ExtractedPaper | null>(null);
  const [processedPaper, setProcessedPaper] = useState<ProcessedPaper | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<number | null>(null);
  const [questionPreview, setQuestionPreview] = useState<Question | null>(null);

  // Load extracted JSON file
  const handleFileUpload = async (file: File) => {
    if (!file.name.endsWith('_extracted.json')) {
      toast({
        variant: 'destructive',
        title: 'Invalid File',
        description: 'Please upload a file ending with "_extracted.json"',
      });
      return;
    }

    setLoading(true);
    try {
      const text = await file.text();
      const data: ExtractedPaper = JSON.parse(text);
      setExtractedPaper(data);
      setSelectedFile(file);
      
      toast({
        title: 'File Loaded',
        description: `Loaded ${data.pages.length} pages with ${data.pages.reduce((sum, p) => sum + p.images.length, 0)} images`,
      });
    } catch (error) {
      console.error('Error loading file:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load JSON file. Please check the file format.',
      });
    } finally {
      setLoading(false);
    }
  };

  // Generate questions from extracted paper
  const generateQuestions = async () => {
    if (!extractedPaper) return;

    setLoading(true);
    try {
      const response = await fetch('/api/generate-questions-from-extraction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ extractedPaper }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate questions');
      }

      const data: ProcessedPaper = await response.json();
      setProcessedPaper(data);
      
      toast({
        title: 'Questions Generated',
        description: `Generated ${data.questions.length} questions`,
      });
    } catch (error) {
      console.error('Error generating questions:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to generate questions. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  // Update question
  const updateQuestion = (index: number, updates: Partial<Question>) => {
    if (!processedPaper) return;
    
    const updated = { ...processedPaper };
    updated.questions[index] = { ...updated.questions[index], ...updates };
    setProcessedPaper(updated);
  };

  // Save processed paper
  const savePaper = async () => {
    if (!processedPaper) return;

    setLoading(true);
    try {
      const response = await fetch('/api/save-processed-paper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ processedPaper }),
      });

      if (!response.ok) {
        throw new Error('Failed to save paper');
      }

      toast({
        title: 'Paper Saved',
        description: 'The paper has been saved successfully',
      });
    } catch (error) {
      console.error('Error saving paper:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save paper. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const getQuestionTypeLabel = (type: Question['type']) => {
    const labels: Record<Question['type'], string> = {
      short: 'Short Answer',
      long: 'Long Answer',
      multiple_choice: 'Multiple Choice',
      fill_in: 'Fill in the Blank',
      diagram: 'Diagram',
      true_false: 'True/False',
      matching: 'Matching',
    };
    return labels[type] || type;
  };

  const getQuestionTypeColor = (type: Question['type']) => {
    const colors: Record<Question['type'], string> = {
      short: 'bg-blue-500',
      long: 'bg-purple-500',
      multiple_choice: 'bg-green-500',
      fill_in: 'bg-yellow-500',
      diagram: 'bg-pink-500',
      true_false: 'bg-orange-500',
      matching: 'bg-cyan-500',
    };
    return colors[type] || 'bg-gray-500';
  };

  const totalMarks = useMemo(() => {
    if (!processedPaper) return 0;
    return processedPaper.questions.reduce((sum, q) => sum + (q.marks || 0), 0);
  }, [processedPaper]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-6 h-6" />
            Paper Editor v3 - CAPS Aligned
          </CardTitle>
          <CardDescription>
            Load extracted JSON data and build a CAPS-aligned paper editor with question types and diagrams
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label htmlFor="json-file">Upload Extracted JSON File</Label>
              <Input
                id="json-file"
                type="file"
                accept=".json"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
                disabled={loading}
              />
            </div>
            {selectedFile && (
              <div className="text-sm text-muted-foreground">
                Loaded: {selectedFile.name}
              </div>
            )}
          </div>

          {extractedPaper && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
              <div>
                <Label className="text-xs text-muted-foreground">Subject</Label>
                <p className="font-semibold">{extractedPaper.subject}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Grade</Label>
                <p className="font-semibold">Grade {extractedPaper.grade}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Paper</Label>
                <p className="font-semibold">{extractedPaper.paper}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Year</Label>
                <p className="font-semibold">{extractedPaper.year}</p>
              </div>
            </div>
          )}

          {extractedPaper && !processedPaper && (
            <Button onClick={generateQuestions} disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Generating Questions...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Questions from Extraction
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      {processedPaper && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Paper Questions</CardTitle>
                <CardDescription>
                  {processedPaper.questions.length} questions • {totalMarks} total marks
                </CardDescription>
              </div>
              <Button onClick={savePaper} disabled={loading}>
                <Save className="w-4 h-4 mr-2" />
                Save Paper
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="editor" className="w-full">
              <TabsList>
                <TabsTrigger value="editor">Editor</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
                <TabsTrigger value="images">Images ({extractedPaper?.pages.reduce((sum, p) => sum + p.images.length, 0) || 0})</TabsTrigger>
              </TabsList>

              <TabsContent value="editor" className="space-y-4">
                <ScrollArea className="h-[600px] pr-4">
                  {processedPaper.questions.map((question, index) => (
                    <Card key={index} className="mb-4">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="font-mono">
                              {question.number}
                            </Badge>
                            <Badge className={getQuestionTypeColor(question.type)}>
                              {getQuestionTypeLabel(question.type)}
                            </Badge>
                            {question.marks && (
                              <Badge variant="secondary">
                                {question.marks} mark{question.marks !== 1 ? 's' : ''}
                              </Badge>
                            )}
                            {question.image && (
                              <Badge variant="outline" className="gap-1">
                                <ImageIcon className="w-3 h-3" />
                                Has Image
                              </Badge>
                            )}
                          </div>
                          <div className="flex gap-2">
                            {questionPreview?.number === question.number ? (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setQuestionPreview(null)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setQuestionPreview(question)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            )}
                            {editingQuestion === index ? (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingQuestion(null)}
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingQuestion(index)}
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {editingQuestion === index ? (
                          <div className="space-y-4">
                            <div>
                              <Label>Question Number</Label>
                              <Input
                                value={question.number}
                                onChange={(e) => updateQuestion(index, { number: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label>Question Type</Label>
                              <Select
                                value={question.type}
                                onValueChange={(value: Question['type']) => updateQuestion(index, { type: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="short">Short Answer</SelectItem>
                                  <SelectItem value="long">Long Answer</SelectItem>
                                  <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                                  <SelectItem value="fill_in">Fill in the Blank</SelectItem>
                                  <SelectItem value="diagram">Diagram</SelectItem>
                                  <SelectItem value="true_false">True/False</SelectItem>
                                  <SelectItem value="matching">Matching</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>Question Text</Label>
                              <Textarea
                                value={question.question}
                                onChange={(e) => updateQuestion(index, { question: e.target.value })}
                                rows={4}
                              />
                            </div>
                            {question.type === 'multiple_choice' && (
                              <div>
                                <Label>Options (one per line)</Label>
                                <Textarea
                                  value={question.options?.join('\n') || ''}
                                  onChange={(e) => {
                                    const options = e.target.value.split('\n').filter(o => o.trim());
                                    updateQuestion(index, { options });
                                  }}
                                  rows={4}
                                  placeholder="A. Option 1&#10;B. Option 2&#10;C. Option 3&#10;D. Option 4"
                                />
                              </div>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Marks</Label>
                                <Input
                                  type="number"
                                  value={question.marks || ''}
                                  onChange={(e) => updateQuestion(index, { marks: parseInt(e.target.value) || 0 })}
                                />
                              </div>
                              <div>
                                <Label>Answer</Label>
                                <Input
                                  value={question.answer || ''}
                                  onChange={(e) => updateQuestion(index, { answer: e.target.value })}
                                  placeholder="Answer (if available)"
                                />
                              </div>
                            </div>
                            {question.image && (
                              <div>
                                <Label>Image</Label>
                                <div className="mt-2">
                                  <img
                                    src={question.image}
                                    alt={question.image_label || 'Question image'}
                                    className="max-w-full h-auto rounded border"
                                  />
                                  {question.image_label && (
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {question.image_label}
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="prose max-w-none">
                              <p className="whitespace-pre-wrap">{question.question}</p>
                            </div>
                            {question.options && question.options.length > 0 && (
                              <div className="mt-4 space-y-1">
                                {question.options.map((option, optIndex) => (
                                  <div key={optIndex} className="text-sm pl-4">
                                    {option}
                                  </div>
                                ))}
                              </div>
                            )}
                            {question.image && (
                              <div className="mt-4">
                                <img
                                  src={question.image}
                                  alt={question.image_label || 'Question image'}
                                  className="max-w-full h-auto rounded border"
                                />
                                {question.image_label && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {question.image_label}
                                  </p>
                                )}
                              </div>
                            )}
                            {question.answer && (
                              <div className="mt-4 p-3 bg-muted rounded">
                                <Label className="text-xs text-muted-foreground">Answer</Label>
                                <p className="text-sm">{question.answer}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="preview" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Paper Preview</CardTitle>
                    <CardDescription>
                      {processedPaper.subject} - {processedPaper.paper} - {processedPaper.year}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none space-y-6">
                      {processedPaper.questions.map((question, index) => (
                        <div key={index} className="border-b pb-6 last:border-0">
                          <div className="flex items-start gap-2 mb-2">
                            <span className="font-bold">{question.number}.</span>
                            <Badge className={getQuestionTypeColor(question.type)}>
                              {getQuestionTypeLabel(question.type)}
                            </Badge>
                            {question.marks && (
                              <Badge variant="outline">
                                [{question.marks}]
                              </Badge>
                            )}
                          </div>
                          <p className="whitespace-pre-wrap">{question.question}</p>
                          {question.options && question.options.length > 0 && (
                            <div className="mt-3 space-y-1 ml-4">
                              {question.options.map((option, optIndex) => (
                                <div key={optIndex}>{option}</div>
                              ))}
                            </div>
                          )}
                          {question.image && (
                            <div className="mt-4">
                              <img
                                src={question.image}
                                alt={question.image_label || 'Question image'}
                                className="max-w-full h-auto rounded border"
                              />
                              {question.image_label && (
                                <p className="text-sm text-muted-foreground mt-1 italic">
                                  {question.image_label}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="images" className="space-y-4">
                <ScrollArea className="h-[600px]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {extractedPaper?.pages.map((page) =>
                      page.images.map((image, imgIndex) => (
                        <Card key={`${page.page}-${imgIndex}`}>
                          <CardHeader>
                            <CardTitle className="text-sm">
                              Page {page.page} - {image.filename}
                            </CardTitle>
                            {image.label && (
                              <CardDescription>{image.label}</CardDescription>
                            )}
                          </CardHeader>
                          <CardContent>
                            <img
                              src={image.dataUri}
                              alt={image.label || image.filename}
                              className="w-full h-auto rounded border"
                            />
                            <div className="mt-2 text-xs text-muted-foreground">
                              {image.width} × {image.height}px
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {questionPreview && (
        <Dialog open={!!questionPreview} onOpenChange={() => setQuestionPreview(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Question {questionPreview.number} Preview</DialogTitle>
              <DialogDescription>
                {getQuestionTypeLabel(questionPreview.type)} • {questionPreview.marks || 0} marks
              </DialogDescription>
            </DialogHeader>
            <div className="prose max-w-none">
              <p className="whitespace-pre-wrap">{questionPreview.question}</p>
              {questionPreview.options && questionPreview.options.length > 0 && (
                <div className="mt-4 space-y-2">
                  {questionPreview.options.map((option, index) => (
                    <div key={index} className="pl-4">{option}</div>
                  ))}
                </div>
              )}
              {questionPreview.image && (
                <div className="mt-4">
                  <img
                    src={questionPreview.image}
                    alt={questionPreview.image_label || 'Question image'}
                    className="max-w-full h-auto rounded border"
                  />
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
