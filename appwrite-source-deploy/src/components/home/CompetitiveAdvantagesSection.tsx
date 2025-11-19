'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, GraduationCap, Target, CheckCircle, Sparkles, TrendingUp } from "lucide-react";

const advantages = [
  {
    icon: Bot,
    title: "AI-Powered Tutoring",
    description: "Get instant, personalized help from an AI tutor that understands the CAPS curriculum. No waiting for office hours or scheduling appointments.",
    highlight: "24/7 Availability"
  },
  {
    icon: GraduationCap,
    title: "100% CAPS Aligned",
    description: "Every lesson and question is meticulously mapped to the official CAPS syllabus. Learn exactly what you need for your exams.",
    highlight: "Curriculum Perfect"
  },
  {
    icon: Target,
    title: "Adaptive Learning",
    description: "Our platform learns your strengths and weaknesses, automatically generating practice questions that target your weak areas.",
    highlight: "Personalized"
  },
  {
    icon: TrendingUp,
    title: "Progress Tracking",
    description: "Visualize your learning journey with detailed analytics on topic mastery, time spent, and performance trends over time.",
    highlight: "Data-Driven"
  },
  {
    icon: Sparkles,
    title: "Instant Feedback",
    description: "Get step-by-step explanations for every question immediately. Understand not just what the answer is, but why it's correct.",
    highlight: "Learn Faster"
  },
  {
    icon: CheckCircle,
    title: "Comprehensive Coverage",
    description: "Access to all subjects across Grades 10-12, with thousands of practice questions and interactive lessons for every topic.",
    highlight: "All Subjects"
  }
];

const comparisonFeatures = [
  {
    feature: "AI Tutoring Available",
    capstutor: true,
    traditional: false,
    otherPlatforms: false
  },
  {
    feature: "CAPS Curriculum Alignment",
    capstutor: true,
    traditional: false,
    otherPlatforms: false
  },
  {
    feature: "Adaptive Practice Questions",
    capstutor: true,
    traditional: false,
    otherPlatforms: true
  },
  {
    feature: "Instant Feedback & Explanations",
    capstutor: true,
    traditional: false,
    otherPlatforms: true
  },
  {
    feature: "Progress Analytics",
    capstutor: true,
    traditional: false,
    otherPlatforms: true
  },
  {
    feature: "24/7 Availability",
    capstutor: true,
    traditional: false,
    otherPlatforms: true
  },
  {
    feature: "Free to Use",
    capstutor: true,
    traditional: false,
    otherPlatforms: false
  },
  {
    feature: "All Grades 10-12 Subjects",
    capstutor: true,
    traditional: false,
    otherPlatforms: false
  }
];

export function CompetitiveAdvantagesSection() {
  return (
    <section className="py-24 sm:py-32 bg-background">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm font-medium text-primary">
            Why Choose CAPS Tutor?
          </div>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl font-headline">
            How We're Different
          </h2>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            We combine cutting-edge AI technology with deep curriculum expertise to deliver the most effective learning experience for South African students.
          </p>
        </div>

        {/* Unique Features Cards */}
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-7xl">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {advantages.map((advantage, index) => {
              const Icon = advantage.icon;
              return (
                <Card key={index} className="relative overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-bl-full" />
                  <CardHeader>
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 rounded-lg bg-primary/10">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {advantage.highlight}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl">{advantage.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {advantage.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Comparison Table */}
        <div className="mx-auto mt-20 max-w-5xl">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-foreground font-headline">
              CAPS Tutor vs. Traditional Learning
            </h3>
            <p className="mt-2 text-muted-foreground">
              See how we compare to traditional tutoring and other learning platforms
            </p>
          </div>
          
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Feature</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">
                      <div className="flex items-center justify-center gap-2">
                        <span>CAPS Tutor</span>
                        <Badge variant="default" className="text-xs">Best</Badge>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-muted-foreground">Traditional Tutoring</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-muted-foreground">Other Platforms</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((item, index) => (
                    <tr key={index} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-foreground">{item.feature}</td>
                      <td className="px-6 py-4 text-center">
                        {item.capstutor ? (
                          <CheckCircle className="h-5 w-5 text-primary mx-auto" />
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {item.traditional ? (
                          <CheckCircle className="h-5 w-5 text-muted-foreground mx-auto" />
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {item.otherPlatforms ? (
                          <CheckCircle className="h-5 w-5 text-muted-foreground mx-auto" />
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}

