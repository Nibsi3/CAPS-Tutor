
'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Loader, Search, BookOpen, BarChart, FlaskConical, Globe, Landmark, Calculator, MessageSquare } from "lucide-react";
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { grades, subjects as allSubjectsData, subjectColors } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { allSubjectsForLookup } from '@/lib/questions';

interface ProcessedPaper {
    id: string;
    subject: string;
    year: string;
    paperName: string;
    status: 'Processing' | 'Processed' | 'Failed';
    questionCount?: number;
    gradeLevel?: number;
}

const subjectIcons: Record<string, React.ElementType> = {
  "Mathematics": Calculator,
  "Physical Sciences": FlaskConical,
  "Life Sciences": BarChart,
  "Accounting": FileText,
  "Business Studies": Landmark,
  "Geography": Globe,
  "English Home Language": MessageSquare,
  "English First Additional Language": MessageSquare,
  "Afrikaans Huistaal": MessageSquare,
  "Afrikaans Eerste Addisionele Taal": MessageSquare,
  // Add more icons for other subjects if needed
};

const uniqueSubjects = [...new Set(allSubjectsData.map(s => s.label.replace(/ Paper \d/, '')))];

/**
 * Extracts the base subject from a full paper title.
 * e.g., "Mathematics Paper 1" -> "Mathematics"
 */
function getBaseSubject(paperTitle: string): string {
    const lowerCaseTitle = paperTitle.toLowerCase();
    // Sort subjects by length, longest first, to avoid partial matches (e.g., "English" matching before "English Home Language")
    const sortedSubjects = [...allSubjectsForLookup].sort((a, b) => b.length - a.length);

    const foundSubject = sortedSubjects.find(subj => lowerCaseTitle.startsWith(subj.toLowerCase()));
    return foundSubject || paperTitle; // Fallback to the original title if no match is found
}


export default function PastPapersPage() {
    const firestore = useFirestore();

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGrade, setSelectedGrade] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    
    // Query for only processed papers
    const pastPapersQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, `pastPapers`), where("status", "==", "Processed"));
    }, [firestore]);

    const { data: processedPapers, isLoading: arePapersLoading } = useCollection<ProcessedPaper>(pastPapersQuery);

    const filteredPapers = useMemo(() => {
        if (!processedPapers) return [];
        return processedPapers.filter(paper => {
            const searchTermMatch = paper.subject.toLowerCase().includes(searchTerm.toLowerCase()) || paper.year.toString().includes(searchTerm);
            const gradeMatch = !selectedGrade || paper.gradeLevel?.toString() === selectedGrade;
            const subjectMatch = !selectedSubject || paper.subject.toLowerCase().includes(selectedSubject.toLowerCase());
            return searchTermMatch && gradeMatch && subjectMatch;
        });
    }, [processedPapers, searchTerm, selectedGrade, selectedSubject]);

    const handleClearFilters = () => {
        setSearchTerm('');
        setSelectedGrade('');
        setSelectedSubject('');
    };

    return (
        <div className="flex-1 space-y-6">
            <Card className="overflow-hidden rounded-2xl">
                <div className="bg-card p-6 border-b">
                    <CardTitle className="font-headline text-3xl flex items-center gap-3"><FileText className='w-8 h-8' />Past Papers</CardTitle>
                    <CardDescription className='pt-2'>
                        Find and practice with official past exam papers. Use the filters to narrow down your search.
                    </CardDescription>
                </div>
                <CardContent className='p-6'>
                    <div className="flex flex-col sm:flex-row gap-4 mb-8">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input
                                placeholder="Search by subject or year..."
                                className="pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Select onValueChange={setSelectedGrade} value={selectedGrade}>
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <SelectValue placeholder="Filter by Grade" />
                            </SelectTrigger>
                            <SelectContent>
                                {grades.map(grade => (
                                    <SelectItem key={grade.value} value={grade.value}>{grade.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select onValueChange={setSelectedSubject} value={selectedSubject}>
                            <SelectTrigger className="w-full sm:w-[240px]">
                                <SelectValue placeholder="Filter by Subject" />
                            </SelectTrigger>
                            <SelectContent>
                                {uniqueSubjects.map(subject => (
                                    <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button onClick={handleClearFilters} variant="outline">
                            Clear Filters
                        </Button>
                    </div>

                    {arePapersLoading && (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {[...Array(6)].map((_, i) => (
                                <Card key={i} className="flex flex-col">
                                    <CardHeader>
                                        <Skeleton className="h-6 w-3/4" />
                                        <Skeleton className="h-4 w-1/2" />
                                    </CardHeader>
                                    <CardContent className="flex-1 space-y-2">
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-2/3" />
                                    </CardContent>
                                    <CardFooter>
                                        <Skeleton className="h-10 w-full" />
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    )}

                    {!arePapersLoading && filteredPapers.length > 0 && (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {filteredPapers.map(paper => {
                                const baseSubject = getBaseSubject(paper.subject);
                                const Icon = subjectIcons[baseSubject] || FileText;
                                const colors = subjectColors[baseSubject] || { bg: "bg-muted", text: "text-muted-foreground" };
                                
                                return (
                                    <Card key={paper.id} className="flex flex-col hover:shadow-lg transition-shadow duration-300 rounded-2xl">
                                        <CardHeader>
                                            <div className="flex items-center gap-4">
                                                <div className={cn("p-3 rounded-xl", colors.bg)}>
                                                    <Icon className={cn("w-6 h-6", colors.text)} />
                                                </div>
                                                <div>
                                                    <CardTitle className="text-xl font-headline">{paper.subject}</CardTitle>
                                                    <CardDescription className={cn("font-semibold", colors.text)}>
                                                        {paper.year} - Grade {paper.gradeLevel}
                                                    </CardDescription>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="flex-1">
                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                {paper.paperName.replace(/_/g, ' ')}
                                            </p>
                                            <p className="text-sm font-semibold mt-2">{paper.questionCount || 0} Questions</p>
                                        </CardContent>
                                        <CardFooter>
                                            <Button asChild className="w-full" disabled={!paper.questionCount || paper.questionCount === 0}>
                                                <Link href={`/dashboard/past-paper-practice/${paper.id}`}>Start Practice</Link>
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                )
                            })}
                        </div>
                    )}

                    {!arePapersLoading && filteredPapers.length === 0 && (
                        <div className="text-center py-16 border-2 border-dashed rounded-lg">
                            <h3 className='text-lg font-semibold'>No Past Papers Found</h3>
                            <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                                No papers matched your search or filter criteria. Try clearing the filters or contact an admin to upload more papers.
                            </p>
                            <Button variant="default" size="sm" onClick={handleClearFilters} className="mt-4">
                                Clear All Filters
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
