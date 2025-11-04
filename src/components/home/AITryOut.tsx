'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { getQuestions, getQuestionWithAnswer, Subject } from '@/lib/demo-questions';
import { getInteractiveFeedback, InteractiveFeedbackOutput } from '@/ai/flows/interactive-feedback-explanation';
import { Calculator, FlaskConical, Leaf, Loader, Play } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { TypingText } from '@/components/ui/typing-text';

export function AITryOut() {
  const [subject, setSubject] = useState<Subject>('Mathematics');
  const [grade, setGrade] = useState([10]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<string>('');
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<InteractiveFeedbackOutput | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [questionList, setQuestionList] = useState<string[]>([]);
  const { toast } = useToast();

  // Get and shuffle questions when subject or grade changes
  useEffect(() => {
    const questions = getQuestions(subject, grade[0] as any);
    setQuestionList(questions);
    setCurrentQuestionIndex(0);
    setAnswer('');
    setFeedback(null);
  }, [subject, grade]);

  // Update current question when index or question list changes
  useEffect(() => {
    if (questionList.length > 0 && currentQuestionIndex < questionList.length) {
      setCurrentQuestion(questionList[currentQuestionIndex]);
      setAnswer('');
      setFeedback(null);
    } else {
      setCurrentQuestion('');
      setAnswer('');
      setFeedback(null);
    }
  }, [currentQuestionIndex, questionList]);

  const handleCheckAnswer = useCallback(async () => {
    if (!currentQuestion || !answer.trim()) {
      toast({
        variant: "destructive",
        title: "Please enter an answer",
        description: "You need to type your answer before checking it.",
      });
      return;
    }

    setIsChecking(true);
    setFeedback(null);

    try {
      // Get the correct answer for this question
      const questionWithAnswer = getQuestionWithAnswer(subject, grade[0] as any, currentQuestion);
      const correctAnswer = questionWithAnswer?.answer;

      const result = await getInteractiveFeedback({
        question: currentQuestion,
        studentAnswer: answer,
        correctAnswer: correctAnswer,
        gradeLevel: grade[0],
        subject: subject,
      });
      setFeedback(result);
    } catch (error) {
      console.error('Failed to check answer:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to check your answer. Please try again.",
      });
    } finally {
      setIsChecking(false);
    }
  }, [currentQuestion, answer, subject, grade, toast]);

  const subjects = useMemo(() => [
    { name: 'Mathematics', icon: Calculator },
    { name: 'Physical Sciences', icon: FlaskConical },
    { name: 'Life Sciences', icon: Leaf },
  ], []);

  return (
    <div className="w-full space-y-6">
      {/* Subject buttons */}
      <div className="flex gap-3 justify-center flex-wrap">
        {subjects.map((sub) => {
          const Icon = sub.icon;
          const isSelected = subject === sub.name;
          const isLifeSciences = sub.name === 'Life Sciences';
          const isMathematics = sub.name === 'Mathematics';
          return (
            <Button
              key={sub.name}
              variant={isSelected ? "default" : "outline"}
              onClick={() => setSubject(sub.name as Subject)}
              className={cn(
                "flex items-center gap-2 rounded-lg",
                isSelected && isLifeSciences && "bg-green-500 hover:bg-green-600 text-white border-green-500",
                isSelected && isMathematics && "bg-orange-500 hover:bg-orange-600 text-white border-orange-500"
              )}
            >
              <Icon className="h-4 w-4" />
              {sub.name}
            </Button>
          );
        })}
      </div>

      {/* Grade slider */}
      <div className="flex items-center gap-4 px-2">
        <label className="text-sm font-medium whitespace-nowrap">
          Grade: {grade[0]}
        </label>
        <Slider
          value={grade}
          onValueChange={setGrade}
          min={1}
          max={12}
          step={1}
          className="flex-1"
        />
      </div>

      {/* Question card */}
      <QuestionCard
        question={currentQuestion}
        answer={answer}
        onAnswerChange={setAnswer}
        onCheckAnswer={handleCheckAnswer}
        feedback={feedback}
        isChecking={isChecking}
      />
    </div>
  );
}

interface QuestionCardProps {
  question: string;
  answer: string;
  onAnswerChange: (value: string) => void;
  onCheckAnswer: () => void;
  feedback: InteractiveFeedbackOutput | null;
  isChecking: boolean;
}

function QuestionCard({
  question,
  answer,
  onAnswerChange,
  onCheckAnswer,
  feedback,
  isChecking,
}: QuestionCardProps) {
  return (
    <Card className="bg-card border">
      <CardContent className="p-6 space-y-6">
        {question ? (
          <>
            <div className="space-y-3">
              <div className="font-semibold text-lg">Question:</div>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>{question}</ReactMarkdown>
              </div>
            </div>

            <div className="space-y-3">
              <Textarea
                value={answer}
                onChange={(e) => onAnswerChange(e.target.value)}
                placeholder="Type your answer here..."
                className="min-h-[120px] resize-y"
                disabled={isChecking}
              />
            </div>

            <div className="flex justify-end">
              <Button
                onClick={onCheckAnswer}
                disabled={isChecking || !answer.trim()}
                className="flex items-center gap-2"
              >
                {isChecking ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 fill-current" />
                    Check Answer
                  </>
                )}
              </Button>
            </div>

            {feedback && (
              <div className={`mt-4 p-4 rounded-lg border overflow-hidden ${
                feedback.isCorrect 
                  ? 'bg-green-500/10 border-green-500/50' 
                  : 'bg-orange-500/10 border-orange-500/50'
              }`}>
                <div className="font-semibold mb-3 text-base">
                  {feedback.isCorrect ? '✓ Correct!' : 'Try Again'}
                </div>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <div className="break-words whitespace-pre-wrap">
                    <TypingText
                      text={typeof feedback.explanation === 'string' 
                        ? feedback.explanation 
                        : String(feedback.explanation || '')}
                      markdown={true}
                      speed={10}
                      rehypePlugins={[rehypeRaw]}
                      markdownComponents={{
                        p: ({children}: {children?: React.ReactNode}) => <p className="mb-3 last:mb-0 break-words">{children}</p>,
                        ul: ({children}: {children?: React.ReactNode}) => <ul className="list-disc pl-5 mb-3 space-y-1">{children}</ul>,
                        ol: ({children}: {children?: React.ReactNode}) => <ol className="list-decimal pl-5 mb-3 space-y-1">{children}</ol>,
                        li: ({children}: {children?: React.ReactNode}) => <li className="break-words">{children}</li>,
                        strong: ({children}: {children?: React.ReactNode}) => <strong className="font-semibold">{children}</strong>,
                        code: ({children}: {children?: React.ReactNode}) => <code className="px-1 py-0.5 rounded bg-muted text-sm break-words">{children}</code>,
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            No questions available for this subject and grade combination.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

