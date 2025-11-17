'use client';

import { useCallback, useMemo, useState } from 'react';
import samplePaper from '@/data/paper-editor/sample-life-sciences.json';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Download, FileJson2, ImageIcon, RefreshCcw, Search, Upload } from 'lucide-react';

type PaperSection = {
  id: string;
  title: string;
  description?: string;
  totalMarks?: number;
  questionRange?: string;
};

type PaperImage = {
  id: string;
  filename?: string;
  label?: string;
  dataUri?: string;
};

type PaperQuestion = {
  number: string;
  sectionId?: string;
  type: string;
  marks: number;
  text: string;
  options?: string[];
  answer?: string;
  hasImage?: boolean;
  imageId?: string;
};

type PaperData = {
  subject: string;
  paper: string;
  year: number;
  grade: number;
  language?: string;
  sections?: PaperSection[];
  questions: PaperQuestion[];
  images?: PaperImage[];
};

const QUESTION_TYPES = [
  { value: 'multiple-choice', label: 'Multiple Choice' },
  { value: 'free-text', label: 'Structured Response' },
  { value: 'data-response', label: 'Data Response' },
  { value: 'diagram', label: 'Diagram / Labeling' },
  { value: 'essay', label: 'Essay / Extended' },
];

const FALLBACK_IMAGE =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAQAAACNbyblAAAALElEQVR42mP8z/C/HwMDAwNDw0AIiIiBNE0TAxEJw0gGphBqQBoAAJ4HC+Wcv16wAAAAASUVORK5CYII=';

