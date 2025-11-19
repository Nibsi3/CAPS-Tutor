'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUser } from "@/appwrite";
import {
  Bot,
  Target,
  MessageSquare,
  TrendingUp,
  GraduationCap,
  Brain,
  BookOpen,
  CalendarClock,
  ClipboardList,
  LineChart,
  Award,
  Gamepad2,
  FileText,
  Users,
  Sparkles,
  Layers,
} from "lucide-react";
import { SafeImage } from "@/components/ui/safe-image";
import Link from "next/link";

const steps = [
  {
    id: 1,
    title: "Intelligent Content Generation",
    description: "Our AI analyzes the CAPS curriculum to generate personalized practice questions tailored to your grade and subject. Every question is carefully crafted to match the exact requirements and difficulty level of your syllabus.",
    details: [
      "Questions generated from official CAPS documents",
      "Difficulty automatically adjusted to your grade level",
      "Subject-specific terminology and examples",
      "Matches the style and format of official exams"
    ],
    icon: Brain,
    imageUrl: "/images/how-it-works/intelligent-content.svg",
    imageAlt: "Illustration of CAPS-aligned intelligent content generation"
  },
  {
    id: 2,
    title: "Adaptive Learning",
    description: "The system learns from your performance and adjusts the difficulty and topics accordingly. Weak areas get more practice, while mastered topics are reviewed less frequently—optimizing your study time.",
    details: [
      "Tracks your performance on every question",
      "Identifies knowledge gaps automatically",
      "Focuses practice on areas needing improvement",
      "Adapts in real-time as you learn"
    ],
    icon: Target,
    imageUrl: "/images/how-it-works/adaptive-learning.svg",
    imageAlt: "Illustration showing adaptive learning focused on CAPS subjects"
  },
  {
    id: 3,
    title: "Instant AI Feedback",
    description: "Get immediate, detailed explanations for every answer you submit. Our AI doesn't just tell you if you're right or wrong—it provides step-by-step solutions and helps you understand the concepts behind each problem.",
    details: [
      "Detailed explanations for every answer",
      "Step-by-step problem-solving guidance",
      "Concept clarification when you're stuck",
      "Celebrates your successes along the way"
    ],
    icon: MessageSquare,
    imageUrl: "/images/how-it-works/ai-feedback.svg",
    imageAlt: "AI chat panel providing instant feedback"
  },
  {
    id: 4,
    title: "Progress Tracking",
    description: "Visualize your learning journey with detailed analytics. Track topic mastery, time spent studying, and improvement over time. See exactly where you excel and where you need more practice.",
    details: [
      "Real-time progress visualization",
      "Topic-level performance breakdowns",
      "Historical performance trends",
      "Study time analytics and insights"
    ],
    icon: TrendingUp,
    imageUrl: "/images/how-it-works/progress-tracking.svg",
    imageAlt: "Progress dashboard highlighting study gains"
  },
  {
    id: 5,
    title: "CAPS Alignment",
    description: "Every lesson, practice question, and assessment is meticulously aligned with the South African CAPS curriculum. Our AI understands the specific requirements, terminology, and assessment standards used in South African schools.",
    details: [
      "100% aligned with CAPS curriculum documents",
      "Uses South African educational standards",
      "Matches official assessment formats",
      "Grade-specific content for Grades 10-12"
    ],
    icon: GraduationCap,
    imageUrl: "/images/how-it-works/caps-alignment.svg",
    imageAlt: "CAPS curriculum alignment board"
  },
  {
    id: 6,
    title: "Interactive Tutoring",
    description: "Have a conversation with our AI tutor whenever you're stuck. Ask questions, request examples, or get help breaking down complex problems into manageable steps—just like having a personal tutor available 24/7.",
    details: [
      "24/7 AI tutor availability",
      "Conversational learning support",
      "Custom examples and explanations",
      "Guided problem-solving assistance"
    ],
    icon: Bot,
    imageUrl: "/images/how-it-works/interactive-tutoring.svg",
    imageAlt: "Friendly AI tutor chat bubbles"
  }
];

