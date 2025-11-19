'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useDatabases, useCollection, useMemoAppwrite } from '@/appwrite';
import { appwriteConfig } from '@/appwrite/config';
import { Query } from 'appwrite';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, Edit, Trash2, Loader2, Eye } from 'lucide-react';
import { EditorPaper } from '@/lib/past-papers-v2/types';
import { Checkbox } from '@/components/ui/checkbox';

export default function PastPapersV2Page() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();
  const databases = useDatabases();

  const [papers, setPapers] = useState<EditorPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedMemoFile, setSelectedMemoFile] = useState<File | null>(null);
  const [subject, setSubject] = useState('');
  const [year, setYear] = useState('');
  const [grade, setGrade] = useState('12');
  const [selectedPapers, setSelectedPapers] = useState<Set<string>>(new Set());

  const papersRef = useMemoAppwrite(() => ({
    databaseId: appwriteConfig.databaseId,
    collectionId: 'pastpapers',
    queries: [Query.orderDesc('$createdAt')],
  }), []);

  const { data: papersData, isLoading, error } = useCollection<EditorPaper>(papersRef);

  useEffect(() => {
    if (!isLoading) {
      // useCollection already maps $id to id, so papersData is already an array
      // Map gradeLevel (from DB) to grade (EditorPaper type expects grade)
      const mappedPapers = (papersData || []).map((doc: any) => ({
        ...doc,
        grade: doc.gradeLevel || doc.grade || 12, // Map gradeLevel from DB to grade for EditorPaper type
      })) as EditorPaper[];
      setPapers(mappedPapers);
      setLoading(false);
      
      // Log for debugging
      if (error) {
        console.error('Error loading papers:', error);
        toast({
          title: 'Error loading papers',
          description: error.message || 'Failed to load papers from database',
          variant: 'destructive',
        });
      }
      if (papersData) {
        console.log(`Loaded ${papersData.length} papers from database`);
      }
    }
  }, [papersData, isLoading, error, toast]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/json') {
      setSelectedFile(file);
    } else {
      toast({
        title: 'Invalid file',
        description: 'Please select a JSON file',
        variant: 'destructive',
      });
    }
  };

  const handleMemoFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === 'application/pdf') {
        setSelectedMemoFile(file);
      } else {
        toast({
          title: 'Invalid file',
          description: 'Please select a PDF file for the memo',
          variant: 'destructive',
        });
        e.target.value = ''; // Clear the input
      }
    } else {
      setSelectedMemoFile(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) {
      toast({
        title: 'Error',
        description: 'Please select a file and ensure you are logged in',
        variant: 'destructive',
      });
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('userId', user.$id);
      if (subject) formData.append('subject', subject);
      if (year) formData.append('year', year);
      if (grade) formData.append('grade', grade);
      if (selectedMemoFile) {
        formData.append('memoFile', selectedMemoFile);
      }

      const response = await fetch('/api/admin/past-papers-v2/upload-poppler-json', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'Success',
          description: `Paper uploaded successfully! ${result.message}`,
        });
        setSelectedFile(null);
        setSelectedMemoFile(null);
        setSubject('');
        setYear('');
        setGrade('12');
        // Reset file inputs
        const jsonInput = document.querySelector('input[type="file"][accept=".json"]') as HTMLInputElement;
        const memoInput = document.querySelector('input[type="file"][accept=".pdf"]') as HTMLInputElement;
        if (jsonInput) jsonInput.value = '';
        if (memoInput) memoInput.value = '';
        // Reload papers
        window.location.reload();
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to upload paper',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const deletePaperAndQuestions = async (paperId: string) => {
    // Use server-side API route to avoid permission issues and rate limits
    const response = await fetch('/api/admin/past-papers-v2/delete', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paperId }),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to delete paper');
    }

    return result;
  };

  const handleDelete = async (paperId: string) => {
    if (!confirm('Are you sure you want to delete this paper? This will also delete all associated questions.')) return;

    try {
      setDeleting(true);
      await deletePaperAndQuestions(paperId);

      toast({
        title: 'Success',
        description: 'Paper and all associated questions deleted successfully',
      });

      // Reload papers
      window.location.reload();
    } catch (error: any) {
      console.error('Delete error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete paper',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedPapers.size === 0) {
      toast({
        title: 'No selection',
        description: 'Please select at least one paper to delete',
        variant: 'destructive',
      });
      return;
    }

    const count = selectedPapers.size;
    if (!confirm(`Are you sure you want to delete ${count} paper(s)? This will also delete all associated questions.`)) return;

    try {
      setDeleting(true);
      const paperIds = Array.from(selectedPapers);
      
      // Use server-side API route for bulk delete to avoid rate limits
      const response = await fetch('/api/admin/past-papers-v2/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paperIds }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to delete papers');
      }

      const successCount = result.results.success.length;
      const failedCount = result.results.failed.length;

      if (failedCount > 0) {
        toast({
          title: 'Partial success',
          description: `Deleted ${successCount} paper(s), ${failedCount} failed. ${result.totalQuestionsDeleted} questions deleted.`,
          variant: 'default',
        });
      } else {
        toast({
          title: 'Success',
          description: `Successfully deleted ${successCount} paper(s) and ${result.totalQuestionsDeleted} questions`,
        });
      }

      // Clear selection and reload
      setSelectedPapers(new Set());
      window.location.reload();
    } catch (error: any) {
      console.error('Bulk delete error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete papers',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleSelectPaper = (paperId: string, checked: boolean) => {
    const newSelected = new Set(selectedPapers);
    if (checked) {
      newSelected.add(paperId);
    } else {
      newSelected.delete(paperId);
    }
    setSelectedPapers(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = papers.map(p => p.id || (p as any).$id).filter(Boolean) as string[];
      setSelectedPapers(new Set(allIds));
    } else {
      setSelectedPapers(new Set());
    }
  };

  const isAllSelected = papers.length > 0 && selectedPapers.size === papers.length;
  const isSomeSelected = selectedPapers.size > 0 && selectedPapers.size < papers.length;
  
  // Ref for select all checkbox to set indeterminate state
  const selectAllCheckboxRef = React.useRef<HTMLButtonElement>(null);
  
  useEffect(() => {
    if (selectAllCheckboxRef.current) {
      // Set indeterminate state on the button element (Radix UI checkbox uses button)
      (selectAllCheckboxRef.current as any).indeterminate = isSomeSelected;
    }
  }, [isSomeSelected]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Processed':
        return 'bg-green-500';
      case 'Processing':
        return 'bg-yellow-500';
      case 'Failed':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Past Papers V2 Editor</h1>
          <p className="text-muted-foreground">Upload and edit past papers with interactive elements</p>
        </div>
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Poppler JSON</CardTitle>
          <CardDescription>
            Upload a JSON file generated by the Poppler pipeline
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="grid gap-2">
              <Label>Subject (optional)</Label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g., Life Sciences"
              />
            </div>
            <div className="grid gap-2">
              <Label>Year (optional)</Label>
              <Input
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="e.g., 2020"
              />
            </div>
            <div className="grid gap-2">
              <Label>Grade (optional)</Label>
              <Select value={grade} onValueChange={setGrade}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[10, 11, 12].map((g) => (
                    <SelectItem key={g} value={g.toString()}>
                      Grade {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label>JSON File *</Label>
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="flex-1"
              />
              {selectedFile && (
                <span className="text-sm text-muted-foreground">{selectedFile.name}</span>
              )}
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Memo PDF (Optional)</Label>
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept=".pdf"
                onChange={handleMemoFileSelect}
                className="flex-1"
              />
              {selectedMemoFile && (
                <span className="text-sm text-muted-foreground">{selectedMemoFile.name}</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Upload a PDF memo file to attach to this past paper
            </p>
          </div>

          <Button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="w-full"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload JSON
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Papers List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Past Papers</CardTitle>
              <CardDescription>Manage your uploaded papers</CardDescription>
            </div>
            {selectedPapers.size > 0 && (
              <Button
                variant="destructive"
                onClick={handleBulkDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Selected ({selectedPapers.size})
                  </>
                )}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {papers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No papers uploaded yet. Upload a JSON file to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      ref={selectAllCheckboxRef}
                      checked={isAllSelected}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all papers"
                    />
                  </TableHead>
                  <TableHead>Paper Name</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Questions</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {papers.map((paper) => {
                  const paperId = paper.id || (paper as any).$id;
                  const isSelected = selectedPapers.has(paperId);
                  return (
                    <TableRow key={paperId}>
                      <TableCell>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => handleSelectPaper(paperId, checked as boolean)}
                          aria-label={`Select ${paper.paperName || 'paper'}`}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{paper.paperName || 'Untitled'}</TableCell>
                      <TableCell>{paper.subject || 'Unknown'}</TableCell>
                      <TableCell>{paper.year || 'N/A'}</TableCell>
                      <TableCell>Grade {paper.grade || 12}</TableCell>
                      <TableCell>{paper.questionCount || 0}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(paper.status || 'Draft')}>
                          {paper.status || 'Draft'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/admin/past-papers-v2/editor/${paperId}`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(paperId)}
                            disabled={deleting}
                          >
                            {deleting ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

