'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from '@/components/ui/textarea';
import { Loader, Bot, User, Sparkles, PencilRuler, BookText, BrainCircuit, Camera, Image as ImageIcon, FileText, X } from "lucide-react";
import { useUser, useDoc, useMemoFirebase, useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { doc } from 'firebase/firestore';
import { askAiTutor, AiTutorOutput } from '@/ai/flows/ai-tutor-flow';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import Link from 'next/link';
import { useLanguage } from '@/components/language-provider';
import { TypingText } from '@/components/ui/typing-text';

interface Attachment {
  type: 'image' | 'pdf';
  dataUri: string;
  name: string;
  preview?: string; // For image preview
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  attachments?: Attachment[];
}

// Generate grade-specific example prompts based on grade level and subjects
const getExamplePrompts = (gradeLevel?: number, subjects?: string[]) => {
    const grade = gradeLevel || 10;
    const firstSubject = subjects && subjects.length > 0 ? subjects[0] : 'Mathematics';
    
    // Grade ranges for CAPS curriculum
    const isFoundationPhase = grade >= 1 && grade <= 3;  // Grades 1-3
    const isIntermediatePhase = grade >= 4 && grade <= 7; // Grades 4-7
    const isSeniorPhase = grade >= 8 && grade <= 9;       // Grades 8-9
    const isFETPhase = grade >= 10 && grade <= 12;        // Grades 10-12
    
    // Different prompts for different grade phases
    if (isFoundationPhase) {
        // Foundation Phase (Grades 1-3): Focus on basic reading, simple math, stories
        return [
            {
                icon: BookText,
                title: "Help Me Read",
                prompt: `Can you help me understand a story or read better? I'm in Grade ${grade}.`
            },
            {
                icon: BrainCircuit,
                title: "Explain Simply",
                prompt: `Can you explain ${firstSubject} in very simple words for a Grade ${grade} student like me?`
            },
            {
                icon: PencilRuler,
                title: "Practice Writing",
                prompt: `Help me practice writing simple sentences or a short story for Grade ${grade}.`
            },
            {
                icon: BrainCircuit,
                title: "Fun Quiz",
                prompt: `Can you give me a fun and easy quiz about ${firstSubject} for Grade ${grade}?`
            }
        ];
    } else if (isIntermediatePhase) {
        // Intermediate Phase (Grades 4-7): Simple paragraphs, comprehension, basic concepts
        return [
            {
                icon: BookText,
                title: "Reading Comprehension",
                prompt: `Help me understand what I'm reading better for Grade ${grade}. How do I answer comprehension questions?`
            },
            {
                icon: PencilRuler,
                title: "Write Paragraphs",
                prompt: `Show me how to write a good paragraph for Grade ${grade}. Can you give me an example?`
            },
            {
                icon: BrainCircuit,
                title: "Explain a Concept",
                prompt: `Explain a ${firstSubject} topic in simple terms for a Grade ${grade} student.`
            },
            {
                icon: BrainCircuit,
                title: "Practice Quiz",
                prompt: `Give me a practice quiz on ${firstSubject} for Grade ${grade} level.`
            }
        ];
    } else if (isSeniorPhase) {
        // Senior Phase (Grades 8-9): Introduction to essays, summaries, more complex topics
        return [
            {
                icon: PencilRuler,
                title: "Write Better",
                prompt: `Help me write better paragraphs and short essays for Grade ${grade}. Show me how to structure my writing.`
            },
            {
                icon: BookText,
                title: "Write Summaries",
                prompt: `What are the key steps to writing a good summary for Grade ${grade}? Give me an example.`
            },
            {
                icon: BrainCircuit,
                title: "Explain Concepts",
                prompt: `Explain a ${firstSubject} concept clearly for a Grade ${grade} student.`
            },
            {
                icon: BrainCircuit,
                title: "Quiz Me",
                prompt: `Give me a practice quiz on ${firstSubject} at Grade ${grade} level.`
            }
        ];
    } else {
        // FET Phase (Grades 10-12): Advanced essays, exam prep, complex analysis
        return [
            {
                icon: PencilRuler,
                title: "Write Better Essays",
                prompt: `How can I structure my essays better to get more marks for Grade ${grade}? Show me an example for a history essay at Grade ${grade} level.`
            },
            {
                icon: BookText,
                title: "Score Better in Summaries",
                prompt: `What are the key steps to writing a good summary for Grade ${grade}? Give me an example appropriate for Grade ${grade} level.`
            },
            {
                icon: BrainCircuit,
                title: "Explain a Concept",
                prompt: `Explain a ${firstSubject} concept in detail suitable for Grade ${grade} exam preparation.`
            },
            {
                icon: BrainCircuit,
                title: "Exam Practice Quiz",
                prompt: `Give me a short, 3-question multiple-choice quiz on ${firstSubject} at Grade ${grade} exam level.`
            }
        ];
    }
};

export default function AiTutorPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const lang = useLanguage();


  const userProfileRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, `users/${user.uid}`);
  }, [user, firestore]);
  const { data: userProfile } = useDoc<{ gradeLevel: number; subjects: string[]; language?: string; }>(userProfileRef);

  // Memoize example prompts to ensure they update when grade or subjects change
  const examplePrompts = useMemo(() => {
    return getExamplePrompts(userProfile?.gradeLevel, userProfile?.subjects);
  }, [userProfile?.gradeLevel, userProfile?.subjects]);

  useEffect(() => {
    // Scroll to the bottom of the chat on new messages
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Convert file to base64 data URI
  const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const newAttachments: Attachment[] = [];
      for (const file of Array.from(files)) {
        const isImage = file.type.startsWith('image/');
        const isPdf = file.type === 'application/pdf';

        if (!isImage && !isPdf) {
          toast({
            variant: "destructive",
            title: "Unsupported file type",
            description: "Please upload images (jpg, png, webp) or PDF files only.",
          });
          continue;
        }

        // Check file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          toast({
            variant: "destructive",
            title: "File too large",
            description: "Please upload files smaller than 10MB.",
          });
          continue;
        }

        const dataUri = await fileToDataUri(file);
        const attachment: Attachment = {
          type: isImage ? 'image' : 'pdf',
          dataUri,
          name: file.name,
          preview: isImage ? dataUri : undefined,
        };
        newAttachments.push(attachment);
      }

      setAttachments(prev => [...prev, ...newAttachments]);
    } catch (error) {
      console.error('Error processing file:', error);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "Failed to process the selected file. Please try again.",
      });
    }

    // Reset input
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleCameraClick = () => {
    cameraInputRef.current?.click();
  };

  const handleFileUploadClick = () => {
    fileInputRef.current?.click();
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSendMessage = useCallback(async (messageToSend?: string) => {
    const currentPrompt = messageToSend || prompt;
    const hasAttachments = attachments.length > 0;
    
    // Allow sending with attachments even if prompt is empty
    if (!user || !userProfile || (!currentPrompt.trim() && !hasAttachments)) {
        toast({
            variant: "destructive",
            title: "Cannot send message",
            description: "You must be logged in, have a complete profile, and include a message or attachment.",
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

    // Create message with attachments if any
    const messageContent = currentPrompt.trim() || (hasAttachments ? "Please help me with this." : "");
    const currentAttachments = [...attachments];
    const newMessages: Message[] = [...messages, { 
      role: 'user', 
      content: messageContent,
      attachments: currentAttachments.length > 0 ? currentAttachments : undefined
    }];
    setMessages(newMessages);
    setPrompt('');
    setAttachments([]); // Clear attachments after sending
    setIsLoading(true);
    
    try {
        const result = await askAiTutor({
            prompt: messageContent,
            gradeLevel: userProfile.gradeLevel,
            subjects: userProfile.subjects,
            language: userProfile.language,
            attachments: currentAttachments.length > 0 ? currentAttachments : undefined,
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
  }, [prompt, attachments, messages, user, userProfile, toast]);

  // Effect to handle initial prompt from URL
  useEffect(() => {
    const initialPrompt = searchParams.get('prompt');
    if (initialPrompt && userProfile && messages.length === 0) {
      const decodedPrompt = decodeURIComponent(initialPrompt);
      handleSendMessage(decodedPrompt);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
            {userProfile?.gradeLevel 
              ? `Your personalized Grade ${userProfile.gradeLevel} AI tutor. Ask questions about your subjects, get explanations tailored to your grade level, or request practice quizzes.`
              : `Ask a question about any of your subjects, paste a problem you're stuck on, or ask for a quiz.`}
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
                  {message.attachments && message.attachments.length > 0 && (
                    <div className={`mb-3 flex flex-wrap gap-2 ${message.role === 'user' ? '' : ''}`}>
                      {message.attachments.map((att, attIndex) => (
                        <div key={attIndex} className="relative">
                          {att.type === 'image' && att.preview ? (
                            <img 
                              src={att.preview} 
                              alt={att.name}
                              className="max-w-[200px] max-h-[200px] rounded border object-contain"
                            />
                          ) : (
                            <div className="flex items-center gap-2 p-2 rounded bg-background/50 border">
                              <FileText className="w-4 h-4" />
                              <span className="text-xs truncate max-w-[150px]">{att.name}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {message.role === 'assistant' ? (
                    <TypingText
                      text={message.content}
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
                  ) : (
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  )}
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
        <div className="p-4 border-t space-y-2">
          {/* Attachment previews */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 pb-2">
              {attachments.map((att, index) => (
                <div key={index} className="relative inline-block">
                  {att.type === 'image' && att.preview ? (
                    <div className="relative group">
                      <img 
                        src={att.preview} 
                        alt={att.name}
                        className="w-20 h-20 object-cover rounded border"
                      />
                      <button
                        onClick={() => removeAttachment(index)}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-2 rounded bg-muted border relative group">
                      <FileText className="w-4 h-4" />
                      <span className="text-xs truncate max-w-[120px]">{att.name}</span>
                      <button
                        onClick={() => removeAttachment(index)}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          <div className="relative flex gap-2">
            {/* Hidden file inputs */}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*,.pdf"
              multiple
              onChange={handleFileSelect}
            />
            <input
              type="file"
              ref={cameraInputRef}
              className="hidden"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
            />
            
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleCameraClick}
                disabled={isLoading}
                title="Take a photo"
              >
                <Camera className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleFileUploadClick}
                disabled={isLoading}
                title="Upload image or PDF"
              >
                <ImageIcon className="w-4 h-4" />
              </Button>
            </div>
            
            <Textarea
              placeholder={userProfile?.gradeLevel 
                ? `e.g., Explain a concept from your Grade ${userProfile.gradeLevel} subjects...`
                : "e.g., Explain photosynthesis in simple terms..."}
              className="flex-1 pr-24"
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
              disabled={isLoading || (!prompt.trim() && attachments.length === 0)}
            >
              {isLoading ? 'Sending...' : 'Send'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

    