const highlightStats = [
  {
    label: "Grades Served",
    value: "10 – 12",
    detail: "Focused on the FET Phase with depth for every senior subject.",
  },
  {
    label: "Past Paper Library",
    value: "Paper 1 & 2",
    detail: "Authentic CAPS exams with matching memos.",
  },
  {
    label: "Study Support",
    value: "24/7 AI Tutor",
    detail: "Instant explanations, hints, and revision prompts.",
  },
  {
    label: "Curriculum Fit",
    value: "100% CAPS",
    detail: "Lesson plans, projects & assessments mirror DBE standards.",
  },
];

const featurePillars = [
  {
    title: "Curriculum-perfect planning",
    description: "Create learning paths that mirror the CAPS term plan for every subject and phase.",
    icon: GraduationCap,
    details: [
      "Grade-specific study goals and weekly focus areas",
      "Built-in CAPS syllabus browser for quick topic lookup",
      "Lesson summaries that echo textbook pacing guides",
    ],
  },
  {
    title: "Adaptive practice engine",
    description: "Mix teacher-created content with AI-generated questions that respond to performance.",
    icon: Target,
    details: [
      "Placement checks surface immediate gaps",
      "Custom drills filter by topic, taxonomy level, or Bloom’s verb",
      "Step-by-step feedback locks in understanding before moving on",
    ],
  },
  {
    title: "Evidence-based monitoring",
    description: "Dashboards help students, teachers, and parents make data-driven decisions every week.",
    icon: TrendingUp,
    details: [
      "Progress screens track mastery per strand and term",
      "Attendance-style logs for practice time and lesson completion",
      "Exportable summaries for parent meetings or teacher records",
    ],
  },
];

const learningJourney = [
  {
    title: "Create your profile",
    subtitle: "Onboarding",
    description: "CAPS Tutor loads the correct term plan, textbooks, and exemplars instantly.",
    icon: Users,
  },
  {
    title: "Placement & readiness checks",
    subtitle: "Baseline checks",
    description: "We highlight prerequisite topics so revision starts where it matters most.",
    icon: ClipboardList,
  },
  {
    title: "Daily learning loops",
    subtitle: "Learning loop",
    description: "Jump between concept videos, quick notes, and AI-generated worked examples.",
    icon: BookOpen,
  },
  {
    title: "Instant guidance",
    subtitle: "AI support",
    description: "Voice-friendly prompts, multilingual hints, and context-aware support keep you moving.",
    icon: MessageSquare,
  },
  {
    title: "Weekly reviews",
    subtitle: "Progress check",
    description: "Teachers and parents receive concise summaries with suggested next steps.",
    icon: LineChart,
  },
  {
    title: "Exam readiness",
    subtitle: "Exam mode",
    description: "Paper 1 and Paper 2 sessions follow the official layout, complete with marking guidelines.",
    icon: FileText,
  },
];

