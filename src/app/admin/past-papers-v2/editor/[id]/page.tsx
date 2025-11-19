'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser, useDatabases, useDoc, useMemoAppwrite } from '@/appwrite';
import { appwriteConfig } from '@/appwrite/config';
import { Query } from 'appwrite';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { QuestionEditor } from '@/components/past-papers-v2/QuestionEditor';
import { EditorQuestion, EditorPaper } from '@/lib/past-papers-v2/types';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { ID } from 'appwrite';

export default function PastPaperEditorPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();
  const databases = useDatabases();
  
  const paperId = Array.isArray(params.id) ? params.id[0] : params.id;

  const paperRef = useMemoAppwrite(() => {
    if (!paperId) return null;
    return {
      databaseId: appwriteConfig.databaseId,
      collectionId: 'pastpapers',
      documentId: paperId as string,
    };
  }, [paperId]);

  const { data: paperData, isLoading: paperLoading } = useDoc<EditorPaper>(paperRef);
  const [questions, setQuestions] = useState<EditorQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number | null>(null);

  // Load questions
  useEffect(() => {
    if (!paperId || !databases) return;

    const loadQuestions = async () => {
      try {
        setLoading(true);
        const response = await databases.listDocuments(
          appwriteConfig.databaseId,
          'questions',
          [
            Query.equal('paperId', paperId),
            Query.orderAsc('order'),
          ]
        );

        const loadedQuestions: EditorQuestion[] = response.documents.map((doc: any) => ({
          id: doc.$id,
          paperId: doc.paperId,
          number: doc.number,
          type: doc.type || 'normal',
          text: doc.question || '',
          marks: doc.marks || 0,
          answer: doc.answer || '',
          section: doc.section,
          parentQuestion: doc.parentQuestion,
          order: doc.order || 0,
          hasImage: doc.hasImage || false,
          imageFileId: doc.imageFileId,
          options: doc.options ? (typeof doc.options === 'string' ? JSON.parse(doc.options) : doc.options) : undefined,
          correctAnswer: doc.correctAnswer,
          tableData: doc.tableData ? (typeof doc.tableData === 'string' ? JSON.parse(doc.tableData) : doc.tableData) : undefined,
          graphData: doc.graphData ? (typeof doc.graphData === 'string' ? JSON.parse(doc.graphData) : doc.graphData) : undefined,
          diagramData: doc.diagramData 
            ? (typeof doc.diagramData === 'string' ? JSON.parse(doc.diagramData) : doc.diagramData)
            : (doc.imageFileId ? { imageFileId: doc.imageFileId, label: undefined, title: undefined } : undefined),
          extractText: doc.extractText,
        }));

        // Sort questions by order to ensure correct display order
        // The order field is already an integer calculated by calculateOrder function
        // No need to divide - just sort directly by order value
        const sortedQuestions = loadedQuestions.sort((a, b) => {
          const orderA = a.order || 0;
          const orderB = b.order || 0;
          return orderA - orderB;
        });
        
        setQuestions(sortedQuestions);
        if (sortedQuestions.length > 0) {
          setSelectedQuestionIndex(0);
        }
      } catch (error: any) {
        console.error('Error loading questions:', error);
        toast({
          title: 'Error',
          description: 'Failed to load questions',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [paperId, databases, toast]);

  const handleQuestionUpdate = (index: number, updated: EditorQuestion) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = updated;
    setQuestions(updatedQuestions);
  };

  const handleSaveQuestion = async (index: number) => {
    if (!databases || !paperId) return;

    const question = questions[index];
    if (!question.id) return;

    try {
      setSaving(true);

      const questionData: any = {
        number: question.number,
        question: question.text.substring(0, 32767),
        answer: question.answer || '(No answer provided)',
        marks: question.marks,
        type: question.type,
        hasImage: question.hasImage || false,
        order: question.order,
      };

      if (question.section) questionData.section = question.section;
      if (question.parentQuestion) questionData.parentQuestion = question.parentQuestion;
      if (question.options) questionData.options = JSON.stringify(question.options);
      if (question.correctAnswer) questionData.correctAnswer = question.correctAnswer;
      if (question.imageFileId) questionData.imageFileId = question.imageFileId;
      if (question.tableData) questionData.tableData = JSON.stringify(question.tableData);
      if (question.graphData) questionData.graphData = JSON.stringify(question.graphData);
      if (question.diagramData) questionData.diagramData = JSON.stringify(question.diagramData);
      if (question.extractText) questionData.extractText = question.extractText.substring(0, 32767);

      await databases.updateDocument(
        appwriteConfig.databaseId,
        'questions',
        question.id,
        questionData
      );

      toast({
        title: 'Success',
        description: `Question ${question.number} saved successfully`,
      });
    } catch (error: any) {
      console.error('Error saving question:', error);
      toast({
        title: 'Error',
        description: 'Failed to save question',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (paperLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!paperData) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <p>Paper not found</p>
            <Button onClick={() => router.push('/admin/past-papers-v2')} className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Papers
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const selectedQuestion = selectedQuestionIndex !== null ? questions[selectedQuestionIndex] : null;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" onClick={() => router.push('/admin/past-papers-v2')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold mt-2">{paperData.paperName}</h1>
          <p className="text-muted-foreground">
            {paperData.subject} • {paperData.year} • Grade {paperData.gradeLevel}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Total Questions</p>
          <p className="text-2xl font-bold">{questions.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Question List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Questions</CardTitle>
            <CardDescription>Select a question to edit</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {questions.map((q, index) => (
                <Button
                  key={q.id || index}
                  variant={selectedQuestionIndex === index ? 'default' : 'outline'}
                  className="w-full justify-start text-left"
                  onClick={() => setSelectedQuestionIndex(index)}
                >
                  <div className="flex flex-col items-start">
                    <span className="font-semibold">{q.number}</span>
                    <span className="text-xs text-muted-foreground truncate w-full">
                      {q.text.substring(0, 50)}...
                    </span>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Question Editor */}
        <div className="lg:col-span-3">
          {selectedQuestion ? (
            <QuestionEditor
              key={selectedQuestion.id || selectedQuestion.number} // Force remount when question changes
              question={selectedQuestion}
              onUpdate={(updated) => handleQuestionUpdate(selectedQuestionIndex!, updated)}
              onSave={() => handleSaveQuestion(selectedQuestionIndex!)}
            />
          ) : (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                Select a question to edit
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

