'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ExtractedPaperJsonSchema, ExtractedPaperJson, ExtractedQuestionJson } from '@/lib/paper-json-extractor';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Download, UploadCloud, Filter, ImageIcon, AlertCircle } from 'lucide-react';

type SectionKey = 'all' | 'A' | 'B' | 'C';
type QuestionFilter = 'all' | 'multiple-choice' | 'diagram' | 'long' | 'short';

const TYPE_OPTIONS = [
  { label: 'Short response', value: 'short' },
  { label: 'Long / Essay', value: 'long' },
  { label: 'Multiple choice', value: 'multiple-choice' },
  { label: 'Diagram / Labeling', value: 'diagram' },
  { label: 'True / False', value: 'true-false' },
  { label: 'Fill in blanks', value: 'fill-in' },
  { label: 'Matching', value: 'matching' },
];

export default function PaperEditorV3Page() {
  const { toast } = useToast();
  const [paperJson, setPaperJson] = useState<ExtractedPaperJson | null>(null);
  const [sectionFilter, setSectionFilter] = useState<SectionKey>('all');
  const [typeFilter, setTypeFilter] = useState<QuestionFilter>('all');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setIsUploading(true);
      const file = event.target.files?.[0];
      if (!file) return;
      const text = await file.text();
      const parsed = ExtractedPaperJsonSchema.parse(JSON.parse(text));
      setPaperJson(parsed);
      toast({
        title: 'Extraction Loaded',
        description: `${parsed.questions.length} questions ready for editing.`,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Invalid JSON',
        description: 'Please upload a valid extracted JSON file.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  }, [toast]);

  const handleQuestionUpdate = (index: number, field: keyof ExtractedQuestionJson, value: string) => {
    setPaperJson(prev => {
      if (!prev) return prev;
      const updated = [...prev.questions];
      const nextValue =
        field === 'marks'
          ? Number(value)
          : field === 'options'
            ? value.split('\n').map(opt => opt.trim()).filter(Boolean)
            : value;
      updated[index] = {
        ...updated[index],
        [field]: nextValue,
      };
      return { ...prev, questions: updated };
    });
  };

  const handleDownloadJson = () => {
    if (!paperJson) return;
    const blob = new Blob([JSON.stringify(paperJson, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeSubject = paperJson.subject.replace(/\s+/g, '_');
    a.download = `${safeSubject}_${paperJson.paper}_${paperJson.year}_edited.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const sectionSummary = useMemo(() => {
    if (!paperJson) return [];
    const summary: Record<SectionKey, { count: number; marks: number }> = {
      all: { count: paperJson.questions.length, marks: 0 },
      A: { count: 0, marks: 0 },
      B: { count: 0, marks: 0 },
      C: { count: 0, marks: 0 },
    };
    paperJson.questions.forEach(question => {
      const section = getSectionKey(question.number);
      summary[section].count += 1;
      summary[section].marks += question.marks ?? estimateMarksFromJson(question);
      summary.all.marks += question.marks ?? estimateMarksFromJson(question);
    });
    return [
      { key: 'all' as SectionKey, label: 'All Sections', ...summary.all },
      { key: 'A' as SectionKey, label: 'Section A (Question 1)', ...summary.A },
      { key: 'B' as SectionKey, label: 'Section B (Question 2)', ...summary.B },
      { key: 'C' as SectionKey, label: 'Section C (Questions 3+)', ...summary.C },
    ];
  }, [paperJson]);

  const filteredQuestions = useMemo(() => {
    if (!paperJson) return [];
    return paperJson.questions.filter(question => {
      const matchesSection = sectionFilter === 'all' || getSectionKey(question.number) === sectionFilter;
      const matchesType = typeFilter === 'all' || mapQuestionType(question.type) === typeFilter;
      return matchesSection && matchesType;
    });
  }, [paperJson, sectionFilter, typeFilter]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-headline">Paper Editor v3</CardTitle>
          <CardDescription>
            Rebuild authentic CAPS past papers directly from extracted JSON. Upload your structured extraction file,
            align each question with CAPS sections, edit text, marks, question types, and preview diagrams before saving.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Upload the extracted JSON (e.g., <code>Life Sciences P1 Nov 2020 Eng (2)_extracted.json</code>) that includes question order, numbering, and diagrams.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button asChild variant="link" className="px-0">
                <Link href="/docs/APPWRITE_PAST_PAPERS_COLLECTIONS.md" target="_blank">
                  CAPS Section Layout Guide →
                </Link>
              </Button>
            </div>
          </div>
          <div className="flex flex-col items-start gap-3 sm:items-end">
            <label className="flex items-center gap-2 text-sm font-medium">
              <UploadCloud className="h-4 w-4" />
              Upload extracted JSON
            </label>
            <Input type="file" accept="application/json" onChange={handleFileUpload} disabled={isUploading} className="w-full sm:w-72" />
          </div>
        </CardContent>
      </Card>

      {paperJson ? (
        <>
          <Card>
            <CardContent className="grid gap-4 py-6 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-sm text-muted-foreground">Subject</p>
                <p className="text-lg font-semibold">{paperJson.subject}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Paper</p>
                <p className="text-lg font-semibold">{paperJson.paper} · {paperJson.year}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Questions</p>
                <p className="text-lg font-semibold">{paperJson.questions.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Diagrams</p>
                <p className="text-lg font-semibold">
                  {paperJson.questions.filter(q => q.imageFilename || q.imageDataUri).length}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl">Sections Overview</CardTitle>
              <CardDescription>Ensure the paper mirrors the official CAPS layout: Section A (MCQ), Section B (Structured), Section C (Extended responses).</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {sectionSummary.map(section => (
                <div
                  key={section.key}
                  className={`rounded-xl border p-4 ${sectionFilter === section.key ? 'border-primary bg-primary/5' : 'border-border'}`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{section.label}</p>
                    <Badge variant={section.key === 'all' ? 'secondary' : 'outline'}>{section.count} q</Badge>
                  </div>
                  <p className="mt-2 text-2xl font-semibold">{section.marks} marks</p>
                  {section.key !== 'all' && (
                    <Button
                      variant="link"
                      className="mt-1 h-auto p-0 text-xs"
                      onClick={() => setSectionFilter(section.key)}
                    >
                      View only {section.label}
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Filters</CardTitle>
              <CardDescription>Focus on specific CAPS sections or question types while editing.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 sm:flex-row">
              <Tabs value={sectionFilter} onValueChange={value => setSectionFilter(value as SectionKey)} className="w-full sm:w-auto">
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="A">Section A</TabsTrigger>
                  <TabsTrigger value="B">Section B</TabsTrigger>
                  <TabsTrigger value="C">Section C</TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="flex items-center gap-3">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={typeFilter} onValueChange={value => setTypeFilter(value as QuestionFilter)}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Question type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    <SelectItem value="multiple-choice">Multiple choice</SelectItem>
                    <SelectItem value="diagram">Diagram / labeling</SelectItem>
                    <SelectItem value="long">Long / essay</SelectItem>
                    <SelectItem value="short">Short response</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" onClick={() => { setSectionFilter('all'); setTypeFilter('all'); }}>
                Reset filters
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Question Bank ({filteredQuestions.length})</CardTitle>
                <CardDescription>Each question stays in exact CAPS order. Update text, marks, types, and answers before exporting.</CardDescription>
              </div>
              <Button variant="outline" onClick={handleDownloadJson}>
                <Download className="mr-2 h-4 w-4" />
                Download edited JSON
              </Button>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-6">
                  {filteredQuestions.map(question => {
                    const index = paperJson.questions.findIndex(q => q.number === question.number && q.question === question.question);
                    return (
                      <QuestionEditorCard
                        key={`${question.number}-${index}`}
                        index={index}
                        question={question}
                        onUpdate={handleQuestionUpdate}
                      />
                    );
                  })}
                  {filteredQuestions.length === 0 && (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-12 text-center">
                      <AlertCircle className="h-8 w-8 text-muted-foreground" />
                      <p className="mt-4 font-medium">No questions match the current filter.</p>
                      <p className="text-sm text-muted-foreground">Try clearing filters to see all questions again.</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <ImageIcon className="h-12 w-12 text-muted-foreground" />
            <div className="space-y-2">
              <p className="text-lg font-semibold">Upload an extracted JSON to begin</p>
              <p className="text-sm text-muted-foreground">
                The Paper Editor will automatically detect Section A/B/C structure, multiple choice options, diagrams, and marks.
              </p>
            </div>
            <Button onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}>
              <UploadCloud className="mr-2 h-4 w-4" />
              Choose JSON file
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function QuestionEditorCard({
  index,
  question,
  onUpdate,
}: {
  index: number;
  question: ExtractedQuestionJson;
  onUpdate: (index: number, field: keyof ExtractedQuestionJson, value: string) => void;
}) {
  const type = mapQuestionType(question.type);
  const marks = question.marks ?? estimateMarksFromJson(question);
  const hasDiagram = Boolean(question.imageDataUri || question.imageFilename);

  return (
    <div className="rounded-2xl border p-4 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-sm font-semibold">
            {question.number || `Q${index + 1}`}
          </Badge>
          <Badge variant={type === 'multiple-choice' ? 'secondary' : 'outline'} className="capitalize">
            {type.replace('-', ' ')}
          </Badge>
          {hasDiagram && (
            <Badge variant="outline" className="flex items-center gap-1">
              <ImageIcon className="h-3 w-3" />
              Diagram
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Marks</span>
          <Input
            type="number"
            className="w-20"
            value={marks}
            onChange={event => onUpdate(index, 'marks', event.target.value)}
            min={1}
            max={20}
          />
          <Select value={type} onValueChange={value => onUpdate(index, 'type', value)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Question type" />
            </SelectTrigger>
            <SelectContent>
              {TYPE_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <Textarea
          value={question.question}
          onChange={event => onUpdate(index, 'question', event.target.value)}
          className="min-h-[140px]"
        />
        {question.options && question.options.length > 0 && (
          <Textarea
            value={question.options.join('\n')}
            onChange={event => onUpdate(index, 'options', event.target.value)}
            className="min-h-[120px] font-mono text-xs"
            placeholder={'A. Option A\nB. Option B'}
          />
        )}
        <Textarea
          value={question.answer ?? ''}
          onChange={event => onUpdate(index, 'answer', event.target.value)}
          className="min-h-[80px]"
          placeholder="Answer / memo notes"
        />
      </div>

      {hasDiagram && (
        <div className="mt-4 rounded-xl bg-muted/40 p-3">
          <p className="mb-2 flex items-center gap-2 text-sm font-medium">
            <ImageIcon className="h-4 w-4" />
            Diagram reference
          </p>
          {question.imageDataUri ? (
            <div className="relative h-64 w-full overflow-hidden rounded-lg border">
              <Image
                src={question.imageDataUri}
                alt={question.imageLabel || question.imageFilename || 'Diagram'}
                fill
                className="object-contain bg-white"
                unoptimized
              />
            </div>
          ) : (
            <div className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
              Linked image: <code>{question.imageFilename || 'Unknown diagram'}</code>
            </div>
          )}
          {question.imageLabel && (
            <p className="mt-2 text-xs text-muted-foreground">{question.imageLabel}</p>
          )}
        </div>
      )}
    </div>
  );
}

function getSectionKey(questionNumber?: string | null): SectionKey {
  if (!questionNumber) return 'B';
  const main = parseInt(questionNumber.split('.')[0] || '0', 10);
  if (main <= 1) return 'A';
  if (main === 2) return 'B';
  return 'C';
}

function estimateMarksFromJson(question: ExtractedQuestionJson): number {
  if (question.type?.toLowerCase().includes('multiple')) return 2;
  if (question.type?.toLowerCase().includes('diagram')) return 4;
  const length = question.question?.length ?? 0;
  if (length > 400) return 8;
  if (length > 240) return 6;
  if (length > 120) return 4;
  return 2;
}

function mapQuestionType(type?: string | null): QuestionFilter {
  if (!type) return 'short';
  const normalized = type.toLowerCase();
  if (normalized.includes('multiple')) return 'multiple-choice';
  if (normalized.includes('diagram')) return 'diagram';
  if (normalized.includes('long')) return 'long';
  if (normalized.includes('essay')) return 'long';
  return 'short';
}
