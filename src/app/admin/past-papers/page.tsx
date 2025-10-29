
'use client';

import { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, Loader, File as FileIcon, X, Trash2, Link2, Search, ArrowUpDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog"
import { processPastPaper } from "@/ai/flows/past-paper-processing";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";


interface StagedFile {
  id: string;
  file: File;
  subject: string;
  year: string;
  type: 'paper' | 'memo';
  language: string;
  paperNumber: string;
}

interface PairedFile {
  id: string;
  paper: StagedFile;
  memo: StagedFile;
}

interface ProcessedPaper {
    id: string;
    subject: string;
    year: string;
    paperName: string;
    memoName: string;
    status: 'Processing' | 'Processed' | 'Failed';
    progress: number;
}

type SortKey = 'subject' | 'year';

// Add more specific keywords for subject detection. Longer, more unique keywords first.
const subjectKeywords: Record<string, string[]> = {
    "Mathematics": ["mathematics", "maths", "wiskunde"],
    "Physical Sciences": ["physical sciences", "physical science", "phys sci", "fisiese wetenskappe"],
    "Life Sciences": ["life sciences", "life science", "life sci", "bio", "lewenswetenskappe"],
    "Accounting": ["accounting", "rekeningkunde"],
    "Business Studies": ["business studies", "bus stud", "besigheidstudies"],
    "Economics": ["economics", "ekonomie"],
    "Geography": ["geography", "geo", "aardrykskunde"],
    "History": ["history", "geskiedenis"],
    "English": ["english", "eng"],
    "Afrikaans": ["afrikaans", "afr"],
};

const languageKeywords: Record<string, string[]> = {
    "ENG": ["english", "eng"],
    "AFR": ["afrikaans", "afr"],
}

export default function PastPaperUploaderPage() {
  const { toast } = useToast();
  const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([]);
  const [pairedFiles, setPairedFiles] = useState<PairedFile[]>([]);
  const [processedPapers, setProcessedPapers] = useState<ProcessedPaper[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('subject');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');


  useEffect(() => {
    const interval = setInterval(() => {
      setProcessedPapers(prevPapers => {
        let changed = false;
        const updatedPapers = prevPapers.map(p => {
          if (p.status === 'Processing' && p.progress < 100) {
            changed = true;
            const newProgress = Math.min(p.progress + Math.random() * 20, 100);
            return {
              ...p,
              progress: newProgress,
              status: newProgress >= 100 ? 'Processed' : 'Processing',
            };
          }
          return p;
        });
        return changed ? updatedPapers : prevPapers;
      });
    }, 800);

    return () => clearInterval(interval);
  }, []);

  const parseFileName = (file: File): Omit<StagedFile, 'id' | 'file'> => {
      const name = file.name.toLowerCase().replace(/_/g, ' ').replace(/-/g, ' ');
      
      const type = (name.includes('memo') || name.includes('memorandum')) ? 'memo' : 'paper';
      
      const yearMatch = name.match(/20\d{2}/) || name.match(/(?<=\s)\d{2}(?=\s|$)/);
      const year = yearMatch ? (yearMatch[0].length === 2 ? `20${yearMatch[0]}` : yearMatch[0]) : '';
      
      let subject = 'Unknown';
      let bestMatchLength = 0;
      for (const [subj, keywords] of Object.entries(subjectKeywords)) {
        for (const kw of keywords) {
            if (name.includes(kw) && kw.length > bestMatchLength) {
                subject = subj;
                bestMatchLength = kw.length;
            }
        }
      }

      let language = 'Unknown';
      for (const [lang, keywords] of Object.entries(languageKeywords)) {
          if (keywords.some(kw => name.includes(kw))) {
              language = lang;
              break;
          }
      }

      let paperNumber = '';
      const paperMatch = name.match(/p(\d)|paper\s?(\d)/);
      if (paperMatch) {
          paperNumber = paperMatch[1] || paperMatch[2];
      }
      
      return { subject, year, type, paperNumber, language };
  }

  const getPairingKey = (file: StagedFile) => {
    return `${file.subject}-${file.year}-${file.language}-${file.paperNumber}`.toLowerCase();
  }

  const autoPairFiles = useCallback((allFiles: StagedFile[]) => {
    const fileGroups = new Map<string, { paper?: StagedFile, memo?: StagedFile }>();
    const remainingFiles: StagedFile[] = [];
    const newPairs: PairedFile[] = [];

    // Group files by pairing key
    for (const file of allFiles) {
      const key = getPairingKey(file);
      if (!fileGroups.has(key)) {
        fileGroups.set(key, {});
      }
      const group = fileGroups.get(key)!;
      if (file.type === 'paper' && !group.paper) {
        group.paper = file;
      } else if (file.type === 'memo' && !group.memo) {
        group.memo = file;
      } else {
        remainingFiles.push(file); // Keep duplicates or extras
      }
    }

    // Create pairs and collect remaining files
    for (const [key, group] of fileGroups.entries()) {
      if (group.paper && group.memo) {
        newPairs.push({
          id: `${group.paper.id}-${group.memo.id}`,
          paper: group.paper,
          memo: group.memo,
        });
      } else {
        if (group.paper) remainingFiles.push(group.paper);
        if (group.memo) remainingFiles.push(group.memo);
      }
    }
    
    return { newPairs, remainingFiles };
  }, []);


  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
  
    const newFiles: StagedFile[] = Array.from(files).map((file, i) => ({
      id: `${file.name}-${Date.now()}-${i}`,
      file,
      ...parseFileName(file)
    }));
  
    setStagedFiles(currentStaged => {
      const allUnpairedFiles = [...currentStaged, ...newFiles];
      const { newPairs, remainingFiles } = autoPairFiles(allUnpairedFiles);

      if (newPairs.length > 0) {
        setPairedFiles(currentPaired => [...currentPaired, ...newPairs]);
        toast({
          title: "Files Paired Automatically",
          description: `${newPairs.length} paper(s) and memo(s) were successfully paired.`,
        });
      }

      // To avoid duplicates, we create a map of the remaining files
      const remainingFileMap = new Map(remainingFiles.map(f => [f.id, f]));
      return Array.from(remainingFileMap.values());
    });
  }, [autoPairFiles, toast]);


  const removeStagedFile = (id: string) => {
    setStagedFiles(prev => prev.filter(f => f.id !== id));
  }

  const removePairedFile = (id: string) => {
    const pairToRemove = pairedFiles.find(p => p.id === id);
    if(pairToRemove) {
      setStagedFiles(prev => [...prev, pairToRemove.paper, pairToRemove.memo]);
      setPairedFiles(prev => prev.filter(p => p.id !== id));
    }
  }

  const pairFiles = (paperId: string, memoId: string) => {
    const paper = stagedFiles.find(f => f.id === paperId);
    const memo = stagedFiles.find(f => f.id === memoId);

    if (paper && memo) {
      setPairedFiles(prev => [...prev, { id: `${paper.id}-${memo.id}`, paper, memo }]);
      setStagedFiles(prev => prev.filter(f => f.id !== paperId && f.id !== memoId));
    }
  }

  const toDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleProcessUploads = async () => {
    setIsProcessing(true);
    let successCount = 0;
    
    for (const pair of pairedFiles) {
      try {
        const paperDataUri = await toDataUri(pair.paper.file);
        const memoDataUri = await toDataUri(pair.memo.file);
        
        const result = await processPastPaper({
          subject: pair.paper.subject,
          grade: 12,
          year: parseInt(pair.paper.year),
          paperDataUri,
          memoDataUri,
        });

        if (result.success) {
          const subjectName = pair.paper.paperNumber 
            ? `${pair.paper.subject} Paper ${pair.paper.paperNumber}` 
            : pair.paper.subject;

          setProcessedPapers(prev => [...prev, { id: pair.id, subject: subjectName, year: pair.paper.year, paperName: pair.paper.file.name, memoName: pair.memo.file.name, status: "Processing", progress: 0 }]);
          successCount++;
        } else {
           throw new Error(result.message);
        }
      } catch (error) {
        console.error("Processing failed for pair:", pair.paper.file.name, error);
        toast({
          variant: "destructive",
          title: `Failed to process ${pair.paper.file.name}`,
          description: error instanceof Error ? error.message : "An unknown error occurred.",
        });
      }
    }
    
    toast({
        title: "Processing Started",
        description: `${successCount} pairs sent for processing.`,
    });

    setPairedFiles([]);
    setIsProcessing(false);
  };
  
  const handleDeleteProcessedPaper = (id: string) => {
    setProcessedPapers(prev => prev.filter(p => p.id !== id));
    toast({
      title: "Entry Deleted",
      description: "The past paper entry has been removed.",
    });
  };

  const unpairedPapers = useMemo(() => stagedFiles.filter(f => f.type === 'paper'), [stagedFiles]);
  const unpairedMemos = useMemo(() => stagedFiles.filter(f => f.type === 'memo'), [stagedFiles]);

  const sortedAndFilteredPapers = useMemo(() => {
    return [...processedPapers]
      .filter(p => p.subject.toLowerCase().includes(searchTerm.toLowerCase()) || p.year.includes(searchTerm))
      .sort((a, b) => {
        const valA = a[sortKey].toLowerCase();
        const valB = b[sortKey].toLowerCase();
        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
  }, [processedPapers, searchTerm, sortKey, sortDirection]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };


  return (
    <div className="flex-1 space-y-6">
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-3xl">Past Paper Manager</CardTitle>
                <CardDescription>
                A three-step workflow to upload, pair, and process past exam papers. The AI will analyze the processed papers to expand the question bank.
                </CardDescription>
            </CardHeader>
        </Card>
        
        {/* Step 1: Upload */}
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><span className="flex items-center justify-center bg-primary text-primary-foreground rounded-full h-6 w-6 text-sm font-bold">1</span>Upload Documents</CardTitle>
                <CardDescription>Bulk upload all your paper and memo PDF files. The system will attempt to auto-pair them. Unpaired files will go to Step 2.</CardDescription>
            </CardHeader>
            <CardContent>
                <Label htmlFor="paper-files" className="sr-only">Past Papers & Memos</Label>
                <Input id="paper-files" type="file" accept=".pdf" multiple onChange={handleFileChange} />
            </CardContent>
        </Card>
        
        {/* Step 2: Staging & Pairing */}
        {stagedFiles.length > 0 && (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><span className="flex items-center justify-center bg-primary text-primary-foreground rounded-full h-6 w-6 text-sm font-bold">2</span>Manual Pairing</CardTitle>
                    <CardDescription>Manually pair any remaining papers with their memos. Paired files will move to Step 3.</CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-6">
                    {/* Unpaired Papers */}
                    <div className="space-y-3">
                        <h3 className="font-semibold">Unpaired Papers ({unpairedPapers.length})</h3>
                        <ScrollArea className="h-72 rounded-md border p-2">
                           {unpairedPapers.length === 0 ? <p className="p-4 text-sm text-muted-foreground">No papers to pair.</p> : unpairedPapers.map(p => (
                                <div key={p.id} className="flex items-center gap-2 p-2 rounded-md hover:bg-muted">
                                    <FileIcon className="h-4 w-4 shrink-0" />
                                    <div className="flex-1 text-sm">
                                        <p className="font-medium truncate">{p.file.name}</p>
                                        <p className="text-xs text-muted-foreground">{p.subject} / {p.year} / P{p.paperNumber} / {p.language}</p>
                                    </div>
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button size="sm" variant="outline" className="shrink-0"><Link2 className="h-4 w-4 mr-2"/>Pair with Memo</Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Pair "{p.file.name}"</DialogTitle>
                                                <DialogDescription>Select the matching memo from the list of unpaired memos.</DialogDescription>
                                            </DialogHeader>
                                            <ScrollArea className="h-60">
                                                <div className="space-y-2">
                                                    {unpairedMemos.map(m => (
                                                        <DialogClose key={m.id} asChild>
                                                            <button onClick={() => pairFiles(p.id, m.id)} className="w-full text-left flex items-center gap-2 p-2 rounded-md border hover:bg-accent">
                                                                <FileIcon className="h-4 w-4 shrink-0"/>
                                                                <div>
                                                                    <p className="font-medium">{m.file.name}</p>
                                                                    <p className="text-xs text-muted-foreground">{m.subject} / {m.year}</p>
                                                                </div>
                                                            </button>
                                                        </DialogClose>
                                                    ))}
                                                </div>
                                            </ScrollArea>
                                        </DialogContent>
                                    </Dialog>
                                    <Button size="icon" variant="ghost" onClick={() => removeStagedFile(p.id)}><Trash2 className="h-4 w-4"/></Button>
                                </div>
                           ))}
                        </ScrollArea>
                    </div>
                    {/* Unpaired Memos */}
                    <div className="space-y-3">
                        <h3 className="font-semibold">Unpaired Memos ({unpairedMemos.length})</h3>
                        <ScrollArea className="h-72 rounded-md border p-2">
                           {unpairedMemos.length === 0 ? <p className="p-4 text-sm text-muted-foreground">No memos available for pairing.</p> : unpairedMemos.map(m => (
                                <div key={m.id} className="flex items-center gap-2 p-2 rounded-md">
                                    <FileIcon className="h-4 w-4 shrink-0" />
                                    <div className="flex-1 text-sm">
                                        <p className="font-medium truncate">{m.file.name}</p>
                                        <p className="text-xs text-muted-foreground">{m.subject} / {m.year}</p>
                                    </div>
                                    <Button size="icon" variant="ghost" onClick={() => removeStagedFile(m.id)}><Trash2 className="h-4 w-4"/></Button>
                                </div>
                           ))}
                        </ScrollArea>
                    </div>
                </CardContent>
            </Card>
        )}
        
        {/* Step 3: Process */}
        {pairedFiles.length > 0 && (
            <Card>
                 <CardHeader>
                    <CardTitle className="flex items-center gap-2"><span className="flex items-center justify-center bg-primary text-primary-foreground rounded-full h-6 w-6 text-sm font-bold">3</span>Ready to Process ({pairedFiles.length})</CardTitle>
                    <CardDescription>These pairs are ready to be sent to the AI for analysis. Click "Process" to begin.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {pairedFiles.map(pair => (
                             <div key={pair.id} className="flex items-center gap-3 p-2 rounded-lg border">
                                <Link2 className="h-5 w-5 text-green-500 shrink-0"/>
                                <div className="flex-1 grid grid-cols-2 gap-2 text-sm">
                                    <p className="font-medium truncate"><span className="text-muted-foreground">Paper:</span> {pair.paper.file.name}</p>
                                    <p className="font-medium truncate"><span className="text-muted-foreground">Memo:</span> {pair.memo.file.name}</p>
                                </div>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removePairedFile(pair.id)}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleProcessUploads} disabled={isProcessing} className="w-full sm:w-auto">
                        {isProcessing ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" /> }
                        Process Paired File(s)
                    </Button>
                </CardFooter>
            </Card>
        )}

        {/* Processed Papers Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>Uploaded Past Papers ({processedPapers.length})</CardTitle>
                <CardDescription>Status and management of processed papers.</CardDescription>
              </div>
               <div className="relative w-full sm:w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                        type="search" 
                        placeholder="Search by subject or year..." 
                        className="pl-8 w-full"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort('subject')}>
                      Subject <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                     <Button variant="ghost" onClick={() => handleSort('year')}>
                      Year <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>Paper File</TableHead>
                  <TableHead>Memo File</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedAndFilteredPapers.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.subject}</TableCell>
                    <TableCell>{item.year}</TableCell>
                    <TableCell className="font-mono text-xs">{item.paperName}</TableCell>
                    <TableCell className="font-mono text-xs">{item.memoName}</TableCell>
                    <TableCell>
                      {item.status === 'Processing' ? (
                        <div className="flex items-center gap-2 w-32">
                           <Progress value={item.progress} className="flex-1" />
                           <span className="text-muted-foreground text-xs font-medium">{Math.round(item.progress)}%</span>
                        </div>
                      ) : (
                         <span className={cn("font-medium", item.status === 'Processed' ? "text-green-600" : "text-red-600")}>{item.status}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                       <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button variant="destructive" size="icon">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the
                              past paper entry and its associated data from the question bank.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteProcessedPaper(item.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
             {sortedAndFilteredPapers.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                    <p>No processed papers to display.</p>
                </div>
            )}
          </CardContent>
        </Card>
    </div>
  );
}


    

    