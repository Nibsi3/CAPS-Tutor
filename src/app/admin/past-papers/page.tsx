'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, Loader } from "lucide-react";
import { subjects as allSubjects } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
// import { processPastPaper } from "@/ai/flows/past-paper-processing";

const grade12Subjects = allSubjects.filter(s => 
  !["Creative Arts", "Mathematical Literacy"].includes(s.label)
);

export default function PastPaperUploaderPage() {
  const { toast } = useToast();
  const [subject, setSubject] = useState('');
  const [year, setYear] = useState('');
  const [paperFile, setPaperFile] = useState<File | null>(null);
  const [memoFile, setMemoFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedPapers, setUploadedPapers] = useState([
    { subject: "Mathematics", year: "2023", paper: "math_p1_nov23.pdf", memo: "math_p1_memo_nov23.pdf", status: "Processed" },
    { subject: "Physical Sciences", year: "2023", paper: "phys_p2_nov23.pdf", memo: "phys_p2_memo_nov23.pdf", status: "Processed" },
  ]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: 'paper' | 'memo') => {
    const file = e.target.files?.[0] || null;
    if (fileType === 'paper') {
      setPaperFile(file);
    } else {
      setMemoFile(file);
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

  const handleUpload = async () => {
    if (!subject || !year || !paperFile || !memoFile) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please select a subject, year, and provide both paper and memo files.",
      });
      return;
    }
    setIsUploading(true);
    try {
      const paperDataUri = await toDataUri(paperFile);
      const memoDataUri = await toDataUri(memoFile);
      
      console.log("Uploading:", { subject, year, grade: 12, paper: paperFile.name, memo: memoFile.name });

      // ** AI Flow Integration - Uncomment when ready **
      // const result = await processPastPaper({
      //   subject,
      //   grade: 12,
      //   year: parseInt(year),
      //   paperDataUri,
      //   memoDataUri,
      // });

      // Mock result for now
      const result = { success: true, message: `Successfully started processing ${paperFile.name}.` };

      if (result.success) {
        toast({
          title: "Upload Successful",
          description: result.message,
        });
        setUploadedPapers(prev => [...prev, { subject, year, paper: paperFile.name, memo: memoFile.name, status: "Processing" }]);
        // Reset form
        setSubject('');
        setYear('');
        setPaperFile(null);
        setMemoFile(null);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error("Upload failed:", error);
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
        <Card className="sm:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle>Grade 12 Past Paper Manager</CardTitle>
            <CardDescription className="max-w-lg text-balance leading-relaxed">
              Upload official past exam papers and their memos. The AI will process them to generate topic-specific questions for Grade 12 students.
            </CardDescription>
          </CardHeader>
        </Card>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Uploaded Past Papers</CardTitle>
              <CardDescription>Manage your exam paper files.</CardDescription>
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
                  {uploadedPapers.map((item, index) => (
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
          
          <Card>
            <CardHeader>
              <CardTitle>Upload New Past Paper</CardTitle>
              <CardDescription>Add a paper and its memo.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid gap-3">
                <Label htmlFor="subject">Subject</Label>
                <Select onValueChange={setSubject} value={subject}>
                  <SelectTrigger id="subject" aria-label="Select subject">
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {grade12Subjects.map((s) => (
                      <SelectItem key={s.value} value={s.label}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-3">
                <Label htmlFor="year">Year</Label>
                <Input id="year" type="number" placeholder="e.g., 2023" value={year} onChange={e => setYear(e.target.value)} />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="paper-file">Past Paper (PDF)</Label>
                <Input id="paper-file" type="file" accept=".pdf" onChange={(e) => handleFileChange(e, 'paper')} />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="memo-file">Memo (PDF)</Label>
                <Input id="memo-file" type="file" accept=".pdf" onChange={(e) => handleFileChange(e, 'memo')} />
              </div>
              <Button onClick={handleUpload} disabled={isUploading}>
                {isUploading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                Start Processing
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
