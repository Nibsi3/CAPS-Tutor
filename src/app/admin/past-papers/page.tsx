
'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
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
  AlertDialogTrigger,
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
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, doc, addDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";


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
    questionCount?: number;
    fileUrl?: string; // from PastPaper entity, not used yet
    teacherId?: string; // from PastPaper entity
    gradeLevel?: number; // from PastPaper entity
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
  const { user } = useUser();
  const firestore = useFirestore();
  const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([]);
  const [pairedFiles, setPairedFiles] = useState<PairedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('subject');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const pastPapersCollectionRef = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, `users/${user.uid}/pastPapers`);
  }, [user, firestore]);

  const { data: processedPapers, isLoading: arePapersLoading } = useCollection<ProcessedPaper>(pastPapersCollectionRef);

  const prevPairedCount = useRef(0);
  useEffect(() => {
    if (pairedFiles.length > prevPairedCount.current) {
      const newPairsCount = pairedFiles.length - prevPairedCount.current;
      toast({
        title: "Files Paired Automatically",
        description: `${newPairsCount} paper(s) and memo(s) were successfully paired.`,
      });
    }
    prevPairedCount.current = pairedFiles.length;
  }, [pairedFiles, toast]);


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

  const getPairingKey = (fileInfo: Omit<StagedFile, 'id' | 'file' | 'type'> & {file: File}) => {
    let name = fileInfo.file.name.toLowerCase();
    // Remove extensions, memo/paper keywords, years, languages, paper numbers
    name = name
      .replace(/\.pdf|\.docx|\.doc/, '')
      .replace(/memo(randum)?/, '')
      .replace(/paper|p\d/, '')
      .replace(/20\d{2}/, '')
      .replace(/eng(lish)?|afr(ikaans)?/, '')
      .replace(/[\s\-_]/g, ''); // Remove all whitespace and dashes
      
    // A simplified key
    return `${fileInfo.subject}-${name}`;
  }


  const autoPairFiles = useCallback((allFiles: StagedFile[]) => {
    const fileGroups = new Map<string, { paper?: StagedFile, memo?: StagedFile }>();
    const remainingFiles: StagedFile[] = [];
    const newPairs: PairedFile[] = [];

    // Group files by pairing key
    for (const file of allFiles) {
      const parsedInfo = parseFileName(file.file);
      const key = getPairingKey({ ...parsedInfo, file: file.file });

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
    for (const group of fileGroups.values()) {
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
         setPairedFiles(currentPaired => {
            const existingPairIds = new Set(currentPaired.map(p => p.id));
            const uniqueNewPairs = newPairs.filter(p => !existingPairIds.has(p.id));
            return [...currentPaired, ...uniqueNewPairs];
        });
      }

      const remainingFileMap = new Map(remainingFiles.map(f => [f.id, f]));
      return Array.from(remainingFileMap.values());
    });
  }, [autoPairFiles]);


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
    if (!user || !pastPapersCollectionRef) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to process papers.",
      });
      return;
    }
    setIsProcessing(true);
    let successCount = 0;
    
    const pairsToProcess = [...pairedFiles];
    setPairedFiles([]);
    
    for (const pair of pairsToProcess) {
      // 1. Create a record in Firestore immediately
      const subjectName = pair.paper.paperNumber 
        ? `${pair.paper.subject} Paper ${pair.paper.paperNumber}` 
        : pair.paper.subject;

      const paperDocData = {
        teacherId: user.uid,
        gradeLevel: 12, // Assuming Grade 12
        subject: subjectName,
        year: pair.paper.year,
        paperName: pair.paper.file.name,
        memoName: pair.memo.file.name,
        status: "Processing" as const,
        questionCount: 0,
        fileUrl: '', // This would be the storage URL in a real app
      };
      
      let docRef;
      try {
        docRef = await addDoc(pastPapersCollectionRef, paperDocData);
        successCount++;
      } catch (error) {
        console.error("Failed to create Firestore record for:", pair.paper.file.name, error);
        toast({
          variant: "destructive",
          title: `Failed to queue ${pair.paper.file.name}`,
          description: "Could not save initial record to the database.",
        });
        continue; // Skip to the next pair
      }

      // 2. Trigger the AI flow in the background (don't await the whole thing)
      // We will handle the result in a non-blocking way.
      (async () => {
        try {
          const paperDataUri = await toDataUri(pair.paper.file);
          const memoDataUri = await toDataUri(pair.memo.file);
          
          const result = await processPastPaper({
            docId: docRef.id,
            userId: user.uid,
            subject: pair.paper.subject,
            grade: 12,
            year: parseInt(pair.paper.year),
            paperDataUri,
            memoDataUri,
          });

          // 3. Update the Firestore doc with the result from the flow
          const finalDocRef = doc(firestore, `users/${user.uid}/pastPapers`, docRef.id);
          if (result.success) {
            await updateDoc(finalDocRef, {
              status: 'Processed',
              questionCount: result.questionCount
            });
          } else {
            await updateDoc(finalDocRef, { status: 'Failed' });
             toast({
                variant: "destructive",
                title: `Processing Failed: ${pair.paper.file.name}`,
                description: result.message,
            });
          }
        } catch (error) {
          console.error("AI flow or update failed for doc ID:", docRef.id, error);
          const finalDocRef = doc(firestore, `users/${user.uid}/pastPapers`, docRef.id);
          await updateDoc(finalDocRef, { status: 'Failed' });
           toast({
                variant: "destructive",
                title: `Processing Error: ${pair.paper.file.name}`,
                description: error instanceof Error ? error.message : "An unknown error occurred during AI analysis.",
            });
        }
      })();
    }
    
    if (successCount > 0) {
      toast({
          title: "Processing Started",
          description: `${successCount} pair(s) have been queued for analysis. Their status will update in the table below.`,
      });
    }

    setIsProcessing(false);
  };
  
  const handleDeleteProcessedPaper = async (id: string) => {
    if (!user) return;
    const docRef = doc(firestore, `users/${user.uid}/pastPapers`, id);
    try {
        await deleteDoc(docRef);
        toast({
            title: "Entry Deleted",
            description: "The past paper entry has been removed.",
        });
    } catch (error) {
        const permissionError = new FirestorePermissionError({
            path: docRef.path,
            operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
        toast({
            variant: "destructive",
            title: "Deletion Failed",
            description: "You do not have permission to delete this entry.",
        });
    }
  };

  const unpairedPapers = useMemo(() => stagedFiles.filter(f => f.type === 'paper'), [stagedFiles]);
  const unpairedMemos = useMemo(() => stagedFiles.filter(f => f.type === 'memo'), [stagedFiles]);

  const sortedAndFilteredPapers = useMemo(() => {
    if (!processedPapers) return [];
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
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><span className="flex items-center justify-center bg-primary text-primary-foreground rounded-full h-6 w-6 text-sm font-bold">3</span>Ready to Process ({pairedFiles.length})</CardTitle>
                <CardDescription>These pairs are ready to be sent to the AI for analysis. Click "Process" to begin.</CardDescription>
            </CardHeader>
            {pairedFiles.length > 0 && (
                <>
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
                        <Button onClick={handleProcessUploads} disabled={isProcessing || pairedFiles.length === 0} className="w-full sm:w-auto">
                            {isProcessing ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" /> }
                            Process Paired File(s)
                        </Button>
                    </CardFooter>
                </>
            )}
        </Card>
        

        {/* Processed Papers Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>Uploaded Past Papers ({processedPapers?.length || 0})</CardTitle>
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
                  <TableHead>Status</TableHead>
                  <TableHead>Questions Found</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {arePapersLoading && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      <Loader className="mx-auto h-8 w-8 animate-spin text-primary" />
                    </TableCell>
                  </TableRow>
                )}
                {sortedAndFilteredPapers.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.subject}</TableCell>
                    <TableCell>{item.year}</TableCell>
                    <TableCell className="font-mono text-xs">{item.paperName}</TableCell>
                    <TableCell>
                       <span className={cn("font-medium px-2 py-1 rounded-full text-xs", 
                          item.status === 'Processed' ? "bg-green-100 text-green-800" : 
                          item.status === 'Failed' ? "bg-red-100 text-red-800" :
                          "bg-yellow-100 text-yellow-800 animate-pulse"
                        )}>
                          {item.status}
                        </span>
                    </TableCell>
                     <TableCell className="font-semibold text-center">{item.questionCount ?? 'N/A'}</TableCell>
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
             {!arePapersLoading && sortedAndFilteredPapers.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                    <p>No processed papers to display.</p>
                </div>
            )}
          </CardContent>
        </Card>
    </div>
  );
}
