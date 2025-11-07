
'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Loader, Search, BookOpen, BarChart, FlaskConical, Globe, Landmark, Calculator, MessageSquare, Briefcase, Paintbrush, Wrench, VenetianMask, Lightbulb, Tractor, ArrowRight, Plus, X, Music, Info } from "lucide-react";
import { useCollection, useDatabases, useMemoAppwrite, useUser, useDoc } from '@/appwrite';
import { appwriteConfig } from '@/appwrite/config';
import { Query } from 'appwrite';
import { subjectColors } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { allSubjectsForLookup } from '@/lib/questions';
import { shouldShowPaper2Questions, UserLiteratureSelection } from '@/lib/literature-filter';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ProcessedPaper {
    id: string;
    subject: string;
    year: string;
    paperName: string;
    status: 'Processing' | 'Processed' | 'Failed';
    questionCount?: number;
    gradeLevel?: number;
}

interface UserProfile {
    gradeLevel?: number;
    subjects?: string[];
    literature?: UserLiteratureSelection;
}

interface PastPaperProgress {
    id: string;
    paperId: string;
    currentQuestion: number;
    lastAccessed: Date | any;
    userId?: string; // The user ID (lowercase 'd')
    paperSubject?: string;
    paperYear?: string;
    paperName?: string;
}

const subjectIcons: Record<string, React.ElementType> = {
  "Mathematics": Calculator,
  "Physical Sciences": FlaskConical,
  "Life Sciences": BarChart,
  "Accounting": Briefcase,
  "Business Studies": Landmark,
  "Geography": Globe,
  "English Home Language": MessageSquare,
  "English First Additional Language": MessageSquare,
  "Afrikaans Huistaal": MessageSquare,
  "Afrikaans Eerste Addisionele Taal": MessageSquare,
  "Afrikaans Second Additional Language": MessageSquare,
  "History": Landmark,
  "Economics": BarChart,
  "Tourism": Globe,
  "Consumer Studies": VenetianMask,
  "Computer Applications Technology": Lightbulb,
  "Information Technology": Lightbulb,
  "Agricultural Sciences": Tractor,
  "Agricultural Technology": Tractor,
  "Agricultural Management Practices": Tractor,
  "Dramatic Arts": VenetianMask,
  "Visual Arts": Paintbrush,
  "Mechanical Technology": Wrench,
  "Electrical Technology": Lightbulb,
  "Civil Technology": Wrench,
  "Technical Sciences": FlaskConical,
  "Mathematical Literacy": Calculator,
  "Engineering Graphics & Design": Wrench,
  "Design": Paintbrush,
  "Music": Music,
  "Dance Studies": VenetianMask,
  "Hospitality Studies": Briefcase,
};


/**
 * Subject name normalization map to handle variations
 */
const subjectNameMap: Record<string, string> = {
    // English variations
    "English HL": "English Home Language",
    "English Home Lang": "English Home Language",
    "English FAL": "English First Additional Language",
    "English First Add Lang": "English First Additional Language",
    // Afrikaans variations
    "Afrikaans HT": "Afrikaans Huistaal",
    "Afrikaans Huistaal": "Afrikaans Huistaal",
    "Afrikaans EAT": "Afrikaans Eerste Addisionele Taal",
    "Afrikaans Eerste Add Taal": "Afrikaans Eerste Addisionele Taal",
    // Other variations
    "Technical Sciences": "Technical Sciences",
    "Mathematical Literacy": "Mathematical Literacy",
    "Maths Literacy": "Mathematical Literacy",
    "Engineering Graphics & Design": "Engineering Graphics & Design",
    "EGD": "Engineering Graphics & Design",
};

/**
 * Extracts the base subject from a full paper title.
 * This function handles various subject name variations and normalizes them.
 * e.g., "Mathematics Paper 1" -> "Mathematics"
 * e.g., "English HL Paper 3" -> "English Home Language"
 * e.g., "Technical Sciences Paper 1" -> "Technical Sciences"
 */
