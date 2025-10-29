
'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, Loader, File as FileIcon, X, Trash2 } from "lucide-react";
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
import { processPastPaper } from "@/ai/flows/past-paper-processing";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";


// Add more specific keywords for subject detection. Longer, more unique keywords first.
const subjectKeywords: Record<string, string[]> = {
    "Mathematics": ["mathematics", "maths", "wiskunde"],
    "Physical Sciences": ["physical sciences", "physical science", "phys sci", "fisiese wetenskappe", "fisies"],
    "Life Sciences": ["life sciences", "life science", "life sci", "bio", "lewenswetenskappe", "lewe"],
    "Accounting": ["accounting", "rekeningkunde"],
    "Business Studies": ["business studies", "bus stud", "besigheidstudies"],
    "Economics": ["economics", "ekonomie"],
    "Geography": ["geography", "geo", "aardrykskunde"],
    "History": ["history", "geskiedenis"],
    "Information Technology": ["information technology", "it"],
    "Computer Applications Technology (CAT)": ["computer applications technology", "cat", "rit"],
    "Tourism": ["tourism", "toerisme"],
    "Consumer Studies": ["consumer studies", "verbruikerstudies"],
    "Hospitality Studies": ["hospitality studies", "gasvryheidstudies"],
    "Engineering Graphics & Design": ["engineering graphics and design", "egd", "ingenieursgrafika en ontwerp"],
    "Visual Arts": ["visual arts"],
    "English Home Language": ["english hl", "eng hl"],
    "English First Additional Language": ["english fal", "eng fal"],
    "Afrikaans Huistaal": ["afrikaans ht", "afr ht"],
    "Afrikaans Eerste Addisionele Taal": ["afrikaans eat", "afr eat"],
};


interface StagedFile {
  file: File;
  subject: string;
  year: string;
  type: 'paper' | 'memo';
  paperNumber: string;
  isDuplicate?: boolean; // To highlight replaced files
}

interface ProcessedPaper {
    subject: string;
    year: string;
    paper: string;
    memo: string;
    status: 'Processing' | 'Processed';
    progress: number;
}

