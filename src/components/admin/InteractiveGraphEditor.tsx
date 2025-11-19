'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Type, Minus, Plus, X, Move, ArrowRight, Text as TextIcon, Trash2 } from 'lucide-react';

interface GraphAnnotation {
  id: string;
  type: 'text' | 'line' | 'arrow';
  x: number;
  y: number;
  text?: string;
  endX?: number;
  endY?: number;
}

interface InteractiveGraphEditorProps {
  graphData: {
    type: string;
    description?: string;
    xAxisLabel?: string;
    yAxisLabel?: string;
    y2AxisLabel?: string;
    dataPoints: Array<{ label: string; value: string | number; value2?: string | number }>;
    showLegend?: boolean;
    showGrid?: boolean;
    annotations?: GraphAnnotation[];
  };
  onUpdate: (updates: Partial<InteractiveGraphEditorProps['graphData'] & { annotations?: GraphAnnotation[] }>) => void;
}

const GRAPH_SYMBOLS = {
  Math: ['×', '÷', '±', '≠', '≤', '≥', '≈', '∑', '√', '∞', 'π', 'θ', 'α', 'β', '°', '²', '³'],
  Letters: ['x', 'y', 'z', 'a', 'b', 'c', 'A', 'B', 'C', 'X', 'Y', 'Z', 'f(x)', 'g(x)'],
  Arrows: ['→', '←', '↑', '↓', '↔', '⇒', '⇐', '⟶', '⟵'],
  Special: ['•', '○', '●', '□', '■', '△', '▲', '☆', '★', '✓', '…'],
};