function getBaseSubject(paperTitle: string): string {
    // Normalize the title
    const normalizedTitle = paperTitle.trim();
    
    // Check for direct mappings first (e.g., "English HL")
    for (const [key, value] of Object.entries(subjectNameMap)) {
        if (normalizedTitle.startsWith(key)) {
            return value;
        }
    }
    
    // Sort subjects by length, longest first, to handle cases like "English Home Language" before "English"
    const sortedSubjects = [...allSubjectsForLookup].sort((a, b) => b.length - a.length);

    const foundSubject = sortedSubjects.find(subj => normalizedTitle.startsWith(subj));
    
    // If a known subject is found at the start of the title, return it.
    if (foundSubject) {
        return foundSubject;
    }
    
    // Try case-insensitive matching
    const lowerTitle = normalizedTitle.toLowerCase();
    const foundSubjectCaseInsensitive = sortedSubjects.find(subj => 
        lowerTitle.startsWith(subj.toLowerCase())
    );
    
    if (foundSubjectCaseInsensitive) {
        return foundSubjectCaseInsensitive;
    }
    
    // Extract subject from common patterns like "Subject Paper X" or "Subject PX"
    const withoutPaper = normalizedTitle.replace(/\s*(Paper|P)\s*\d+.*/i, '').trim();
    if (withoutPaper && withoutPaper !== normalizedTitle) {
        // Check if the extracted part matches a known subject
        for (const [key, value] of Object.entries(subjectNameMap)) {
            if (withoutPaper.startsWith(key)) {
                return value;
            }
        }
        const found = sortedSubjects.find(subj => withoutPaper.startsWith(subj));
        if (found) return found;
    }
    
    // Return the normalized title as fallback
    return normalizedTitle;
}

const STORAGE_KEY = 'past-papers-filters';

interface SavedFilters {
    searchTerm: string;
    selectedSubjects: string[];
}

