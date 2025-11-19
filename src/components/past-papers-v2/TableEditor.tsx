'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Save } from 'lucide-react';
import { EditorQuestion } from '@/lib/past-papers-v2/types';

interface TableEditorProps {
  question: EditorQuestion;
  onUpdate: (question: EditorQuestion) => void;
}

export function TableEditor({ question, onUpdate }: TableEditorProps) {
  const tableData = question.tableData || {
    headers: ['Column 1', 'Column 2'],
    rows: [['', '']],
    description: '',
  };

  const [headers, setHeaders] = useState<string[]>(tableData.headers || []);
  const [rows, setRows] = useState<string[][]>(tableData.rows || []);
  const [description, setDescription] = useState<string>(tableData.description || '');

  const handleAddColumn = () => {
    setHeaders([...headers, `Column ${headers.length + 1}`]);
    setRows(rows.map(row => [...row, '']));
  };

  const handleRemoveColumn = (index: number) => {
    if (headers.length <= 1) return; // Keep at least one column
    setHeaders(headers.filter((_, i) => i !== index));
    setRows(rows.map(row => row.filter((_, i) => i !== index)));
  };

  const handleAddRow = () => {
    setRows([...rows, new Array(headers.length).fill('')]);
  };

  const handleRemoveRow = (index: number) => {
    if (rows.length <= 1) return; // Keep at least one row
    setRows(rows.filter((_, i) => i !== index));
  };

  const handleHeaderChange = (index: number, value: string) => {
    const updated = [...headers];
    updated[index] = value;
    setHeaders(updated);
  };

  const handleCellChange = (rowIndex: number, colIndex: number, value: string) => {
    const updated = [...rows];
    if (!updated[rowIndex]) {
      updated[rowIndex] = new Array(headers.length).fill('');
    }
    updated[rowIndex][colIndex] = value;
    setRows(updated);
  };

  const handleSave = () => {
    const updatedQuestion: EditorQuestion = {
      ...question,
      tableData: {
        headers,
        rows,
        description,
      },
    };
    onUpdate(updatedQuestion);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Table Editor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Description */}
          <div className="grid gap-2">
            <Label>Table Description</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the table"
            />
          </div>

          {/* Table Controls */}
          <div className="flex gap-2">
            <Button type="button" size="sm" onClick={handleAddColumn}>
              <Plus className="h-4 w-4 mr-1" />
              Add Column
            </Button>
            <Button type="button" size="sm" onClick={handleAddRow}>
              <Plus className="h-4 w-4 mr-1" />
              Add Row
            </Button>
          </div>

          {/* Table */}
          <div className="border rounded-md overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {headers.map((header, index) => (
                    <TableHead key={index} className="relative">
                      <Input
                        value={header}
                        onChange={(e) => handleHeaderChange(index, e.target.value)}
                        className="border-0 p-2 h-auto font-semibold"
                        placeholder={`Column ${index + 1}`}
                      />
                      {headers.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute top-0 right-0 h-6 w-6 p-0"
                          onClick={() => handleRemoveColumn(index)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {headers.map((_, colIndex) => (
                      <TableCell key={colIndex}>
                        <Input
                          value={row[colIndex] || ''}
                          onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                          className="border-0 p-2 h-auto"
                          placeholder="Enter value"
                        />
                      </TableCell>
                    ))}
                    <TableCell>
                      {rows.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveRow(rowIndex)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Button onClick={handleSave} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            Save Table Data
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