export default function PastPaperUploaderPage() {
  const { toast } = useToast();
  const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedPapers, setProcessedPapers] = useState<ProcessedPaper[]>([
    { subject: "Mathematics Paper 1", year: "2023", paper: "math_p1_nov23.pdf", memo: "math_p1_memo_nov23.pdf", status: "Processed", progress: 100 },
    { subject: "Physical Sciences Paper 2", year: "2023", paper: "phys_p2_nov23.pdf", memo: "phys_p2_memo_nov23.pdf", status: "Processed", progress: 100 },
  ]);

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
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
  
    const newFiles: StagedFile[] = Array.from(files).map(file => {
      const name = file.name.toLowerCase().replace(/_/g, ' ').replace(/-/g, ' ');
  
      let type: StagedFile['type'] = 'paper';
      if (name.includes('memo') || name.includes('memorandum')) {
        type = 'memo';
      }
  
      const yearMatch = name.match(/20\d{2}/) || name.match(/(?<=\s)\d{2}(?=\s|$)/);
      const year = yearMatch ? (yearMatch[0].length === 2 ? `20${yearMatch[0]}` : yearMatch[0]) : '';
      
      let subject = '';
      let bestMatchLength = 0;
  
      for (const [subj, keywords] of Object.entries(subjectKeywords)) {
        for (const kw of keywords) {
            if (name.includes(kw) && kw.length > bestMatchLength) {
                subject = subj;
                bestMatchLength = kw.length;
            }
        }
      }
      
      if (!subject) {
        const nameWithoutExt = name.split('.pdf')[0];
        let potentialSubject = nameWithoutExt;
        potentialSubject = potentialSubject.replace(/(nov|jun|feb|march|afr|eng)\s*$/, '').trim();
        potentialSubject = potentialSubject.replace(/20\d{2}\s*$/, '').trim();
        potentialSubject = potentialSubject.replace(/p\d\s*$/, '').trim();
        potentialSubject = potentialSubject.replace(/paper\s\d\s*$/, '').trim();
        potentialSubject = potentialSubject.replace(/memo(randum)?\s*$/, '').trim();
  
        if(potentialSubject) {
            subject = potentialSubject.replace(/\b\w/g, l => l.toUpperCase()).trim();
        }
      }
  
      let paperNumber = '';
      const paperMatch = name.match(/p(\d)|paper\s?(\d)/);
      if (paperMatch) {
          paperNumber = paperMatch[1] || paperMatch[2];
      }
      
      return { file, subject, year, type, paperNumber };
    });
  
    setStagedFiles(prevStagedFiles => {
        const updatedFilesMap = new Map(prevStagedFiles.map(f => [f.file.name, f]));
        newFiles.forEach(nf => {
            const isDuplicate = updatedFilesMap.has(nf.file.name);
            updatedFilesMap.set(nf.file.name, { ...nf, isDuplicate });
        });
        return Array.from(updatedFilesMap.values());
    });
  };
  
  const removeStagedFile = (index: number) => {
    setStagedFiles(prev => prev.filter((_, i) => i !== index));
  }
  
  const updateStagedFile = (index: number, newProps: Partial<StagedFile>) => {
    setStagedFiles(prev => prev.map((f, i) => i === index ? { ...f, ...newProps } : f));
  }

  const toDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const getBaseName = (name: string): string => {
      return name
          .toLowerCase()
          .replace(/_/g, ' ')
          .replace(/-/g, ' ')
          .replace(/memo(randum)?/g, '')
          .replace(/paper/g, '')
          .replace(/p\d/g, '')
          .replace(/\s+/g, ' ')
          .trim();
  };

  const processUploads = async () => {
    setIsProcessing(true);
    
    let successCount = 0;
    let failedPairs = 0;

    const papers = stagedFiles.filter(f => f.type === 'paper');
    const memos = stagedFiles.filter(f => f.type === 'memo');
    const usedMemoIndices = new Set<number>();

    for (const paper of papers) {
      const paperBaseName = getBaseName(paper.file.name);
      let foundMemo: StagedFile | null = null;
      let foundMemoIndex = -1;

      for (let i = 0; i < memos.length; i++) {
        if (usedMemoIndices.has(i)) continue;
        const memo = memos[i];
        const memoBaseName = getBaseName(memo.file.name);
        if (paperBaseName === memoBaseName) {
          foundMemo = memo;
          foundMemoIndex = i;
          break;
        }
      }

      if (foundMemo) {
        try {
          usedMemoIndices.add(foundMemoIndex);
          toast({ title: `Processing pair: ${paper.file.name}` });

          const paperDataUri = await toDataUri(paper.file);
          const memoDataUri = await toDataUri(foundMemo.file);
          
          const result = await processPastPaper({
            subject: paper.subject,
            grade: 12, // Defaulting to Grade 12 as requested
            year: parseInt(paper.year),
            paperDataUri,
            memoDataUri,
          });

          if (result.success) {
            const subjectName = paper.paperNumber 
              ? `${paper.subject} Paper ${paper.paperNumber}` 
              : paper.subject;

            setProcessedPapers(prev => [...prev, { subject: subjectName, year: paper.year, paper: paper.file.name, memo: foundMemo!.file.name, status: "Processing", progress: 0 }]);
            successCount++;
          } else {
             throw new Error(result.message);
          }
        } catch (error) {
          failedPairs++;
          console.error("Upload failed for pair:", paper.file.name, error);
          toast({
            variant: "destructive",
            title: `Failed to process ${paper.file.name}`,
            description: error instanceof Error ? error.message : "An unknown error occurred.",
          });
        }
      }
    }
    
    const unpairedCount = stagedFiles.length - (successCount * 2) - (usedMemoIndices.size - successCount);

    if (successCount > 0 || failedPairs > 0) {
        toast({
            title: "Bulk Processing Complete",
            description: `${successCount} pairs successfully queued. ${failedPairs} pairs failed. ${unpairedCount > 0 ? `${unpairedCount} files could not be paired.` : ''}`,
        });
    } else {
        toast({
            variant: "destructive",
            title: "No Pairs Found",
            description: "Could not find any matching paper and memo pairs in the staged files. Please check file names.",
        });
    }

    setStagedFiles([]);
    setIsProcessing(false);
  };
  
  const handleDeleteProcessedPaper = (index: number) => {
    setProcessedPapers(prev => prev.filter((_, i) => i !== index));
    toast({
      title: "Entry Deleted",
      description: "The past paper entry has been removed.",
    });
  };

  return (
    <div className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Grade 12 Past Paper Manager</CardTitle>
          <CardDescription className="max-w-lg text-balance leading-relaxed">
            Bulk upload official past exam papers and their memos. The system will auto-pair them, detect subject, year, and paper number. The AI will then process them to generate topic-specific questions.
          </CardDescription>
        </CardHeader>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Uploaded Past Papers</CardTitle>
            <CardDescription>Status of previously uploaded papers.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Paper File</TableHead>
                  <TableHead>Memo File</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {processedPapers.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.subject}</TableCell>
                    <TableCell>{item.year}</TableCell>
                    <TableCell className="font-medium">{item.paper}</TableCell>
                    <TableCell className="font-medium">{item.memo}</TableCell>
                    <TableCell>
                      {item.status === 'Processing' ? (
                        <div className="flex items-center gap-2 w-32">
                           <Progress value={item.progress} className="flex-1" />
                           <span className="text-muted-foreground text-xs font-medium">{Math.round(item.progress)}%</span>
                        </div>
                      ) : (
                         <span className="text-green-600 font-medium">Processed</span>
                      )}
                    </TableCell>
                    <TableCell>
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
                              past paper entry.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteProcessedPaper(index)}>
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
          </CardContent>
        </Card>
        
        <div className="space-y-8">
            <Card>
                <CardHeader>
                <CardTitle>Bulk Upload New Papers</CardTitle>
                <CardDescription>Select all papers and memos. Name them consistently (e.g., `subj_p1_2023.pdf` & `subj_p1_2023_memo.pdf`).</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-3">
                        <Label htmlFor="paper-files">Past Papers & Memos (PDF)</Label>
                        <Input id="paper-files" type="file" accept=".pdf" multiple onChange={handleFileChange} />
                    </div>
                </CardContent>
            </Card>

            {stagedFiles.length > 0 && (
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Staged Files ({stagedFiles.length})</CardTitle>
                        <CardDescription>Review files before processing.</CardDescription>
                    </div>
                    <Button variant="outline" size="icon" onClick={() => setStagedFiles([])}>
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remove all</span>
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4 max-h-[500px] overflow-y-auto">
                    {stagedFiles.map((stagedFile, index) => (
                    <div key={index} className={cn("flex items-center gap-3 p-2 rounded-lg border", stagedFile.isDuplicate && "bg-yellow-100/50 border-yellow-400 dark:bg-yellow-900/30")}>
                        <FileIcon className="h-5 w-5 text-muted-foreground" />
                        <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium leading-none truncate">{stagedFile.file.name}</p>
                            <div className="flex gap-2">
                                <Input 
                                    type="text"
                                    placeholder="Subject"
                                    className="h-8 text-xs w-[120px]"
                                    value={stagedFile.subject}
                                    onChange={(e) => updateStagedFile(index, { subject: e.target.value })}
                                />
                                <Input 
                                    type="text"
                                    placeholder="Year"
                                    className="h-8 text-xs w-[70px]"
                                    value={stagedFile.year}
                                    onChange={(e) => updateStagedFile(index, { year: e.target.value })}
                                />
                                {stagedFile.paperNumber && <div className="h-8 px-2 flex items-center rounded-md bg-muted text-xs font-medium capitalize">P{stagedFile.paperNumber}</div>}
                                <div className="h-8 px-2 flex items-center rounded-md bg-muted text-xs font-medium capitalize">{stagedFile.type}</div>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeStagedFile(index)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                    ))}
                </CardContent>
                <CardContent>
                    <Button onClick={processUploads} disabled={isProcessing} className="w-full">
                        {isProcessing ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" /> }
                        Process All Files
                    </Button>
                </CardContent>
            </Card>
            )}
        </div>
      </div>
    </div>
  )
}
