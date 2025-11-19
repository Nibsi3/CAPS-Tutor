'use client';

import { AllSubjectsSection } from "@/components/home/AllSubjectsSection";

export default function AllSubjectsPage() {
  return (
    <main className="flex-1">
      <div className="relative isolate overflow-hidden">
        {/* Decorative element */}
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

        {/* Hero Section */}
        <section className="w-full max-w-5xl mx-auto px-4 md:px-6 pt-24 sm:pt-32 pb-12 sm:pb-16">
          <div className="flex flex-col items-center justify-center space-y-8 text-center">
            <div className="space-y-4">
              <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm font-medium text-primary">
                All Subjects
              </div>
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl font-headline">
                Explore All Subjects We Offer
              </h1>
              <p className="max-w-[800px] mx-auto text-muted-foreground md:text-xl">
                Browse our comprehensive subject offerings for Grades 10-12. All subjects are aligned with the CAPS curriculum.
              </p>
            </div>
          </div>
        </section>

        {/* All Subjects Section */}
        <AllSubjectsSection />

        {/* Bottom decorative elements */}
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
  );
}

