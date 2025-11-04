
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import Link from "next/link";

const features = [
  {
    name: "100% Curriculum Alignment",
    description: "Every lesson, quiz, and practice question is meticulously mapped to the latest CAPS documents, ensuring students learn exactly what they need to for their exams.",
  },
  {
    name: "Grade-Specific Content",
    description: "Content is tailored for each grade, from Grade 1 to Grade 12, providing age-appropriate language, examples, and complexity.",
  },
  {
    name: "Subject-Specific Expertise",
    description: "Our AI is trained as an expert in each subject, understanding the unique concepts and methodologies required for Mathematics, Physical Sciences, Life Sciences, and more.",
  },
  {
    name: "Structured Learning Paths",
    description: "The platform follows the term-by-term structure of the CAPS syllabus, guiding students through the curriculum in a logical and organized manner.",
  },
];


export default function CapsSyllabusPage() {
  return (
    <main className="flex-1">
        <div className="relative isolate overflow-hidden">
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

          <section className="w-full max-w-5xl mx-auto px-4 md:px-6 py-24 sm:py-32">
            <div className="flex flex-col items-center justify-center space-y-8 text-center">
              <div className="space-y-4">
                 <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm font-medium text-primary">Our Core Focus</div>
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl font-headline">
                  Perfectly Aligned with the CAPS Syllabus
                </h1>
                <p className="max-w-[800px] mx-auto text-muted-foreground md:text-xl">
                  CAPS Tutor is not just another generic learning tool. It was built from the ground up with a single mission: to provide world-class AI-powered tutoring that is 100% aligned with South Africa's Curriculum and Assessment Policy Statement (CAPS).
                </p>
              </div>
            </div>
          </section>

          <section className="py-12 bg-muted/50">
            <div className="max-w-5xl mx-auto px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {features.map((feature) => (
                  <div key={feature.name} className="flex gap-4">
                    <div className="flex-shrink-0">
                      <CheckCircle className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{feature.name}</h3>
                      <p className="mt-1 text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="py-24 sm:py-32">
            <div className="max-w-3xl mx-auto text-center px-6 lg:px-8">
                <h2 className="text-3xl font-bold tracking-tight font-headline sm:text-4xl">Why Does Alignment Matter?</h2>
                <p className="mt-6 text-lg leading-8 text-muted-foreground">
                    By focusing exclusively on the CAPS curriculum, we ensure that students are not wasting time on irrelevant topics. Our AI Tutor helps reinforce classroom learning, clarifies difficult concepts, and prepares students for the exact type of questions they will face in their tests and exams. It's the smartest way to study and achieve academic excellence.
                </p>
                <div className="mt-10 flex items-center justify-center gap-x-6">
                    <Button asChild size="lg">
                      <Link href="/register">Get Started for Free</Link>
                    </Button>
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
  )
}
