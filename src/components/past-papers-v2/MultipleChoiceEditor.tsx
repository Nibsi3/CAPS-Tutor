'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Plus, Trash2, Save } from 'lucide-react';
import { EditorQuestion } from '@/lib/past-papers-v2/types';
// Drag and drop will be added later if needed

interface MultipleChoiceEditorProps {
  question: EditorQuestion;
  onUpdate: (question: EditorQuestion) => void;
}

export function MultipleChoiceEditor({ question, onUpdate }: MultipleChoiceEditorProps) {
  const options = question.options || ['', '', '', ''];
  const [optionList, setOptionList] = useState<string[]>(options.length > 0 ? options : ['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState<string>(question.correctAnswer || '');

  const handleAddOption = () => {
    setOptionList([...optionList, '']);
  };

  const handleRemoveOption = (index: number) => {
    if (optionList.length <= 2) return; // Keep at least 2 options
    const updated = optionList.filter((_, i) => i !== index);
    setOptionList(updated);
    // Clear correct answer if it was the removed option
    if (correctAnswer === String.fromCharCode(65 + index)) {
      setCorrectAnswer('');
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const updated = [...optionList];
    updated[index] = value;
    setOptionList(updated);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const items = [...optionList];
    [items[index - 1], items[index]] = [items[index], items[index - 1]];
    setOptionList(items);
    // Update correct answer
    if (correctAnswer) {
      const oldLetter = String.fromCharCode(65 + index);
      if (correctAnswer === oldLetter) {
        setCorrectAnswer(String.fromCharCode(65 + index - 1));
      } else if (correctAnswer === String.fromCharCode(65 + index - 1)) {
        setCorrectAnswer(String.fromCharCode(65 + index));
      }
    }
  };

  const handleMoveDown = (index: number) => {
    if (index === optionList.length - 1) return;
    const items = [...optionList];
    [items[index], items[index + 1]] = [items[index + 1], items[index]];
    setOptionList(items);
    // Update correct answer
    if (correctAnswer) {
      const oldLetter = String.fromCharCode(65 + index);
      if (correctAnswer === oldLetter) {
        setCorrectAnswer(String.fromCharCode(65 + index + 1));
      } else if (correctAnswer === String.fromCharCode(65 + index + 1)) {
        setCorrectAnswer(String.fromCharCode(65 + index));
      }
    }
  };

  const handleSave = () => {
    const updatedQuestion: EditorQuestion = {
      ...question,
      options: optionList.filter(opt => opt.trim() !== ''),
      correctAnswer,
    };
    onUpdate(updatedQuestion);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Multiple Choice Editor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Options */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Options</Label>
              <Button type="button" size="sm" onClick={handleAddOption}>
                <Plus className="h-4 w-4 mr-1" />
                Add Option
              </Button>
            </div>

            <div className="space-y-2">
              {optionList.map((option, index) => {
                const letter = String.fromCharCode(65 + index);
                return (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 border rounded-md"
                  >
                    <div className="flex flex-col gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0"
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                      >
                        ↑
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0"
                        onClick={() => handleMoveDown(index)}
                        disabled={index === optionList.length - 1}
                      >
                        ↓
                      </Button>
                    </div>
                    <span className="font-semibold w-6">{letter}.</span>
                    <Input
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      placeholder={`Option ${letter}`}
                      className="flex-1"
                    />
                    {optionList.length > 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveOption(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Correct Answer */}
          <div className="grid gap-2">
            <Label>Correct Answer</Label>
            <RadioGroup value={correctAnswer} onValueChange={setCorrectAnswer}>
              <div className="grid grid-cols-2 gap-2">
                {optionList.map((option, index) => {
                  const letter = String.fromCharCode(65 + index);
                  if (!option.trim()) return null;
                  return (
                    <div key={index} className="flex items-center space-x-2">
                      <RadioGroupItem value={letter} id={`answer-${index}`} />
                      <Label htmlFor={`answer-${index}`} className="cursor-pointer">
                        {letter}. {option || `Option ${letter}`}
                      </Label>
                    </div>
                  );
                })}
              </div>
            </RadioGroup>
          </div>

          <Button onClick={handleSave} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            Save Options
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

