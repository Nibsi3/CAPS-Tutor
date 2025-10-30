'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from '@/components/ui/textarea';
import { Loader, Bot, User, Sparkles, PencilRuler, BookText, BrainCircuit } from "lucide-react";
import { useUser, useDoc, useMemoFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { doc, getFirestore } from 'firebase/firestore';
import { askAiTutor, AiTutorOutput } from '@/ai/flows/ai-tutor-flow';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const examplePrompts = [
    {
        icon: PencilRuler,
        title: "Write Better Essays",
        prompt: "How can I structure my essays better to get more marks? Show me an example for a history essay."
    },
    {
        icon: BookText,
        title: "Score Better in Summaries",
        prompt: "What are the key steps to writing a good summary? Give me an example."
    },
    {
        icon: BrainCircuit,
        title: "Explain a Concept",
        prompt: "Explain photosynthesis in simple terms for a Grade 10 student."
    },
     {
        icon: BrainCircuit,
        title: "Quiz Me",
        prompt: "Give me a short, 3-question multiple-choice quiz on Grade 12 Algebra."
    }
]

export default function AiTutorPage() {
  const { user } = useUser();
  const firestore = getFirestore();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);


  const userProfileRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, `users/${user.uid}`);
  }, [user, firestore]);
  const { data: userProfile } = useDoc<{ gradeLevel: number; subjects: string[] }>(userProfileRef);

  useEffect(() => {
    // Scroll to the bottom of the chat on new messages
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (messageToSend?: string) => {
    const currentPrompt = messageToSend || prompt;
    if (!user || !userProfile || !currentPrompt.trim()) {
        toast({
            variant: "destructive",
            title: "Cannot send message",
            description: "You must be logged in and have a complete profile to use the tutor.",
        });
        return;
    }
    
    // Explicitly check for required profile information
    if (!userProfile.gradeLevel || !userProfile.subjects || userProfile.subjects.length === 0) {
        toast({
            variant: "destructive",
            title: "Profile Incomplete",
            description: "Please complete your grade level and subject selection in the settings to use the AI Tutor.",
            action: <Button asChild variant="secondary"><Link href="/dashboard/settings">Go to Settings</Link></Button>
        });
        return;
    }

    const newMessages: Message[] = [...messages, { role: 'user', content: currentPrompt }];
    setMessages(newMessages);
    setPrompt('');
    setIsLoading(true);
    
    try {
        const result = await askAiTutor({
            prompt: currentPrompt,
            gradeLevel: userProfile.gradeLevel,
            subjects: userProfile.subjects,
        });

        setMessages([...newMessages, { role: 'assistant', content: result.response }]);

    } catch (error) {
        console.error("Failed to get response from AI tutor:", error);
        toast({
            variant: "destructive",
            title: "AI Tutor Error",
            description: "The AI failed to provide a response. Please try again.",
        });
         // Don't remove the user message on failure, so they can retry.
         // setMessages(newMessages); 
    } finally {
        setIsLoading(false);
    }
  };

  // Effect to handle initial prompt from URL
  useEffect(() => {
    const initialPrompt = searchParams.get('prompt');
    if (initialPrompt && userProfile && messages.length === 0) {
      const decodedPrompt = decodeURIComponent(initialPrompt);
      handleSendMessage(decodedPrompt);
    }
  }, [searchParams, userProfile, messages.length]);


  return (
    <div className="flex-1 flex flex-col h-full">
      <Card className="flex-1 flex flex-col max-h-[85vh]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline text-3xl">
            <Bot className="h-8 w-8" />
            Personal AI Tutor
          </CardTitle>
          <CardDescription>
            Ask a question about any of your subjects, paste a problem you're stuck on, or ask for a quiz.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col gap-4 overflow-y-auto p-6">
          <div className="flex-1 space-y-6">
            {messages.length === 0 && !isLoading && (
              <div className="text-center text-muted-foreground h-full flex flex-col items-center justify-center">
                 <Sparkles className="w-12 h-12 mb-4 text-primary" />
                <h3 className="text-2xl font-bold font-headline mb-2">What can I help you with today?</h3>
                <p className='mb-8'>Select an example below or type your own question.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
                    {examplePrompts.map((example, i) => (
                        <button key={i} onClick={() => handleSendMessage(example.prompt)} className="text-left p-4 border rounded-lg hover:bg-muted transition-all text-card-foreground">
                            <div className="flex items-center gap-3">
                                <example.icon className="w-5 h-5 text-primary" />
                                <span className="font-semibold">{example.title}</span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{example.prompt}</p>
                        </button>
                    ))}
                </div>
              </div>
            )}
            {messages.map((message, index) => (
              <div key={index} className={`flex items-start gap-4 ${message.role === 'user' ? 'justify-end' : ''}`}>
                {message.role === 'assistant' && <Bot className="w-8 h-8 flex-shrink-0 text-primary" />}
                <div className={`rounded-lg p-4 max-w-[80%] prose prose-sm ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
                {message.role === 'user' && <User className="w-8 h-8 flex-shrink-0" />}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-4">
                <Bot className="w-8 h-8 flex-shrink-0 text-primary" />
                <div className="rounded-lg p-4 bg-muted">
                    <Loader className="w-5 h-5 animate-spin" />
                </div>
              </div>
            )}
             <div ref={chatEndRef} />
          </div>
        </CardContent>
        <div className="p-4 border-t">
          <div className="relative">
            <Textarea
              placeholder="e.g., Explain photosynthesis in simple terms..."
              className="pr-24"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="sm"
              className="absolute right-2.5 top-1/2 -translate-y-1/2"
              onClick={() => handleSendMessage()}
              disabled={isLoading || !prompt.trim()}
            >
              {isLoading ? 'Sending...' : 'Send'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