export function InteractiveGraphEditor({ graphData, onUpdate }: InteractiveGraphEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [annotations, setAnnotations] = useState<GraphAnnotation[]>(graphData.annotations || []);
  const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [tool, setTool] = useState<'select' | 'text' | 'line' | 'arrow'>('select');
  const [showSymbols, setShowSymbols] = useState(false);

  // Sync annotations with graphData
  useEffect(() => {
    if (graphData.annotations) {
      setAnnotations(graphData.annotations);
    }
  }, [graphData.annotations]);

  const width = 600;
  const height = 400;
  const padding = 60;
  const graphWidth = width - padding * 2;
  const graphHeight = height - padding * 2;

  // Calculate graph bounds
  const values = graphData.dataPoints
    .map(dp => {
      const val = typeof dp.value === 'number' ? dp.value : parseFloat(String(dp.value)) || 0;
      return val;
    })
    .filter(v => !isNaN(v));

  const maxValue = values.length > 0 ? Math.max(...values, 0) : 10;
  const minValue = values.length > 0 ? Math.min(...values, 0) : 0;
  const valueRange = maxValue - minValue || 1;

  // Convert data point to canvas coordinates
  const valueToY = (value: number) => {
    const normalized = (value - minValue) / valueRange;
    return height - padding - normalized * graphHeight;
  };

  const indexToX = (index: number, total: number) => {
    if (total === 0) return padding;
    return padding + (index / (total - 1 || 1)) * graphWidth;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    if (graphData.showGrid) {
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1;
      
      // Horizontal grid lines
      for (let i = 0; i <= 5; i++) {
        const y = padding + (i / 5) * graphHeight;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
      }
      
      // Vertical grid lines
      for (let i = 0; i <= graphData.dataPoints.length; i++) {
        const x = padding + (i / (graphData.dataPoints.length || 1)) * graphWidth;
        ctx.beginPath();
        ctx.moveTo(x, padding);
        ctx.lineTo(x, height - padding);
        ctx.stroke();
      }
    }

    // Draw axes
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    
    // X-axis
    ctx.beginPath();
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();
    
    // Y-axis
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.stroke();

    // Draw axis labels
    ctx.fillStyle = '#000000';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    
    if (graphData.xAxisLabel) {
      ctx.fillText(graphData.xAxisLabel, width / 2, height - padding + 10);
    }
    
    ctx.save();
    ctx.translate(20, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    if (graphData.yAxisLabel) {
      ctx.fillText(graphData.yAxisLabel, 0, 0);
    }
    ctx.restore();

    // Draw data points and lines
    if (graphData.dataPoints.length > 0) {
      ctx.strokeStyle = '#3b82f6';
      ctx.fillStyle = '#3b82f6';
      ctx.lineWidth = 2;

      if (graphData.type === 'line' || graphData.type === 'scatter') {
        // Draw line
        ctx.beginPath();
        graphData.dataPoints.forEach((dp, idx) => {
          const val = typeof dp.value === 'number' ? dp.value : parseFloat(String(dp.value)) || 0;
          const x = indexToX(idx, graphData.dataPoints.length);
          const y = valueToY(val);
          if (idx === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });
        ctx.stroke();
      }

      // Draw points
      graphData.dataPoints.forEach((dp, idx) => {
        const val = typeof dp.value === 'number' ? dp.value : parseFloat(String(dp.value)) || 0;
        const x = indexToX(idx, graphData.dataPoints.length);
        const y = valueToY(val);
        
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw label
        if (dp.label) {
          ctx.fillStyle = '#000000';
          ctx.font = '10px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';
          ctx.fillText(dp.label, x, y - 8);
          ctx.fillStyle = '#3b82f6';
        }
      });

      // Draw bar chart
      if (graphData.type === 'bar') {
        graphData.dataPoints.forEach((dp, idx) => {
          const val = typeof dp.value === 'number' ? dp.value : parseFloat(String(dp.value)) || 0;
          const x = indexToX(idx, graphData.dataPoints.length);
          const y = valueToY(val);
          const barWidth = graphWidth / (graphData.dataPoints.length * 1.5);
          
          ctx.fillStyle = '#3b82f6';
          ctx.fillRect(x - barWidth / 2, y, barWidth, height - padding - y);
        });
      }
    }

    // Draw annotations
    annotations.forEach(ann => {
      if (ann.type === 'text' && ann.text) {
        ctx.fillStyle = selectedAnnotation === ann.id ? '#ef4444' : '#000000';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(ann.text, ann.x, ann.y);
      } else if (ann.type === 'line' && ann.endX && ann.endY) {
        ctx.strokeStyle = selectedAnnotation === ann.id ? '#ef4444' : '#000000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(ann.x, ann.y);
        ctx.lineTo(ann.endX, ann.endY);
        ctx.stroke();
      } else if (ann.type === 'arrow' && ann.endX && ann.endY) {
        ctx.strokeStyle = selectedAnnotation === ann.id ? '#ef4444' : '#000000';
        ctx.fillStyle = selectedAnnotation === ann.id ? '#ef4444' : '#000000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(ann.x, ann.y);
        ctx.lineTo(ann.endX, ann.endY);
        ctx.stroke();
        
        // Draw arrowhead
        const angle = Math.atan2(ann.endY - ann.y, ann.endX - ann.x);
        const arrowLength = 10;
        ctx.beginPath();
        ctx.moveTo(ann.endX, ann.endY);
        ctx.lineTo(
          ann.endX - arrowLength * Math.cos(angle - Math.PI / 6),
          ann.endY - arrowLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
          ann.endX - arrowLength * Math.cos(angle + Math.PI / 6),
          ann.endY - arrowLength * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fill();
      }
    });
  }, [graphData, annotations, selectedAnnotation]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (tool === 'text') {
      const newAnnotation: GraphAnnotation = {
        id: Date.now().toString(),
        type: 'text',
        x,
        y,
        text: 'Label',
      };
      handleAddAnnotation(newAnnotation);
      setTool('select');
    } else if (tool === 'line' || tool === 'arrow') {
      if (!isDrawing) {
        setIsDrawing(true);
        setDrawStart({ x, y });
      } else {
        const newAnnotation: GraphAnnotation = {
          id: Date.now().toString(),
          type: tool,
          x: drawStart!.x,
          y: drawStart!.y,
          endX: x,
          endY: y,
        };
        handleAddAnnotation(newAnnotation);
        setIsDrawing(false);
        setDrawStart(null);
        setTool('select');
      }
    } else {
      // Select annotation
      const clicked = annotations.find(ann => {
        if (ann.type === 'text') {
          return Math.abs(ann.x - x) < 50 && Math.abs(ann.y - y) < 15;
        } else if (ann.endX && ann.endY) {
          const dist = distanceToLineSegment(x, y, ann.x, ann.y, ann.endX, ann.endY);
          return dist < 5;
        }
        return false;
      });
      setSelectedAnnotation(clicked?.id || null);
    }
  };

  const distanceToLineSegment = (px: number, py: number, x1: number, y1: number, x2: number, y2: number) => {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;
    if (lenSq !== 0) param = dot / lenSq;

    let xx, yy;

    if (param < 0) {
      xx = x1;
      yy = y1;
    } else if (param > 1) {
      xx = x2;
      yy = y2;
    } else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }

    const dx = px - xx;
    const dy = py - yy;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleAnnotationUpdate = (id: string, updates: Partial<GraphAnnotation>) => {
    const updated = annotations.map(ann => 
      ann.id === id ? { ...ann, ...updates } : ann
    );
    setAnnotations(updated);
    onUpdate({ annotations: updated });
  };

  const handleDeleteAnnotation = (id: string) => {
    const updated = annotations.filter(ann => ann.id !== id);
    setAnnotations(updated);
    setSelectedAnnotation(null);
    onUpdate({ annotations: updated });
  };

  const handleAddAnnotation = (annotation: GraphAnnotation) => {
    const updated = [...annotations, annotation];
    setAnnotations(updated);
    setSelectedAnnotation(annotation.id);
    onUpdate({ annotations: updated });
  };

  const selectedAnn = annotations.find(ann => ann.id === selectedAnnotation);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-2 border border-border rounded-lg bg-muted/20">
        <Button
          variant={tool === 'select' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTool('select')}
          className="h-8"
        >
          <Move className="h-4 w-4 mr-1" />
          Select
        </Button>
        <Button
          variant={tool === 'text' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTool('text')}
          className="h-8"
        >
          <TextIcon className="h-4 w-4 mr-1" />
          Text
        </Button>
        <Button
          variant={tool === 'line' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTool('line')}
          className="h-8"
        >
          <Minus className="h-4 w-4 mr-1" />
          Line
        </Button>
        <Button
          variant={tool === 'arrow' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTool('arrow')}
          className="h-8"
        >
          <ArrowRight className="h-4 w-4 mr-1" />
          Arrow
        </Button>
        <Popover open={showSymbols} onOpenChange={setShowSymbols}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              <Type className="h-4 w-4 mr-1" />
              Symbols
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-2">
            <Tabs defaultValue="Math" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="Math">Math</TabsTrigger>
                <TabsTrigger value="Letters">Letters</TabsTrigger>
                <TabsTrigger value="Arrows">Arrows</TabsTrigger>
                <TabsTrigger value="Special">Special</TabsTrigger>
              </TabsList>
              {Object.entries(GRAPH_SYMBOLS).map(([category, symbols]) => (
                <TabsContent key={category} value={category} className="mt-2">
                  <div className="grid grid-cols-8 gap-1 max-h-40 overflow-y-auto">
                    {symbols.map((symbol, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 text-sm"
                        onClick={() => {
                          if (selectedAnn && selectedAnn.type === 'text') {
                            handleAnnotationUpdate(selectedAnn.id, {
                              text: (selectedAnn.text || '') + symbol
                            });
                          }
                          setShowSymbols(false);
                        }}
                      >
                        {symbol}
                      </Button>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </PopoverContent>
        </Popover>
        {selectedAnnotation && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDeleteAnnotation(selectedAnnotation)}
            className="h-8 text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        )}
      </div>

      {/* Canvas */}
      <div className="border-2 border-border rounded-lg p-4 bg-white">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          onClick={handleCanvasClick}
          className="cursor-crosshair border border-border rounded"
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      </div>

      {/* Annotation Editor */}
      {selectedAnn && selectedAnn.type === 'text' && (
        <div className="p-3 border border-border rounded-lg bg-muted/20">
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Annotation Text</label>
          <Input
            value={selectedAnn.text || ''}
            onChange={(e) => handleAnnotationUpdate(selectedAnn.id, { text: e.target.value })}
            className="bg-background border-border"
            placeholder="Enter text"
          />
        </div>
      )}

      {/* Instructions */}
      <div className="text-xs text-muted-foreground">
        <p>• Click on a tool to activate it, then click on the graph to add annotations</p>
        <p>• For lines and arrows: click once to start, click again to end</p>
        <p>• Click on annotations to select and edit them</p>
      </div>
    </div>
  );
}

