'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/appwrite';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useScrollRestore } from '@/hooks/use-scroll-restore';
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Eye, 
  Edit, 
  Trash2,
  Plus,
  Image as ImageIcon,
  List,
  AlertCircle,
  FileUp,
  Link as LinkIcon,
  MoreVertical,
  EyeOff,
  Save
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

interface PastPaper {
  $id: string;
  teacherId: string;
  gradeLevel: number;
  subject: string;
  year: string;
  paperName: string;
  memoName: string;
  status: 'Processing' | 'Processed' | 'Failed' | 'Draft';
  questionCount: number;
  generatedQuestions?: any[];
  $createdAt?: string;
  hidden?: boolean;
}


export default function PastPapersPage() {
  const { user } = useUser();
  const { toast } = useToast();
  const router = useRouter();
  
  // Persist active tab across reloads
  const [activeTab, setActiveTab] = useLocalStorage<string>('admin-past-papers-tab', 'custom');
  
  // Restore scroll position on reload
  useScrollRestore('admin-past-papers-page');
  
  const [papers, setPapers] = useState<PastPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState<PastPaper | null>(null);
  const [quickViewPaper, setQuickViewPaper] = useState<PastPaper | null>(null);
  
  const [grade, setGrade] = useState('12');
  const [creatingCustom, setCreatingCustom] = useState(false);

  // Processing status polling
  const [processingPapers, setProcessingPapers] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchPapers();
  }, []);

  // Poll processing status for papers that are processing
  useEffect(() => {
    if (processingPapers.size === 0) return;

    const interval = setInterval(() => {
      processingPapers.forEach(async (paperId) => {
        try {
          const response = await fetch(`/api/admin/content/past-papers?paperId=${paperId}`);
          const data = await response.json();
          if (data.success && data.paper) {
            setPapers((prev) =>
              prev.map((p) => (p.$id === paperId ? data.paper : p))
            );
            // Remove from processing set if status is not Processing
            if (data.paper.status !== 'Processing') {
              setProcessingPapers((prev) => {
                const next = new Set(prev);
                next.delete(paperId);
                return next;
              });
            }
          }
        } catch (error) {
          console.error('Error polling paper status:', error);
        }
      });
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(interval);
  }, [processingPapers]);

  const fetchPapers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/content/past-papers');
      const data = await response.json();
      if (data.success) {
        setPapers(data.papers || []);
        // Add processing papers to polling set
        const processing = data.papers
          ?.filter((p: PastPaper) => p.status === 'Processing')
          .map((p: PastPaper) => p.$id) || [];
        setProcessingPapers(new Set(processing));
      }
    } catch (error) {
      console.error('Error fetching papers:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch past papers',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleJsonUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', user.$id);
      formData.append('autoDetect', 'true'); // Enable auto-detection

      const response = await fetch('/api/admin/past-papers/upload-json', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process JSON file');
      }

      // Read stream to get paper ID
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      let buffer = '';
      let paperId: string | null = null;
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

              if (data.type === 'paper_created' && data.paperId) {
                paperId = data.paperId;
              } else if (data.type === 'question') {
                questionCount++;
              } else if (data.type === 'done') {
                questionCount = data.total || questionCount;
              } else if (data.type === 'error') {
                throw new Error(data.message || 'Processing error');
              }
            } catch (parseError) {
              console.error('Error parsing stream data:', parseError);
            }
          }
        }
      }

      if (paperId) {
        toast({
          title: 'Success',
          description: `Successfully processed ${questionCount} questions from JSON. Redirecting to editor...`,
        });
        
        // Redirect to paper editor
        router.push(`/admin/past-papers/${paperId}`);
      } else {
        throw new Error('Paper ID not received from server');
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
      // Reset file input
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const handleDelete = async (paperId: string) => {
    if (!confirm('Are you sure you want to delete this paper?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/content/past-papers?paperId=${paperId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Success',
          description: 'Paper deleted successfully',
        });
        await fetchPapers();
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: data.error || 'Failed to delete paper',
        });
      }
    } catch (error) {
      console.error('Error deleting paper:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete paper',
      });
    }
  };

  const handlePublish = async (paperId: string) => {
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
        await fetchPapers();
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: data.error || 'Failed to publish paper',
        });
      }
    } catch (error) {
      console.error('Error publishing paper:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to publish paper',
      });
    }
  };

  const handleToggleHide = async (paperId: string, currentHidden: boolean) => {
    try {
      const response = await fetch('/api/admin/content/past-papers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paperId, hidden: !currentHidden }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Success',
          description: currentHidden ? 'Paper is now visible' : 'Paper is now hidden',
        });
        await fetchPapers();
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: data.error || 'Failed to update paper visibility',
        });
      }
    } catch (error) {
      console.error('Error toggling paper visibility:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update paper visibility',
      });
    }
  };

  const handleQuickView = (paper: PastPaper) => {
    setQuickViewPaper(paper);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Processed':
        return <Badge className="bg-green-500">Processed</Badge>;
      case 'Processing':
        return <Badge className="bg-yellow-500">Processing</Badge>;
      case 'Failed':
        return <Badge className="bg-red-500">Failed</Badge>;
      case 'Draft':
        return <Badge className="bg-blue-500">Draft</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getProcessingProgress = (paper: PastPaper) => {
    if (paper.status !== 'Processing') return null;
    
    // Show simple processing indicator since we don't have detailed status in schema
    return (
      <div className="mt-2 space-y-1">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin text-yellow-500" />
          <span>Processing paper... This may take a few minutes.</span>
        </div>
        <div className="text-xs text-muted-foreground">
          Extracting text and images, creating questions, and organizing sections.
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Past Papers Management</h1>
          <p className="text-muted-foreground">
            Upload, manage, and edit past papers and their questions
          </p>
        </div>
      </div>

      <Tabs value={activeTab || 'papers'} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="presets">Add Presets</TabsTrigger>
          <TabsTrigger value="papers">Past Paper</TabsTrigger>
        </TabsList>

        <TabsContent value="presets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Custom Presets</CardTitle>
              <CardDescription>
                Create and manage your own question presets with diagrams, graphs, tables, and answers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/past-papers/presets">
                <Button className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Go to Presets Management
                </Button>
              </Link>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="papers" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <Button
                onClick={async () => {
                  if (!user) {
                    toast({
                      variant: 'destructive',
                      title: 'Error',
                      description: 'Please log in to create papers',
                    });
                    return;
                  }

                  setCreatingCustom(true);

                  try {
                    const formData = new FormData();
                    formData.append('subject', '');
                    formData.append('paperType', '');
                    formData.append('year', new Date().getFullYear().toString());
                    formData.append('grade', grade);
                    formData.append('userId', user.$id);
                    formData.append('createCustom', 'true');
                    formData.append('customPaperName', `New Past Paper - ${new Date().getFullYear()}`);

                    const response = await fetch('/api/admin/past-papers/upload', {
                      method: 'POST',
                      body: formData,
                    });

                    const data = await response.json();

                    if (data.success && data.paperId) {
                      toast({
                        title: 'Success',
                        description: 'New past paper created',
                      });
                      
                      // Navigate to edit page immediately
                      router.push(`/admin/past-papers/${data.paperId}`);
                    } else {
                      toast({
                        variant: 'destructive',
                        title: 'Error',
                        description: data.error || 'Failed to create past paper',
                      });
                    }
                  } catch (error) {
                    console.error('Error creating past paper:', error);
                    toast({
                      variant: 'destructive',
                      title: 'Error',
                      description: 'Failed to create past paper',
                    });
                  } finally {
                    setCreatingCustom(false);
                  }
                }}
                disabled={creatingCustom || !user}
                className="w-full"
              >
                {creatingCustom ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Add a new past paper
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : papers.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No past papers uploaded yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {papers.map((paper) => (
                <Card key={paper.$id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold">
                            {paper.subject} - {paper.year}
                          </h3>
                          {getStatusBadge(paper.status)}
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>Paper: {paper.paperName}</p>
                          {paper.memoName && <p>Memo: {paper.memoName}</p>}
                          <p>Grade: {paper.gradeLevel} | Questions: {paper.questionCount}</p>
                        </div>
                        {getProcessingProgress(paper)}
                      </div>
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/past-papers/${paper.$id}`}>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                        </Link>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleQuickView(paper)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Quick View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleHide(paper.$id, paper.hidden || false)}>
                              <EyeOff className="h-4 w-4 mr-2" />
                              {paper.hidden ? 'Show' : 'Hide from view'}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(paper.$id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Quick View Dialog */}
      <Dialog open={!!quickViewPaper} onOpenChange={(open) => !open && setQuickViewPaper(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {quickViewPaper?.subject} - {quickViewPaper?.year}
            </DialogTitle>
            <DialogDescription>
              Quick preview of past paper details
            </DialogDescription>
          </DialogHeader>
          {quickViewPaper && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold">Subject</Label>
                  <p className="text-sm text-muted-foreground">{quickViewPaper.subject}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Year</Label>
                  <p className="text-sm text-muted-foreground">{quickViewPaper.year}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Grade</Label>
                  <p className="text-sm text-muted-foreground">{quickViewPaper.gradeLevel}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Status</Label>
                  <div className="mt-1">
                    {getStatusBadge(quickViewPaper.status)}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Questions</Label>
                  <p className="text-sm text-muted-foreground">{quickViewPaper.questionCount}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Paper File</Label>
                  <p className="text-sm text-muted-foreground">{quickViewPaper.paperName || 'N/A'}</p>
                </div>
                {quickViewPaper.memoName && (
                  <div>
                    <Label className="text-sm font-semibold">Memo File</Label>
                    <p className="text-sm text-muted-foreground">{quickViewPaper.memoName}</p>
                  </div>
                )}
                {quickViewPaper.$createdAt && (
                  <div>
                    <Label className="text-sm font-semibold">Created</Label>
                    <p className="text-sm text-muted-foreground">
                      {new Date(quickViewPaper.$createdAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
              <div className="flex gap-2 pt-4 border-t">
                <Link href={`/admin/past-papers/${quickViewPaper.$id}`} className="flex-1">
                  <Button variant="outline" className="w-full">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Paper
                  </Button>
                </Link>
                {quickViewPaper.status === 'Draft' && (
                  <Button 
                    variant="default" 
                    className="flex-1"
                    onClick={() => {
                      handlePublish(quickViewPaper.$id);
                      setQuickViewPaper(null);
                    }}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Publish
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

