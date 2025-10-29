
'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader, Search, FileText, ArrowRight, BrainCircuit } from 'lucide-react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collectionGroup, query, where, getDocs } from 'firebase/firestore';
import { subjects as allSubjects, grades as allGrades } from '@/lib/data';

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
    const [papers, setPapers] = useState<PastPaper[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
    const [selectedYear, setSelectedYear] = useState<string | null>(null);

    useEffect(() => {
        if (!firestore) return;

        const fetchPapers = async () => {
            setIsLoading(true);
            try {
                const papersQuery = query(
                    collectionGroup(firestore, 'pastPapers'), 
                    where('status', '==', 'Processed')
                );
                const querySnapshot = await getDocs(papersQuery);
                const fetchedPapers: PastPaper[] = [];
                querySnapshot.forEach(doc => {
                    fetchedPapers.push({ id: doc.id, ...doc.data() } as PastPaper);
                });
                
                // Remove duplicates by ID in case collectionGroup finds same paper from different user uploads
                const uniquePapers = Array.from(new Map(fetchedPapers.map(p => [p.paperName, p])).values());

                setPapers(uniquePapers);
            } catch (error) {
                console.error("Error fetching past papers:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPapers();
    }, [firestore]);
    
    const availableYears = useMemo(() => {
        const years = new Set(papers.map(p => p.year));
        return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a));
    }, [papers]);

    const filteredPapers = useMemo(() => {
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
                            {filteredPapers.map(paper => (
                                <Card key={paper.id} className="flex flex-col hover:shadow-lg transition-shadow duration-300">
                                    <CardHeader>
                                        <CardTitle className="text-xl">{paper.subject}</CardTitle>
                                        <CardDescription>{paper.year} Examination Paper</CardDescription>
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
                            ))}
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