const capabilityGrid = [
  {
    title: "Smart Practice Workspace",
    tag: "Practice",
    description: "Blend AI-created questions with your teacher’s worksheets in one drill.",
    icon: Sparkles,
    items: [
      "Topic filters for everything from Euclidean Geometry to Organic Chemistry",
      "Difficulty sliders and timed modes that match Paper 1/Paper 2 expectations",
      "Confidence ratings so the AI knows when to remediate or extend",
    ],
  },
  {
    title: "Past Paper Studio",
    tag: "Assessment",
    description: "Real CAPS past papers with matching memos, diagrams, and mark allocations.",
    icon: FileText,
    items: [
      "Switch between standard view and exam-timer view",
      "Upload your own scanned scripts for targeted marking",
      "Flag tricky questions to revisit inside personalised revision lists",
    ],
  },
  {
    title: "Interactive Tutor Desk",
    tag: "AI Tutor",
    description: "Chat to the tutor, request analogies, or break down multi-mark questions.",
    icon: Bot,
    items: [
      "Supports Afrikaans and English terminology from CAPS glossaries",
      "Shares diagrams, tables, and step-by-step hints inline",
      "Escalates to human tutor notes when schools upload their own scripts",
    ],
  },
  {
    title: "Lesson & Syllabus Explorer",
    tag: "Lessons",
    description: "Jump straight to the CAPS topic, ATP week, or textbook heading you need.",
    icon: Layers,
    items: [
      "Linked concept summaries, worked examples, and practical tips",
      "One-click access to DBE guidelines, PAT rubrics, and SBA checklists",
      "Bookmark favourite lessons for offline revision packs",
    ],
  },
  {
    title: "Gamified Motivation",
    tag: "Progress",
    description: "Keep momentum with streaks, achievements, and friendly leaderboards.",
    icon: Gamepad2,
    items: [
      "Unlock badges for consistent study habits",
      "House competitions encourage collaborative revision",
      "Optional teacher challenges for homework accountability",
    ],
  },
  {
    title: "Teacher & Parent Insights",
    tag: "Insights",
    description: "Bring everyone into the learning loop with shareable analytics.",
    icon: Award,
    items: [
      "Export PDF or CSV snapshots of mastery per term",
      "Annotate goals and interventions directly on the dashboard",
      "Receive nudges when a student needs encouragement or extension",
    ],
  },
];

