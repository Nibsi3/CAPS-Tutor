'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { BookOpen, FileText, GraduationCap, Download, ExternalLink, Award, Lightbulb } from "lucide-react";

const studyResources = [
  {
    icon: FileText,
    title: "Study Guides",
    description: "Comprehensive study guides for all subjects, covering key concepts, formulas, and exam tips.",
    link: "/dashboard/lessons",
    badge: "Available"
  },
  {
    icon: Lightbulb,
    title: "Exam Tips & Strategies",
    description: "Learn proven strategies for exam success, time management, and tackling different question types.",
    link: "/blog",
    badge: "Blog Posts"
  },
  {
    icon: Award,
    title: "Past Papers & Practice",
    description: "Access thousands of practice questions and work through past exam papers to prepare effectively.",
    link: "/dashboard/practice",
    badge: "Practice"
  },
  {
    icon: GraduationCap,
    title: "Subject-Specific Resources",
    description: "Quick access to resources organized by subject and grade level for targeted learning.",
    link: "/all-subjects",
    badge: "All Subjects"
  }
];

const popularSubjects = [
  "Mathematics",
  "Physical Sciences",
  "Life Sciences",
  "Accounting",
  "English"
];

export function StudyResourcesSection() {
  return (
    <section className="py-24 sm:py-32 bg-background">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm font-medium text-primary">
            Study Resources
          </div>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl font-headline">
            Everything You Need to Succeed
          </h2>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Access study guides, exam tips, practice questions, and official resources to help you excel in your studies.
          </p>
        </div>

        {/* Resource Cards */}
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-7xl">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {studyResources.map((resource, index) => {
              const Icon = resource.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow group">
                  <Link href={resource.link} className="block">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {resource.badge}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">{resource.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-sm">
                        {resource.description}
                      </CardDescription>
                    </CardContent>
                  </Link>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Quick Access by Subject */}
        <div className="mx-auto mt-16 max-w-5xl">
          <h3 className="text-xl font-semibold text-foreground mb-6 text-center">
            Quick Access by Subject
          </h3>
          <div className="flex flex-wrap gap-3 justify-center">
            {popularSubjects.map((subject) => (
              <Button
                key={subject}
                asChild
                variant="outline"
                className="hover:bg-primary hover:text-primary-foreground"
              >
                <Link href={`/dashboard/lessons?subject=${encodeURIComponent(subject)}`}>
                  <BookOpen className="mr-2 h-4 w-4" />
                  {subject}
                </Link>
              </Button>
            ))}
          </div>
        </div>

        {/* Department of Education Resources */}
        <div className="mx-auto mt-16 max-w-4xl">
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-purple-500/5">
            <CardHeader>
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <GraduationCap className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-2xl">Official Department of Education Resources</CardTitle>
                  <CardDescription className="text-base mt-2">
                    Access official study materials, curriculum documents, and resources directly from the South African Department of Basic Education.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  The Department of Basic Education provides a wealth of official study resources, past papers, 
                  curriculum documents, and learning materials for all CAPS subjects. These resources are 
                  essential for comprehensive exam preparation. Visit the DBE website to access study guides, 
                  past exam papers, and official curriculum documents.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button asChild size="lg" className="flex-1">
                    <a 
                      href="https://www.education.gov.za" 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <Download className="mr-2 h-5 w-5" />
                      Visit DBE Study Resources
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="flex-1">
                    <a 
                      href="https://www.education.gov.za" 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <FileText className="mr-2 h-5 w-5" />
                      CAPS Curriculum Documents
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </div>
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    <strong>Note:</strong> These links will take you to the official Department of Basic Education website. 
                    All resources are provided free of charge by the South African government.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

