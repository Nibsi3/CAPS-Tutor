import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { CheckCircle2, Target, BookCopy, BarChart, FileUp, Users } from 'lucide-react';

const heroImage = PlaceHolderImages.find(p => p.id === "hero");
const feature1Image = PlaceHolderImages.find(p => p.id === "feature1");
const feature2Image = PlaceHolderImages.find(p => p.id === "feature2");
const feature3Image = PlaceHolderImages.find(p => p.id === "feature3");

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
            <path d="M16 3L3 9.75V22.25L16 29L29 22.25V9.75L16 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3 10L16 17L29 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 17V29" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="font-headline text-2xl font-bold">CAPS Tutor</span>
        </Link>
        <nav className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/dashboard">Sign In</Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard">Get Started Free</Link>
          </Button>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 bg-card">
           <div className="container mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col gap-6 text-center md:text-left">
              <h1 className="font-headline text-4xl md:text-6xl font-bold tracking-tighter">
                Master the CAPS Syllabus with Your AI Tutor
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground">
                Interactive lessons, adaptive practice, and instant feedback to help you excel. Aligned with the South African curriculum from Grade 1 to 12.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Button size="lg" asChild>
                  <Link href="/dashboard">Start Learning Now</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="#features">Explore Features</Link>
                </Button>
              </div>
            </div>
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-2xl">
              {heroImage && (
                 <Image 
                  src={heroImage.imageUrl} 
                  alt={heroImage.description} 
                  fill
                  style={{objectFit: "cover"}}
                  className="bg-muted"
                  data-ai-hint={heroImage.imageHint}
                />
              )}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 md:py-28">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="font-headline text-3xl md:text-4xl font-bold">Everything You Need to Succeed</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                CAPS Tutor is more than just a study tool. It's a personalized learning environment built for South African students.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard
                icon={<CheckCircle2 className="w-8 h-8 text-primary" />}
                title="Interactive Practice"
                description="Get immediate feedback on your answers with step-by-step explanations to understand the 'why' behind every solution."
              />
              <FeatureCard
                icon={<Target className="w-8 h-8 text-primary" />}
                title="Adaptive Exam Generator"
                description="Our AI identifies your weak spots and creates custom practice exams to help you strengthen them before test day."
              />
              <FeatureCard
                icon={<BookCopy className="w-8 h-8 text-primary" />}
                title="Complete Lesson Hub"
                description="Access the full CAPS syllabus for your grade and subject, with searchable content and embedded quizzes."
              />
              <FeatureCard
                icon={<BarChart className="w-8 h-8 text-primary" />}
                title="Progress Dashboard"
                description="Visually track your mastery of topics, time spent studying, and historical performance to stay motivated."
              />
              <FeatureCard
                icon={<FileUp className="w-8 h-8 text-primary" />}
                title="Syllabus Uploader"
                description="For teachers: easily upload CAPS documents or your own notes to create a unified source of truth for the AI."
              />
              <FeatureCard
                icon={<Users className="w-8 h-8 text-primary" />}
                title="Student Management"
                description="Teachers can monitor class progress, identify students who need help, and view detailed performance reports."
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-card py-20 md:py-28">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="font-headline text-3xl md:text-4xl font-bold">Ready to Unlock Your Potential?</h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Join thousands of students across South Africa who are using CAPS Tutor to achieve their academic goals.
            </p>
            <Button size="lg" className="mt-8" asChild>
              <Link href="/dashboard">Get Started for Free</Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="py-8 bg-background border-t">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} CAPS Tutor. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Card className="text-center">
      <CardHeader>
        <div className="mx-auto bg-accent/20 rounded-full w-16 h-16 flex items-center justify-center mb-4">
          {icon}
        </div>
        <CardTitle className="font-headline">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
