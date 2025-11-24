'use client';

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot, Target, MessageSquare, TrendingUp, GraduationCap, Brain } from "lucide-react";
import { SafeImage } from "@/components/ui/safe-image";
import Link from "next/link";

const baseSteps = [
  {
    id: 1,
    title: "Intelligent Content Generation",
    description: "Our AI analyzes the CAPS curriculum to generate personalized practice questions tailored to your grade and subject. Every question is carefully crafted to match the exact requirements and difficulty level of your syllabus.",
    icon: Brain,
    imageKey: "intelligent-content",
    fallbackAlt: "AI-generated educational content",
  },
  {
    id: 2,
    title: "Adaptive Learning",
    description: "The system learns from your performance and adjusts the difficulty and topics accordingly. Weak areas get more practice, while mastered topics are reviewed less frequently—optimizing your study time.",
    icon: Target,
    imageKey: "adaptive-learning",
    fallbackAlt: "Adaptive learning visualization",
  },
  {
    id: 3,
    title: "Instant AI Feedback",
    description: "Get immediate, detailed explanations for every answer you submit. Our AI doesn't just tell you if you're right or wrong—it provides step-by-step solutions and helps you understand the concepts behind each problem.",
    icon: MessageSquare,
    imageKey: "ai-feedback",
    fallbackAlt: "Interactive feedback and explanations",
  },
  {
    id: 4,
    title: "Progress Tracking",
    description: "Visualize your learning journey with detailed analytics. Track topic mastery, time spent studying, and improvement over time. See exactly where you excel and where you need more practice.",
    icon: TrendingUp,
    imageKey: "progress-tracking",
    fallbackAlt: "Progress tracking and analytics",
  },
  {
    id: 5,
    title: "CAPS Alignment",
    description: "Every lesson, practice question, and assessment is meticulously aligned with the South African CAPS curriculum. Our AI understands the specific requirements, terminology, and assessment standards used in South African schools.",
    icon: GraduationCap,
    imageKey: "caps-alignment",
    fallbackAlt: "CAPS curriculum alignment",
  },
  {
    id: 6,
    title: "Interactive Tutoring",
    description: "Have a conversation with our AI tutor whenever you're stuck. Ask questions, request examples, or get help breaking down complex problems into manageable steps—just like having a personal tutor available 24/7.",
    icon: Bot,
    imageKey: "interactive-tutoring",
    fallbackAlt: "Interactive AI tutoring",
  }
];

const steps = baseSteps.map((step) => ({
  ...step,
  imageUrl: `/images/how-it-works/${step.imageKey}.jpg`, // Fallback URL
  imageAlt: step.fallbackAlt,
}));

export function HowItWorks() {
  const [thumbnails, setThumbnails] = useState<Record<string, string>>({});
  const [thumbnailError, setThumbnailError] = useState<string | null>(null);

  const imageKeys = useMemo(
    () => steps.map((step) => step.imageKey),
    []
  );

  const missingKeys = useMemo(
    () => imageKeys.filter((key) => !thumbnails[key]),
    [imageKeys, thumbnails]
  );

  useEffect(() => {
    if (missingKeys.length === 0) return;

    let cancelled = false;

    const fetchThumbnails = async () => {
      try {
        const response = await fetch('/api/how-it-works/thumbnails', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slugs: missingKeys }),
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch thumbnails: ${response.statusText}`);
        }

        const data = await response.json();

        if (!cancelled && data?.thumbnails) {
          setThumbnails((prev) => ({ ...prev, ...data.thumbnails }));
          setThumbnailError(null);
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to resolve how-it-works thumbnails:', error);
          setThumbnailError('Some images may fall back to default artwork.');
        }
      }
    };

    fetchThumbnails();

    return () => {
      cancelled = true;
    };
  }, [missingKeys]);

  return (
    <section id="how-it-works" className="py-24 sm:py-32 bg-gradient-to-b from-background to-muted/20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-primary">How It Works</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl font-headline">
            Your AI-Powered Learning Journey
          </p>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Experience the future of personalized education with our intelligent tutoring system that understands you and adapts to your needs.
          </p>
        </div>

        {/* Steps */}
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isEven = index % 2 === 0;
              const imageUrl = thumbnails[step.imageKey] ?? step.imageUrl;
              
              return (
                <Card 
                  key={step.id} 
                  className="overflow-hidden border-2 hover:shadow-lg transition-all duration-300"
                >
                  <div className={`flex flex-col ${isEven ? '' : 'lg:flex-row-reverse'}`}>
                    {/* Image */}
                    <div className="relative w-full lg:w-1/2 aspect-[16/10] lg:aspect-[4/3] lg:min-h-[400px] bg-muted">
                      <SafeImage
                        src={imageUrl}
                        alt={step.imageAlt}
                        fill
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/40 to-transparent lg:from-transparent lg:via-transparent lg:bg-gradient-to-r lg:from-background/80 lg:to-transparent" />
                    </div>

                    {/* Content */}
                    <div className="w-full lg:w-1/2 p-8 flex flex-col justify-center">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
                          <Icon className="h-6 w-6 text-white" aria-hidden="true" />
                        </div>
                        <div className="text-sm font-semibold text-primary">
                          Step {step.id}
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-semibold leading-7 text-foreground mb-3">
                        {step.title}
                      </h3>
                      
                      <p className="text-base leading-7 text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="text-lg px-8 py-6">
              <Link href="/how-it-works">Learn More</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
              <Link href="/register">Start Your Learning Journey</Link>
            </Button>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Join thousands of South African students already using CAPS Tutor
          </p>
        </div>
      </div>
    </section>
  );
}

