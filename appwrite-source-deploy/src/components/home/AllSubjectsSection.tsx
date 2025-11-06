'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { grades, subjectColors, compulsorySubjectsByGrade } from "@/lib/data";
import { BookOpen, GraduationCap, ArrowRight, Sparkles, CheckCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from '@/appwrite';

/**
 * Subject descriptions for better user understanding
 */
const subjectDescriptions: Record<string, string> = {
  "Mathematics": "Master numbers, algebra, geometry, and problem-solving skills. Essential for STEM fields and daily life.",
  "Mathematical Literacy": "Practical application of mathematics in real-world contexts. Focus on financial literacy and data interpretation.",
  "Physical Sciences": "Explore physics and chemistry. Understand matter, energy, forces, and chemical reactions.",
  "Life Sciences": "Study living organisms, biology, genetics, and ecosystems. Essential for medical and biological careers.",
  "Accounting": "Learn financial record-keeping, bookkeeping, and business accounting principles.",
  "Business Studies": "Understand business operations, management, marketing, and entrepreneurship.",
  "Economics": "Study economic systems, markets, supply and demand, and economic policy.",
  "Geography": "Explore physical and human geography, climate, landforms, and human-environment interactions.",
  "History": "Study past events, historical analysis, and understand how history shapes the present.",
  "Information Technology": "Learn programming, computer systems, databases, and software development.",
  "Computer Applications Technology (CAT)": "Master office software, digital literacy, and practical computer applications.",
  "Tourism": "Study the tourism industry, travel planning, and hospitality management.",
  "Consumer Studies": "Learn about consumer rights, product evaluation, and sustainable consumption.",
  "Hospitality Studies": "Understand hospitality operations, food service, and customer service.",
  "Engineering Graphics & Design": "Develop technical drawing skills and engineering design principles.",
  "English Home Language": "Master English as your primary language through literature, writing, and communication.",
  "English First Additional Language": "Develop English proficiency as a second language for academic and professional success.",
  "Afrikaans Huistaal": "Master Afrikaans as your primary language through literature and communication.",
  "Afrikaans Eerste Addisionele Taal": "Develop Afrikaans proficiency as an additional language.",
  "Natural Sciences": "Integrated study of biology, chemistry, and physics in the senior phase.",
  "Natural Sciences and Technology": "Combined study of natural sciences and technology in the intermediate phase.",
  "Social Sciences": "Study history and geography together, understanding human society and the environment.",
  "Technology": "Learn about technology systems, design processes, and practical problem-solving.",
  "Economic & Management Sciences": "Study economics and business management fundamentals.",
  "Life Orientation": "Develop life skills, personal development, health, and career planning.",
  "Life Skills": "Build essential life skills including personal, social, and emotional development.",
  "Creative Arts": "Explore visual arts, music, drama, and creative expression.",
};

/**
 * Maps subjects to grades based on CAPS curriculum
 * This is a comprehensive mapping of all subjects available per grade
 */
function getSubjectsForGrade(grade: string): string[] {
  const gradeNum = parseInt(grade);
  
  // Foundation Phase (Grades 1-3)
  if (gradeNum >= 1 && gradeNum <= 3) {
    return [
      "Mathematics",
      "English Home Language",
      "English First Additional Language",
      "Afrikaans Huistaal",
      "Afrikaans Eerste Addisionele Taal",
      "Life Skills",
    ];
  }
  
  // Intermediate Phase (Grades 4-6)
  if (gradeNum >= 4 && gradeNum <= 6) {
    return [
      "Mathematics",
      "English Home Language",
      "English First Additional Language",
      "Afrikaans Huistaal",
      "Afrikaans Eerste Addisionele Taal",
      "Life Skills",
      "Natural Sciences and Technology",
      "Social Sciences",
    ];
  }
  
  // Senior Phase (Grades 7-9)
  if (gradeNum >= 7 && gradeNum <= 9) {
    return [
      "Mathematics",
      "Mathematical Literacy",
      "English Home Language",
      "English First Additional Language",
      "Afrikaans Huistaal",
      "Afrikaans Eerste Addisionele Taal",
      "Natural Sciences",
      "Social Sciences",
      "Technology",
      "Economic & Management Sciences",
      "Life Orientation",
      "Creative Arts",
    ];
  }
  
  // FET Phase (Grades 10-12) - All subjects available
  if (gradeNum >= 10 && gradeNum <= 12) {
    return [
      "Mathematics",
      "Mathematical Literacy",
      "Physical Sciences",
      "Life Sciences",
      "Accounting",
      "Business Studies",
      "Economics",
      "Geography",
      "History",
      "Information Technology",
      "Computer Applications Technology (CAT)",
      "Tourism",
      "Consumer Studies",
      "Hospitality Studies",
      "Engineering Graphics & Design",
      "English Home Language",
      "English First Additional Language",
      "Afrikaans Huistaal",
      "Afrikaans Eerste Addisionele Taal",
    ];
  }
  
  return [];
}

export function AllSubjectsSection() {
  const [selectedGrade, setSelectedGrade] = useState<string>("10");
  const { user } = useUser();

  const subjectsForGrade = useMemo(() => {
    return getSubjectsForGrade(selectedGrade);
  }, [selectedGrade]);

  const getSubjectColor = (subject: string) => {
    return subjectColors[subject] || subjectColors["Unknown"];
  };

  const getSubjectDisplayName = (subject: string) => {
    // Shorten long names for better display
    if (subject === "Computer Applications Technology (CAT)") {
      return "CAT";
    }
    if (subject === "Natural Sciences and Technology") {
      return "Natural Sciences & Tech";
    }
    if (subject === "Economic & Management Sciences") {
      return "EMS";
    }
    return subject;
  };

  const getSubjectLink = (subject: string, grade: string) => {
    if (user) {
      // If logged in, link to dashboard lessons filtered by subject and grade
      return `/dashboard/lessons?subject=${encodeURIComponent(subject)}&grade=${grade}`;
    } else {
      // If not logged in, link to register page
      return `/register?subject=${encodeURIComponent(subject)}&grade=${grade}`;
    }
  };

  const getPhaseDescription = (grade: string) => {
    const gradeNum = parseInt(grade);
    if (gradeNum >= 1 && gradeNum <= 3) {
      return "Foundation Phase - Building fundamental skills and knowledge";
    }
    if (gradeNum >= 4 && gradeNum <= 6) {
      return "Intermediate Phase - Expanding knowledge and critical thinking";
    }
    if (gradeNum >= 7 && gradeNum <= 9) {
      return "Senior Phase - Preparing for subject specialization";
    }
    if (gradeNum >= 10 && gradeNum <= 12) {
      return "FET Phase - Specialized subjects for career preparation";
    }
    return "";
  };

  return (
    <section className="py-12 sm:py-16 bg-background">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">

        {/* Grade Selection Carousel */}
        <div>
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <GraduationCap className="h-5 w-5" />
              <span className="font-medium">Select Grade:</span>
            </div>
          </div>
          
          <div className="max-w-5xl mx-auto relative">
            <Carousel
              opts={{
                align: "start",
                loop: false,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-2 md:-ml-4">
                {grades.map((grade) => (
                  <CarouselItem key={grade.value} className="pl-2 md:pl-4 basis-1/3 sm:basis-1/4 md:basis-1/6 lg:basis-1/8">
                    <Button
                      variant={selectedGrade === grade.value ? "default" : "outline"}
                      className={cn(
                        "w-full h-16 flex flex-col items-center justify-center gap-1 transition-all",
                        selectedGrade === grade.value && "shadow-lg scale-105"
                      )}
                      onClick={() => setSelectedGrade(grade.value)}
                    >
                      <span className="text-lg font-bold">{grade.value}</span>
                      <span className="text-xs opacity-80">Grade</span>
                    </Button>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden lg:flex -left-12" />
              <CarouselNext className="hidden lg:flex -right-12" />
            </Carousel>
          </div>
        </div>

        {/* Phase Information */}
        <div className="mt-12 max-w-3xl mx-auto">
          <div className="bg-muted/50 rounded-lg p-6 border border-border">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Info className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-foreground mb-1">Grade {selectedGrade} - {getPhaseDescription(selectedGrade)}</h4>
                <p className="text-sm text-muted-foreground">
                  {subjectsForGrade.length} {subjectsForGrade.length === 1 ? 'subject' : 'subjects'} available for this grade level. 
                  {compulsorySubjectsByGrade[selectedGrade] && (
                    <> Click on any subject to explore lessons, practice questions, and learning resources.</>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Subjects Display */}
        <div className="mt-12">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-semibold text-foreground">
              Subjects for Grade {selectedGrade}
            </h3>
            <p className="mt-2 text-muted-foreground">
              Click on any subject to learn more and start practicing
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {subjectsForGrade.map((subject) => {
              const colors = getSubjectColor(subject);
              const isCompulsory = compulsorySubjectsByGrade[selectedGrade]?.contentSubjects.includes(subject) ||
                                   compulsorySubjectsByGrade[selectedGrade]?.languageSubjects.includes(subject);
              const description = subjectDescriptions[subject] || "Explore this subject with interactive lessons and practice questions.";
              const subjectLink = getSubjectLink(subject, selectedGrade);
              
              return (
                <Link key={subject} href={subjectLink}>
                  <Card
                    className={cn(
                      "h-full hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer group",
                      colors.border && `border-2 ${colors.border} hover:border-primary/50`
                    )}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className={cn("p-3 rounded-lg transition-transform group-hover:scale-110", colors.bg)}>
                          <BookOpen className={cn("h-6 w-6", colors.text)} />
                        </div>
                        <div className="flex flex-col gap-1 items-end">
                          {isCompulsory && (
                            <Badge variant="secondary" className="text-xs">
                              Core
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs">
                            Grade {selectedGrade}
                          </Badge>
                        </div>
                      </div>
                      <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
                        {getSubjectDisplayName(subject)}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <CardDescription className={cn("text-sm line-clamp-3", colors.text)}>
                        {description}
                      </CardDescription>
                      <div className="flex items-center gap-2 text-primary text-sm font-medium group-hover:gap-3 transition-all">
                        <span>Explore Subject</span>
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Additional Info & Features */}
        <div className="mt-16">
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="text-center p-6 rounded-lg bg-muted/30 border border-border">
              <div className="inline-flex p-3 rounded-full bg-primary/10 mb-4">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-semibold mb-2">Interactive Lessons</h4>
              <p className="text-sm text-muted-foreground">
                Access comprehensive lessons aligned with CAPS curriculum for each subject
              </p>
            </div>
            <div className="text-center p-6 rounded-lg bg-muted/30 border border-border">
              <div className="inline-flex p-3 rounded-full bg-primary/10 mb-4">
                <CheckCircle className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-semibold mb-2">Practice Questions</h4>
              <p className="text-sm text-muted-foreground">
                Test your knowledge with thousands of practice questions and get instant feedback
              </p>
            </div>
            <div className="text-center p-6 rounded-lg bg-muted/30 border border-border">
              <div className="inline-flex p-3 rounded-full bg-primary/10 mb-4">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-semibold mb-2">AI Tutoring</h4>
              <p className="text-sm text-muted-foreground">
                Get personalized help from our AI tutor for any topic you're struggling with
              </p>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-lg">
            <Info className="h-4 w-4" />
            <span>Subject availability may vary. Some subjects are available across multiple grades.</span>
          </div>
        </div>
      </div>
    </section>
  );
}

