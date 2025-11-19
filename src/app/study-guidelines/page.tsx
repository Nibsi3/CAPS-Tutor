'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import Link from "next/link";
import { 
  BookOpen, 
  ChevronDown, 
  ChevronUp, 
  ArrowUp, 
  GraduationCap, 
  Target, 
  Lightbulb,
  CheckCircle,
  Clock,
  Users,
  Brain,
  FileText,
  Calculator,
  FlaskConical,
  Leaf,
  History,
  Map,
  DollarSign
} from "lucide-react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { Footer } from "@/components/layout/Footer";
import { useUser } from "@/appwrite";

const subjectIcons: Record<string, any> = {
  'Languages': BookOpen,
  'Mathematics': Calculator,
  'Physical Sciences': FlaskConical,
  'Life Sciences': Leaf,
  'History': History,
  'Geography': Map,
  'Accounting': DollarSign,
};

export default function StudyGuidelinesPage() {
  const { user } = useUser();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    'understanding-caps': true,
    'general-strategies': false,
    'subject-specific': false,
    'final-tips': false,
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-purple-500/10 to-primary/5 py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center">
              <Badge className="mb-4" variant="secondary">
                CAPS Study Guide
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl font-headline">
                CAPS Study Guide for Grade 10-12 Students
              </h1>
              <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-3xl mx-auto">
                A comprehensive guide structured according to the CAPS (Curriculum and Assessment Policy Statement) 
                syllabus to help you navigate your subjects effectively and prepare for assessments.
              </p>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Table of Contents Sidebar */}
            <aside className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Table of Contents
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => scrollToSection('understanding-caps')}
                  >
                    I. Understanding CAPS
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => scrollToSection('general-strategies')}
                  >
                    II. General Study Strategies
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => scrollToSection('subject-specific')}
                  >
                    III. Subject-Specific Guidelines
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => scrollToSection('final-tips')}
                  >
                    IV. Final Tips for Success
                  </Button>
                </CardContent>
              </Card>
            </aside>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-8">
              {/* Section I: Understanding CAPS */}
              <section id="understanding-caps" className="scroll-mt-24">
                <Collapsible
                  open={openSections['understanding-caps']}
                  onOpenChange={() => toggleSection('understanding-caps')}
                >
                  <Card>
                    <CollapsibleTrigger className="w-full">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <GraduationCap className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-2xl">I. Understanding CAPS</CardTitle>
                              <CardDescription>What is CAPS and why it matters</CardDescription>
                            </div>
                          </div>
                          {openSections['understanding-caps'] ? (
                            <ChevronUp className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="space-y-6">
                        <div>
                          <h3 className="text-xl font-semibold mb-3">What is CAPS?</h3>
                          <p className="text-muted-foreground">
                            The Curriculum and Assessment Policy Statement (CAPS) is a single, comprehensive, and concise 
                            policy document introduced by the Department of Basic Education in South Africa. It outlines the 
                            updated curriculum for all subjects in Grades R-12.
                          </p>
                        </div>

                        <div>
                          <h3 className="text-xl font-semibold mb-3">Key Features of CAPS:</h3>
                          <ul className="space-y-2 text-muted-foreground">
                            <li className="flex items-start gap-2">
                              <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                              <span>Prescribes specific topics and content to be covered in each grade and subject.</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                              <span>Provides clear guidelines on the number of hours to be spent on each subject.</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                              <span>Specifies the types and weighting of assessment tasks for each grade.</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                              <span>Emphasizes the development of critical thinking, problem-solving, and practical skills.</span>
                            </li>
                          </ul>
                        </div>

                        <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                            <Lightbulb className="h-5 w-5 text-primary" />
                            Why is it important to know CAPS?
                          </h3>
                          <p className="text-muted-foreground">
                            Understanding CAPS helps you know exactly what is expected of you in terms of content, skills, 
                            and assessment, enabling you to study smarter and more efficiently.
                          </p>
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              </section>

              {/* Section II: General Study Strategies */}
              <section id="general-strategies" className="scroll-mt-24">
                <Collapsible
                  open={openSections['general-strategies']}
                  onOpenChange={() => toggleSection('general-strategies')}
                >
                  <Card>
                    <CollapsibleTrigger className="w-full">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <Target className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-2xl">II. General Study Strategies for CAPS</CardTitle>
                              <CardDescription>Essential techniques for effective learning</CardDescription>
                            </div>
                          </div>
                          {openSections['general-strategies'] ? (
                            <ChevronUp className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="space-y-6">
                        <div>
                          <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-primary" />
                            Know Your Syllabus
                          </h3>
                          <ul className="space-y-2 text-muted-foreground ml-7">
                            <li>• Obtain the CAPS document or a detailed syllabus breakdown for each of your subjects (your teacher can provide this).</li>
                            <li>• Highlight key topics, concepts, and skills required for each term and year.</li>
                            <li>• Create a checklist of all learning outcomes.</li>
                          </ul>
                        </div>

                        <div>
                          <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary" />
                            Effective Note-Taking
                          </h3>
                          <div className="space-y-3 text-muted-foreground ml-7">
                            <div>
                              <strong className="text-foreground">During Class:</strong> Be an active listener. Write down key points, 
                              definitions, formulas, and examples. Ask questions if you don't understand.
                            </div>
                            <div>
                              <strong className="text-foreground">After Class:</strong> Review and organize your notes. Re-write them 
                              in your own words, use mind maps, flowcharts, or summary tables. This aids memorization and understanding.
                            </div>
                            <div>
                              <strong className="text-foreground">Colour-Coding:</strong> Use different colours for headings, important 
                              terms, examples, and points to remember.
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                            <Clock className="h-5 w-5 text-primary" />
                            Time Management and Study Schedule
                          </h3>
                          <ul className="space-y-2 text-muted-foreground ml-7">
                            <li>• <strong className="text-foreground">Create a Realistic Timetable:</strong> Allocate specific times for each subject, daily and weekly. Include breaks, extra-curricular activities, and leisure time.</li>
                            <li>• <strong className="text-foreground">Prioritize:</strong> Focus more time on challenging subjects or topics.</li>
                            <li>• <strong className="text-foreground">Regularity is Key:</strong> Consistent, shorter study sessions are more effective than infrequent, long ones.</li>
                            <li>• <strong className="text-foreground">Pomodoro Technique:</strong> Study for 25 minutes, then take a 5-minute break. After four cycles, take a longer break (20-30 minutes).</li>
                          </ul>
                        </div>

                        <div>
                          <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                            <Brain className="h-5 w-5 text-primary" />
                            Active Learning Techniques
                          </h3>
                          <ul className="space-y-2 text-muted-foreground ml-7">
                            <li>• <strong className="text-foreground">Don't Just Read:</strong> Actively engage with the material.</li>
                            <li>• <strong className="text-foreground">Summarize:</strong> Explain concepts in your own words.</li>
                            <li>• <strong className="text-foreground">Teach Others:</strong> Explaining a concept to someone else is a great way to solidify your understanding.</li>
                            <li>• <strong className="text-foreground">Practice Questions:</strong> Work through examples and exercises from your textbook, past papers, and worksheets. This is crucial for applying knowledge.</li>
                            <li>• <strong className="text-foreground">Flashcards:</strong> Use them for definitions, formulas, and key facts.</li>
                          </ul>
                        </div>

                        <div>
                          <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-primary" />
                            Assessment Preparation
                          </h3>
                          <ul className="space-y-2 text-muted-foreground ml-7">
                            <li>• <strong className="text-foreground">Understand Assessment Criteria:</strong> Know what types of questions will be asked, the mark allocation, and the time limits for each section.</li>
                            <li>• <strong className="text-foreground">Practice with Past Papers:</strong> This is invaluable. It helps you understand the format, common question types, and time management under exam conditions.</li>
                            <li>• <strong className="text-foreground">Review Mistakes:</strong> Don't just get the answer right; understand why you got something wrong. Learn from your errors.</li>
                            <li>• <strong className="text-foreground">Revision:</strong> Start revising well in advance of exams. Don't cram.</li>
                          </ul>
                        </div>

                        <div>
                          <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                            <Users className="h-5 w-5 text-primary" />
                            Seek Help
                          </h3>
                          <ul className="space-y-2 text-muted-foreground ml-7">
                            <li>• <strong className="text-foreground">Ask Your Teachers:</strong> Don't be afraid to ask questions in class or after school.</li>
                            <li>• <strong className="text-foreground">Study Groups:</strong> Collaborate with classmates. Discuss difficult concepts, quiz each other, and share notes.</li>
                            <li>• <strong className="text-foreground">Tutoring:</strong> If you're really struggling, consider extra lessons.</li>
                          </ul>
                        </div>

                        <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                            <Lightbulb className="h-5 w-5 text-primary" />
                            Maintain Well-being
                          </h3>
                          <ul className="space-y-2 text-muted-foreground">
                            <li>• <strong className="text-foreground">Sleep:</strong> Get adequate rest (7-9 hours per night). Sleep deprivation impairs memory and concentration.</li>
                            <li>• <strong className="text-foreground">Nutrition:</strong> Eat healthy, balanced meals. Avoid excessive sugary snacks.</li>
                            <li>• <strong className="text-foreground">Exercise:</strong> Physical activity reduces stress and improves focus.</li>
                            <li>• <strong className="text-foreground">Breaks:</strong> Take regular breaks to avoid burnout.</li>
                            <li>• <strong className="text-foreground">Manage Stress:</strong> Find healthy ways to cope with stress (hobbies, talking to friends/family).</li>
                          </ul>
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              </section>

              {/* Section III: Subject-Specific Guidelines */}
              <section id="subject-specific" className="scroll-mt-24">
                <Collapsible
                  open={openSections['subject-specific']}
                  onOpenChange={() => toggleSection('subject-specific')}
                >
                  <Card>
                    <CollapsibleTrigger className="w-full">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <BookOpen className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-2xl">III. Subject-Specific CAPS Guidelines & Strategies</CardTitle>
                              <CardDescription>Tailored approaches for each subject</CardDescription>
                            </div>
                          </div>
                          {openSections['subject-specific'] ? (
                            <ChevronUp className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="space-y-6">
                        {/* Languages */}
                        <div className="border-l-4 border-primary pl-4">
                          <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-primary" />
                            A. Languages (Home Language & First Additional Language)
                          </h3>
                          <div className="space-y-3 text-muted-foreground">
                            <div>
                              <strong className="text-foreground">CAPS Focus:</strong> Reading comprehension, writing skills 
                              (essays, summaries, transactional texts), language structures and conventions (grammar), 
                              literature analysis (poetry, novels, dramas), oral communication.
                            </div>
                            <div>
                              <strong className="text-foreground">Study Strategies:</strong>
                              <ul className="mt-2 space-y-1 ml-4">
                                <li>• <strong>Read Widely:</strong> Engage with different texts (newspapers, magazines, novels) to improve vocabulary and comprehension.</li>
                                <li>• <strong>Vocabulary Building:</strong> Keep a vocabulary notebook. Learn new words in context.</li>
                                <li>• <strong>Grammar Practice:</strong> Regularly review and practice grammar rules (parts of speech, tenses, punctuation, sentence structure).</li>
                                <li>• <strong>Literature Analysis:</strong> Read prescribed texts thoroughly, taking notes on characters, plot, themes, literary devices, and author's style. Practice writing essays on different literary aspects.</li>
                                <li>• <strong>Writing Practice:</strong> Regularly write essays, summaries, and different transactional texts (letters, reports, advertisements). Focus on structure, coherence, and clarity.</li>
                                <li>• <strong>Oral Skills:</strong> Practice speaking clearly and confidently. Participate in class discussions.</li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        {/* Mathematics */}
                        <div className="border-l-4 border-primary pl-4">
                          <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                            <Calculator className="h-5 w-5 text-primary" />
                            B. Mathematics / Mathematical Literacy
                          </h3>
                          <div className="space-y-3 text-muted-foreground">
                            <div>
                              <strong className="text-foreground">CAPS Focus (Mathematics):</strong> Algebra, functions, number patterns, 
                              finance, data handling, probability, Euclidean geometry, analytical geometry, trigonometry, calculus (Grade 12). 
                              Emphasizes problem-solving and application.
                            </div>
                            <div>
                              <strong className="text-foreground">CAPS Focus (Mathematical Literacy):</strong> Interpretation and application 
                              of mathematical concepts in real-life contexts. Focus on finance, measurement, maps, plans, data handling, and probability.
                            </div>
                            <div>
                              <strong className="text-foreground">Study Strategies:</strong>
                              <ul className="mt-2 space-y-1 ml-4">
                                <li>• <strong>Practice, Practice, Practice:</strong> Mathematics is a skill. The more problems you solve, the better you become.</li>
                                <li>• <strong>Understand Concepts:</strong> Don't just memorize formulas. Know why a formula works and when to apply it.</li>
                                <li>• <strong>Show All Your Workings:</strong> Even if your final answer is wrong, you can get marks for correct steps.</li>
                                <li>• <strong>Review Fundamental Concepts:</strong> Ensure you have a strong grasp of earlier concepts as they build on each other.</li>
                                <li>• <strong>Error Analysis:</strong> Go back through incorrect answers to understand your mistakes.</li>
                                <li>• <strong>Past Papers:</strong> Essential for exam preparation. Work through them under timed conditions.</li>
                                <li>• <strong>Use your Scientific Calculator:</strong> Understand all its functions.</li>
                                <li>• <strong>Draw Diagrams:</strong> Especially for geometry and trigonometry, clear diagrams help visualize the problem.</li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        {/* Physical Sciences */}
                        <div className="border-l-4 border-primary pl-4">
                          <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                            <FlaskConical className="h-5 w-5 text-primary" />
                            C. Physical Sciences (Physics & Chemistry)
                          </h3>
                          <div className="space-y-3 text-muted-foreground">
                            <div>
                              <strong className="text-foreground">CAPS Focus:</strong> Mechanics, waves, electricity & magnetism, 
                              matter & materials, chemical change, chemical systems. Emphasizes understanding theories, laws, 
                              calculations, and practical applications.
                            </div>
                            <div>
                              <strong className="text-foreground">Study Strategies:</strong>
                              <ul className="mt-2 space-y-1 ml-4">
                                <li>• <strong>Conceptual Understanding:</strong> Don't just memorize definitions. Understand the underlying principles and how concepts link together.</li>
                                <li>• <strong>Formulas:</strong> Make a list of all formulas, their symbols, and units. Practice applying them to problems.</li>
                                <li>• <strong>Problem-Solving:</strong> Work through numerous examples and practice problems. Show all steps and units.</li>
                                <li>• <strong>Diagrams & Graphs:</strong> Understand how to interpret and draw scientific diagrams and graphs.</li>
                                <li>• <strong>Practical Work:</strong> Pay close attention during experiments. Understand the procedure, observations, and conclusions.</li>
                                <li>• <strong>Chemical Equations:</strong> Practice balancing equations and understanding reaction types.</li>
                                <li>• <strong>Periodic Table:</strong> Understand its structure and how to use it effectively.</li>
                                <li>• <strong>Definitions:</strong> Memorize key definitions precisely.</li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        {/* Life Sciences */}
                        <div className="border-l-4 border-primary pl-4">
                          <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                            <Leaf className="h-5 w-5 text-primary" />
                            D. Life Sciences
                          </h3>
                          <div className="space-y-3 text-muted-foreground">
                            <div>
                              <strong className="text-foreground">CAPS Focus:</strong> Cells, tissues, organs, systems; plant & animal 
                              diversity; ecology; genetics & inheritance; human reproduction; evolution. Emphasizes understanding biological 
                              processes, structures, and their interrelationships.
                            </div>
                            <div>
                              <strong className="text-foreground">Study Strategies:</strong>
                              <ul className="mt-2 space-y-1 ml-4">
                                <li>• <strong>Diagrams:</strong> Draw and label diagrams of structures, processes, and life cycles. This aids visualization and memory.</li>
                                <li>• <strong>Vocabulary:</strong> Biology has a vast vocabulary. Create flashcards for scientific terms and their definitions.</li>
                                <li>• <strong>Flowcharts:</strong> Use flowcharts to illustrate biological processes (e.g., photosynthesis, respiration, nervous impulse).</li>
                                <li>• <strong>Compare and Contrast:</strong> Understand similarities and differences between structures, processes, and organisms.</li>
                                <li>• <strong>Practical Work:</strong> Understand the aim, method, results, and conclusion of practical investigations.</li>
                                <li>• <strong>Genetics Problems:</strong> Practice solving genetics problems (Punnett squares, pedigrees).</li>
                                <li>• <strong>Essay Questions:</strong> Practice writing structured essays, ensuring you answer the question comprehensively and logically.</li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        {/* History */}
                        <div className="border-l-4 border-primary pl-4">
                          <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                            <History className="h-5 w-5 text-primary" />
                            E. History
                          </h3>
                          <div className="space-y-3 text-muted-foreground">
                            <div>
                              <strong className="text-foreground">CAPS Focus:</strong> Detailed study of historical events, individuals, 
                              and concepts within specific periods (e.g., Cold War, South Africa's journey to democracy, Black Consciousness). 
                              Emphasizes source analysis, critical thinking, and essay writing.
                            </div>
                            <div>
                              <strong className="text-foreground">Study Strategies:</strong>
                              <ul className="mt-2 space-y-1 ml-4">
                                <li>• <strong>Chronology:</strong> Create timelines to understand the sequence of events.</li>
                                <li>• <strong>Key Figures & Events:</strong> Identify and understand the roles of significant individuals and the impact of key events.</li>
                                <li>• <strong>Cause and Effect:</strong> Analyze the causes and consequences of historical developments.</li>
                                <li>• <strong>Source Analysis:</strong> Practice analyzing primary and secondary sources. Understand how to identify bias, evaluate reliability, and extract information.</li>
                                <li>• <strong>Essay Writing:</strong> Structure your essays logically with an introduction, body paragraphs (with evidence), and a conclusion. Practice writing under timed conditions.</li>
                                <li>• <strong>Debate & Discussion:</strong> Discuss historical interpretations with classmates or teachers.</li>
                                <li>• <strong>Mind Maps:</strong> Use mind maps to connect concepts, events, and figures.</li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        {/* Geography */}
                        <div className="border-l-4 border-primary pl-4">
                          <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                            <Map className="h-5 w-5 text-primary" />
                            F. Geography
                          </h3>
                          <div className="space-y-3 text-muted-foreground">
                            <div>
                              <strong className="text-foreground">CAPS Focus:</strong> Map work, geographical skills, geomorphology (landforms), 
                              climate & weather, hydrology, settlement geography, economic geography. Emphasizes understanding spatial patterns, 
                              processes, and human-environment interactions.
                            </div>
                            <div>
                              <strong className="text-foreground">Study Strategies:</strong>
                              <ul className="mt-2 space-y-1 ml-4">
                                <li>• <strong>Map Work:</strong> Regularly practice with topographical maps, orthophoto maps, and GIS. Understand scale, contours, bearings, and calculating distance/area.</li>
                                <li>• <strong>Diagrams & Sketches:</strong> Learn to draw and label geographical diagrams (e.g., weather systems, landforms).</li>
                                <li>• <strong>Case Studies:</strong> Understand specific examples for different geographical concepts (e.g., specific rivers, cities, industries).</li>
                                <li>• <strong>Terminology:</strong> Build a strong vocabulary of geographical terms.</li>
                                <li>• <strong>Data Interpretation:</strong> Practice interpreting graphs, tables, and statistics related to geographical phenomena.</li>
                                <li>• <strong>Fieldwork:</strong> If applicable, pay attention during field trips to connect theory with real-world observations.</li>
                                <li>• <strong>Essay Writing:</strong> Practice structured essay writing for geographical explanations and discussions.</li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        {/* Accounting */}
                        <div className="border-l-4 border-primary pl-4">
                          <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-primary" />
                            G. Accounting
                          </h3>
                          <div className="space-y-3 text-muted-foreground">
                            <div>
                              <strong className="text-foreground">CAPS Focus:</strong> Financial statements (Income Statement, Statement of 
                              Financial Position, Cash Flow Statement), VAT, inventory valuation, partnerships, companies, manufacturing, 
                              budgeting, reconciliations. Emphasizes accuracy, logical thinking, and adherence to accounting principles.
                            </div>
                            <div>
                              <strong className="text-foreground">Study Strategies:</strong>
                              <ul className="mt-2 space-y-1 ml-4">
                                <li>• <strong>Understand Principles:</strong> Grasp the underlying accounting principles (e.g., matching principle, accrual basis) before attempting practical applications.</li>
                                <li>• <strong>Practice Exercises:</strong> Work through as many ledger accounts, financial statements, and reconciliation problems as possible.</li>
                                <li>• <strong>Step-by-Step Approach:</strong> Follow a systematic approach to solving problems.</li>
                                <li>• <strong>Accuracy and Neatness:</strong> Accounting requires precision. Pay attention to detail and present your work clearly.</li>
                                <li>• <strong>Regular Review:</strong> Accounting concepts build on each other, so regularly review earlier topics.</li>
                                <li>• <strong>Past Papers:</strong> Essential for exam preparation, especially for understanding the format and types of adjustments.</li>
                                <li>• <strong>Journal Entries:</strong> Master journal entries as they are fundamental to all accounting processes.</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              </section>

              {/* Section IV: Final Tips */}
              <section id="final-tips" className="scroll-mt-24">
                <Collapsible
                  open={openSections['final-tips']}
                  onOpenChange={() => toggleSection('final-tips')}
                >
                  <Card>
                    <CollapsibleTrigger className="w-full">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <Lightbulb className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-2xl">IV. Final Tips for Success</CardTitle>
                              <CardDescription>Key principles for academic excellence</CardDescription>
                            </div>
                          </div>
                          {openSections['final-tips'] ? (
                            <ChevronUp className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <CheckCircle className="h-5 w-5 text-primary" />
                              Stay Organized
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              Keep your notes, textbooks, and past papers neatly organized.
                            </p>
                          </div>
                          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <CheckCircle className="h-5 w-5 text-primary" />
                              Review Regularly
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              Consistent review of previously learned material helps transfer information from short-term to long-term memory.
                            </p>
                          </div>
                          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <CheckCircle className="h-5 w-5 text-primary" />
                              Stay Positive
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              Believe in your ability to succeed.
                            </p>
                          </div>
                          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <CheckCircle className="h-5 w-5 text-primary" />
                              Don't Compare
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              Focus on your own progress and learning journey.
                            </p>
                          </div>
                          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 md:col-span-2">
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <CheckCircle className="h-5 w-5 text-primary" />
                              Celebrate Small Victories
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              Acknowledge your efforts and achievements along the way.
                            </p>
                          </div>
                        </div>
                        <div className="mt-6 p-4 rounded-lg bg-muted border">
                          <p className="text-muted-foreground text-center">
                            This study guide provides a framework. Remember to adapt it to your individual learning style, 
                            your specific subjects, and the guidance of your teachers. <strong className="text-foreground">Good luck!</strong>
                          </p>
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              </section>

              {/* Call to Action - Only show if user is not logged in */}
              {!user && (
                <Card className="bg-gradient-to-br from-primary/10 to-purple-500/10 border-2 border-primary/20">
                  <CardHeader>
                    <CardTitle className="text-2xl text-center">Ready to Start Your Learning Journey?</CardTitle>
                    <CardDescription className="text-center">
                      Join thousands of students using CAPS Tutor to excel in their studies
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button asChild size="lg">
                        <Link href="/register">
                          Get Started for Free
                        </Link>
                      </Button>
                      <Button asChild size="lg" variant="outline">
                        <Link href="/dashboard/practice">
                          Start Practicing
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>

        {/* Back to Top Button */}
        <div className="fixed bottom-8 right-8 z-50">
          <Button
            onClick={scrollToTop}
            size="icon"
            className="rounded-full shadow-lg"
            aria-label="Back to top"
          >
            <ArrowUp className="h-5 w-5" />
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
}

