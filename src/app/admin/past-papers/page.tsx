
'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, Loader, File as FileIcon, X, Trash2 } from "lucide-react";
import { subjects as allSubjects } from "@/lib/data";
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
} from "@/components/ui/alert-dialog"
// import { processPastPaper } from "@/ai/flows/past-paper-processing";

const grade12Subjects = allSubjects.filter(s => 
  !["Creative Arts", "Mathematical Literacy"].includes(s.label)
);

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
    "English Home Language": ["english hl", "eng hl"],
    "English First Additional Language": ["english fal", "eng fal"],
    "Afrikaans Huistaal": ["afrikaans ht", "afr ht"],
    "Afrikaans Eerste Addisionele Taal": ["afrikaans eat", "afr eat"],
};


interface StagedFile {
  file: File;
  subject: string;
  year: string;
  type: 'paper' | 'memo' | 'unknown';
  paperNumber: string;
}

export default function PastPaperUploaderPage() {
  const { toast } = useToast();
  const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedPapers, setProcessedPapers] = useState([
    { subject: "Mathematics Paper 1", year: "2023", paper: "math_p1_nov23.pdf", memo: "math_p1_memo_nov23.pdf", status: "Processed" },
    { subject: "Physical Sciences Paper 2", year: "2023", paper: "phys_p2_nov23.pdf", memo: "phys_p2_memo_nov23.pdf", status: "Processed" },
  ]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles: StagedFile[] = Array.from(files).map(file => {
      const name = file.name.toLowerCase().replace(/_/g, ' ').replace(/-/g, ' ');

      let type: StagedFile['type'] = 'unknown';
      if (name.includes('memo') || name.includes('memorandum')) {
        type = 'memo';
      } else if (name.includes('p1') || name.includes('p2') || name.includes('paper') || name.includes('qp')) {
        type = 'paper';
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
      
      let paperNumber = '';
      const paperMatch = name.match(/p(\d)|paper\s?(\d)/);
      if (paperMatch) {
          paperNumber = paperMatch[1] || paperMatch[2];
      }


      return { file, subject, year, type, paperNumber };
    });
    setStagedFiles(prev => [...prev, ...newFiles]);
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

  const processUploads = async () => {
    setIsProcessing(true);
    
    const fileGroups = new Map<string, { paper?: StagedFile, memo?: StagedFile }>();

    // Normalize name by removing memo, paper number identifiers for grouping
    const getBaseName = (stagedFile: StagedFile) => {
        return stagedFile.file.name.toLowerCase()
          .replace(/_memo(randum)?/, '')
          .replace(/_p\d/, '')
          .replace(/_paper\d?/, '')
          .replace(/\.pdf$/, '');
    };

    stagedFiles.forEach(stagedFile => {
      if (stagedFile.type === 'unknown' || !stagedFile.subject || !stagedFile.year) return;
      const baseName = getBaseName(stagedFile);
      
      if (!fileGroups.has(baseName)) {
        fileGroups.set(baseName, {});
      }
      
      const group = fileGroups.get(baseName)!;
      if (stagedFile.type === 'paper') group.paper = stagedFile;
      if (stagedFile.type === 'memo') group.memo = stagedFile;
    });

    let successCount = 0;
    for (const [baseName, group] of fileGroups.entries()) {
      if (group.paper && group.memo) {
        try {
          toast({ title: `Processing: ${group.paper.file.name}` });
          const paperDataUri = await toDataUri(group.paper.file);
          const memoDataUri = await toDataUri(group.memo.file);
          
          // ** AI Flow Integration - Uncomment when ready **
          // const result = await processPastPaper({
          //   subject: group.paper.subject,
          //   grade: 12,
          //   year: parseInt(group.paper.year),
          //   paperDataUri,
          //   memoDataUri,
          // });

          // Mock result
           const result = { success: true, message: `Successfully queued ${group.paper.file.name} for processing.` };

          if (result.success) {
            const subjectName = group.paper.paperNumber 
              ? `${group.paper.subject} Paper ${group.paper.paperNumber}` 
              : group.paper.subject;

            setProcessedPapers(prev => [...prev, { subject: subjectName, year: group.paper!.year, paper: group.paper!.file.name, memo: group.memo!.file.name, status: "Processing" }]);
            successCount++;
          } else {
             throw new Error(result.message);
          }
        } catch (error) {
          console.error("Upload failed for pair:", baseName, error);
          toast({
            variant: "destructive",
            title: `Failed to process ${group.paper?.file?.name || 'a paper'}`,
            description: error instanceof Error ? error.message : "An unknown error occurred.",
          });
        }
      } else {
        toast({
            variant: "destructive",
            title: `Incomplete Pair`,
            description: `Could not find a matching paper or memo for files related to "${baseName}"`,
        });
      }
    }
    
    if (successCount > 0) {
        toast({
            title: "Bulk Processing Complete",
            description: `${successCount} pairs successfully queued for processing.`,
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
            Bulk upload official past exam papers and their memos. The system will auto-pair them. The AI will then process them to generate topic-specific questions.
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
                    <TableCell className={item.status === 'Processed' ? "text-green-600" : "text-yellow-600"}>{item.status}</TableCell>
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
                <CardHeader>
                    <CardTitle>Staged Files</CardTitle>
                    <CardDescription>Review and categorize the selected files before processing.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {stagedFiles.map((stagedFile, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 rounded-lg border">
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
