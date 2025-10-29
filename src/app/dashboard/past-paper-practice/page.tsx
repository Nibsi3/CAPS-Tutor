
'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader, Search, FileText, ArrowRight, BrainCircuit } from 'lucide-react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { subjects as allSubjects, grades as allGrades, subjectColors } from '@/lib/data';
import { cn } from '@/lib/utils';

interface PastPaper {
    id: string;
    subject: string;
    year: string;
    paperName: string;
    memoName: string;
    status: 'Processing' | 'Processed' | 'Failed';
    questionCount?: number;
}

export default function PastPaperPracticePage() {
    const { user } = useUser();
    const firestore = useFirestore();
    
    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
    const [selectedYear, setSelectedYear] = useState<string | null>(null);

    const papersQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(
            collection(firestore, 'pastPapers'), 
            where('status', '==', 'Processed')
        );
    }, [firestore]);

    const { data: papers, isLoading } = useCollection<PastPaper>(papersQuery);

    const availableYears = useMemo(() => {
        if (!papers) return [];
        const years = new Set(papers.map(p => p.year));
        return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a));
    }, [papers]);

    const filteredPapers = useMemo(() => {
        if (!papers) return [];
        return papers.filter(paper => {
            const searchTermMatch = paper.subject.toLowerCase().includes(searchTerm.toLowerCase()) || paper.year.includes(searchTerm);
            const subjectMatch = !selectedSubject || paper.subject.toLowerCase().startsWith(selectedSubject.toLowerCase());
            const yearMatch = !selectedYear || paper.year === selectedYear;
            return searchTermMatch && subjectMatch && yearMatch;
        });
    }, [papers, searchTerm, selectedSubject, selectedYear]);

    return (
        <div className="flex-1 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-3xl flex items-center gap-3">
                        <FileText className="w-8 h-8" />
                        Past Paper Practice
                    </CardTitle>
                    <CardDescription>
                        Select an official past paper to start a timed practice session and test your knowledge under exam conditions.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4 mb-8">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by subject or year..."
                                className="pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Select onValueChange={(value) => setSelectedSubject(value === 'all' ? null : value)} value={selectedSubject || 'all'}>
                            <SelectTrigger className="w-full sm:w-[200px]">
                                <SelectValue placeholder="Filter by Subject" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='all'>All Subjects</SelectItem>
                                {allSubjects.map(subject => (
                                    <SelectItem key={subject.value} value={subject.value}>{subject.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select onValueChange={(value) => setSelectedYear(value === 'all' ? null : value)} value={selectedYear || 'all'}>
                            <SelectTrigger className="w-full sm:w-[150px]">
                                <SelectValue placeholder="Filter by Year" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='all'>All Years</SelectItem>
                                {availableYears.map(year => (
                                    <SelectItem key={year} value={year}>{year}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center text-center text-muted-foreground py-16">
                            <Loader className="w-12 h-12 mb-4 animate-spin" />
                            <h3 className="font-semibold text-lg">Loading Past Papers...</h3>
                        </div>
                    ) : filteredPapers.length > 0 ? (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {filteredPapers.map(paper => {
                                // Find the base subject name (e.g., "Mathematics" from "Mathematics Paper 1")
                                const baseSubject = allSubjects.find(s => paper.subject.startsWith(s.label))?.label || paper.subject;
                                const colors = subjectColors[baseSubject] || { bg: "bg-muted", text: "text-muted-foreground" };
                                return (
                                <Card key={paper.id} className="flex flex-col hover:shadow-lg transition-shadow duration-300">
                                    <CardHeader>
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className={cn("p-2 rounded-lg", colors.bg)}>
                                                <FileText className={cn("w-5 h-5", colors.text)} />
                                            </div>
                                            <CardTitle className="text-xl">{paper.subject}</CardTitle>
                                        </div>
                                        <CardDescription className={cn("font-semibold", colors.text)}>{paper.year} Examination Paper</CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex-1">
                                        <div className="space-y-2 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-2">
                                                <BrainCircuit className="w-4 h-4" />
                                                <span>{paper.questionCount} questions</span>
                                            </div>
                                             <div className="flex items-center gap-2">
                                                <FileText className="w-4 h-4" />
                                                <span className="truncate">{paper.paperName}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter>
                                        <Button className="w-full" asChild>
                                            <Link href={`/dashboard/past-paper-practice/${paper.id}`}>
                                                Start Practice Session <ArrowRight className="ml-2 h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </CardFooter>
                                </Card>
                            )})}
                        </div>
                    ) : (
                         <div className="flex flex-col items-center justify-center text-center text-muted-foreground py-16 border-2 border-dashed rounded-lg">
                            <Search className="w-12 h-12 mb-4" />
                            <h3 className="font-semibold text-lg">No Papers Found</h3>
                            <p className="max-w-sm">No processed past papers match your criteria. Admins can upload more papers in the admin section.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
