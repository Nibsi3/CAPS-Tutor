'use client';

import { AITryOut } from "@/components/home/AITryOut";
import { HowItWorks } from "@/components/home/HowItWorks";
import { CapsSyllabusSection, NewsSection, BlogSection, ContactSection, CompetitiveAdvantagesSection, FAQSection, StudyResourcesSection } from "@/components/home/HomeSections";
import { AllSubjectsPreview } from "@/components/home/AllSubjectsPreview";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Target, Bot, BarChart } from "lucide-react";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Force dynamic rendering to prevent SSG issues during preview mode
export const dynamic = "force-dynamic";

const features = [
  {
    name: 'Adaptive Practice',
    description: 'Generate custom quizzes that focus on your weak topics, helping you improve where it matters most.',
    icon: Target,
  },
  {
    name: 'Instant AI Feedback',
    description: 'Never get stuck again. Our AI provides instant, step-by-step explanations for every question.',
    icon: Bot,
  },
  {
    name: 'Progress Tracking',
    description: 'Visualize your progress with detailed analytics on topic mastery, time spent, and historical performance.',
    icon: BarChart,
  },
]


export default function HomePage() {
  console.log("page-start");
  
  try {
    // Log environment and component initialization
    const data = {
      timestamp: new Date().toISOString(),
      isClient: typeof window !== 'undefined',
    };
    console.log("page-data", data);
    
    return (
      <ErrorBoundary>
        <main className="flex-1">
        <div className="relative isolate overflow-hidden">
          {/* Decorative element from previous design, can be kept for visual flair */}
          <div
            className="absolute left-[calc(50%-4rem)] top-10 -z-10 transform-gpu blur-3xl sm:left-[calc(50%-18rem)] lg:left-48 lg:top-[calc(50%-30rem)] xl:left-[calc(50%-24rem)]"
            aria-hidden="true"
          >
            <div
              className="aspect-[1108/632] w-[72.125rem] bg-gradient-to-r from-primary to-purple-500 opacity-20"
              style={{
                clipPath:
                  'polygon(73.6% 51.7%, 91.7% 11.8%, 100% 46.4%, 97.4% 82.2%, 92.5% 84.9%, 75.7% 64.3%, 55.3% 47.5%, 46.5% 49.4%, 45% 62.9%, 50.3% 87.2%, 21.3% 64.1%, 0.1% 100%, 5.4% 51.1%, 21.4% 63.9%, 58.9% 0.2%, 73.6% 51.7%)',
              }}
            />
          </div>
          
          <section className="w-full max-w-4xl mx-auto px-4 md:px-6 pt-24 pb-12 sm:pt-32">
            <div className="flex flex-col items-center justify-center space-y-6 text-center">
              <div className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-headline">
                  The Ultimate AI Tutor for the CAPS Curriculum
                </h1>
                <p className="max-w-[700px] mx-auto text-muted-foreground md:text-lg">
                  Master any subject with interactive lessons, adaptive practice, and instant feedback, all perfectly aligned with the South African curriculum.
                </p>
              </div>
            </div>
            
            <div className="pt-12">
               <AITryOut />
            </div>

            <div className="flex items-center justify-center gap-4 pt-8">
                <Button asChild size="lg">
                    <Link href="/register">Get Started for Free</Link>
                </Button>
            </div>
          </section>

        </div>

      {/* How It Works Section */}
      <HowItWorks />

      {/* CAPS Syllabus Section */}
      <CapsSyllabusSection />

      {/* All Subjects Preview Section */}
      <AllSubjectsPreview />

      {/* How It's Different / Competitive Advantages Section */}
      <CompetitiveAdvantagesSection />

      {/* Study Resources Section */}
      <StudyResourcesSection />

      {/* FAQ Section */}
      <FAQSection />

      {/* News Section */}
      <NewsSection />

      {/* Blog Section */}
      <BlogSection />

      {/* Contact Section */}
      <ContactSection />

      <div className="relative isolate overflow-hidden">
          <section className="py-24 sm:py-32 bg-muted/30">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="mx-auto max-w-2xl lg:text-center">
                <p className="text-base font-semibold leading-7 text-primary">Learn Smarter</p>
                <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl font-headline">
                  Everything you need to excel in your exams
                </h2>
                <p className="mt-6 text-lg leading-8 text-muted-foreground">
                  Our platform is more than just questions and answers. It's a complete learning ecosystem designed to help you understand, practice, and master your subjects.
                </p>
              </div>
              <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
                <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-3 lg:gap-y-16">
                  {features.map((feature) => (
                    <div key={feature.name} className="relative pl-16">
                      <dt className="text-base font-semibold leading-7 text-foreground">
                        <div className="absolute left-0 top-0 flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
                          <feature.icon className="h-6 w-6 text-white" aria-hidden="true" />
                        </div>
                        {feature.name}
                      </dt>
                      <dd className="mt-2 text-base leading-7 text-muted-foreground">{feature.description}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </section>


          {/* Bottom-left decorative element */}
          <div
            className="absolute bottom-0 left-0 -z-10 transform-gpu overflow-hidden blur-3xl"
            aria-hidden="true"
          >
            <div
              className="aspect-[1155/678] w-[72.1875rem] -translate-x-1/2 bg-gradient-to-tr from-[#1e40af] to-[#9333ea] opacity-30"
              style={{
                clipPath:
                  'polygon(20% 65%, 0% 50%, 10% 20%, 40% 0%, 70% 20%, 90% 50%, 100% 65%, 80% 85%, 50% 100%, 30% 85%)',
              }}
            />
          </div>
          {/* Bottom-right decorative element */}
          <div
            className="absolute bottom-0 right-0 -z-10 transform-gpu overflow-hidden blur-3xl"
            aria-hidden="true"
          >
             <div
              className="aspect-[1155/678] w-[72.1875rem] translate-x-1/2 bg-gradient-to-tl from-[#1e40af] to-[#9333ea] opacity-30"
              style={{
                clipPath:
                  'polygon(80% 65%, 100% 50%, 90% 20%, 60% 0%, 30% 20%, 10% 50%, 0% 65%, 20% 85%, 50% 100%, 70% 85%)',
              }}
            />
          </div>

      </div>
    </main>
    </ErrorBoundary>
  );
  } catch (e) {
    console.error("page-error", e);
    throw e; // Re-throw to let ErrorBoundary handle it
  }
}
