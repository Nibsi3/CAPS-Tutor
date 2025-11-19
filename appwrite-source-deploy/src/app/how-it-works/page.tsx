import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot, Target, MessageSquare, TrendingUp, GraduationCap, Brain } from "lucide-react";
import { SafeImage } from "@/components/ui/safe-image";
import { getHowItWorksImageOrFallback } from "@/lib/how-it-works-images";
import Link from "next/link";

const baseSteps = [
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
    imageKey: "intelligent-content",
    fallbackAlt: "AI-generated educational content",
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
    imageKey: "adaptive-learning",
    fallbackAlt: "Adaptive learning visualization",
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
    imageKey: "ai-feedback",
    fallbackAlt: "Interactive feedback and explanations",
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
    imageKey: "progress-tracking",
    fallbackAlt: "Progress tracking and analytics",
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
    imageKey: "caps-alignment",
    fallbackAlt: "CAPS curriculum alignment",
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
    imageKey: "interactive-tutoring",
    fallbackAlt: "Interactive AI tutoring",
  }
];

const steps = baseSteps.map((step) => {
  const image = getHowItWorksImageOrFallback(
    step.imageKey,
    `/images/how-it-works/${step.imageKey}.jpg`,
    step.fallbackAlt
  );

  return {
    ...step,
    imageUrl: image.imageUrl,
    imageAlt: image.imageAlt,
  };
});

export default function HowItWorksPage() {
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
                        <div className="relative w-full lg:w-1/2 aspect-[16/10] lg:aspect-auto">
                          <SafeImage
                            src={step.imageUrl}
                            alt={step.imageAlt}
                            fill
                            sizes="(max-width: 1024px) 100vw, 50vw"
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/40 to-transparent lg:from-transparent lg:via-transparent lg:bg-gradient-to-r lg:from-background/80 lg:to-transparent" />
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

        {/* CTA Section */}
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








