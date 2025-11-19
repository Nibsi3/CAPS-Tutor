'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from '@/components/ui/textarea';
import { Loader, Bot, User, Sparkles, PencilRuler, BookText, BrainCircuit, Camera, Image as ImageIcon, FileText, X } from "lucide-react";
import { useUser, useDoc, useMemoAppwrite } from '@/appwrite';
import { appwriteConfig } from '@/appwrite/config';
import { useToast } from '@/hooks/use-toast';
import { askAiTutor, AiTutorOutput } from '@/ai/flows/ai-tutor-flow';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import Link from 'next/link';
import { useLanguage } from '@/components/language-provider';
import { TypingText } from '@/components/ui/typing-text';
import { useScrollRestore } from '@/hooks/use-scroll-restore';
import { useFeature } from '@/hooks/use-features';
import { useRouter } from 'next/navigation';

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
};

export default function AiTutorPage() {
  const { user } = useUser();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { enabled: aiTutorEnabled, isLoading: featuresLoading } = useFeature('aiTutor');
  
  const [isLoading, setIsLoading] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const lang = useLanguage();
  
  // Restore scroll position on reload
  useScrollRestore('tutor-page');
  
  // Redirect if feature is disabled
  useEffect(() => {
    if (!featuresLoading && !aiTutorEnabled) {
      toast({
        title: "Feature Disabled",
        description: "AI Tutor is currently disabled. Please contact an administrator.",
        variant: "destructive",
      });
      router.push('/dashboard');
    }
  }, [aiTutorEnabled, featuresLoading, router, toast]);
  
  if (featuresLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader className="h-12 w-12 animate-spin" />
      </div>
    );
  }
  
  if (!aiTutorEnabled) {
    return null; // Will redirect via useEffect
  }


  const userProfileRef = useMemoAppwrite(() => {
    if (!user) return null;
    return {
      databaseId: appwriteConfig.databaseId,
      collectionId: 'user',
      documentId: user.$id,
    };
  }, [user]);
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
    if (!files || files.length === 0) {
      // Reset input even if no files selected
      if (e.target) {
        e.target.value = '';
      }
      return;
    }

    try {
      const newAttachments: Attachment[] = [];
      const fileArray = Array.from(files);
      
      // Show loading toast for multiple files
      if (fileArray.length > 1) {
        toast({
          title: "Processing files",
          description: `Processing ${fileArray.length} file(s)...`,
        });
      }

      for (const file of fileArray) {
        const isImage = file.type.startsWith('image/');
        const isPdf = file.type === 'application/pdf';

        if (!isImage && !isPdf) {
          toast({
            variant: "destructive",
            title: "Unsupported file type",
            description: `${file.name}: Please upload images (jpg, png, webp, gif) or PDF files only.`,
          });
          continue;
        }

        // Check file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          toast({
            variant: "destructive",
            title: "File too large",
            description: `${file.name} is too large. Please upload files smaller than 10MB.`,
          });
          continue;
        }

        try {
          const dataUri = await fileToDataUri(file);
          const attachment: Attachment = {
            type: isImage ? 'image' : 'pdf',
            dataUri,
            name: file.name,
            preview: isImage ? dataUri : undefined,
          };
          newAttachments.push(attachment);
        } catch (fileError) {
          console.error(`Error processing file ${file.name}:`, fileError);
          toast({
            variant: "destructive",
            title: "File processing error",
            description: `Failed to process ${file.name}. Please try again.`,
          });
        }
      }

      if (newAttachments.length > 0) {
        setAttachments(prev => [...prev, ...newAttachments]);
        toast({
          title: "Files added",
          description: `Successfully added ${newAttachments.length} file(s).`,
        });
      }
    } catch (error) {
      console.error('Error processing files:', error);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "Failed to process the selected files. Please try again.",
      });
    } finally {
      // Reset input
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  const handleCameraClick = () => {
    // Check if device supports camera
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      // Device likely supports camera, trigger camera input
      cameraInputRef.current?.click();
    } else {
      // Fallback to regular file input if camera not available
      toast({
        title: "Camera not available",
        description: "Opening file picker instead. You can select a photo from your device.",
      });
      fileInputRef.current?.click();
    }
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
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                        title="Remove attachment"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-2 rounded bg-muted border relative group">
                      <FileText className="w-4 h-4 flex-shrink-0" />
                      <span className="text-xs truncate max-w-[120px]" title={att.name}>{att.name}</span>
                      <button
                        onClick={() => removeAttachment(index)}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                        title="Remove attachment"
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
              accept="image/*,.pdf,application/pdf"
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
              // Fallback: if camera not available, still allow file selection
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

    