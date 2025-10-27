'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle2, Target, BookCopy, BarChart, FileUp, Users, Check, X, Loader } from 'lucide-react';
import { useState, useMemo } from 'react';
import { getInteractiveFeedback, InteractiveFeedbackOutput } from '@/ai/flows/interactive-feedback-explanation';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUser } from '@/firebase';

const gradeProblems: Record<string, { question: string, subject: string }> = {
  "1": { question: "If you have 2 apples and you get 3 more, how many apples do you have?", subject: "Mathematics" },
  "2": { question: "What is 15 - 7?", subject: "Mathematics" },
  "3": { question: "What is 8 multiplied by 4?", subject: "Mathematics" },
  "4": { question: "A class has 35 students. If 1/5 are absent, how many students are present?", subject: "Mathematics" },
  "5": { question: "What is the perimeter of a rectangle with a length of 12 cm and a width of 5 cm?", subject: "Mathematics" },
  "6": { question: "Convert 0.75 to a fraction in its simplest form.", subject: "Mathematics" },
  "7": { question: "Find the value of x if 3x - 4 = 11.", subject: "Mathematics" },
  "8": { question: "Calculate the area of a circle with a radius of 7 cm. (Use π ≈ 22/7)", subject: "Mathematics" },
  "9": { question: "Simplify the expression: (2x^2)(3x^3)", subject: "Mathematics" },
  "10": { question: "Solve the quadratic equation: x^2 - 5x + 6 = 0", subject: "Mathematics" },
  "11": { question: "If sin(θ) = 0.5, what is the value of cos(2θ)?", subject: "Trigonometry" },
  "12": { question: "Find the derivative of f(x) = 4x^3 - 2x^2 + 5x - 1.", subject: "Calculus" },
}

export default function LandingPage() {
  const [selectedGrade, setSelectedGrade] = useState("8");
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<InteractiveFeedbackOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();

  const sampleQuestion = useMemo(() => {
    return gradeProblems[selectedGrade] || gradeProblems["8"];
  }, [selectedGrade]);

  const handleGradeChange = (grade: string) => {
    setSelectedGrade(grade);
    setAnswer("");
    setFeedback(null);
  }

  const handleFeedback = async () => {
    if (!answer) {
      toast({
        variant: "destructive",
        title: "No answer provided",
        description: "Please enter your answer before getting feedback.",
      });
      return;
    }
    setIsLoading(true);
    setFeedback(null);
    try {
      const result = await getInteractiveFeedback({
        question: sampleQuestion.question,
        studentAnswer: answer,
        subject: sampleQuestion.subject,
        gradeLevel: parseInt(selectedGrade),
      });
      setFeedback(result);
    } catch (error) {
      console.error("Error getting feedback:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not get feedback from the AI. Please try again.",
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
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
          {!isUserLoading && !user && (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/login">Get Started Free</Link>
              </Button>
            </>
          )}
           {!isUserLoading && user && (
            <Button asChild>
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          )}
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 md:py-32 text-center">
           <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="font-headline text-4xl md:text-6xl font-bold tracking-tighter max-w-4xl mx-auto">
              Master the CAPS Syllabus with Your AI Tutor
            </h1>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Interactive lessons, adaptive practice, and instant feedback to help you excel. Aligned with the South African curriculum from Grade 1 to 12.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href={user ? "/dashboard" : "/login"}>Start Learning Now</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#features">Explore Features</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Interactive Demo Section */}
        <section id="interactive-demo" className="py-20 md:py-28 bg-muted/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="font-headline text-3xl md:text-4xl font-bold">See the AI in Action</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Experience our interactive feedback system. Select a grade, answer the question, and see how our AI tutor can help you learn.
              </p>
            </div>
            <Card className="max-w-3xl mx-auto shadow-lg">
              <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle className="font-headline text-2xl">{sampleQuestion.subject} - Grade {selectedGrade}</CardTitle>
                    <Select value={selectedGrade} onValueChange={handleGradeChange}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select Grade" />
                        </SelectTrigger>
                        <SelectContent>
                            {[...Array(12)].map((_, i) => (
                                <SelectItem key={i + 1} value={`${i + 1}`}>Grade {i + 1}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <CardDescription className="text-lg pt-4">{sampleQuestion.question}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea 
                  placeholder="Type your answer here..."
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="text-base"
                />
                <Button onClick={handleFeedback} disabled={isLoading} className="w-full sm:w-auto">
                  {isLoading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                  {isLoading ? 'Getting Feedback...' : 'Get Feedback'}
                </Button>
                
                {feedback && (
                  <div className="mt-6 p-4 border rounded-lg bg-background">
                    <div className="flex items-center gap-3 mb-4">
                       <div className={cn("flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center", feedback.isCorrect ? 'bg-green-100' : 'bg-red-100')}>
                         {feedback.isCorrect ? (
                           <Check className="w-6 h-6 text-green-600" />
                         ) : (
                           <X className="w-6 h-6 text-red-600" />
                         )}
                       </div>
                       <h3 className="text-xl font-bold font-headline">
                         {feedback.isCorrect ? 'Correct!' : 'Not Quite'}
                       </h3>
                    </div>
                    <div className="prose prose-sm max-w-none text-foreground">
                      <h4 className="font-semibold mb-2">Step-by-step Explanation:</h4>
                      <p>{feedback.explanation}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
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
        <section className="bg-muted/50 py-20 md:py-28">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="font-headline text-3xl md:text-4xl font-bold">Ready to Unlock Your Potential?</h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Join thousands of students across South Africa who are using CAPS Tutor to achieve their academic goals.
            </p>
            <Button size="lg" className="mt-8" asChild>
              <Link href={user ? "/dashboard" : "/login"}>Get Started for Free</Link>
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
    <Card className="text-center hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="mx-auto bg-accent rounded-full w-16 h-16 flex items-center justify-center mb-4">
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