export default function PaperEditorV3Page() {
  const [paperData, setPaperData] = useState<PaperData | null>(null);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [filterSection, setFilterSection] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loadError, setLoadError] = useState<string | null>(null);

  const selectedQuestion = useMemo(() => {
    if (!paperData || !selectedQuestionId) return null;
    return paperData.questions.find(q => q.number === selectedQuestionId) ?? null;
  }, [paperData, selectedQuestionId]);

  const sectionMap = useMemo(() => {
    if (!paperData?.sections) return new Map<string, PaperSection>();
    return new Map(paperData.sections.map(section => [section.id, section] as const));
  }, [paperData?.sections]);

  const sectionStatistics = useMemo(() => {
    if (!paperData) return [];
    return (paperData.sections ?? []).map(section => {
      const questions = paperData.questions.filter(q => q.sectionId === section.id);
      const marks = questions.reduce((sum, q) => sum + (q.marks ?? 0), 0);
      const expected = section.totalMarks ?? 0;
      const coverage = expected > 0 ? Math.min(100, Math.round((marks / expected) * 100)) : 0;
      return { ...section, marks, questionCount: questions.length, coverage };
    });
  }, [paperData]);

  const totalMarks = paperData?.questions.reduce((sum, q) => sum + (q.marks ?? 0), 0) ?? 0;

  const filteredQuestions = useMemo(() => {
    if (!paperData) return [];
    return paperData.questions.filter(question => {
      if (filterSection !== 'all' && question.sectionId !== filterSection) return false;
      if (filterType !== 'all' && question.type !== filterType) return false;
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const blob = `${question.number} ${question.text} ${question.answer ?? ''}`.toLowerCase();
        return blob.includes(term);
      }
      return true;
    });
  }, [paperData, filterSection, filterType, searchTerm]);

  const loadJson = useCallback((data: PaperData) => {
    setPaperData(data);
    setSelectedQuestionId(data.questions[0]?.number ?? null);
    setLoadError(null);
  }, []);

  const handleSampleLoad = () => {
    loadJson(samplePaper as PaperData);
  };

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string) as PaperData;
        if (!parsed.questions || parsed.questions.length === 0) {
          throw new Error('JSON is missing a questions array.');
        }
        loadJson(parsed);
      } catch (error) {
        console.error(error);
        setLoadError(error instanceof Error ? error.message : 'Unable to parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const updateQuestion = (changes: Partial<PaperQuestion>) => {
    if (!paperData || !selectedQuestion) return;
    const updatedQuestions = paperData.questions.map(question =>
      question.number === selectedQuestion.number ? { ...question, ...changes } : question
    );
    setPaperData({ ...paperData, questions: updatedQuestions });
  };

  const exportJson = () => {
    if (!paperData) return;
    const blob = new Blob([JSON.stringify(paperData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${paperData.subject.replace(/\s+/g, '_')}_${paperData.paper}_${paperData.year}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-headline">Paper Editor v3</h1>
        <p className="text-muted-foreground">
          Load extracted JSON data, validate the CAPS layout, and polish questions, diagrams, and marks before publishing.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Load JSON</CardTitle>
              <CardDescription>Upload an extracted JSON file or start from the curated sample.</CardDescription>
            </div>
            <FileJson2 className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="json-upload" className="flex items-center gap-2">
                <Upload className="h-4 w-4" /> Upload extracted JSON
              </Label>
              <Input id="json-upload" type="file" accept="application/json" onChange={handleFileInput} />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={handleSampleLoad}>
                Load Life Sciences sample
              </Button>
              <Button variant="outline" onClick={() => setPaperData(null)}>
                <RefreshCcw className="mr-2 h-4 w-4" />
                Reset workspace
              </Button>
              <Button variant="outline" onClick={exportJson} disabled={!paperData}>
                <Download className="mr-2 h-4 w-4" />
                Export JSON
              </Button>
            </div>
            {loadError && <p className="text-sm text-destructive">{loadError}</p>}
          </CardContent>
        </Card>

        {paperData && (
          <Card>
            <CardHeader>
              <CardTitle>Paper overview</CardTitle>
              <CardDescription>Metadata detected from the extracted JSON.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{paperData.subject}</Badge>
                <Badge variant="outline">{paperData.paper}</Badge>
                <Badge variant="outline">Grade {paperData.grade}</Badge>
                <Badge variant="outline">{paperData.year}</Badge>
                {paperData.language && <Badge variant="outline">{paperData.language}</Badge>}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Questions</span>
                <span className="font-semibold">{paperData.questions.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total marks (current)</span>
                <span className="font-semibold">{totalMarks}</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {paperData && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>CAPS section validation</CardTitle>
              <CardDescription>Ensure each section aligns with the official structure and mark allocations.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              {sectionStatistics.map(section => (
                <div key={section.id} className="space-y-3 rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{section.title}</p>
                      <p className="text-xs text-muted-foreground">{section.description}</p>
                    </div>
                    <Badge variant={section.coverage >= 90 ? 'default' : 'secondary'}>
                      {section.marks}/{section.totalMarks ?? '—'} marks
                    </Badge>
                  </div>
                  <Progress value={section.coverage} />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{section.questionCount} questions</span>
                    <span>{section.coverage}% coverage</span>
                  </div>
                </div>
              ))}
              {sectionStatistics.length === 0 && (
                <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                  No section metadata found. Define sections inside your JSON to unlock CAPS validation.
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader className="space-y-2">
                <CardTitle>Question bank</CardTitle>
                <div className="flex flex-wrap gap-2">
                  <div className="flex-1 min-w-[180px]">
                    <Label className="sr-only">Search</Label>
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        className="pl-8"
                        placeholder="Search by number or keyword"
                        value={searchTerm}
                        onChange={event => setSearchTerm(event.target.value)}
                      />
                    </div>
                  </div>
                  <Select value={filterSection} onValueChange={setFilterSection}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Section" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All sections</SelectItem>
                      {(paperData.sections ?? []).map(section => (
                        <SelectItem key={section.id} value={section.id}>
                          {section.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Question type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All types</SelectItem>
                      {QUESTION_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[520px] pr-4">
                  <div className="space-y-3">
                    {filteredQuestions.map(question => {
                      const isSelected = question.number === selectedQuestionId;
                      const sectionTitle = question.sectionId
                        ? sectionMap.get(question.sectionId)?.title ?? 'Unassigned section'
                        : 'Unassigned section';
                      return (
                        <button
                          key={question.number}
                          className={cn(
                            'w-full rounded-lg border p-4 text-left transition hover:border-primary',
                            isSelected && 'border-primary bg-primary/5'
                          )}
                          onClick={() => setSelectedQuestionId(question.number)}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{question.number}</span>
                              <Badge variant="outline">{sectionTitle}</Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">
                                {QUESTION_TYPES.find(type => type.value === question.type)?.label ?? question.type}
                              </Badge>
                              <Badge variant="outline">{question.marks} marks</Badge>
                              {question.hasImage && (
                                <Badge variant="outline" className="gap-1">
                                  <ImageIcon className="h-3.5 w-3.5" />
                                  Diagram
                                </Badge>
                              )}
                            </div>
                          </div>
                          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground" dangerouslySetInnerHTML={{ __html: question.text }} />
                        </button>
                      );
                    })}
                    {filteredQuestions.length === 0 && (
                      <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                        No questions match the current filters.
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Question editor</CardTitle>
                <CardDescription>Adjust text, marks, type, and diagram references.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedQuestion ? (
                  <>
                    <div className="space-y-2">
                      <Label>Question number</Label>
                      <Input
                        value={selectedQuestion.number}
                        onChange={event => updateQuestion({ number: event.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>Section</Label>
                        <Select
                          value={selectedQuestion.sectionId ?? 'unassigned'}
                          onValueChange={value => updateQuestion({ sectionId: value === 'unassigned' ? undefined : value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select section" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unassigned">Unassigned</SelectItem>
                            {(paperData.sections ?? []).map(section => (
                              <SelectItem key={section.id} value={section.id}>
                                {section.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Marks</Label>
                        <Input
                          type="number"
                          min={0}
                          value={selectedQuestion.marks}
                          onChange={event => updateQuestion({ marks: Number(event.target.value) })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Question type</Label>
                      <Select value={selectedQuestion.type} onValueChange={value => updateQuestion({ type: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {QUESTION_TYPES.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Question text</Label>
                      <Textarea
                        className="min-h-[140px]"
                        value={selectedQuestion.text}
                        onChange={event => updateQuestion({ text: event.target.value })}
                      />
                    </div>
                    {selectedQuestion.type === 'multiple-choice' && (
                      <Tabs defaultValue="options">
                        <TabsList className="grid grid-cols-2">
                          <TabsTrigger value="options">Options</TabsTrigger>
                          <TabsTrigger value="answer">Answer</TabsTrigger>
                        </TabsList>
                        <TabsContent value="options" className="space-y-2">
                          {(selectedQuestion.options ?? ['A.', 'B.', 'C.', 'D.']).map((option, index) => (
                            <Input
                              key={`${selectedQuestion.number}-option-${index}`}
                              value={option}
                              onChange={event => {
                                const nextOptions = [...(selectedQuestion.options ?? ['A.', 'B.', 'C.', 'D.'])];
                                nextOptions[index] = event.target.value;
                                updateQuestion({ options: nextOptions });
                              }}
                            />
                          ))}
                        </TabsContent>
                        <TabsContent value="answer">
                          <Textarea
                            value={selectedQuestion.answer ?? ''}
                            onChange={event => updateQuestion({ answer: event.target.value })}
                          />
                        </TabsContent>
                      </Tabs>
                    )}
                    {selectedQuestion.type !== 'multiple-choice' && (
                      <div className="space-y-2">
                        <Label>Memo / ideal answer</Label>
                        <Textarea
                          value={selectedQuestion.answer ?? ''}
                          onChange={event => updateQuestion({ answer: event.target.value })}
                        />
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label>Diagram</Label>
                      <div className="grid gap-2">
                        <Select
                          value={selectedQuestion.imageId ?? 'none'}
                          onValueChange={value =>
                            updateQuestion({
                              imageId: value === 'none' ? undefined : value,
                              hasImage: value !== 'none',
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Choose diagram" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No diagram</SelectItem>
                            {(paperData.images ?? []).map(image => (
                              <SelectItem key={image.id} value={image.id}>
                                {image.label ?? image.filename ?? image.id}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {selectedQuestion.hasImage && (
                          <div className="rounded-lg border bg-muted/30 p-3">
                            {(() => {
                              const image = paperData.images?.find(img => img.id === selectedQuestion.imageId);
                              return image ? (
                                <>
                                  <p className="text-sm font-medium">{image.label ?? image.filename}</p>
                                  <img
                                    src={image.dataUri ?? FALLBACK_IMAGE}
                                    alt={image.label ?? image.filename ?? 'Diagram'}
                                    className="mt-2 rounded-md border bg-white object-contain"
                                  />
                                </>
                              ) : (
                                <p className="text-sm text-muted-foreground">No diagram selected.</p>
                              );
                            })()}
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Select a question from the list to start editing.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
