
'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, Loader, File as FileIcon, X } from "lucide-react";
import { subjects as allSubjects } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
// import { processPastPaper } from "@/ai/flows/past-paper-processing";

const grade12Subjects = allSubjects.filter(s => 
  !["Creative Arts", "Mathematical Literacy"].includes(s.label)
);

interface StagedFile {
  file: File;
  subject: string;
  year: string;
  type: 'paper' | 'memo' | 'unknown';
}

export default function PastPaperUploaderPage() {
  const { toast } = useToast();
  const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedPapers, setProcessedPapers] = useState([
    { subject: "Mathematics", year: "2023", paper: "math_p1_nov23.pdf", memo: "math_p1_memo_nov23.pdf", status: "Processed" },
    { subject: "Physical Sciences", year: "2023", paper: "phys_p2_nov23.pdf", memo: "phys_p2_memo_nov23.pdf", status: "Processed" },
  ]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles: StagedFile[] = Array.from(files).map(file => {
      const name = file.name.toLowerCase();
      let type: StagedFile['type'] = 'unknown';
      if (name.includes('memo')) {
        type = 'memo';
      } else if (name.includes('p1') || name.includes('p2') || name.includes('paper')) {
        type = 'paper';
      }

      // Simple regex to guess year from filename
      const yearMatch = file.name.match(/20\d{2}/);
      const year = yearMatch ? yearMatch[0] : '';
      
      return { file, subject: '', year, type };
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
    
    // Group files by a common base name (e.g., 'math_p1_2023')
    const fileGroups = new Map<string, { paper?: StagedFile, memo?: StagedFile }>();

    stagedFiles.forEach(stagedFile => {
      if (stagedFile.type === 'unknown' || !stagedFile.subject || !stagedFile.year) return;
      const baseName = stagedFile.file.name.toLowerCase().replace('_memo', '').replace('.pdf', '');
      
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
            setProcessedPapers(prev => [...prev, { subject: group.paper!.subject, year: group.paper!.year, paper: group.paper!.file.name, memo: group.memo!.file.name, status: "Processing" }]);
            successCount++;
          } else {
             throw new Error(result.message);
          }
        } catch (error) {
          console.error("Upload failed for pair:", baseName, error);
          toast({
            variant: "destructive",
            title: `Failed to process ${group.paper.file.name}`,
            description: error instanceof Error ? error.message : "An unknown error occurred.",
          });
        }
      } else {
        toast({
            variant: "destructive",
            title: `Incomplete Pair`,
            description: `Could not find a matching paper or memo for "${baseName}.pdf"`,
        });
      }
    }
    
    toast({
        title: "Bulk Processing Complete",
        description: `${successCount} pairs successfully queued for processing.`,
    });

    setStagedFiles([]);
    setIsProcessing(false);
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
                  <TableHead>Paper</TableHead>
                  <TableHead>Memo</TableHead>
                  <TableHead>Status</TableHead>
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
                                <Select onValueChange={(val) => updateStagedFile(index, { subject: val })} value={stagedFile.subject}>
                                    <SelectTrigger className="h-8 text-xs w-[120px]">
                                        <SelectValue placeholder="Subject" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {grade12Subjects.map(s => <SelectItem key={s.value} value={s.label}>{s.label}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <Input 
                                    type="text"
                                    placeholder="Year"
                                    className="h-8 text-xs w-[70px]"
                                    value={stagedFile.year}
                                    onChange={(e) => updateStagedFile(index, { year: e.target.value })}
                                />
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

    