export default function HowItWorksPage() {
  const { user } = useUser();
  return (
    <main className="flex-1">
      <div className="relative isolate bg-background">
        {/* Hero Section */}
        <div className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl font-headline">
                How CAPS Tutor Works
              </h1>
              <p className="mt-6 text-lg leading-8 text-muted-foreground">
                Discover how our AI-powered platform revolutionizes learning for South African students
              </p>
            </div>
          </div>
        </div>

        {/* Highlight Metrics */}
        <div className="pb-12">
          <div className="mx-auto max-w-6xl px-6 lg:px-8">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {highlightStats.map((stat) => (
                <Card key={stat.label} className="border-primary/20 bg-card/70">
                  <CardHeader>
                    <CardDescription>{stat.label}</CardDescription>
                    <CardTitle className="text-3xl font-bold">{stat.value}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{stat.detail}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Feature Pillars */}
        <div className="py-16 bg-muted/20">
          <div className="mx-auto max-w-6xl px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center mb-12">
              <p className="text-base font-semibold text-primary">Built for South African classrooms</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Everything revolves around CAPS learning
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                CAPS Tutor isn’t a generic study app—it mirrors the official policy so teachers, parents, and students stay in sync.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {featurePillars.map((pillar) => {
                const Icon = pillar.icon;
                return (
                  <Card key={pillar.title} className="h-full border-2 border-primary/10 shadow-sm">
                    <CardHeader className="space-y-4">
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Icon className="h-6 w-6" aria-hidden="true" />
                      </div>
                      <CardTitle className="text-xl">{pillar.title}</CardTitle>
                      <CardDescription className="text-base">{pillar.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3 text-sm text-muted-foreground">
                        {pillar.details.map((point) => (
                          <li key={point} className="flex items-start gap-2">
                            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>

        {/* Steps Section */}
        <div className="py-12 bg-muted/20">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="space-y-24">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isEven = index % 2 === 0;
                
                return (
                  <div key={step.id} className="relative">
                    {/* Step Number Badge */}
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-10">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white font-bold text-xl shadow-lg">
                        {step.id}
                      </div>
                    </div>

                    <Card className="overflow-hidden border-2 hover:shadow-xl transition-all duration-300">
                      <div className={`flex flex-col ${isEven ? '' : 'lg:flex-row-reverse'}`}>
                        {/* Image */}
                        <div className="relative w-full lg:w-1/2 aspect-[16/10] lg:aspect-[4/3] lg:min-h-[400px] bg-muted overflow-hidden rounded-t-lg lg:rounded-none lg:rounded-l-lg">
                          <SafeImage
                            src={step.imageUrl}
                            alt={step.imageAlt}
                            fill
                            sizes="(max-width: 1024px) 100vw, 50vw"
                            className="object-cover"
                          />
                          <div className="absolute inset-0 pointer-events-none">
                            <div className="h-full w-full bg-gradient-to-t from-background/60 via-background/10 to-transparent md:bg-gradient-to-r md:from-background/25 md:via-transparent md:to-transparent" />
                          </div>
                        </div>

                        {/* Content */}
                        <div className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
                          <div className="flex items-center gap-4 mb-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
                              <Icon className="h-6 w-6 text-white" aria-hidden="true" />
                            </div>
                            <div className="text-sm font-semibold text-primary">
                              Step {step.id}
                            </div>
                          </div>
                          
                          <h2 className="text-2xl font-bold leading-8 text-foreground mb-4">
                            {step.title}
                          </h2>
                          
                          <p className="text-base leading-7 text-muted-foreground mb-6">
                            {step.description}
                          </p>

                          {/* Details List */}
                          <ul className="space-y-3">
                            {step.details.map((detail, idx) => (
                              <li key={idx} className="flex items-start gap-3">
                                <div className="flex-shrink-0 mt-0.5">
                                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                </div>
                                <span className="text-sm leading-6 text-muted-foreground">{detail}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Learning Journey */}
        <div className="py-16">
          <div className="mx-auto max-w-6xl px-6 lg:px-8">
            <div className="max-w-3xl">
              <p className="text-base font-semibold text-primary">A day-to-day journey that makes sense</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                From onboarding to exam day, every step stays CAPS-aligned
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Learners follow the official Annual Teaching Plan (ATP) rhythm while still enjoying personalised support, reflection, and celebration.
              </p>
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-2">
              {learningJourney.map((phase, index) => {
                const Icon = phase.icon;
                return (
                  <Card key={phase.title} className="relative h-full border-2 border-primary/10">
                    <CardHeader className="space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white font-semibold">
                          {index + 1}
                        </span>
                        <div className="rounded-full bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
                          {phase.subtitle}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <Icon className="h-6 w-6" aria-hidden="true" />
                        </div>
                        <CardTitle className="text-xl">{phase.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{phase.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>

        {/* Capabilities Grid */}
        <div className="py-16 bg-muted/10">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="max-w-3xl">
              <p className="text-base font-semibold text-primary">Deep dive into the toolkit</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Everything you need to learn, teach, and monitor—online in one place
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Each feature reflects real workflows inside South African classrooms, from weekly homework to formal assessments.
              </p>
            </div>
            <div className="mt-12 grid gap-8 md:grid-cols-2">
              {capabilityGrid.map((feature) => {
                const Icon = feature.icon;
                return (
                  <Card key={feature.title} className="flex h-full flex-col border-2 border-primary/10">
                    <CardHeader className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <Icon className="h-6 w-6" aria-hidden="true" />
                          </div>
                          <CardTitle className="text-xl">{feature.title}</CardTitle>
                        </div>
                        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                          {feature.tag}
                        </span>
                      </div>
                      <CardDescription className="text-base">{feature.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="mt-auto">
                      <ul className="space-y-3 text-sm text-muted-foreground">
                        {feature.items.map((item) => (
                          <li key={item} className="flex items-start gap-2">
                            <Sparkles className="mt-0.5 h-4 w-4 text-primary" aria-hidden="true" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>

        {/* CTA Section - Only show if user is not logged in */}
        {!user && (
          <div className="py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto max-w-2xl text-center">
                <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  Ready to Transform Your Learning?
                </h2>
                <p className="mt-6 text-lg leading-8 text-muted-foreground">
                  Join thousands of South African students already using CAPS Tutor to excel in their studies
                </p>
                <div className="mt-10 flex items-center justify-center gap-x-6">
                  <Button asChild size="lg" className="text-lg px-8 py-6">
                    <Link href="/register">Get Started for Free</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link href="/">Back to Home</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Decorative elements */}
        <div
          className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
          aria-hidden="true"
        >
          <div
            className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary to-purple-500 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
          />
        </div>
      </div>
    </main>
  );
}








