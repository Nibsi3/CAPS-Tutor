'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GraphEditor } from './GraphEditor';
import { TableEditor } from './TableEditor';
import { DiagramViewer } from './DiagramViewer';
import { MultipleChoiceEditor } from './MultipleChoiceEditor';
import { EditorQuestion } from '@/lib/past-papers-v2/types';
import { Save } from 'lucide-react';

interface QuestionEditorProps {
  question: EditorQuestion;
  onUpdate: (question: EditorQuestion) => void;
  onSave?: () => void;
}

export function QuestionEditor({ question, onUpdate, onSave }: QuestionEditorProps) {
  const [localQuestion, setLocalQuestion] = useState<EditorQuestion>(question);
  const [activeTab, setActiveTab] = useState<'basic' | 'content'>('basic');

  // Update local state when question prop changes (e.g., when selecting a different question)
  useEffect(() => {
    setLocalQuestion(question);
  }, [question.id, question.number, question.text]); // Update when question ID, number, or text changes

  const handleUpdate = (updated: EditorQuestion) => {
    setLocalQuestion(updated);
    onUpdate(updated);
  };

  const handleSave = () => {
    if (onSave) {
      onSave();
    }
  };

  return (
    <Card className={question.isHeader ? "border-2 border-primary/50 bg-primary/5" : ""}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className={question.isHeader ? "text-lg font-bold text-primary" : ""}>
            {question.isHeader ? (
              <span className="flex items-center gap-2">
                <span className="px-2 py-1 bg-primary/10 text-primary rounded text-sm font-semibold">HEADER</span>
                Question {question.number}
              </span>
            ) : (
              `Question ${question.number}`
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {question.section && `Section ${question.section}`}
              {question.marks > 0 && ` • ${question.marks} marks`}
              {question.isHeader && " • Header Question"}
            </span>
            {onSave && (
              <Button onClick={handleSave} size="sm">
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'basic' | 'content')}>
          <TabsList>
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            {/* Question Number */}
            <div className="grid gap-2">
              <Label>Question Number</Label>
              <Input
                value={localQuestion.number}
                onChange={(e) => handleUpdate({ ...localQuestion, number: e.target.value })}
                placeholder="e.g., 1.1, 1.2.3"
              />
            </div>

            {/* Question Type */}
            <div className="grid gap-2">
              <Label>Question Type</Label>
              <Select
                value={localQuestion.type}
                onValueChange={(value) => handleUpdate({ ...localQuestion, type: value as EditorQuestion['type'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                  <SelectItem value="true-false">True/False</SelectItem>
                  <SelectItem value="table">Table</SelectItem>
                  <SelectItem value="graph">Graph</SelectItem>
                  <SelectItem value="diagram">Diagram</SelectItem>
                  <SelectItem value="extract">Extract</SelectItem>
                  <SelectItem value="subquestion">Sub-question</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Marks */}
            <div className="grid gap-2">
              <Label>Marks</Label>
              <Input
                type="number"
                value={localQuestion.marks}
                onChange={(e) => handleUpdate({ ...localQuestion, marks: parseInt(e.target.value) || 0 })}
                placeholder="Enter marks"
              />
            </div>

            {/* Section */}
            <div className="grid gap-2">
              <Label>Section</Label>
              <Input
                value={localQuestion.section || ''}
                onChange={(e) => handleUpdate({ ...localQuestion, section: e.target.value })}
                placeholder="e.g., Section A"
              />
            </div>

            {/* Header Question */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isHeader"
                checked={localQuestion.isHeader || false}
                onChange={(e) => handleUpdate({ ...localQuestion, isHeader: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="isHeader" className="text-sm font-normal cursor-pointer">
                Header Question (e.g., "QUESTION 1", "SECTION A", instruction headers)
              </Label>
            </div>

            {/* Parent Question (for subquestions) */}
            {localQuestion.type === 'subquestion' && (
              <div className="grid gap-2">
                <Label>Parent Question</Label>
                <Input
                  value={localQuestion.parentQuestion || ''}
                  onChange={(e) => handleUpdate({ ...localQuestion, parentQuestion: e.target.value })}
                  placeholder="e.g., 1.1"
                />
              </div>
            )}

            {/* Answer */}
            <div className="grid gap-2">
              <Label>Answer</Label>
              <Textarea
                value={localQuestion.answer || ''}
                onChange={(e) => handleUpdate({ ...localQuestion, answer: e.target.value })}
                placeholder="Enter answer"
                rows={4}
              />
            </div>
          </TabsContent>

          <TabsContent value="content" className="space-y-4">
            {/* Question Text */}
            <div className="grid gap-2">
              <Label>Question Text</Label>
              <Textarea
                value={localQuestion.text}
                onChange={(e) => handleUpdate({ ...localQuestion, text: e.target.value })}
                placeholder="Enter question text"
                rows={6}
              />
            </div>

            {/* Type-specific editors */}
            {localQuestion.type === 'graph' && (
              <GraphEditor question={localQuestion} onUpdate={handleUpdate} />
            )}

            {localQuestion.type === 'table' && (
              <TableEditor question={localQuestion} onUpdate={handleUpdate} />
            )}

            {localQuestion.type === 'diagram' && (
              <DiagramViewer question={localQuestion} onUpdate={handleUpdate} editable />
            )}

            {localQuestion.type === 'multiple-choice' && (
              <MultipleChoiceEditor question={localQuestion} onUpdate={handleUpdate} />
            )}

            {localQuestion.type === 'extract' && (
              <div className="grid gap-2">
                <Label>Extract Text</Label>
                <Textarea
                  value={localQuestion.extractText || ''}
                  onChange={(e) => handleUpdate({ ...localQuestion, extractText: e.target.value })}
                  placeholder="Enter extract/passage text"
                  rows={10}
                />
              </div>
            )}

            {/* Display diagram if has image (either as diagram type or associated image) */}
            {localQuestion.hasImage && (
              <div className="mt-4">
                <Label>{localQuestion.type === 'diagram' ? 'Diagram' : 'Associated Diagram'}</Label>
                <DiagramViewer question={localQuestion} editable={localQuestion.type === 'diagram'} />
              </div>
            )}
            
            {/* Also show if imageFileId exists even if hasImage is false (fallback) */}
            {!localQuestion.hasImage && localQuestion.imageFileId && (
              <div className="mt-4">
                <Label>Diagram</Label>
                <DiagramViewer question={{ ...localQuestion, hasImage: true }} editable={localQuestion.type === 'diagram'} />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

