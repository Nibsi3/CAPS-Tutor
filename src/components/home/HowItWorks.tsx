import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot, Target, MessageSquare, TrendingUp, GraduationCap, Brain } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const steps = [
  {
    id: 1,
    title: "Intelligent Content Generation",
    description: "Our AI analyzes the CAPS curriculum to generate personalized practice questions tailored to your grade and subject. Every question is carefully crafted to match the exact requirements and difficulty level of your syllabus.",
    icon: Brain,
    imageUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxMnx8YWklMjBtYWNoaW5lfGVufDB8fHx8MTc2MTUwODk3MHww&ixlib=rb-4.1.0&q=80&w=1080",
    imageAlt: "AI-generated educational content"
  },
  {
    id: 2,
    title: "Adaptive Learning",
    description: "The system learns from your performance and adjusts the difficulty and topics accordingly. Weak areas get more practice, while mastered topics are reviewed less frequently—optimizing your study time.",
    icon: Target,
    imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHx0ZWNobm9sb2d5fGVufDB8fHx8MTc2MTQ4NjQ5NXww&ixlib=rb-4.1.0&q=80&w=1080",
    imageAlt: "Adaptive learning visualization"
  },
  {
    id: 3,
    title: "Instant AI Feedback",
    description: "Get immediate, detailed explanations for every answer you submit. Our AI doesn't just tell you if you're right or wrong—it provides step-by-step solutions and helps you understand the concepts behind each problem.",
    icon: MessageSquare,
    imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw0fHxlZHVjYXRpb258ZW58MHx8fHwxNzYxNDg3MTc2fDA&ixlib=rb-4.1.0&q=80&w=1080",
    imageAlt: "Interactive feedback and explanations"
  },
  {
    id: 4,
    title: "Progress Tracking",
    description: "Visualize your learning journey with detailed analytics. Track topic mastery, time spent studying, and improvement over time. See exactly where you excel and where you need more practice.",
    icon: TrendingUp,
    imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw2fHxhbmFseXRpY3N8ZW58MHx8fHwxNzYxNDg3MTc2fDA&ixlib=rb-4.1.0&q=80&w=1080",
    imageAlt: "Progress tracking and analytics"
  },
  {
    id: 5,
    title: "CAPS Alignment",
    description: "Every lesson, practice question, and assessment is meticulously aligned with the South African CAPS curriculum. Our AI understands the specific requirements, terminology, and assessment standards used in South African schools.",
    icon: GraduationCap,
    imageUrl: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxMnx8ZWR1Y2F0aW9uJTIwc291dGglMjBhZnJpY2F8ZW58MHx8fHwxNzYxNDg3MTc2fDA&ixlib=rb-4.1.0&q=80&w=1080",
    imageAlt: "CAPS curriculum alignment"
  },
  {
    id: 6,
    title: "Interactive Tutoring",
    description: "Have a conversation with our AI tutor whenever you're stuck. Ask questions, request examples, or get help breaking down complex problems into manageable steps—just like having a personal tutor available 24/7.",
    icon: Bot,
    imageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw4fHxjb2xsYWJvcmF0aW9ufGVufDB8fHx8MTc2MTQ4NzE3Nnww&ixlib=rb-4.1.0&q=80&w=1080",
    imageAlt: "Interactive AI tutoring"
  }
];

export function HowItWorks() {
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
              
              return (
                <Card 
                  key={step.id} 
                  className="overflow-hidden border-2 hover:shadow-lg transition-all duration-300"
                >
                  <div className={`flex flex-col ${isEven ? '' : 'lg:flex-row-reverse'}`}>
                    {/* Image */}
                    <div className="relative w-full lg:w-1/2 aspect-[16/10] lg:aspect-auto">
                      <Image
                        src={step.imageUrl}
                        alt={step.imageAlt}
                        fill
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

