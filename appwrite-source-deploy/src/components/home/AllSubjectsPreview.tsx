'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { BookOpen, ArrowRight, GraduationCap } from "lucide-react";
import { subjectColors } from "@/lib/data";
import { cn } from "@/lib/utils";

// Sample subjects from different grades to show variety
const sampleSubjects = [
  { name: "Mathematics", grade: "All Grades" },
  { name: "Physical Sciences", grade: "Grades 10-12" },
  { name: "Life Sciences", grade: "Grades 10-12" },
  { name: "English Home Language", grade: "All Grades" },
  { name: "Natural Sciences", grade: "Grades 7-9" },
  { name: "Accounting", grade: "Grades 10-12" },
];

export function AllSubjectsPreview() {
  const getSubjectColor = (subject: string) => {
    return subjectColors[subject] || subjectColors["Unknown"];
  };

  return (
    <section className="py-24 sm:py-32 bg-background">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm font-medium text-primary">
            All Subjects
          </div>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl font-headline">
            Explore All Subjects We Offer
          </h2>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Browse our comprehensive subject offerings by grade level. Select your grade to see all available subjects aligned with the CAPS curriculum.
          </p>
        </div>

        {/* Sample Subjects Grid */}
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-7xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sampleSubjects.map((item) => {
              const colors = getSubjectColor(item.name);
              
              return (
                <Card
                  key={item.name}
                  className={cn(
                    "hover:shadow-lg transition-all duration-300 hover:scale-105",
                    colors.border && `border-2 ${colors.border}`
                  )}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className={cn("p-2 rounded-lg", colors.bg)}>
                        <BookOpen className={cn("h-5 w-5", colors.text)} />
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {item.grade}
                      </Badge>
                    </div>
                    <CardTitle className="mt-4 text-lg leading-tight">
                      {item.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className={cn("text-sm", colors.text)}>
                      Available for {item.grade}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-12 flex items-center justify-center gap-x-6">
          <Button asChild size="lg">
            <Link href="/all-subjects">
              View All Subjects by Grade
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <GraduationCap className="h-4 w-4" />
            <span>Browse subjects for Grades 10-12 with our interactive grade selector</span>
          </div>
        </div>
      </div>
    </section>
  );
}

