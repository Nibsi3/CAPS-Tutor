'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Plus, Trash2, Save } from 'lucide-react';
import { EditorQuestion } from '@/lib/past-papers-v2/types';

interface GraphEditorProps {
  question: EditorQuestion;
  onUpdate: (question: EditorQuestion) => void;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export function GraphEditor({ question, onUpdate }: GraphEditorProps) {
  const graphData = question.graphData || {
    type: 'line' as const,
    xAxisLabel: '',
    yAxisLabel: '',
    dataPoints: [],
    description: '',
  };

  const [type, setType] = useState<string>(graphData.type || 'line');
  const [xAxisLabel, setXAxisLabel] = useState<string>(graphData.xAxisLabel || '');
  const [yAxisLabel, setYAxisLabel] = useState<string>(graphData.yAxisLabel || '');
  const [dataPoints, setDataPoints] = useState<Array<{ label: string; value: number }>>(
    graphData.dataPoints || []
  );
  const [description, setDescription] = useState<string>(graphData.description || '');

  const handleAddDataPoint = () => {
    setDataPoints([...dataPoints, { label: '', value: 0 }]);
  };

  const handleRemoveDataPoint = (index: number) => {
    setDataPoints(dataPoints.filter((_, i) => i !== index));
  };

  const handleDataPointChange = (index: number, field: 'label' | 'value', value: string | number) => {
    const updated = [...dataPoints];
    updated[index] = { ...updated[index], [field]: value };
    setDataPoints(updated);
  };

  const handleSave = () => {
    const updatedQuestion: EditorQuestion = {
      ...question,
      graphData: {
        type: type as 'line' | 'bar' | 'pie' | 'scatter',
        xAxisLabel,
        yAxisLabel,
        dataPoints,
        description,
      },
    };
    onUpdate(updatedQuestion);
  };

  // Prepare chart data
  const chartData = dataPoints.map((dp, idx) => ({
    name: dp.label || `Point ${idx + 1}`,
    value: dp.value,
  }));

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Graph Editor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Graph Type */}
          <div className="grid gap-2">
            <Label>Graph Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="line">Line Graph</SelectItem>
                <SelectItem value="bar">Bar Chart</SelectItem>
                <SelectItem value="pie">Pie Chart</SelectItem>
                <SelectItem value="scatter">Scatter Plot</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Axis Labels */}
          {type !== 'pie' && (
            <>
              <div className="grid gap-2">
                <Label>X-Axis Label</Label>
                <Input
                  value={xAxisLabel}
                  onChange={(e) => setXAxisLabel(e.target.value)}
                  placeholder="Enter X-axis label"
                />
              </div>
              <div className="grid gap-2">
                <Label>Y-Axis Label</Label>
                <Input
                  value={yAxisLabel}
                  onChange={(e) => setYAxisLabel(e.target.value)}
                  placeholder="Enter Y-axis label"
                />
              </div>
            </>
          )}

          {/* Description */}
          <div className="grid gap-2">
            <Label>Description</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Graph description"
            />
          </div>

          {/* Data Points */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Data Points</Label>
              <Button type="button" size="sm" onClick={handleAddDataPoint}>
                <Plus className="h-4 w-4 mr-1" />
                Add Point
              </Button>
            </div>
            <div className="space-y-2">
              {dataPoints.map((point, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <Input
                    value={point.label}
                    onChange={(e) => handleDataPointChange(index, 'label', e.target.value)}
                    placeholder="Label"
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    value={point.value}
                    onChange={(e) => handleDataPointChange(index, 'value', parseFloat(e.target.value) || 0)}
                    placeholder="Value"
                    className="w-24"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveDataPoint(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Preview */}
          {chartData.length > 0 && (
            <div className="mt-4">
              <Label>Preview</Label>
              <div className="h-64 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  {type === 'line' ? (
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" label={{ value: xAxisLabel, position: 'insideBottom', offset: -5 }} />
                      <YAxis label={{ value: yAxisLabel, angle: -90, position: 'insideLeft' }} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="value" stroke="#3b82f6" />
                    </LineChart>
                  ) : type === 'bar' ? (
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" label={{ value: xAxisLabel, position: 'insideBottom', offset: -5 }} />
                      <YAxis label={{ value: yAxisLabel, angle: -90, position: 'insideLeft' }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#3b82f6" />
                    </BarChart>
                  ) : type === 'pie' ? (
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  ) : (
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" label={{ value: xAxisLabel, position: 'insideBottom', offset: -5 }} />
                      <YAxis label={{ value: yAxisLabel, angle: -90, position: 'insideLeft' }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="value" stroke="#3b82f6" dot={{ r: 6 }} />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <Button onClick={handleSave} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            Save Graph Data
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

