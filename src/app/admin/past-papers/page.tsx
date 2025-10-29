
'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, Loader, File as FileIcon, X, Trash2, Link2, Search, ArrowUpDown, RefreshCw, AlertTriangle } from "lucide-react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, doc, addDoc, deleteDoc, updateDoc, writeBatch, DocumentReference } from 'firebase/firestore';
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";


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
  subject: string;
}

interface GeneratedQuestion {
    questionNumber: string;
    questionText: string;
    marks: number;
    answer: string;
}

interface ProcessedPaper {
    id: string;
    subject: string;
    year: string;
    paperName: string;
    memoName: string;
    status: 'Processing' | 'Processed' | 'Failed';
    questionCount?: number;
    fileUrl?: string;
    teacherId?: string;
    gradeLevel?: number;
    generatedQuestions?: GeneratedQuestion[];
}

interface DuplicateFile {
  newFile: StagedFile;
  existingPaper: ProcessedPaper;
}


type SortKey = 'subject' | 'year';

const subjectKeywords: Record<string, string[]> = {
    "Mathematics": ["mathematics", "maths", "wiskunde"],
    "Physical Sciences": ["physical sciences", "physical science", "phys sci", "fisiese wetenskappe"],
    "Life Sciences": ["life sciences", "life science", "life sci", "bio", "lewenswetenskappe"],
    "Accounting": ["accounting", "rekeningkunde"],
    "Business Studies": ["business studies", "bus stud", "besigheidstudies"],
    "Economics": ["economics", "ekonomie"],
    "Geography": ["geography", "geo", "aardrykskunde"],
    "History": ["history", "geskiedenis"],
    "Tourism": ["tourism", "toerisme"],
    "Computer Applications Technology": ["cat", "computer applications technology"],
    "Information Technology": ["it", "information technology"],
    "Consumer Studies": ["consumer studies", "verbruikerstudie"],
    "Engineering Graphics & Design": ["egd", "engineering graphics", "engineering graphics & design"],
    "Mathematical Literacy": ["maths lit", "math lit", "mathematical literacy", "wiskundige geletterdheid"],
    "Technical Sciences": ["technical sciences"],
    "Visual Arts": ["visual arts"],
    "Mechanical Technology": ["mechanical technology", "mechanical tech"],
    "Dance Studies": ["dance studies"],
    "Civil Technology": ["civil technology", "civil tech"],
    "Dramatic Arts": ["dramatic arts"],
    "Electrical Technology": ["electrical technology", "electrical tech"],
    "Agricultural Management Practices": ["agricultural management practices", "agric management"],
    "Agricultural Sciences": ["agricultural sciences", "agric sci", "agricultural science"],
    "Agricultural Technology": ["agricultural technology", "agric tech"],
    "English FAL": ["english fal", "english first additional language"],
    "English HL": ["english hl", "english home language"],
    "Afrikaans HT": ["afrikaans ht", "afrikaans huistaal"],
    "Afrikaans EAT": ["afrikaans eat", "afrikaans eerste addisionele taal"],
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
  const [selectedPapers, setSelectedPapers] = useState<string[]>([]);
  const [reprocessingId, setReprocessingId] = useState<string | null>(null);
  
  const [duplicateFiles, setDuplicateFiles] = useState<DuplicateFile[]>([]);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingSubject, setEditingSubject] = useState<string>('');

  const [totalBatchSize, setTotalBatchSize] = useState(0);
  const [processedInBatch, setProcessedInBatch] = useState(0);

  const [reprocessingProgress, setReprocessingProgress] = useState(0);


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
  }, [pairedFiles.length, toast]);


  const pastPapersCollectionRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, `pastPapers`);
  }, [firestore]);

  const { data: processedPapers, isLoading: arePapersLoading } = useCollection<ProcessedPaper>(pastPapersCollectionRef);


  const parseFileName = (file: File): Omit<StagedFile, 'id' | 'file'> => {
      const name = file.name.toLowerCase().replace(/_/g, ' ').replace(/-/g, ' ');
      
      const type = (name.includes('memo') || name.includes('memorandum') || name.includes('answer book') || name.includes('marking guidelines')) ? 'memo' : 'paper';
      
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
          }
      }

      let paperNumber = '';
      const paperMatch = name.match(/p(\d)|paper\s?(\d)/);
      if (paperMatch) {
          paperNumber = paperMatch[1] || paperMatch[2];
      }
      
      return { subject, year, type, paperNumber, language };
  }
  
  const getPairingKey = useCallback((fileName: string): string => {
      const noiseWords = [
          'memo', 'memorandum', 'answer book', 'marking guidelines', 'addendum',
          'nsc', 'ieb', 'sc', 
          'eng', 'afr', 'english', 'afrikaans',
          'hl', 'ht', 'fal', 'eat', 'huistaal', 'eerste addisionele taal', 'home language', 'first additional language',
          'fs', 'gp', 'wc', 'ec', 'nc', 'nw', 'lp', 'mp', // Provinces
      ];

      const noiseRegex = new RegExp(`\\b(${noiseWords.join('|')})\\b`, 'gi');
      
      let cleanName = fileName.toLowerCase()
        .replace(/\.(pdf|docx|doc)$/i, '') // Remove file extensions
        .replace(noiseRegex, '') // Remove specific noise words
        .replace(/p\d/gi, '') // Remove paper numbers like p1, p2
        .replace(/\(1\)|\(2\)|\(3\)/g, '') // Remove copy indicators
        .replace(/[^a-z0-9]/gi, ' ') // Replace non-alphanumeric chars with a space
        .replace(/\s+/g, ' ') // Collapse multiple spaces
        .trim();
        
      // Also remove year from the key to avoid mismatches
      cleanName = cleanName.replace(/20\d{2}/g, '').trim();

      return cleanName;
  }, []);

  const autoPairFiles = useCallback((allFiles: StagedFile[]) => {
    const fileGroups = new Map<string, StagedFile[]>();
    const newPairs: PairedFile[] = [];
    let remainingFiles: StagedFile[] = [...allFiles];

    // Attempt to pair using subject, year, and paper number first
    const specificFileGroups = new Map<string, StagedFile[]>();
    for (const file of allFiles) {
        if (file.subject !== 'Unknown' && file.year && file.paperNumber) {
            const key = `${file.subject}-${file.year}-p${file.paperNumber}-${file.language}`;
            if (!specificFileGroups.has(key)) specificFileGroups.set(key, []);
            specificFileGroups.get(key)!.push(file);
        }
    }

    for (const [key, groupFiles] of specificFileGroups.entries()) {
        const paper = groupFiles.find(f => f.type === 'paper');
        const memo = groupFiles.find(f => f.type === 'memo');

        if (paper && memo) {
            newPairs.push({ id: `${paper.id}-${memo.id}`, paper, memo, subject: paper.subject });
            remainingFiles = remainingFiles.filter(f => f.id !== paper.id && f.id !== memo.id);
        }
    }

    // Fallback to more generic pairing key for remaining files
    const genericFileGroups = new Map<string, StagedFile[]>();
    for (const file of remainingFiles) {
        const key = getPairingKey(file.file.name);
        if (!genericFileGroups.has(key)) genericFileGroups.set(key, []);
        genericFileGroups.get(key)!.push(file);
    }

    for (const [key, groupFiles] of genericFileGroups.entries()) {
        if (key && groupFiles.length >= 2) {
            const paper = groupFiles.find(f => f.type === 'paper');
            const memo = groupFiles.find(f => f.type === 'memo');

            if (paper && memo) {
                newPairs.push({ id: `${paper.id}-${memo.id}`, paper, memo, subject: paper.subject });
                remainingFiles = remainingFiles.filter(f => f.id !== paper.id && f.id !== memo.id);
            }
        }
    }
    
    return { newPairs, remainingFiles };
  }, [getPairingKey]);


  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !processedPapers) return;

    const newStagedFiles: StagedFile[] = Array.from(files).map((file, i) => ({
      id: `${file.name}-${Date.now()}-${i}`,
      file,
      ...parseFileName(file)
    }));

    const uniqueNewFiles: StagedFile[] = [];
    const detectedDuplicates: DuplicateFile[] = [];
    const processedPaperKeys = new Map(processedPapers.map(p => [getPairingKey(p.paperName), p]));

    for (const newFile of newStagedFiles) {
      const newFileKey = getPairingKey(newFile.file.name);
      if (processedPaperKeys.has(newFileKey)) {
        detectedDuplicates.push({ newFile, existingPaper: processedPaperKeys.get(newFileKey)! });
      } else {
        uniqueNewFiles.push(newFile);
      }
    }
    
    if (detectedDuplicates.length > 0) {
      setDuplicateFiles(detectedDuplicates);
      setShowDuplicateDialog(true);
    }
  
    setStagedFiles(currentStaged => {
        const allUnpairedFiles = [...currentStaged, ...uniqueNewFiles];
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

  }, [autoPairFiles, parseFileName, processedPapers, getPairingKey]);

  const handleDuplicateDecision = (replace: boolean) => {
    if (replace) {
      const paperIdsToDelete: string[] = duplicateFiles.map(d => d.existingPaper.id);

      // We'll delete the old ones and add the new ones to be processed
      handleBulkDelete(paperIdsToDelete);
      
      const allUnpairedFiles = [...stagedFiles, ...duplicateFiles.map(d => d.newFile)];
      const { newPairs, remainingFiles } = autoPairFiles(allUnpairedFiles);

      if (newPairs.length > 0) {
        setPairedFiles(currentPaired => [...currentPaired, ...newPairs]);
      }
      setStagedFiles(remainingFiles);
      
      toast({
        title: "Duplicates Replaced",
        description: `${duplicateFiles.length} existing entries will be replaced with the new files.`
      });
    } else {
      toast({
        title: "Duplicates Skipped",
        description: `${duplicateFiles.length} new files were ignored as they matched existing entries.`
      });
    }

    setDuplicateFiles([]);
    setShowDuplicateDialog(false);
  }


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
      setPairedFiles(prev => [...prev, { id: `${paper.id}-${memo.id}`, paper, memo, subject: paper.subject }]);
      setStagedFiles(prev => prev.filter(f => f.id !== paperId && f.id !== memoId));
    }
  }

    const handleSubjectChange = (id: string, newSubject: string, type: 'staged' | 'paired') => {
        if (type === 'staged') {
            setStagedFiles(current => current.map(f => f.id === id ? { ...f, subject: newSubject } : f));
        } else if (type === 'paired') {
            setPairedFiles(current => current.map(p => p.id === id ? { ...p, subject: newSubject } : p));
        }
    };


  const toDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleProcessUploads = async () => {
    if (!user || !pastPapersCollectionRef || !firestore || pairedFiles.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Cannot process. Ensure you are logged in and have files ready.",
      });
      return;
    }
    if (isProcessing) return;

    setIsProcessing(true);
    setTotalBatchSize(pairedFiles.length);
    setProcessedInBatch(0);
    
    const filesToProcess = [...pairedFiles];
    setPairedFiles([]); // Clear the queue visually

    for (const [index, pair] of filesToProcess.entries()) {
      const subjectName = pair.paper.paperNumber 
        ? `${pair.subject} Paper ${pair.paper.paperNumber}` 
        : pair.subject;

      const paperDocData = {
        teacherId: user.uid,
        gradeLevel: 12,
        subject: subjectName,
        year: pair.paper.year,
        paperName: pair.paper.file.name,
        memoName: pair.memo.file.name,
        status: "Processing" as const,
        questionCount: 0,
        fileUrl: '',
        generatedQuestions: [],
      };

      try {
        const docRef = await addDoc(pastPapersCollectionRef, paperDocData);
        setProcessedInBatch(prev => prev + 1);

        // This part runs in the background. No `await` on the async IIFE.
        (async () => {
          try {
            const paperDataUri = await toDataUri(pair.paper.file);
            const memoDataUri = await toDataUri(pair.memo.file);
            
            const result = await processPastPaper({
              docId: docRef.id,
              userId: user.uid,
              subject: pair.subject,
              grade: 12,
              year: parseInt(pair.paper.year),
              paperDataUri,
              memoDataUri,
            });

            await updateDoc(docRef, {
                status: result.success ? 'Processed' : 'Failed',
                questionCount: result.generatedQuestions?.length || 0,
                generatedQuestions: result.generatedQuestions || [],
            });

            if (!result.success) {
              toast({
                  variant: "destructive",
                  title: `Processing Failed: ${pair.paper.file.name}`,
                  description: result.message,
              });
            }
          } catch (error) {
              console.error("AI flow or update failed for doc ID:", docRef.id, error);
              await updateDoc(docRef, { status: 'Failed' });
              toast({
                    variant: "destructive",
                    title: `Processing Error: ${pair.paper.file.name}`,
                    description: error instanceof Error ? error.message : "An unknown error occurred during AI analysis.",
              });
          }
        })();
      } catch (serverError) {
        const permissionError = new FirestorePermissionError({
          path: pastPapersCollectionRef.path,
          operation: 'create',
          requestResourceData: paperDocData,
        });
        errorEmitter.emit('permission-error', permissionError);
        toast({
          variant: 'destructive',
          title: 'Upload Failed',
          description: `Could not queue ${pair.paper.file.name}. Stopping process.`
        });
        // Put the remaining files back in the queue
        const remainingFiles = filesToProcess.slice(index);
        setPairedFiles(remainingFiles);
        setIsProcessing(false);
        return; // Stop the whole process on a firestore error
      }
    }
    
    setIsProcessing(false);
    toast({
        title: "Batch Processing Started",
        description: `${filesToProcess.length} files have been queued for AI analysis in the background.`
    });
    
    setTimeout(() => {
        setTotalBatchSize(0);
        setProcessedInBatch(0);
    }, 5000);
  };
  
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (reprocessingId) {
      setReprocessingProgress(0);
      let progress = 0;
      interval = setInterval(() => {
        progress += Math.random() * 10;
        if (progress >= 100) {
          // Don't set to 100, let the final status update handle it
          clearInterval(interval);
        } else {
          setReprocessingProgress(progress);
        }
      }, 500);
    }
    return () => clearInterval(interval);
  }, [reprocessingId]);

  const handleReprocessPaper = async (paper: ProcessedPaper) => {
    if (!user || !firestore) return;
    setReprocessingId(paper.id);

    const docRef = doc(firestore, `pastPapers`, paper.id);

    try {
        await updateDoc(docRef, { status: 'Processing', questionCount: 0, generatedQuestions: [] });

        const result = await processPastPaper({
            docId: paper.id,
            userId: user.uid,
            subject: paper.subject,
            grade: paper.gradeLevel || 12,
            year: parseInt(paper.year),
        });

        await updateDoc(docRef, {
            status: result.success ? 'Processed' : 'Failed',
            questionCount: result.generatedQuestions?.length || 0,
            generatedQuestions: result.generatedQuestions || [],
        });

        if(result.success) {
            toast({
                title: "Reprocessing Complete",
                description: `${paper.paperName} has been successfully re-analyzed.`
            });
        } else {
             toast({
                variant: "destructive",
                title: `Reprocessing Failed: ${paper.paperName}`,
                description: result.message,
            });
        }

    } catch (error) {
        console.error("Reprocessing failed:", error);
        await updateDoc(docRef, { status: 'Failed' });
        toast({
            variant: "destructive",
            title: "Reprocessing Error",
            description: "An unexpected error occurred while reprocessing the paper.",
        });
    } finally {
        setReprocessingId(null);
        setReprocessingProgress(0);
    }
  };


  const handleDeleteProcessedPaper = async (id: string) => {
    if (!firestore) return;
    const docRef = doc(firestore, 'pastPapers', id);
    
    deleteDoc(docRef)
      .catch((serverError) => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  const handleBulkDelete = (paperIds?: string[]) => {
    const idsToDelete = paperIds || selectedPapers;
    if (!firestore || idsToDelete.length === 0) return;
    
    const batch = writeBatch(firestore);
    idsToDelete.forEach(id => {
        const docRef = doc(firestore, `pastPapers`, id);
        batch.delete(docRef);
    });

    batch.commit()
      .then(() => {
        toast({
            title: "Bulk Delete Successful",
            description: `${idsToDelete.length} entries have been removed.`,
        });
        if (!paperIds) {
          setSelectedPapers([]);
        }
      })
      .catch(serverError => {
        if (idsToDelete.length > 0) {
            const firstDocRef = doc(firestore, `pastPapers`, idsToDelete[0]);
            const permissionError = new FirestorePermissionError({
                path: firstDocRef.path,
                operation: 'delete',
            });
            errorEmitter.emit('permission-error', permissionError);
        }
      });
  }
  
  const handleSubjectUpdate = async () => {
    if (!editingId || !firestore) return;

    const docRef = doc(firestore, 'pastPapers', editingId);
    
    try {
      await updateDoc(docRef, { subject: editingSubject });
      toast({
        title: "Subject Updated",
        description: "The subject name has been saved.",
      });
    } catch (error) {
       console.error("Subject update failed:", error);
       const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'update',
          requestResourceData: { subject: editingSubject },
        });
       errorEmitter.emit('permission-error', permissionError);
       toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Could not save the new subject name.",
      });
    } finally {
      setEditingId(null);
      setEditingSubject('');
    }
  };


  const unpairedPapers = useMemo(() => stagedFiles.filter(f => f.type === 'paper'), [stagedFiles]);
  const unpairedMemos = useMemo(() => stagedFiles.filter(f => f.type === 'memo'), [stagedFiles]);

  const sortedAndFilteredPapers = useMemo(() => {
    if (!processedPapers) return [];
    return [...processedPapers]
      .filter(p => p.subject.toLowerCase().includes(searchTerm.toLowerCase()) || (p.year && p.year.includes(searchTerm)))
      .sort((a, b) => {
        const valA = a[sortKey]?.toLowerCase() ?? '';
        const valB = b[sortKey]?.toLowerCase() ?? '';
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

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
        setSelectedPapers(sortedAndFilteredPapers.map(p => p.id));
    } else {
        setSelectedPapers([]);
    }
  }


  return (
    <div className="flex-1 space-y-6">
        <AlertDialog open={showDuplicateDialog} onOpenChange={setShowDuplicateDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2"><AlertTriangle className="text-destructive"/> Duplicate File(s) Detected</AlertDialogTitle>
              <AlertDialogDescription>
                You uploaded {duplicateFiles.length} file(s) that match entries already processed. What would you like to do?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <ScrollArea className="mt-4 h-40 rounded-md border p-2">
                {duplicateFiles.map((d, i) => (
                <div key={i} className="mb-2 rounded-md border bg-muted p-2 text-sm">
                    <div><b>New file:</b> {d.newFile.file.name}</div>
                    <div><b>Matches:</b> {d.existingPaper.paperName}</div>
                </div>
                ))}
            </ScrollArea>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => handleDuplicateDecision(false)}>Skip Duplicates</AlertDialogCancel>
              <AlertDialogAction onClick={() => handleDuplicateDecision(true)} className={buttonVariants({ variant: "destructive" })}>Replace Existing</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

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
                <Input id="paper-files" type="file" accept=".pdf,.doc,.docx" multiple onChange={handleFileChange} />
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
                    <div className="space-y-3">
                        <h3 className="font-semibold">Unpaired Papers ({unpairedPapers.length})</h3>
                        <ScrollArea className="h-72 rounded-md border p-2">
                           {unpairedPapers.length === 0 ? <p className="p-4 text-sm text-muted-foreground">No papers to pair.</p> : unpairedPapers.map(p => (
                                <div key={p.id} className="flex items-center gap-2 p-2 rounded-md hover:bg-muted">
                                    <FileIcon className="h-4 w-4 shrink-0" />
                                    <div className="flex-1 text-sm space-y-1">
                                        <p className="font-medium truncate">{p.file.name}</p>
                                        <div className="flex gap-2 items-center">
                                            <Input value={p.subject} onChange={(e) => handleSubjectChange(p.id, e.target.value, 'staged')} className="h-7 text-xs" />
                                            <span className="text-xs text-muted-foreground">{p.year}</span>
                                            <span className="text-xs text-muted-foreground">P{p.paperNumber}</span>
                                            <span className="text-xs text-muted-foreground">{p.language}</span>
                                        </div>
                                    </div>
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button size="sm" variant="outline" className="shrink-0"><Link2 className="h-4 w-4 mr-2"/>Pair</Button>
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
                    <div className="space-y-3">
                        <h3 className="font-semibold">Unpaired Memos ({unpairedMemos.length})</h3>
                        <ScrollArea className="h-72 rounded-md border p-2">
                           {unpairedMemos.length === 0 ? <p className="p-4 text-sm text-muted-foreground">No memos available for pairing.</p> : unpairedMemos.map(m => (
                                <div key={m.id} className="flex items-center gap-2 p-2 rounded-md">
                                    <FileIcon className="h-4 w-4 shrink-0" />
                                    <div className="flex-1 text-sm space-y-1">
                                        <p className="font-medium truncate">{m.file.name}</p>
                                        <div className="flex gap-2 items-center">
                                          <Input value={m.subject} onChange={(e) => handleSubjectChange(m.id, e.target.value, 'staged')} className="h-7 text-xs" />
                                          <span className="text-xs text-muted-foreground">{m.year}</span>
                                        </div>
                                    </div>
                                    <Button size="icon" variant="ghost" onClick={() => removeStagedFile(m.id)}><Trash2 className="h-4 w-4"/></Button>
                                </div>
                           ))}
                        </ScrollArea>
                    </div>
                </CardContent>
            </Card>
        )}
        
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="flex items-center gap-2"><span className="flex items-center justify-center bg-primary text-primary-foreground rounded-full h-6 w-6 text-sm font-bold">3</span>Ready to Process ({pairedFiles.length})</CardTitle>
                        <CardDescription>These pairs are ready for AI analysis. Click "Process" to begin queuing them.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            {pairedFiles.length > 0 && (
                <>
                    <CardContent>
                        <div className="space-y-4">
                            {pairedFiles.map(pair => (
                                <div key={pair.id} className="flex items-start gap-3 p-3 rounded-lg border">
                                    <Link2 className="h-5 w-5 text-green-500 shrink-0 mt-2"/>
                                    <div className="flex-1 space-y-2">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                                            <div className="text-sm">
                                                <Label className="text-xs text-muted-foreground">Paper</Label>
                                                <p className="font-medium truncate">{pair.paper.file.name}</p>
                                            </div>
                                             <div className="text-sm">
                                                <Label className="text-xs text-muted-foreground">Memo</Label>
                                                <p className="font-medium truncate">{pair.memo.file.name}</p>
                                            </div>
                                        </div>
                                         <div>
                                            <Label htmlFor={`subject-${pair.id}`} className="text-xs">Subject</Label>
                                            <Input 
                                                id={`subject-${pair.id}`}
                                                value={pair.subject} 
                                                onChange={(e) => handleSubjectChange(pair.id, e.target.value, 'paired')} 
                                                className="h-8"
                                            />
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => removePairedFile(pair.id)}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </>
            )}
             <CardFooter className="flex-col items-start gap-4">
                {(isProcessing || totalBatchSize > 0) && (
                    <div className="w-full">
                        <Progress value={(processedInBatch / totalBatchSize) * 100} className="w-full" />
                        <p className="text-sm text-muted-foreground mt-2">
                            Queued {processedInBatch} of {totalBatchSize} files.
                        </p>
                    </div>
                )}
                <Button onClick={handleProcessUploads} disabled={isProcessing || pairedFiles.length === 0} className="w-full sm:w-auto">
                    {isProcessing ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" /> }
                    {isProcessing ? `Processing...` : `Process ${pairedFiles.length} Paired File(s)`}
                </Button>
            </CardFooter>
        </Card>
        

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>Uploaded Past Papers ({processedPapers?.length || 0})</CardTitle>
                <CardDescription>Status and management of processed papers.</CardDescription>
              </div>
              <div className="flex gap-2 items-center w-full sm:w-auto">
                {selectedPapers.length > 0 && (
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button variant="destructive">
                                <Trash2 className="mr-2 h-4 w-4" /> Delete Selected ({selectedPapers.length})
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the
                               {selectedPapers.length} selected entries.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleBulkDelete()}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                )}
                <div className="relative flex-1 sm:flex-initial sm:w-64">
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
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                   <TableHead className="w-[50px]">
                     <Checkbox
                        checked={selectedPapers.length > 0 && !!sortedAndFilteredPapers.length && selectedPapers.length === sortedAndFilteredPapers.length}
                        onCheckedChange={(checked) => handleSelectAll(!!checked)}
                        aria-label="Select all"
                      />
                  </TableHead>
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
                    <TableCell colSpan={7} className="text-center">
                      <Loader className="mx-auto h-8 w-8 animate-spin text-primary" />
                    </TableCell>
                  </TableRow>
                )}
                {sortedAndFilteredPapers.map((item) => {
                   const isReprocessingThisItem = reprocessingId === item.id;
                   const progressValue = isReprocessingThisItem ? reprocessingProgress : item.status === 'Processed' ? 100 : item.status === 'Processing' ? 50 : 0;
                   const displayValue = isReprocessingThisItem ? `${Math.round(progressValue)}%` : item.status === 'Processed' ? `100%` : item.status === 'Processing' ? `...` : '';
                  return (
                  <TableRow 
                    key={item.id}
                    data-state={selectedPapers.includes(item.id) && "selected"}
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedPapers.includes(item.id)}
                        onCheckedChange={(checked) => {
                          setSelectedPapers(prev => 
                            checked ? [...prev, item.id] : prev.filter(id => id !== item.id)
                          );
                        }}
                        aria-label="Select row"
                      />
                    </TableCell>
                    <TableCell 
                      className="font-medium"
                      onDoubleClick={() => {
                        setEditingId(item.id);
                        setEditingSubject(item.subject);
                      }}
                    >
                      {editingId === item.id ? (
                        <Input
                          value={editingSubject}
                          onChange={(e) => setEditingSubject(e.target.value)}
                          onBlur={handleSubjectUpdate}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSubjectUpdate();
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                          autoFocus
                          className="h-8"
                        />
                      ) : (
                        item.subject
                      )}
                    </TableCell>
                    <TableCell>{item.year}</TableCell>
                    <TableCell className="font-mono text-xs">{item.paperName}</TableCell>
                    <TableCell>
                      <div className="w-36 flex items-center gap-2">
                         <Progress 
                            value={progressValue}
                            displayValue={displayValue}
                            className={cn('h-6 flex-1', item.status === 'Failed' && '[&>*]:bg-destructive')}
                         />
                         <span className={cn("font-medium text-xs", 
                            item.status === 'Processed' ? "text-green-600" : 
                            item.status === 'Failed' ? "text-red-600" :
                            "text-yellow-600 animate-pulse"
                          )}>
                            {item.status}
                          </span>
                      </div>
                    </TableCell>
                     <TableCell className="font-semibold text-center">
                        <div className="flex flex-col items-center justify-center">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => handleReprocessPaper(item)}
                                disabled={reprocessingId === item.id || item.status === 'Processing'}
                                aria-label="Reprocess"
                            >
                                {isReprocessingThisItem ? (
                                    <Loader className="h-4 w-4 animate-spin" />
                                ) : (
                                    <RefreshCw className="h-4 w-4" />
                                )}
                            </Button>
                            <span>{item.questionCount ?? 'N/A'}</span>
                        </div>
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
                )})}
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
