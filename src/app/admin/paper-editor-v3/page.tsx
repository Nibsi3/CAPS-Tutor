'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/appwrite';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload, 
  FileText, 
  Loader2, 
  Save,
  ArrowLeft,
  Image as ImageIcon,
  Table as TableIcon,
  BarChart3,
  FileUp,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { SafeImage } from '@/components/ui/safe-image';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ExtractedQuestion {
  number: string;
  type: string;
  question: string;
  marks?: number;
  answer?: string;
  options?: string[];
  image?: string | null;
  image_label?: string | null;
  diagram?: string | null;
  tableData?: any;
  graphData?: any;
  extractText?: string;
}

interface ExtractedJSON {
  past_paper_name?: string;
  subject?: string;
  grade?: number;
  paper?: string;
  year?: number;
  questions?: ExtractedQuestion[];
  documents?: Array<{
    document_type: string;
    structured?: {
      sections?: Array<{
        name: string;
        questions?: ExtractedQuestion[];
      }>;
    };
  }>;
}

interface PaperMetadata {
  subject: string;
  year: string;
  grade: number;
  paperNumber: string;
}

export default function PaperEditorV3Page() {
  const { user } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  
  const [jsonFile, setJsonFile] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedJSON | null>(null);
  const [metadata, setMetadata] = useState<PaperMetadata | null>(null);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [paperId, setPaperId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<ExtractedQuestion[]>([]);
  const [saving, setSaving] = useState(false);

  const handleJsonFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/json') {
      setJsonFile(file);
      loadJsonFile(file);
    } else {
      toast({
        variant: 'destructive',
        title: 'Invalid File',
        description: 'Please select a valid JSON file',
      });
    }
  };

  const loadJsonFile = async (file: File) => {
    try {
      const text = await file.text();
      const data: ExtractedJSON = JSON.parse(text);
      setExtractedData(data);
      
      // Extract metadata
      const detectedMetadata = extractMetadata(data, file.name);
      setMetadata(detectedMetadata);
      
      // Extract questions
      const extractedQuestions = extractQuestions(data);
      setQuestions(extractedQuestions);
      
      toast({
        title: 'Success',
        description: `Loaded ${extractedQuestions.length} questions from JSON`,
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `Failed to parse JSON: ${error.message}`,
      });
    }
  };

  const extractMetadata = (data: ExtractedJSON, filename: string): PaperMetadata => {
    // Try to extract from past_paper_name
    let subject = data.subject || 'Unknown Subject';
    let year = data.year?.toString() || new Date().getFullYear().toString();
    let grade = data.grade || 12;
    let paperNumber = data.paper || '1';

    if (data.past_paper_name) {
      // Try to parse: "Life Sciences P1 Nov 2020 Eng"
      const nameMatch = data.past_paper_name.match(/(.+?)\s+P(\d+)\s+(?:Nov|Feb|Mar|May|Jun|Sep|Oct)\s+(\d{4})/i);
      if (nameMatch) {
        subject = nameMatch[1].trim();
        paperNumber = nameMatch[2];
        year = nameMatch[3];
      }
    }

    // Try to extract from filename
    if (subject === 'Unknown Subject') {
      const filenameMatch = filename.match(/(.+?)\s+P(\d+)\s+(?:Nov|Feb|Mar|May|Jun|Sep|Oct)\s+(\d{4})/i);
      if (filenameMatch) {
        subject = filenameMatch[1].trim();
        paperNumber = filenameMatch[2];
        year = filenameMatch[3];
      }
    }

    return { subject, year, grade, paperNumber };
  };

  const extractQuestions = (data: ExtractedJSON): ExtractedQuestion[] => {
    const questions: ExtractedQuestion[] = [];

    // Handle nested structure: documents[].structured.sections[].questions[]
    if (data.documents && Array.isArray(data.documents)) {
      for (const doc of data.documents) {
        if (doc.document_type === 'memo') continue; // Skip memos
        
        if (doc.structured?.sections) {
          for (const section of doc.structured.sections) {
            if (section.questions && Array.isArray(section.questions)) {
              questions.push(...section.questions);
            }
          }
        }
      }
    }
    // Handle flat structure: questions[]
    else if (data.questions && Array.isArray(data.questions)) {
      questions.push(...data.questions);
    }

    // Sort by question number
    questions.sort((a, b) => {
      const aParts = a.number.split('.').map(Number);
      const bParts = b.number.split('.').map(Number);
      for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
        const aVal = aParts[i] || 0;
        const bVal = bParts[i] || 0;
        if (aVal !== bVal) return aVal - bVal;
      }
      return 0;
    });

    return questions;
  };

  const handleUpload = async () => {
    if (!jsonFile || !user || !metadata) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select a JSON file first',
      });
      return;
    }

    setUploading(true);
    setProcessing(true);

    try {
      const formData = new FormData();
      formData.append('file', jsonFile);
      formData.append('userId', user.$id);
      formData.append('subject', metadata.subject);
      formData.append('year', metadata.year);
      formData.append('grade', metadata.grade.toString());
      formData.append('autoDetect', 'true');

      const response = await fetch('/api/admin/past-papers/upload-json', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload JSON');
      }

      // Read stream
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      let buffer = '';
      let detectedPaperId: string | null = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine || !trimmedLine.startsWith('data: ')) continue;

          try {
            const jsonStr = trimmedLine.substring(6);
            const data = JSON.parse(jsonStr);

            if (data.type === 'paper_created' && data.paperId) {
              detectedPaperId = data.paperId;
              setPaperId(data.paperId);
            } else if (data.type === 'done') {
              setProcessing(false);
              toast({
                title: 'Success',
                description: `Successfully processed ${data.total || 0} questions. Redirecting to editor...`,
              });
              
              // Redirect to paper editor
              if (detectedPaperId) {
                setTimeout(() => {
                  router.push(`/admin/past-papers/${detectedPaperId}`);
                }, 1000);
              }
            } else if (data.type === 'error') {
              throw new Error(data.message || 'Processing error');
            }
          } catch (parseError) {
            console.error('Error parsing stream data:', parseError);
          }
        }
      }
    } catch (error: any) {
      console.error('Error uploading JSON:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to upload JSON file',
      });
      setProcessing(false);
    } finally {
      setUploading(false);
    }
  };

  const getQuestionTypeIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'diagram':
      case 'diagramme':
        return <ImageIcon className="h-4 w-4" />;
      case 'table':
        return <TableIcon className="h-4 w-4" />;
      case 'graph':
      case 'chart':
        return <BarChart3 className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getQuestionTypeBadge = (type: string) => {
    const typeLower = type?.toLowerCase() || 'normal';
    const badges: Record<string, string> = {
      'multiple-choice': 'Multiple Choice',
      'multiple_choice': 'Multiple Choice',
      'diagram': 'Diagram',
      'diagramme': 'Diagram',
      'table': 'Table',
      'graph': 'Graph',
      'chart': 'Graph',
      'extract': 'Extract',
      'short': 'Short Answer',
      'long': 'Long Answer',
      'true-false': 'True/False',
      'true_false': 'True/False',
    };
    return badges[typeLower] || 'Normal';
  };

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
            <h1 className="text-3xl font-bold">Paper Editor V3</h1>
            <p className="text-muted-foreground">
              Upload and edit past papers with CAPS syllabus alignment
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="upload" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upload">Upload JSON</TabsTrigger>
          <TabsTrigger value="preview" disabled={!extractedData}>
            Preview ({questions.length} questions)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <Card className="border-dashed border-2 border-primary/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Upload JSON Past Paper
              </CardTitle>
              <CardDescription>
                Upload a JSON file with extracted questions, images, diagrams, and graphs.
                The system will automatically detect metadata and process all questions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    accept=".json"
                    id="json-upload-v3"
                    className="hidden"
                    onChange={handleJsonFileSelect}
                    disabled={uploading || processing}
                  />
                  <Button
                    variant="default"
                    onClick={() => document.getElementById('json-upload-v3')?.click()}
                    disabled={uploading || processing || !user}
                    className="flex items-center gap-2"
                  >
                    {uploading || processing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {processing ? 'Processing...' : 'Uploading...'}
                      </>
                    ) : (
                      <>
                        <FileUp className="h-4 w-4" />
                        Select JSON File
                      </>
                    )}
                  </Button>
                  {jsonFile && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>{jsonFile.name}</span>
                    </div>
                  )}
                </div>

                {metadata && (
                  <Card className="bg-muted/50">
                    <CardHeader>
                      <CardTitle className="text-sm">Detected Metadata</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Subject</Label>
                          <p className="font-medium">{metadata.subject}</p>
                        </div>
                        <div>
                          <Label>Year</Label>
                          <p className="font-medium">{metadata.year}</p>
                        </div>
                        <div>
                          <Label>Grade</Label>
                          <p className="font-medium">{metadata.grade}</p>
                        </div>
                        <div>
                          <Label>Paper Number</Label>
                          <p className="font-medium">Paper {metadata.paperNumber}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {questions.length > 0 && (
                  <Card className="bg-muted/50">
                    <CardHeader>
                      <CardTitle className="text-sm">Extracted Questions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium">
                          {questions.length} questions extracted successfully
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Button
                  onClick={handleUpload}
                  disabled={!jsonFile || !metadata || uploading || processing}
                  className="w-full"
                >
                  {uploading || processing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {processing ? 'Processing JSON...' : 'Uploading...'}
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload and Process JSON
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          {questions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No questions loaded</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Question Preview</CardTitle>
                <CardDescription>
                  Preview of {questions.length} questions extracted from JSON
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-4">
                    {questions.map((question, index) => (
                      <Card key={index} className="border-l-4 border-l-primary">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">Q{question.number}</Badge>
                              {getQuestionTypeIcon(question.type)}
                              <Badge>{getQuestionTypeBadge(question.type)}</Badge>
                              {question.marks && (
                                <Badge variant="secondary">{question.marks} marks</Badge>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <Label className="text-xs text-muted-foreground">Question Text</Label>
                            <p className="text-sm whitespace-pre-wrap">{question.question}</p>
                          </div>

                          {question.options && question.options.length > 0 && (
                            <div>
                              <Label className="text-xs text-muted-foreground">Options</Label>
                              <ul className="list-disc list-inside text-sm space-y-1">
                                {question.options.map((opt, optIdx) => (
                                  <li key={optIdx}>{opt}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {(question.image || question.diagram) && (
                            <div>
                              <Label className="text-xs text-muted-foreground">Image/Diagram</Label>
                              <div className="mt-2">
                                {question.image && (
                                  <SafeImage
                                    src={question.image}
                                    alt={question.image_label || `Question ${question.number}`}
                                    className="max-w-full h-auto rounded border"
                                  />
                                )}
                                {question.image_label && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {question.image_label}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}

                          {question.answer && (
                            <div>
                              <Label className="text-xs text-muted-foreground">Answer</Label>
                              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                {question.answer}
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

