'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader, FileText, Play, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/appwrite';
import { Progress } from '@/components/ui/progress';

interface StorageFile {
  paper: {
    fileId: string;
    name: string;
    size: number;
    year: string | null;
  };
  memo: {
    fileId: string;
    name: string;
    size: number;
  } | null;
}

interface ProcessingStatus {
  fileId: string;
  status: 'idle' | 'processing' | 'success' | 'error';
  message?: string;
  questionCount?: number;
}

export default function ProcessStoragePapersPage() {
  const { user } = useUser();
  const { toast } = useToast();
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingStatus, setProcessingStatus] = useState<Record<string, ProcessingStatus>>({});
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());

  // Load files from storage
  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/process-storage-paper');
      const data = await response.json();
      
      if (data.success) {
        setFiles(data.files || []);
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: data.message || 'Failed to load files',
        });
      }
    } catch (error) {
      console.error('Error loading files:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load files from storage',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProcessFile = async (file: StorageFile) => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Authentication Required',
        description: 'Please log in to process papers',
      });
      return;
    }

    const fileId = file.paper.fileId;
    
    // Update status
    setProcessingStatus(prev => ({
      ...prev,
      [fileId]: {
        fileId,
        status: 'processing',
        message: 'Processing paper...',
      },
    }));

    try {
      const response = await fetch('/api/process-storage-paper', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paperFileId: file.paper.fileId,
          memoFileId: file.memo?.fileId,
          userId: user.$id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setProcessingStatus(prev => ({
          ...prev,
          [fileId]: {
            fileId,
            status: 'success',
            message: `Processed successfully`,
            questionCount: data.questionCount,
          },
        }));

        toast({
          title: 'Success',
          description: `Processed ${file.paper.name}. Extracted ${data.questionCount} questions.`,
        });
      } else {
        setProcessingStatus(prev => ({
          ...prev,
          [fileId]: {
            fileId,
            status: 'error',
            message: data.message || 'Processing failed',
          },
        }));

        toast({
          variant: 'destructive',
          title: 'Processing Failed',
          description: data.message || 'Failed to process paper',
        });
      }
    } catch (error) {
      console.error('Error processing file:', error);
      setProcessingStatus(prev => ({
        ...prev,
        [fileId]: {
          fileId,
          status: 'error',
          message: 'Network error occurred',
        },
      }));

      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to process paper',
      });
    }
  };

  const handleSelectFile = (fileId: string) => {
    setSelectedFiles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fileId)) {
        newSet.delete(fileId);
      } else {
        newSet.add(fileId);
      }
      return newSet;
    });
  };

  const handleProcessSelected = async () => {
    if (selectedFiles.size === 0) {
      toast({
        variant: 'destructive',
        title: 'No Files Selected',
        description: 'Please select at least one file to process',
      });
      return;
    }

    const filesToProcess = files.filter(f => selectedFiles.has(f.paper.fileId));
    
    for (const file of filesToProcess) {
      await handleProcessFile(file);
      // Add a small delay between processing to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-6 h-6" />
            Process Life Science Paper 1 from Storage
          </CardTitle>
          <CardDescription>
            Process past papers from Appwrite Storage bucket. Papers will be extracted using OCR,
            questions will be generated, and images will be matched to questions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Button onClick={loadFiles} variant="outline" disabled={loading}>
              {loading ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                'Refresh Files'
              )}
            </Button>
            
            {selectedFiles.size > 0 && (
              <Button onClick={handleProcessSelected} className="ml-auto">
                <Play className="w-4 h-4 mr-2" />
                Process Selected ({selectedFiles.size})
              </Button>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No Life Science Paper 1 files found in storage.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {files.map((file) => {
                const status = processingStatus[file.paper.fileId];
                const isSelected = selectedFiles.has(file.paper.fileId);
                
                return (
                  <Card key={file.paper.fileId} className={isSelected ? 'border-primary' : ''}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleSelectFile(file.paper.fileId)}
                              className="w-4 h-4"
                            />
                            <h3 className="font-semibold">{file.paper.name}</h3>
                          </div>
                          
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p>Year: {file.paper.year || 'Unknown'}</p>
                            <p>Size: {formatFileSize(file.paper.size)}</p>
                            {file.memo && (
                              <p>Memo: {file.memo.name} ({formatFileSize(file.memo.size)})</p>
                            )}
                            {!file.memo && (
                              <p className="text-amber-600">⚠️ No memo found</p>
                            )}
                          </div>

                          {status && (
                            <div className="mt-3 space-y-2">
                              {status.status === 'processing' && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Loader className="w-4 h-4 animate-spin" />
                                  <span>{status.message}</span>
                                </div>
                              )}
                              
                              {status.status === 'success' && (
                                <div className="flex items-center gap-2 text-sm text-green-600">
                                  <CheckCircle className="w-4 h-4" />
                                  <span>
                                    {status.message}
                                    {status.questionCount && ` - ${status.questionCount} questions extracted`}
                                  </span>
                                </div>
                              )}
                              
                              {status.status === 'error' && (
                                <div className="flex items-center gap-2 text-sm text-red-600">
                                  <XCircle className="w-4 h-4" />
                                  <span>{status.message}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        <Button
                          onClick={() => handleProcessFile(file)}
                          disabled={status?.status === 'processing'}
                          variant={status?.status === 'success' ? 'outline' : 'default'}
                        >
                          {status?.status === 'processing' ? (
                            <>
                              <Loader className="w-4 h-4 mr-2 animate-spin" />
                              Processing...
                            </>
                          ) : status?.status === 'success' ? (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Processed
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4 mr-2" />
                              Process
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

