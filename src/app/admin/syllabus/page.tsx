import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload } from "lucide-react";

export default function SyllabusUploaderPage() {
  return (
    <div className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
          <Card className="sm:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle>Syllabus Manager</CardTitle>
              <CardDescription className="max-w-lg text-balance leading-relaxed">
                Upload official CAPS documents or structured content. The system will index it for the AI to use as a source of truth.
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Subjects</CardDescription>
              <CardTitle className="text-4xl">8</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">
                +2 this month
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Documents Indexed</CardDescription>
              <CardTitle className="text-4xl">124</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">
                +15 this week
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Uploaded Documents</CardTitle>
              <CardDescription>Manage your curriculum files.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>File Name</TableHead>
                    <TableHead>Date Uploaded</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Mathematics</TableCell>
                    <TableCell>Grade 8</TableCell>
                    <TableCell>caps_math_gr8.pdf</TableCell>
                    <TableCell>2024-05-10</TableCell>
                    <TableCell className="text-green-600">Indexed</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Physical Sciences</TableCell>
                    <TableCell>Grade 10</TableCell>
                    <TableCell>phy_sci_gr10_term2.pdf</TableCell>
                    <TableCell>2024-05-12</TableCell>
                    <TableCell className="text-yellow-600">Processing</TableCell>
                  </TableRow>
                   <TableRow>
                    <TableCell>Life Sciences</TableCell>
                    <TableCell>Grade 11</TableCell>
                    <TableCell>life_sci_notes.docx</TableCell>
                    <TableCell>2024-05-14</TableCell>
                    <TableCell className="text-green-600">Indexed</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Upload New Document</CardTitle>
              <CardDescription>Add a new syllabus file.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid gap-3">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" type="text" placeholder="e.g., Mathematics" />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="grade">Grade</Label>
                <Select>
                  <SelectTrigger id="grade" aria-label="Select grade">
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {[...Array(12)].map((_, i) => (
                      <SelectItem key={i+1} value={`${i+1}`}>Grade {i+1}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-3">
                <Label htmlFor="document">Document</Label>
                <div className="flex items-center justify-center w-full">
                  <Label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                          <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                          <p className="text-xs text-muted-foreground">PDF, DOCX, MD (MAX. 800x400px)</p>
                      </div>
                      <Input id="dropzone-file" type="file" className="hidden" />
                  </Label>
                </div>
              </div>
              <Button>Start Upload</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
