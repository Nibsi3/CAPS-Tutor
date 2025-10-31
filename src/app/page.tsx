"use client";

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { grades, getQuestions, Subject } from '@/lib/demo-questions';

export default function HomePage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && user) {
      router.replace('/dashboard');
    }
  }, [user, isUserLoading, router]);

  const [subject, setSubject] = useState<Subject>('Mathematics');
  const [grade, setGrade] = useState<number>(10);
  const questionList = useMemo(() => getQuestions(subject, grade as any), [subject, grade]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [question, setQuestion] = useState<string>(questionList[0]);
  const [answer, setAnswer] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setCurrentIdx(0);
    setQuestion(questionList[0]);
    setAnswer('');
  }, [questionList]);

  const askDemo = async () => {
    setLoading(true);
    try {
      const prompt = `You are a CAPS-aligned South African ${subject} tutor for Grade ${grade}. Explain step-by-step how to approach the question below without simply giving away full exam solutions. Use concise Markdown.\n\nQuestion: ${question}`;
      const res = await fetch('/api/demo', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt }) });
      const json = await res.json();
      setAnswer(json.content || json.error || 'No response');
    } catch (e: any) {
      setAnswer(e?.message || 'Failed to get response.');
    } finally {
      setLoading(false);
    }
  };

  if (user) return null;

  return (
    <>
      <main className="flex min-h-screen flex-col items-center bg-gradient-to-b from-background via-background to-muted/40">
        <section className="w-full border-b bg-background">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 py-20 md:grid-cols-2">
            <div>
              <p className="mb-2 text-xs uppercase tracking-widest text-primary">CAPS Tutor</p>
              <h1 className="font-headline mb-4 text-5xl font-bold md:text-6xl">The most supportive CAPS AI tutor</h1>
              <p className="text-muted-foreground mb-6 max-w-prose">Low‑latency, CAPS‑aligned explanations, practice and feedback for Grades 8–12. Explore the live demo below or sign up to start learning.</p>
              <div className="flex gap-3">
                <Button asChild><Link href="/register">Sign up</Link></Button>
                <Button asChild variant="outline"><Link href="/contact">Contact sales</Link></Button>
              </div>
            </div>
            <div className="rounded-xl border bg-card p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex gap-2">
                  <Button variant={subject==='Mathematics'?'default':'outline'} size="sm" onClick={() => setSubject('Mathematics')}>Mathematics</Button>
                  <Button variant={subject==='Physical Sciences'?'default':'outline'} size="sm" onClick={() => setSubject('Physical Sciences')}>Physical Science</Button>
                  <Button variant={subject==='Life Sciences'?'default':'outline'} size="sm" onClick={() => setSubject('Life Sciences')}>Life Science</Button>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <label htmlFor="grade" className="text-muted-foreground">Grade</label>
                  <select id="grade" className="rounded-md border bg-background px-2 py-1"
                    value={grade}
                    onChange={e => setGrade(parseInt(e.target.value))}
                  >
                    {grades.map(g => (<option key={g} value={g}>{g}</option>))}
                  </select>
                </div>
              </div>
              <div className="mb-3 flex items-center justify-between">
                <div className="text-xs text-muted-foreground">Sample questions (CAPS)</div>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => { const i = (currentIdx+3)%4; setCurrentIdx(i); setQuestion(questionList[i]); setAnswer(''); }}>Prev</Button>
                  <Button size="sm" variant="ghost" onClick={() => { const i = (currentIdx+1)%4; setCurrentIdx(i); setQuestion(questionList[i]); setAnswer(''); }}>Next</Button>
                </div>
              </div>
              <div className="rounded-md border bg-background p-3 text-left text-sm">
                {question}
              </div>
              <div className="mt-3 flex justify-end">
                <Button onClick={askDemo} disabled={loading}>{loading ? 'Thinking…' : 'Explain'}</Button>
              </div>
              {answer && (
                <div className="prose mt-4 max-w-none whitespace-pre-wrap break-words text-sm prose-headings:mt-0 dark:prose-invert">
                  {answer}
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-6 py-16">
          <div className="grid gap-6 md:grid-cols-3">
            <FeatureCard title="CAPS-aligned" desc="Aligned to DBE CAPS docs and Siyavula resources for Grades 8–12."/>
            <FeatureCard title="Adaptive practice" desc="Personalised questions that adjust to each learner’s mastery."/>
            <FeatureCard title="Multilingual" desc="Support responses in all 11 official South African languages."/>
          </div>
        </section>
        
        <section className="w-full border-t bg-background">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-6 py-16 md:grid-cols-3">
            <Stat title="Avg. response" value="~1.5s" note="with Groq chat"/>
            <Stat title="Curriculum" value="CAPS" note="Grades 8–12"/>
            <Stat title="Languages" value="11" note="official SA languages"/>
          </div>
        </section>
      </main>
    </>
  );
}

function FeatureCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <h3 className="font-headline mb-2 text-xl font-semibold">{title}</h3>
      <p className="text-muted-foreground text-sm">{desc}</p>
    </div>
  );
}

function Stat({ title, value, note }: { title: string; value: string; note?: string }) {
  return (
    <div className="rounded-xl border bg-card p-6 text-center shadow-sm">
      <div className="text-muted-foreground text-xs uppercase tracking-widest">{title}</div>
      <div className="font-headline my-1 text-3xl font-bold">{value}</div>
      {note && <div className="text-muted-foreground text-xs">{note}</div>}
    </div>
  );
}

