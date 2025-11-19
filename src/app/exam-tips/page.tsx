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
  Target, 
  Lightbulb,
  CheckCircle,
  Clock,
  Users,
  Brain,
  FileText,
  Home,
  Calendar,
  Coffee,
  Moon,
  Sun,
  PenTool,
  Calculator,
  ClipboardCheck,
  AlertCircle
} from "lucide-react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { Footer } from "@/components/layout/Footer";
import { useUser } from "@/appwrite";

export default function ExamTipsPage() {
  const { user } = useUser();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    'study-environment': true,
    'note-taking': false,
    'active-recall': false,
    'past-papers': false,
    'days-before': false,
    'exam-day': false,
    'after-exam': false,
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
                Exam Preparation
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl font-headline">
                Exam Tips & Strategies
              </h1>
              <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-3xl mx-auto">
                Comprehensive strategies to help you prepare effectively, perform your best on exam day, and achieve academic success.
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
                    onClick={() => scrollToSection('study-environment')}
                  >
                    Study Environment
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => scrollToSection('note-taking')}
                  >
                    Note-Taking & Organization
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => scrollToSection('active-recall')}
                  >
                    Active Recall & Spaced Repetition
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => scrollToSection('past-papers')}
                  >
                    Past Papers & Memos
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => scrollToSection('days-before')}
                  >
                    Days Before Exam
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => scrollToSection('exam-day')}
                  >
                    Exam Day
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => scrollToSection('after-exam')}
                  >
                    After the Exam
                  </Button>
                </CardContent>
              </Card>
            </aside>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-8">
              {/* Phase 1: Study Environment */}
              <section id="study-environment" className="scroll-mt-24">
                <Collapsible
                  open={openSections['study-environment']}
                  onOpenChange={() => toggleSection('study-environment')}
                >
                  <Card>
                    <CollapsibleTrigger className="w-full">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <Home className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-2xl">Optimize Your Study Environment</CardTitle>
                              <CardDescription>Create the perfect space for effective learning</CardDescription>
                            </div>
                          </div>
                          {openSections['study-environment'] ? (
                            <ChevronUp className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <CheckCircle className="h-5 w-5 text-primary" />
                              Dedicated Space
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              Find a quiet, well-lit, and comfortable (but not too comfortable) place to study.
                            </p>
                          </div>
                          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <CheckCircle className="h-5 w-5 text-primary" />
                              Eliminate Distractions
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              Turn off notifications on your phone, close unnecessary tabs. If possible, put your phone in another room.
                            </p>
                          </div>
                          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <CheckCircle className="h-5 w-5 text-primary" />
                              Organize Your Materials
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              Keep textbooks, notes, pens, and paper readily accessible. A tidy space leads to a tidy mind.
                            </p>
                          </div>
                          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <CheckCircle className="h-5 w-5 text-primary" />
                              Ergonomics
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              Ensure your chair and desk are at a suitable height to prevent discomfort.
                            </p>
                          </div>
                        </div>
                        <div className="p-4 rounded-lg bg-muted border">
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <Sun className="h-5 w-5 text-primary" />
                            Lighting & Airflow
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Good lighting prevents eye strain. Fresh air keeps you alert.
                          </p>
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              </section>

              {/* Phase 1: Note-Taking */}
              <section id="note-taking" className="scroll-mt-24">
                <Collapsible
                  open={openSections['note-taking']}
                  onOpenChange={() => toggleSection('note-taking')}
                >
                  <Card>
                    <CollapsibleTrigger className="w-full">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <PenTool className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-2xl">Advanced Note-Taking & Organization</CardTitle>
                              <CardDescription>Master the art of effective note-taking</CardDescription>
                            </div>
                          </div>
                          {openSections['note-taking'] ? (
                            <ChevronUp className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-semibold mb-2">Consolidate & Condense</h4>
                            <p className="text-sm text-muted-foreground">
                              Combine class notes, textbook readings, and supplementary materials into one master set of notes per topic.
                            </p>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">Active Summarizing</h4>
                            <p className="text-sm text-muted-foreground">
                              Don't just copy. Rephrase information in your own words.
                            </p>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">Visual Notes</h4>
                            <p className="text-sm text-muted-foreground">
                              Use mind maps, flowcharts, concept maps, diagrams, and tables to show relationships between ideas.
                            </p>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">Flashcards (Physical or Digital)</h4>
                            <p className="text-sm text-muted-foreground">
                              Ideal for definitions, formulas, dates, key figures, and quick facts. Test yourself regularly.
                            </p>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">Cornell Note-Taking System</h4>
                            <p className="text-sm text-muted-foreground">
                              Divide your page into a main note-taking area, a cue column for questions/keywords, and a summary section at the bottom.
                            </p>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">Colour-Coding & Highlighting</h4>
                            <p className="text-sm text-muted-foreground">
                              Use strategically to emphasize key information, but don't overdo it (it loses its effectiveness).
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              </section>

              {/* Phase 1: Active Recall */}
              <section id="active-recall" className="scroll-mt-24">
                <Collapsible
                  open={openSections['active-recall']}
                  onOpenChange={() => toggleSection('active-recall')}
                >
                  <Card>
                    <CollapsibleTrigger className="w-full">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <Brain className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-2xl">Active Recall & Spaced Repetition</CardTitle>
                              <CardDescription>Science-backed techniques for better retention</CardDescription>
                            </div>
                          </div>
                          {openSections['active-recall'] ? (
                            <ChevronUp className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-semibold mb-2">Test Yourself</h4>
                            <p className="text-sm text-muted-foreground">
                              Don't just reread. Actively try to retrieve information from memory before looking at your notes.
                            </p>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">Question Formulation</h4>
                            <p className="text-sm text-muted-foreground">
                              Turn headings and sub-headings into questions and answer them aloud or in writing.
                            </p>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">Blurting Method</h4>
                            <p className="text-sm text-muted-foreground">
                              After studying a topic, close your notes and write down everything you remember about it. Then compare with your notes to identify gaps.
                            </p>
                          </div>
                          <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <Clock className="h-5 w-5 text-primary" />
                              Spaced Repetition
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              Review material at increasing intervals (e.g., 1 day, 3 days, 1 week, 2 weeks, 1 month). This is scientifically proven to improve long-term retention.
                            </p>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">Teach It</h4>
                            <p className="text-sm text-muted-foreground">
                              Explain complex concepts aloud to an imaginary student, a pet, or a study partner. If you can teach it, you understand it.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              </section>

              {/* Phase 1: Past Papers */}
              <section id="past-papers" className="scroll-mt-24">
                <Collapsible
                  open={openSections['past-papers']}
                  onOpenChange={() => toggleSection('past-papers')}
                >
                  <Card>
                    <CollapsibleTrigger className="w-full">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <FileText className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-2xl">Utilize Past Papers & Memos Strategically</CardTitle>
                              <CardDescription>Make the most of past exam papers</CardDescription>
                            </div>
                          </div>
                          {openSections['past-papers'] ? (
                            <ChevronUp className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-semibold mb-2">Early Familiarization</h4>
                            <p className="text-sm text-muted-foreground">
                              Look at past papers early in your revision to understand the exam format, question types, and common themes.
                            </p>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">Targeted Practice</h4>
                            <p className="text-sm text-muted-foreground">
                              Use past papers to practice specific topics as you cover them, not just at the end.
                            </p>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">Timed Conditions</h4>
                            <p className="text-sm text-muted-foreground">
                              As exams draw closer, complete full papers under strict exam conditions (no notes, strict time limits). This simulates the real experience.
                            </p>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">Thorough Marking</h4>
                            <p className="text-sm text-muted-foreground">
                              Use the memo not just to check answers but to understand why an answer is correct and how marks are allocated. Look for keywords, specific phrases, and required steps.
                            </p>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">Error Analysis</h4>
                            <p className="text-sm text-muted-foreground">
                              Keep an "Error Log" where you list questions you got wrong, why you got them wrong, and the correct approach. Revisit these errors frequently.
                            </p>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">Identify Trends</h4>
                            <p className="text-sm text-muted-foreground">
                              Notice if certain topics or question styles appear consistently across multiple years.
                            </p>
                          </div>
                        </div>
                        <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <Users className="h-5 w-5 text-primary" />
                            Seek Clarification & Collaboration
                          </h4>
                          <ul className="space-y-2 text-sm text-muted-foreground mt-2">
                            <li>• <strong className="text-foreground">Ask Teachers:</strong> Don't hesitate to ask questions in class or during extra help sessions.</li>
                            <li>• <strong className="text-foreground">Study Groups:</strong> Form small, focused study groups. Discuss difficult concepts and quiz each other.</li>
                            <li>• <strong className="text-foreground">Online Resources:</strong> Explore reputable educational websites and video tutorials for alternative perspectives.</li>
                          </ul>
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              </section>

              {/* Phase 2: Days Before */}
              <section id="days-before" className="scroll-mt-24">
                <Collapsible
                  open={openSections['days-before']}
                  onOpenChange={() => toggleSection('days-before')}
                >
                  <Card>
                    <CollapsibleTrigger className="w-full">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <Calendar className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-2xl">The Days Leading Up to the Exam</CardTitle>
                              <CardDescription>The Final Polish</CardDescription>
                            </div>
                          </div>
                          {openSections['days-before'] ? (
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
                          <h3 className="text-xl font-semibold mb-3">Prioritize Your Remaining Material</h3>
                          <ul className="space-y-2 text-muted-foreground">
                            <li className="flex items-start gap-2">
                              <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                              <span><strong className="text-foreground">Address Weaknesses:</strong> Focus on topics you're less confident in. Don't just stick to what you already know well.</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                              <span><strong className="text-foreground">High-Yield Topics:</strong> Revisit sections that carry heavy weighting or frequently appear in exams.</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                              <span><strong className="text-foreground">Quick Reviews:</strong> Use your condensed notes, mind maps, and flashcards for rapid revision of all content.</span>
                            </li>
                          </ul>
                        </div>

                        <div>
                          <h3 className="text-xl font-semibold mb-3">Mock Exam Simulation</h3>
                          <ul className="space-y-2 text-muted-foreground">
                            <li className="flex items-start gap-2">
                              <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                              <span><strong className="text-foreground">Full Dress Rehearsal:</strong> Complete at least one full past paper under strict exam conditions, including wearing what you'd wear and using only allowed equipment.</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                              <span><strong className="text-foreground">Practice Time Management:</strong> Use the mock exam to refine your time allocation per section/question.</span>
                            </li>
                          </ul>
                        </div>

                        <div>
                          <h3 className="text-xl font-semibold mb-3">Prepare Your Exam Essentials</h3>
                          <div className="grid gap-3 md:grid-cols-2">
                            <div className="p-3 rounded-lg bg-muted">
                              <p className="text-sm text-muted-foreground">
                                <strong className="text-foreground">Stationery:</strong> Multiple pens (blue/black), pencils (HB and 2B for EGD), eraser, ruler, calculator (check batteries!), protractor, compass, highlighters.
                              </p>
                            </div>
                            <div className="p-3 rounded-lg bg-muted">
                              <p className="text-sm text-muted-foreground">
                                <strong className="text-foreground">ID/Exam Card:</strong> Confirm you have your identity document and any required exam admission card.
                              </p>
                            </div>
                            <div className="p-3 rounded-lg bg-muted">
                              <p className="text-sm text-muted-foreground">
                                <strong className="text-foreground">Water Bottle:</strong> A clear, label-free water bottle.
                              </p>
                            </div>
                            <div className="p-3 rounded-lg bg-muted">
                              <p className="text-sm text-muted-foreground">
                                <strong className="text-foreground">Comfort:</strong> Layers of clothing for temperature control.
                              </p>
                            </div>
                          </div>
                          <p className="mt-3 text-sm text-muted-foreground">
                            <strong className="text-foreground">Check Exam Venue/Time:</strong> Double-check the exam timetable, venue, and seat number the day before.
                          </p>
                        </div>

                        <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                            <Moon className="h-5 w-5 text-primary" />
                            Prioritize Well-being
                          </h3>
                          <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>• <strong className="text-foreground">Consistent Sleep:</strong> Aim for 7-9 hours of quality sleep each night. Sleep is crucial for memory consolidation.</li>
                            <li>• <strong className="text-foreground">Nutritious Meals:</strong> Eat balanced meals. Avoid excessive sugar or caffeine crashes.</li>
                            <li>• <strong className="text-foreground">Light Exercise:</strong> A short walk or light workout can reduce stress and improve blood flow to the brain.</li>
                            <li>• <strong className="text-foreground">Mindfulness/Relaxation:</strong> Practice deep breathing, meditation, or light stretching to calm nerves.</li>
                            <li>• <strong className="text-foreground">Avoid Cramming:</strong> Resist the urge to pull all-nighters. Last-minute cramming is generally ineffective and detrimental to performance.</li>
                            <li>• <strong className="text-foreground">Wind Down:</strong> Do something relaxing before bed (read a non-study book, listen to calming music).</li>
                          </ul>
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              </section>

              {/* Phase 3: Exam Day */}
              <section id="exam-day" className="scroll-mt-24">
                <Collapsible
                  open={openSections['exam-day']}
                  onOpenChange={() => toggleSection('exam-day')}
                >
                  <Card>
                    <CollapsibleTrigger className="w-full">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <ClipboardCheck className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-2xl">Exam Day: Peak Performance</CardTitle>
                              <CardDescription>Strategies for success on the day</CardDescription>
                            </div>
                          </div>
                          {openSections['exam-day'] ? (
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
                            <Sun className="h-5 w-5 text-primary" />
                            Morning of the Exam
                          </h3>
                          <ul className="space-y-2 text-muted-foreground">
                            <li>• <strong className="text-foreground">Wake Up Early:</strong> Give yourself ample time to get ready without rushing.</li>
                            <li>• <strong className="text-foreground">Light, Healthy Breakfast:</strong> Fuel your brain.</li>
                            <li>• <strong className="text-foreground">Light Review (Optional):</strong> A very quick glance over key facts or formulas on flashcards, but avoid intense study.</li>
                            <li>• <strong className="text-foreground">Arrive Early:</strong> Get to the exam venue at least 15-20 minutes before start time. This allows you to settle in, find your seat, and acclimatize.</li>
                            <li>• <strong className="text-foreground">Deep Breaths:</strong> If you feel anxious, take a few slow, deep breaths to calm your nervous system.</li>
                          </ul>
                        </div>

                        <div>
                          <h3 className="text-xl font-semibold mb-3">In the Exam Hall</h3>
                          <ul className="space-y-2 text-muted-foreground">
                            <li>• <strong className="text-foreground">Listen to Instructions:</strong> Pay close attention to the invigilator's announcements regarding rules, corrections, or any last-minute information.</li>
                            <li>• <strong className="text-foreground">Fill Out Details Carefully:</strong> Ensure your name, ID number, subject, and any other required details are filled in accurately on your answer booklet.</li>
                            <li>• <strong className="text-foreground">Read the Entire Question Paper:</strong> Before starting, take 5-10 minutes to read all instructions and all questions. Identify compulsory questions, note mark allocations, underline keywords, and mentally plan your approach.</li>
                          </ul>
                        </div>

                        <div>
                          <h3 className="text-xl font-semibold mb-3">Executing the Exam</h3>
                          <div className="space-y-3">
                            <div className="p-3 rounded-lg bg-muted">
                              <p className="text-sm text-muted-foreground">
                                <strong className="text-foreground">Allocate Time Wisely:</strong> Divide the total exam time by the total marks to get a rough time per mark (e.g., 1.2 minutes per mark for a 2-hour, 100-mark paper). Stick to this.
                              </p>
                            </div>
                            <div className="p-3 rounded-lg bg-muted">
                              <p className="text-sm text-muted-foreground">
                                <strong className="text-foreground">Start with Strengths:</strong> Begin with the questions you feel most confident about. This builds confidence and ensures you secure easy marks.
                              </p>
                            </div>
                            <div className="p-3 rounded-lg bg-muted">
                              <p className="text-sm text-muted-foreground">
                                <strong className="text-foreground">Answer the Question Asked:</strong> Read each question carefully. Underline command words (e.g., "explain," "analyze," "compare," "calculate," "evaluate"). Don't just write everything you know about a topic.
                              </p>
                            </div>
                            <div className="p-3 rounded-lg bg-muted">
                              <p className="text-sm text-muted-foreground">
                                <strong className="text-foreground">Show All Workings:</strong> Especially in Maths/Sciences/Accounting. Even if your final answer is wrong, you can earn method marks. State formulas, substitute values, and show calculations clearly.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-xl font-semibold mb-3">Structure Your Answers</h3>
                          <ul className="space-y-2 text-muted-foreground">
                            <li>• <strong className="text-foreground">Essays:</strong> Introduction, well-developed body paragraphs (point, explanation, example/evidence), conclusion.</li>
                            <li>• <strong className="text-foreground">Longer Answers:</strong> Use clear headings, sub-headings, bullet points, and numbered lists where appropriate.</li>
                            <li>• <strong className="text-foreground">Paragraph per Idea:</strong> Introduce one main idea per paragraph in essays.</li>
                            <li>• <strong className="text-foreground">Clarity and Neatness:</strong> Write legibly. If the examiner can't read it, they can't mark it. Use diagrams, tables, and graphs where they enhance your answer.</li>
                          </ul>
                        </div>

                        <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                          <h3 className="text-lg font-semibold mb-3">Additional Tips</h3>
                          <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>• <strong className="text-foreground">Manage Blank Spots:</strong> If you're stuck on a question, make a note, move on, and return to it later.</li>
                            <li>• <strong className="text-foreground">Keyword Spotting:</strong> For definition-based questions, ensure you include all the required keywords as per the syllabus.</li>
                            <li>• <strong className="text-foreground">Use All Given Information:</strong> Sometimes, a question provides specific data, diagrams, or scenarios that must be referenced in your answer.</li>
                            <li>• <strong className="text-foreground">Pace Yourself:</strong> Keep an eye on the clock. If you're running out of time, briefly outline answers for remaining questions.</li>
                            <li>• <strong className="text-foreground">Don't Leave Blanks:</strong> Even an educated guess is better than nothing for multiple-choice questions.</li>
                          </ul>
                        </div>

                        <div>
                          <h3 className="text-xl font-semibold mb-3">Final Review (If Time Permits)</h3>
                          <ul className="space-y-2 text-muted-foreground">
                            <li>• <strong className="text-foreground">Proofread:</strong> Check for grammatical errors, spelling mistakes, and unclear sentences.</li>
                            <li>• <strong className="text-foreground">Check Against Question:</strong> Ensure you have answered all parts of all questions.</li>
                            <li>• <strong className="text-foreground">Accuracy Check:</strong> Briefly re-check calculations, formulas, and labels on diagrams.</li>
                            <li>• <strong className="text-foreground">Information Check:</strong> Make sure you've filled in all your personal details correctly.</li>
                          </ul>
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              </section>

              {/* Phase 4: After Exam */}
              <section id="after-exam" className="scroll-mt-24">
                <Collapsible
                  open={openSections['after-exam']}
                  onOpenChange={() => toggleSection('after-exam')}
                >
                  <Card>
                    <CollapsibleTrigger className="w-full">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <CheckCircle className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-2xl">After the Exam: The Debrief</CardTitle>
                              <CardDescription>What to do after you've finished</CardDescription>
                            </div>
                          </div>
                          {openSections['after-exam'] ? (
                            <ChevronUp className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <AlertCircle className="h-5 w-5 text-primary" />
                              Don't Dwell
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              Once you leave the exam hall, it's done. Avoid dissecting every answer with friends, as this can cause unnecessary anxiety for upcoming exams.
                            </p>
                          </div>
                          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <Target className="h-5 w-5 text-primary" />
                              Focus on the Next Exam
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              Shift your mental energy to preparing for your next subject.
                            </p>
                          </div>
                          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <Coffee className="h-5 w-5 text-primary" />
                              Relax and Recharge
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              Take a short break after the exam before starting preparation for the next one.
                            </p>
                          </div>
                          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <Lightbulb className="h-5 w-5 text-primary" />
                              Learn from the Experience
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              After all exams are over, review your performance (when results are released). Use the feedback to improve your study strategies for future assessments.
                            </p>
                          </div>
                        </div>
                        <div className="mt-6 p-4 rounded-lg bg-muted border">
                          <p className="text-muted-foreground text-center">
                            Remember, exams are a marathon, not a sprint. Consistent effort, smart preparation, and strategic execution are your best tools for achieving success. <strong className="text-foreground">Good luck!</strong>
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
                    <CardTitle className="text-2xl text-center">Ready to Put These Tips Into Practice?</CardTitle>
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