export default function PastPapersPage() {
    const databases = useDatabases();
    const { user, isUserLoading: isAuthLoading } = useUser();

    // Load saved filters from localStorage on mount
    const [searchTerm, setSearchTerm] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                try {
                    const parsed: SavedFilters = JSON.parse(saved);
                    return parsed.searchTerm || '';
                } catch {
                    return '';
                }
            }
        }
        return '';
    });

    const [selectedSubjects, setSelectedSubjects] = useState<string[]>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                try {
                    const parsed: SavedFilters = JSON.parse(saved);
                    return parsed.selectedSubjects || [];
                } catch {
                    return [];
                }
            }
        }
        return [];
    });

    const [showAddSubjectDialog, setShowAddSubjectDialog] = useState(false);
    const [tempSelectedSubjects, setTempSelectedSubjects] = useState<string[]>([]);
    
    // Save filters to localStorage whenever they change
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const filters: SavedFilters = {
                searchTerm,
                selectedSubjects,
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
        }
    }, [searchTerm, selectedSubjects]);
    
    // Get user profile to access grade from settings
    const userProfileRef = useMemoAppwrite(() => {
        if (isAuthLoading || !user) return null;
        return {
            databaseId: appwriteConfig.databaseId,
            collectionId: 'user',
            documentId: user.$id,
        };
    }, [user, isAuthLoading]);

    const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);
    
    // Query for user's past paper progress
    const pastPaperProgressQuery = useMemoAppwrite(() => {
        if (isAuthLoading || !user) return null;
        
        return {
            databaseId: appwriteConfig.databaseId,
            collectionId: 'pastPaperProgress',
            queries: [
                Query.equal('userId', user.$id),
                Query.orderDesc('lastAccessed'),
                Query.limit(5),
            ],
        };
    }, [user, isAuthLoading]);

    const { data: pastPaperProgress, isLoading: isProgressLoading, error: progressError } = useCollection<PastPaperProgress>(pastPaperProgressQuery);
    
    // Debug logging (remove in production)
    useEffect(() => {
        if (process.env.NODE_ENV === 'development') {
            if (progressError) {
                console.warn('[Past Papers] Progress query error:', progressError);
            }
            if (pastPaperProgress) {
                console.log('[Past Papers] Progress data:', pastPaperProgress.length, 'items');
            }
        }
    }, [pastPaperProgress, progressError]);
    
    // Sort progress by lastAccessed if we have data (client-side fallback if orderBy fails)
    const sortedProgress = useMemo(() => {
        if (!pastPaperProgress || pastPaperProgress.length === 0) return null;
        
        // Sort by lastAccessed descending, then limit to 5
        // Handle both Firestore Timestamp and Date objects
        const sorted = [...pastPaperProgress].sort((a, b) => {
            let aTime = 0;
            let bTime = 0;
            
            // Handle Firestore Timestamp
            if (a.lastAccessed?.toMillis) {
                aTime = a.lastAccessed.toMillis();
            } else if (a.lastAccessed?.seconds) {
                aTime = a.lastAccessed.seconds * 1000;
            } else if (a.lastAccessed instanceof Date) {
                aTime = a.lastAccessed.getTime();
            } else if (typeof a.lastAccessed === 'number') {
                aTime = a.lastAccessed;
            }
            
            if (b.lastAccessed?.toMillis) {
                bTime = b.lastAccessed.toMillis();
            } else if (b.lastAccessed?.seconds) {
                bTime = b.lastAccessed.seconds * 1000;
            } else if (b.lastAccessed instanceof Date) {
                bTime = b.lastAccessed.getTime();
            } else if (typeof b.lastAccessed === 'number') {
                bTime = b.lastAccessed;
            }
            
            return bTime - aTime;
        });
        
        return sorted.slice(0, 5);
    }, [pastPaperProgress]);
    
    // Query for all papers (not filtered by status)
    // Note: This is publicly readable, but we wait for auth to finish initializing
    // to ensure Firestore is fully ready before making queries
    const pastPapersQuery = useMemoAppwrite(() => {
        if (isAuthLoading) return null;
        // Query for all papers regardless of status, we'll filter out "Unknown" in the client
        return {
            databaseId: appwriteConfig.databaseId,
            collectionId: 'pastPapers',
        };
    }, [isAuthLoading]);

    const { data: processedPapers, isLoading: arePapersLoading } = useCollection<ProcessedPaper>(pastPapersQuery);

    // Get unique subjects available in database (all grades)
    const uniqueSubjectsInDb = useMemo(() => {
        if (!processedPapers) return [];
        
        // Create a set to deduplicate papers for subject extraction
        const seen = new Map<string, ProcessedPaper>();
        processedPapers.forEach(paper => {
            const subjectLower = paper.subject.toLowerCase().trim();
            const isUnknown = subjectLower === 'unknown' || 
                             (subjectLower.includes('unknown') && subjectLower.length <= 10);
            if (isUnknown) return;
            
            const paperNumber = paper.subject.match(/(?:paper|p)\s*(\d+)/i)?.[1] || '';
            const baseSubject = getBaseSubject(paper.subject);
            const key = `${baseSubject.toLowerCase()}_${paper.year}_${paperNumber}_${paper.gradeLevel || 12}`;
            
            if (!seen.has(key) || (paper.questionCount || 0) > (seen.get(key)?.questionCount || 0)) {
                seen.set(key, paper);
            }
        });
        
        // Get all unique subjects from all papers (not filtered by grade)
        const uniquePapers = Array.from(seen.values());
        const subjects = new Set(uniquePapers.map(p => {
            const baseSubject = getBaseSubject(p.subject);
            return baseSubject.toLowerCase() !== 'unknown' ? baseSubject : null;
        }).filter((s): s is string => s !== null));
        return Array.from(subjects).sort();
    }, [processedPapers]);

    const filteredPapers = useMemo(() => {
        if (!processedPapers) return [];
        
        // First filter: Remove "Unknown" papers
        const knownPapers = processedPapers.filter(paper => {
            const subjectLower = paper.subject.toLowerCase().trim();
            
            // Filter out papers with "Unknown" as subject (exact match or very short names containing "unknown")
            if (subjectLower === 'unknown') {
                return false;
            }
            
            // Check if subject is just "Unknown" with possible whitespace/paper number
            const normalizedSubject = subjectLower.replace(/\s*(?:paper|p)\s*\d+.*$/i, '').trim();
            if (normalizedSubject === 'unknown' || (normalizedSubject.length <= 10 && normalizedSubject.includes('unknown'))) {
                return false;
            }
            
            return true;
        });
        
        // Second filter: Remove duplicates based on subject, year, paper number, and grade
        const seen = new Map<string, ProcessedPaper>();
        const uniquePapers: ProcessedPaper[] = [];
        
        knownPapers.forEach(paper => {
            // Create a unique key for each paper
            const paperNumber = paper.subject.match(/(?:paper|p)\s*(\d+)/i)?.[1] || '';
            const baseSubject = getBaseSubject(paper.subject);
            const key = `${baseSubject.toLowerCase()}_${paper.year}_${paperNumber}_${paper.gradeLevel || 12}`;
            
            if (seen.has(key)) {
                // Keep the one with more questions, or the first one if equal
                const existing = seen.get(key)!;
                if ((paper.questionCount || 0) > (existing.questionCount || 0)) {
                    // Replace the existing one
                    const existingIndex = uniquePapers.findIndex(p => p.id === existing.id);
                    if (existingIndex >= 0) {
                        uniquePapers[existingIndex] = paper;
                        seen.set(key, paper);
                    }
                }
                // Otherwise, skip this duplicate
            } else {
                seen.set(key, paper);
                uniquePapers.push(paper);
            }
        });
        
        // Third filter: Apply search, subject, and grade level filters
        return uniquePapers.filter(paper => {
            const baseSubject = getBaseSubject(paper.subject);
            const searchTermMatch = paper.subject.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                   paper.year.toString().includes(searchTerm) ||
                                   baseSubject.toLowerCase().includes(searchTerm.toLowerCase());
            // Filter by selected subjects - if any are selected, match any of them
            const subjectMatch = selectedSubjects.length === 0 || 
                selectedSubjects.some(selected => baseSubject.toLowerCase().includes(selected.toLowerCase()));
            // Filter by grade level - only show papers matching user's grade level
            const paperGrade = paper.gradeLevel || 12; // Default to 12 if not specified
            const userGrade = userProfile?.gradeLevel;
            const gradeMatch = !userGrade || paperGrade === userGrade;
            return searchTermMatch && subjectMatch && gradeMatch;
        });
    }, [processedPapers, searchTerm, selectedSubjects, userProfile?.gradeLevel]);

    const handleClearFilters = () => {
        setSearchTerm('');
        setSelectedSubjects([]);
    };

    const handleRemoveSubject = (subjectToRemove: string) => {
        setSelectedSubjects(prev => prev.filter(s => s !== subjectToRemove));
    };

    const handleToggleSubject = (subject: string, checked: boolean) => {
        setTempSelectedSubjects(prev => {
            if (checked) {
                return [...prev, subject];
            } else {
                return prev.filter(s => s !== subject);
            }
        });
    };

    const handleOpenDialog = () => {
        setTempSelectedSubjects([...selectedSubjects]);
        setShowAddSubjectDialog(true);
    };

    const handleApplySubjects = () => {
        setSelectedSubjects([...tempSelectedSubjects]);
        setShowAddSubjectDialog(false);
    };

    return (
        <div className="flex-1 space-y-6">
            <Card className="overflow-hidden rounded-2xl">
                <div className="bg-card p-6 border-b">
                    <CardTitle className="font-headline text-3xl flex items-center gap-3">
                        <FileText className='w-8 h-8' />
                        Past Papers
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Info className="w-5 h-5 text-muted-foreground hover:text-foreground cursor-help transition-colors" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-sm">
                                    <p>These past papers are sourced from authentic exam papers. Each paper is structured and formatted exactly as it would appear in an actual examination.</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </CardTitle>
                    <CardDescription className='pt-2'>
                        Find and practice with official past exam papers. Use the filters to narrow down your search.
                    </CardDescription>
                </div>
                <CardContent className='p-6'>
                    <div className="flex flex-col gap-4 mb-8">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input
                                    placeholder="Search by subject or year..."
                                    className="pl-10"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Button onClick={handleClearFilters} variant="outline">
                                Clear Filters
                            </Button>
                        </div>
                        
                        {/* Add Subject Button and Selected Subjects */}
                        <div className="flex items-center gap-2 flex-wrap">
                                <Dialog 
                                    open={showAddSubjectDialog} 
                                    onOpenChange={(open) => {
                                        if (!open) {
                                            // Reset temp selections when dialog closes without applying
                                            setTempSelectedSubjects([...selectedSubjects]);
                                        }
                                        setShowAddSubjectDialog(open);
                                    }}
                                >
                                    <DialogTrigger asChild>
                                        <Button 
                                            type="button" 
                                            variant="outline" 
                                            size="sm"
                                            className="gap-2"
                                            onClick={handleOpenDialog}
                                        >
                                            <Plus className="h-4 w-4" />
                                            Add Subject Filters
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-md">
                                        <DialogHeader>
                                            <DialogTitle>Select Subjects</DialogTitle>
                                            <DialogDescription>
                                                Choose one or more subjects to filter past papers. All available papers will be displayed.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto py-4">
                                            {uniqueSubjectsInDb.length > 0 ? (
                                                uniqueSubjectsInDb.map((subject) => (
                                                    <div
                                                        key={subject}
                                                        className="flex items-center space-x-3 p-3 rounded-lg border hover:border-primary/50 hover:bg-accent/30 transition-all duration-200"
                                                    >
                                                        <Checkbox
                                                            id={subject}
                                                            checked={tempSelectedSubjects.includes(subject)}
                                                            onCheckedChange={(checked) => handleToggleSubject(subject, checked as boolean)}
                                                        />
                                                        <label
                                                            htmlFor={subject}
                                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1 cursor-pointer"
                                                        >
                                                            {subject}
                                                        </label>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center py-8 text-muted-foreground">
                                                    <p>No subjects available</p>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex justify-end gap-2 pt-4 border-t">
                                            <Button 
                                                variant="outline" 
                                                onClick={() => {
                                                    setTempSelectedSubjects([...selectedSubjects]);
                                                    setShowAddSubjectDialog(false);
                                                }}
                                            >
                                                Cancel
                                            </Button>
                                            <Button 
                                                onClick={handleApplySubjects}
                                            >
                                                Apply ({tempSelectedSubjects.length})
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                                {/* Selected Subjects as Buttons */}
                                {selectedSubjects.length > 0 && (
                                    <>
                                        {selectedSubjects.map((subject) => (
                                            <Button
                                                key={subject}
                                                type="button"
                                                variant="secondary"
                                                size="sm"
                                                className="gap-2"
                                                onClick={() => handleRemoveSubject(subject)}
                                            >
                                                <span>{subject}</span>
                                                <X className="h-3 w-3" />
                                            </Button>
                                        ))}
                                    </>
                                )}
                            </div>
                    </div>

                    {/* Recent Past Papers Section */}
                    {!isProgressLoading && !arePapersLoading && sortedProgress && sortedProgress.length > 0 && processedPapers && (
                        (() => {
                            // Filter and map papers that exist in processedPapers
                            const validProgressItems = sortedProgress
                                .map((progress) => {
                                    const paper = processedPapers.find(p => p.id === progress.paperId);
                                    if (!paper) return null;
                                    return { progress, paper };
                                })
                                .filter((item): item is { progress: PastPaperProgress; paper: ProcessedPaper } => item !== null);
                            
                            // Only show section if we have valid items
                            if (validProgressItems.length === 0) return null;
                            
                            return (
                                <div className="mb-8">
                                    <div className="flex items-center gap-2 mb-4">
                                        <BookOpen className="w-5 h-5 text-muted-foreground" />
                                        <h3 className="text-lg font-semibold">Continue Recent Practice</h3>
                                    </div>
                                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                        {validProgressItems.map(({ progress, paper }) => {
                                    
                                            const baseSubject = getBaseSubject(paper.subject);
                                            const Icon = subjectIcons[baseSubject] || FileText;
                                            
                                            // Get colors
                                            let colors = subjectColors[baseSubject];
                                            if (!colors) {
                                                const colorPalette = [
                                                    { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-600 dark:text-blue-400", border: "border-blue-500 dark:border-blue-400" },
                                                    { bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-600 dark:text-purple-400", border: "border-purple-500 dark:border-purple-400" },
                                                    { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-600 dark:text-green-400", border: "border-green-500 dark:border-green-400" },
                                                    { bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-600 dark:text-orange-400", border: "border-orange-500 dark:border-orange-400" },
                                                    { bg: "bg-indigo-100 dark:bg-indigo-900/30", text: "text-indigo-600 dark:text-indigo-400", border: "border-indigo-500 dark:border-indigo-400" },
                                                    { bg: "bg-pink-100 dark:bg-pink-900/30", text: "text-pink-600 dark:text-pink-400", border: "border-pink-500 dark:border-pink-400" },
                                                ];
                                                let hash = 0;
                                                for (let i = 0; i < baseSubject.length; i++) {
                                                    hash = baseSubject.charCodeAt(i) + ((hash << 5) - hash);
                                                }
                                                const colorIndex = Math.abs(hash) % colorPalette.length;
                                                colors = colorPalette[colorIndex];
                                            }
                                            
                                            const questionCount = paper.questionCount || 0;
                                            
                                            return (
                                                <Card key={progress.id} className={cn(
                                                    "flex flex-col hover:shadow-lg transition-all duration-300 rounded-xl border-l-2",
                                                    "hover:scale-[1.01]",
                                                    "h-full border-primary/50 bg-primary/5"
                                                )}>
                                                    <CardHeader className="pb-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className={cn("p-2 rounded-lg shadow-sm", colors.bg)}>
                                                                <Icon className={cn("w-5 h-5", colors.text)} />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <CardTitle className="text-lg font-headline line-clamp-1">{paper.subject}</CardTitle>
                                                                <CardDescription className="text-sm mt-0.5">
                                                                    {paper.year} • Grade {paper.gradeLevel}
                                                                </CardDescription>
                                                            </div>
                                                        </div>
                                                    </CardHeader>
                                                    <CardContent className="flex-1 space-y-3 pb-3">
                                                        <div className="space-y-2">
                                                            <div className="flex items-center justify-between">
                                                                <p className="text-sm font-medium text-muted-foreground">Question {progress.currentQuestion} of {questionCount}</p>
                                                            </div>
                                                            <div className="w-full bg-muted rounded-full h-2">
                                                                <div 
                                                                    className="bg-primary h-2 rounded-full transition-all"
                                                                    style={{ width: `${(progress.currentQuestion / questionCount) * 100}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                    <CardFooter className="pt-3">
                                                        <Button 
                                                            asChild 
                                                            className={cn(
                                                                "w-full h-10 text-sm font-semibold",
                                                                "transition-all duration-200",
                                                                "hover:shadow-md"
                                                            )}
                                                        >
                                                            <Link href={`/dashboard/past-paper-practice/${paper.id}?question=${progress.currentQuestion}`}>
                                                                Continue Practice
                                                                <ArrowRight className="ml-2 h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                    </CardFooter>
                                                </Card>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })()
                    )}

                    {(arePapersLoading || isProfileLoading || isAuthLoading) && (
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
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {filteredPapers.map(paper => {
                                const baseSubject = getBaseSubject(paper.subject);
                                const Icon = subjectIcons[baseSubject] || FileText;
                                
                                // Get colors, with fallback to generate a unique color based on subject name
                                let colors = subjectColors[baseSubject];
                                if (!colors) {
                                    // Generate a consistent color based on the subject name hash
                                    // This ensures every subject gets a unique color even if not explicitly defined
                                    const colorPalette = [
                                        { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-600 dark:text-blue-400", border: "border-blue-500 dark:border-blue-400" },
                                        { bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-600 dark:text-purple-400", border: "border-purple-500 dark:border-purple-400" },
                                        { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-600 dark:text-green-400", border: "border-green-500 dark:border-green-400" },
                                        { bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-600 dark:text-orange-400", border: "border-orange-500 dark:border-orange-400" },
                                        { bg: "bg-indigo-100 dark:bg-indigo-900/30", text: "text-indigo-600 dark:text-indigo-400", border: "border-indigo-500 dark:border-indigo-400" },
                                        { bg: "bg-pink-100 dark:bg-pink-900/30", text: "text-pink-600 dark:text-pink-400", border: "border-pink-500 dark:border-pink-400" },
                                        { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-600 dark:text-red-400", border: "border-red-500 dark:border-red-400" },
                                        { bg: "bg-yellow-100 dark:bg-yellow-900/30", text: "text-yellow-600 dark:text-yellow-400", border: "border-yellow-500 dark:border-yellow-400" },
                                        { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-600 dark:text-amber-400", border: "border-amber-500 dark:border-amber-400" },
                                        { bg: "bg-cyan-100 dark:bg-cyan-900/30", text: "text-cyan-600 dark:text-cyan-400", border: "border-cyan-500 dark:border-cyan-400" },
                                        { bg: "bg-teal-100 dark:bg-teal-900/30", text: "text-teal-600 dark:text-teal-400", border: "border-teal-500 dark:border-teal-400" },
                                        { bg: "bg-lime-100 dark:bg-lime-900/30", text: "text-lime-600 dark:text-lime-400", border: "border-lime-500 dark:border-lime-400" },
                                        { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-500 dark:border-emerald-400" },
                                        { bg: "bg-violet-100 dark:bg-violet-900/30", text: "text-violet-600 dark:text-violet-400", border: "border-violet-500 dark:border-violet-400" },
                                        { bg: "bg-fuchsia-100 dark:bg-fuchsia-900/30", text: "text-fuchsia-600 dark:text-fuchsia-400", border: "border-fuchsia-500 dark:border-fuchsia-400" },
                                        { bg: "bg-rose-100 dark:bg-rose-900/30", text: "text-rose-600 dark:text-rose-400", border: "border-rose-500 dark:border-rose-400" },
                                        { bg: "bg-slate-100 dark:bg-slate-900/30", text: "text-slate-600 dark:text-slate-400", border: "border-slate-500 dark:border-slate-400" },
                                        { bg: "bg-sky-100 dark:bg-sky-900/30", text: "text-sky-600 dark:text-sky-400", border: "border-sky-500 dark:border-sky-400" },
                                        { bg: "bg-stone-100 dark:bg-stone-900/30", text: "text-stone-600 dark:text-stone-400", border: "border-stone-500 dark:border-stone-400" },
                                        { bg: "bg-zinc-100 dark:bg-zinc-900/30", text: "text-zinc-600 dark:text-zinc-400", border: "border-zinc-500 dark:border-zinc-400" },
                                    ];
                                    
                                    // Simple hash function to get a consistent index
                                    let hash = 0;
                                    for (let i = 0; i < baseSubject.length; i++) {
                                        hash = baseSubject.charCodeAt(i) + ((hash << 5) - hash);
                                    }
                                    const colorIndex = Math.abs(hash) % colorPalette.length;
                                    colors = colorPalette[colorIndex];
                                }
                                
                                const questionCount = paper.questionCount || 0;
                                const topics: string[] = [];
                                
                                return (
                                    <Card key={paper.id} className={cn(
                                        "flex flex-col hover:shadow-lg transition-all duration-300 rounded-xl border-l-2",
                                        "hover:scale-[1.01]",
                                        "h-full"
                                    )}>
                                        <CardHeader className="pb-3">
                                            <div className="flex items-center gap-3">
                                                <div className={cn("p-2 rounded-lg shadow-sm", colors.bg)}>
                                                    <Icon className={cn("w-5 h-5", colors.text)} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <CardTitle className="text-lg font-headline line-clamp-1">{paper.subject}</CardTitle>
                                                    <CardDescription className="text-sm mt-0.5">
                                                        {paper.year} • Grade {paper.gradeLevel}
                                                    </CardDescription>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="flex-1 space-y-3 pb-3">
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-xl font-bold">{questionCount}</p>
                                                    <span className="text-xs text-muted-foreground">Questions</span>
                                                </div>
                                                {topics.length > 0 && (
                                                    <div className="space-y-1.5">
                                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Topics</p>
                                                        <div className="flex flex-wrap gap-1">
                                                            {topics.slice(0, 5).map((topic, idx) => (
                                                                <span 
                                                                    key={idx}
                                                                    className={cn(
                                                                        "text-xs px-2 py-0.5 rounded-md font-medium",
                                                                        "border",
                                                                        colors.bg,
                                                                        colors.text,
                                                                        colors.border
                                                                    )}
                                                                >
                                                                    {topic}
                                                                </span>
                                                            ))}
                                                            {topics.length > 5 && (
                                                                <TooltipProvider>
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <span className="text-xs px-2 py-0.5 rounded-md font-medium text-muted-foreground bg-muted/50 border border-border cursor-help hover:bg-muted/70 transition-colors">
                                                                                +{topics.length - 5}
                                                                            </span>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent className="max-w-xs">
                                                                            <div className="space-y-1">
                                                                                <p className="font-semibold text-sm mb-2">Additional Topics:</p>
                                                                                <div className="flex flex-wrap gap-1">
                                                                                    {topics.slice(5).map((topic, idx) => (
                                                                                        <span 
                                                                                            key={idx}
                                                                                            className="text-xs px-2 py-0.5 rounded-md bg-background border border-border"
                                                                                        >
                                                                                            {topic}
                                                                                        </span>
                                                                                    ))}
                                                                                </div>
                                                                            </div>
                                                                        </TooltipContent>
                                                                    </Tooltip>
                                                                </TooltipProvider>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                        <CardFooter className="pt-3">
                                            <Button 
                                                asChild 
                                                className={cn(
                                                    "w-full h-10 text-sm font-semibold",
                                                    "transition-all duration-200",
                                                    questionCount === 0 
                                                        ? "opacity-50 cursor-not-allowed" 
                                                        : "hover:shadow-md"
                                                )} 
                                                disabled={questionCount === 0}
                                            >
                                                <Link href={`/dashboard/past-paper-practice/${paper.id}`}>
                                                    {questionCount > 0 ? (
                                                        <>
                                                            Start Practice
                                                            <ArrowRight className="ml-2 h-4 w-4" />
                                                        </>
                                                    ) : (
                                                        'No Questions Available'
                                                    )}
                                                </Link>
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

    