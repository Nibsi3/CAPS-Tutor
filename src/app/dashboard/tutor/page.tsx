'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from '@/components/ui/textarea';
import { Loader, Bot, User, Sparkles } from "lucide-react";
import { useUser, useDoc, useMemoFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { doc, getFirestore } from 'firebase/firestore';
import { askAiTutor, AiTutorOutput } from '@/ai/flows/ai-tutor-flow';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AiTutorPage() {
  const { user } = useUser();
  const firestore = getFirestore();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);

  const userProfileRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, `users/${user.uid}`);
  }, [user, firestore]);
  const { data: userProfile } = useDoc(userProfileRef);

  useEffect(() => {
    const initialPrompt = searchParams.get('prompt');
    if (initialPrompt) {
      // Decode the prompt from the URL
      const decodedPrompt = decodeURIComponent(initialPrompt);
      setPrompt(decodedPrompt);
      // Automatically send the message if the user profile is loaded
      if (userProfile) {
        handleSendMessage(decodedPrompt);
      }
    }
  }, [searchParams, userProfile]); // Re-run when userProfile is available


  const handleSendMessage = async (messageToSend?: string) => {
    const currentPrompt = messageToSend || prompt;
    if (!user || !userProfile || !currentPrompt.trim()) {
        toast({
            variant: "destructive",
            title: "Cannot send message",
            description: "You must be logged in and have a complete profile.",
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
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      <Card className="flex-1 flex flex-col">
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
                 <Sparkles className="w-12 h-12 mb-4" />
                <p className="text-lg">Ready to help!</p>
                <p>What concept can I explain for you today?</p>
              </div>
            )}
            {messages.map((message, index) => (
              <div key={index} className={`flex items-start gap-4 ${message.role === 'user' ? 'justify-end' : ''}`}>
                {message.role === 'assistant' && <Bot className="w-8 h-8 flex-shrink-0 text-primary" />}
                <div className={`rounded-lg p-4 max-w-[80%] ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  <p className="whitespace-pre-wrap">{message.content}</p>
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
              {isLoading ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : null}
              Send
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
