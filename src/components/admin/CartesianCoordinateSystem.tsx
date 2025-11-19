'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Type, Move, Circle, Minus, ArrowRight, Text as TextIcon, Trash2, Square, X as XIcon, Plus } from 'lucide-react';

export interface CoordinatePoint {
  id: string;
  x: number;
  y: number;
  label?: string;
  color?: string;
}

export interface CoordinateLine {
  id: string;
  points: Array<{ x: number; y: number }>;
  color?: string;
  type: 'line' | 'curve' | 'arrow';
  equation?: string;
  pointIds?: string[]; // IDs of points that make up this line
  name?: string; // Optional name for the line/curve
}

export interface CoordinateAnnotation {
  id: string;
  type: 'text' | 'point' | 'line' | 'arrow';
  x: number;
  y: number;
  text?: string;
  endX?: number;
  endY?: number;
  color?: string;
}

export interface CartesianCoordinateData {
  xMin?: number;
  xMax?: number;
  yMin?: number;
  yMax?: number;
  gridStep?: number;
  showGrid?: boolean;
  showAxes?: boolean;
  showLabels?: boolean;
  points?: CoordinatePoint[];
  lines?: CoordinateLine[];
  annotations?: CoordinateAnnotation[];
}

interface CartesianCoordinateSystemProps {
  data: CartesianCoordinateData;
  onUpdate: (data: CartesianCoordinateData) => void;
  width?: number;
  height?: number;
}

const SYMBOLS = {
  Math: ['×', '÷', '±', '≠', '≤', '≥', '≈', '∑', '√', '∞', 'π', 'θ', 'α', 'β', '°', '²', '³', '∫', '∆'],
  Letters: ['x', 'y', 'z', 'a', 'b', 'c', 'A', 'B', 'C', 'X', 'Y', 'Z', 'f(x)', 'g(x)', 'h(x)'],
  Arrows: ['→', '←', '↑', '↓', '↔', '⇒', '⇐', '⟶', '⟵'],
};

export function CartesianCoordinateSystem({
  data,
  onUpdate,
  width = 600,
  height = 600,
}: CartesianCoordinateSystemProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<'select' | 'point' | 'line' | 'arrow' | 'text'>('select');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [showSymbols, setShowSymbols] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const xMin = data.xMin ?? -10;
  const xMax = data.xMax ?? 10;
  const yMin = data.yMin ?? -10;
  const yMax = data.yMax ?? 10;
  const gridStep = data.gridStep ?? 1;
  const showGrid = data.showGrid !== false;
  const showAxes = data.showAxes !== false;
  const showLabels = data.showLabels !== false;

  const padding = 60;
  const graphWidth = width - padding * 2;
  const graphHeight = height - padding * 2;

  // Convert mathematical coordinates to canvas coordinates
  const mathToCanvas = (mathX: number, mathY: number) => {
    const canvasX = padding + ((mathX - xMin) / (xMax - xMin)) * graphWidth;
    const canvasY = height - padding - ((mathY - yMin) / (yMax - yMin)) * graphHeight;
    return { x: canvasX, y: canvasY };
  };

  // Convert canvas coordinates to mathematical coordinates
  const canvasToMath = (canvasX: number, canvasY: number) => {
    const mathX = xMin + ((canvasX - padding) / graphWidth) * (xMax - xMin);
    const mathY = yMin + ((height - padding - canvasY) / graphHeight) * (yMax - yMin);
    return { x: mathX, y: mathY };
  };

  // Draw the coordinate system
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
    if (showGrid) {
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1;

      // Vertical grid lines
      for (let x = xMin; x <= xMax; x += gridStep) {
        const { x: canvasX } = mathToCanvas(x, 0);
        ctx.beginPath();
        ctx.moveTo(canvasX, padding);
        ctx.lineTo(canvasX, height - padding);
        ctx.stroke();
      }

      // Horizontal grid lines
      for (let y = yMin; y <= yMax; y += gridStep) {
        const { y: canvasY } = mathToCanvas(0, y);
        ctx.beginPath();
        ctx.moveTo(padding, canvasY);
        ctx.lineTo(width - padding, canvasY);
        ctx.stroke();
      }
    }

    // Draw axes
    if (showAxes) {
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;

      // X-axis
      const originY = mathToCanvas(0, 0).y;
      ctx.beginPath();
      ctx.moveTo(padding, originY);
      ctx.lineTo(width - padding, originY);
      ctx.stroke();

      // Y-axis
      const originX = mathToCanvas(0, 0).x;
      ctx.beginPath();
      ctx.moveTo(originX, padding);
      ctx.lineTo(originX, height - padding);
      ctx.stroke();

      // Arrowheads
      ctx.fillStyle = '#000000';
      // X-axis arrow (right)
      ctx.beginPath();
      ctx.moveTo(width - padding, originY);
      ctx.lineTo(width - padding - 10, originY - 5);
      ctx.lineTo(width - padding - 10, originY + 5);
      ctx.closePath();
      ctx.fill();

      // Y-axis arrow (up)
      ctx.beginPath();
      ctx.moveTo(originX, padding);
      ctx.lineTo(originX - 5, padding + 10);
      ctx.lineTo(originX + 5, padding + 10);
      ctx.closePath();
      ctx.fill();

      // Axis labels
      if (showLabels) {
        ctx.fillStyle = '#000000';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText('x', width - padding + 15, originY - 5);
        
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText('y', originX - 10, padding - 15);
      }
    }

    // Draw axis labels (numbers)
    if (showLabels) {
      ctx.fillStyle = '#666666';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // X-axis labels
      for (let x = xMin; x <= xMax; x += gridStep) {
        if (x === 0) continue;
        const { x: canvasX, y: canvasY } = mathToCanvas(x, 0);
        ctx.fillText(x.toString(), canvasX, canvasY + 15);
      }

      // Y-axis labels
      ctx.textAlign = 'right';
      for (let y = yMin; y <= yMax; y += gridStep) {
        if (y === 0) continue;
        const { x: canvasX, y: canvasY } = mathToCanvas(0, y);
        ctx.fillText(y.toString(), canvasX - 10, canvasY);
      }

      // Origin label
      const origin = mathToCanvas(0, 0);
      ctx.textAlign = 'right';
      ctx.textBaseline = 'top';
      ctx.fillText('0', origin.x - 5, origin.y + 5);
    }

    // Draw lines (from grouped points)
    if (data.lines) {
      data.lines.forEach(line => {
        // Use pointIds to get points in order, or fall back to points array
        let pointsToDraw: Array<{ x: number; y: number }> = [];
        
        if (line.pointIds && line.pointIds.length > 0) {
          // Get points from pointIds in order
          pointsToDraw = line.pointIds
            .map(id => {
              const pt = data.points?.find(p => p.id === id);
              return pt ? { x: pt.x, y: pt.y } : null;
            })
            .filter((p): p is { x: number; y: number } => p !== null);
        } else if (line.points && line.points.length > 0) {
          // Fall back to points array
          pointsToDraw = line.points;
        }
        
        if (pointsToDraw.length < 2) return;

        ctx.strokeStyle = line.color || '#3b82f6';
        ctx.lineWidth = 2;
        ctx.beginPath();

        if (line.type === 'curve' && pointsToDraw.length >= 2) {
          // Draw smooth curve using cubic bezier curves for better smoothness
          const first = mathToCanvas(pointsToDraw[0].x, pointsToDraw[0].y);
          ctx.moveTo(first.x, first.y);
          
          if (pointsToDraw.length === 2) {
            // Simple line for 2 points (curves need at least 3 points for smoothness)
            const second = mathToCanvas(pointsToDraw[1].x, pointsToDraw[1].y);
            ctx.lineTo(second.x, second.y);
          } else if (pointsToDraw.length === 3) {
            // Quadratic curve for 3 points
            const second = mathToCanvas(pointsToDraw[1].x, pointsToDraw[1].y);
            const third = mathToCanvas(pointsToDraw[2].x, pointsToDraw[2].y);
            ctx.quadraticCurveTo(second.x, second.y, third.x, third.y);
          } else {
            // Cubic bezier curves for 4+ points for smoother curves
            for (let i = 0; i < pointsToDraw.length - 1; i++) {
              const current = mathToCanvas(pointsToDraw[i].x, pointsToDraw[i].y);
              const next = mathToCanvas(pointsToDraw[i + 1].x, pointsToDraw[i + 1].y);
              
              if (i === 0) {
                // First segment: use next point as control
                const nextNext = i + 2 < pointsToDraw.length 
                  ? mathToCanvas(pointsToDraw[i + 2].x, pointsToDraw[i + 2].y)
                  : next;
                const cp1x = current.x + (next.x - current.x) * 0.3;
                const cp1y = current.y + (next.y - current.y) * 0.3;
                const cp2x = next.x - (nextNext.x - next.x) * 0.3;
                const cp2y = next.y - (nextNext.y - next.y) * 0.3;
                ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, next.x, next.y);
              } else if (i === pointsToDraw.length - 2) {
                // Last segment: use previous point as control
                const prev = mathToCanvas(pointsToDraw[i - 1].x, pointsToDraw[i - 1].y);
                const cp1x = current.x + (next.x - current.x) * 0.3;
                const cp1y = current.y + (next.y - current.y) * 0.3;
                const cp2x = next.x - (next.x - current.x) * 0.3;
                const cp2y = next.y - (next.y - current.y) * 0.3;
                ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, next.x, next.y);
              } else {
                // Middle segments: use neighboring points for smooth curves
                const prev = mathToCanvas(pointsToDraw[i - 1].x, pointsToDraw[i - 1].y);
                const nextNext = mathToCanvas(pointsToDraw[i + 2].x, pointsToDraw[i + 2].y);
                
                // Calculate control points for smooth curve
                const tension = 0.3; // Controls curve tightness
                const cp1x = current.x + (next.x - prev.x) * tension;
                const cp1y = current.y + (next.y - prev.y) * tension;
                const cp2x = next.x - (nextNext.x - current.x) * tension;
                const cp2y = next.y - (nextNext.y - current.y) * tension;
                
                ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, next.x, next.y);
              }
            }
          }
        } else {
          // Straight line - connect all points in order
          pointsToDraw.forEach((point, idx) => {
            const { x, y } = mathToCanvas(point.x, point.y);
            if (idx === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          });
        }
        
        ctx.stroke();

        // Draw arrowhead for arrow type
        if (line.type === 'arrow' && pointsToDraw.length >= 2) {
          const lastPoint = pointsToDraw[pointsToDraw.length - 1];
          const secondLastPoint = pointsToDraw[pointsToDraw.length - 2];
          const { x: x1, y: y1 } = mathToCanvas(lastPoint.x, lastPoint.y);
          const { x: x2, y: y2 } = mathToCanvas(secondLastPoint.x, secondLastPoint.y);
          
          const angle = Math.atan2(y1 - y2, x1 - x2);
          ctx.fillStyle = line.color || '#3b82f6';
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x1 - 10 * Math.cos(angle - Math.PI / 6), y1 - 10 * Math.sin(angle - Math.PI / 6));
          ctx.lineTo(x1 - 10 * Math.cos(angle + Math.PI / 6), y1 - 10 * Math.sin(angle + Math.PI / 6));
          ctx.closePath();
          ctx.fill();
        }
        
        // Draw line name/label if available
        if (line.name && pointsToDraw.length > 0) {
          const midPoint = pointsToDraw[Math.floor(pointsToDraw.length / 2)];
          const { x, y } = mathToCanvas(midPoint.x, midPoint.y);
          ctx.fillStyle = line.color || '#3b82f6';
          ctx.font = '12px sans-serif';
          ctx.textAlign = 'left';
          ctx.textBaseline = 'bottom';
          ctx.fillText(line.name, x + 5, y - 5);
        }
      });
    }

    // Draw points
    if (data.points) {
      data.points.forEach(point => {
        const { x, y } = mathToCanvas(point.x, point.y);
        ctx.fillStyle = point.color || (selectedId === point.id ? '#ef4444' : '#3b82f6');
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();

        // Draw label
        if (point.label) {
          ctx.fillStyle = '#000000';
          ctx.font = '12px sans-serif';
          ctx.textAlign = 'left';
          ctx.textBaseline = 'bottom';
          ctx.fillText(point.label, x + 8, y - 8);
        }
      });
    }

    // Draw annotations
    if (data.annotations) {
      data.annotations.forEach(ann => {
        if (ann.type === 'text' && ann.text) {
          const { x, y } = mathToCanvas(ann.x, ann.y);
          ctx.fillStyle = ann.color || (selectedId === ann.id ? '#ef4444' : '#000000');
          ctx.font = '12px sans-serif';
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          ctx.fillText(ann.text, x, y);
        } else if (ann.type === 'line' && ann.endX !== undefined && ann.endY !== undefined) {
          const start = mathToCanvas(ann.x, ann.y);
          const end = mathToCanvas(ann.endX, ann.endY);
          ctx.strokeStyle = ann.color || (selectedId === ann.id ? '#ef4444' : '#000000');
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(start.x, start.y);
          ctx.lineTo(end.x, end.y);
          ctx.stroke();
        } else if (ann.type === 'arrow' && ann.endX !== undefined && ann.endY !== undefined) {
          const start = mathToCanvas(ann.x, ann.y);
          const end = mathToCanvas(ann.endX, ann.endY);
          ctx.strokeStyle = ann.color || (selectedId === ann.id ? '#ef4444' : '#000000');
          ctx.fillStyle = ann.color || (selectedId === ann.id ? '#ef4444' : '#000000');
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(start.x, start.y);
          ctx.lineTo(end.x, end.y);
          ctx.stroke();

          // Arrowhead
          const angle = Math.atan2(end.y - start.y, end.x - start.x);
          ctx.beginPath();
          ctx.moveTo(end.x, end.y);
          ctx.lineTo(end.x - 10 * Math.cos(angle - Math.PI / 6), end.y - 10 * Math.sin(angle - Math.PI / 6));
          ctx.lineTo(end.x - 10 * Math.cos(angle + Math.PI / 6), end.y - 10 * Math.sin(angle + Math.PI / 6));
          ctx.closePath();
          ctx.fill();
        }
      });
    }

    // Draw preview line while drawing
    if (isDrawing && drawStart && mousePos && (tool === 'line' || tool === 'arrow')) {
      const start = mathToCanvas(drawStart.x, drawStart.y);
      const end = mathToCanvas(mousePos.x, mousePos.y);
      
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
      
      // Draw arrowhead preview if arrow tool
      if (tool === 'arrow') {
        const angle = Math.atan2(end.y - start.y, end.x - start.x);
        ctx.fillStyle = '#3b82f6';
        ctx.beginPath();
        ctx.moveTo(end.x, end.y);
        ctx.lineTo(end.x - 10 * Math.cos(angle - Math.PI / 6), end.y - 10 * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(end.x - 10 * Math.cos(angle + Math.PI / 6), end.y - 10 * Math.sin(angle + Math.PI / 6));
        ctx.closePath();
        ctx.fill();
      }
      
      ctx.setLineDash([]);
    }
  }, [data, selectedId, isDrawing, drawStart, mousePos, tool, xMin, xMax, yMin, yMax, gridStep, showGrid, showAxes, showLabels, width, height]);


  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const canvasX = e.clientX - rect.left;
    const canvasY = e.clientY - rect.top;
    const { x: mathX, y: mathY } = canvasToMath(canvasX, canvasY);

    if (tool === 'point') {
      const newPoint: CoordinatePoint = {
        id: Date.now().toString(),
        x: Math.round(mathX * 10) / 10,
        y: Math.round(mathY * 10) / 10,
        color: '#3b82f6',
      };
      onUpdate({
        ...data,
        points: [...(data.points || []), newPoint],
      });
      setSelectedId(newPoint.id);
      setTool('select');
    } else if (tool === 'line' || tool === 'arrow') {
      if (!isDrawing) {
        setIsDrawing(true);
        setDrawStart({ x: mathX, y: mathY });
      } else {
        // Second click - end the line
        const newLine: CoordinateLine = {
          id: Date.now().toString(),
          points: [
            { x: Math.round(drawStart!.x * 10) / 10, y: Math.round(drawStart!.y * 10) / 10 },
            { x: Math.round(mathX * 10) / 10, y: Math.round(mathY * 10) / 10 },
          ],
          type: tool === 'arrow' ? 'arrow' : 'line',
          color: '#3b82f6',
        };
        onUpdate({
          ...data,
          lines: [...(data.lines || []), newLine],
        });
        setIsDrawing(false);
        setDrawStart(null);
        setMousePos(null);
        setTool('select');
      }
    } else if (tool === 'text') {
      const newAnnotation: CoordinateAnnotation = {
        id: Date.now().toString(),
        type: 'text',
        x: Math.round(mathX * 10) / 10,
        y: Math.round(mathY * 10) / 10,
        text: 'Label',
        color: '#000000',
      };
      onUpdate({
        ...data,
        annotations: [...(data.annotations || []), newAnnotation],
      });
      setSelectedId(newAnnotation.id);
      setTool('select');
    } else {
      // Select mode - check if clicked on a point, line, or annotation
      let clicked = false;

      // Check points
      if (data.points) {
        data.points.forEach(point => {
          const { x, y } = mathToCanvas(point.x, point.y);
          const dist = Math.sqrt(Math.pow(canvasX - x, 2) + Math.pow(canvasY - y, 2));
          if (dist < 10) {
            setSelectedId(point.id);
            clicked = true;
          }
        });
      }

      // Check annotations
      if (!clicked && data.annotations) {
        data.annotations.forEach(ann => {
          if (ann.type === 'text') {
            const { x, y } = mathToCanvas(ann.x, ann.y);
            const dist = Math.sqrt(Math.pow(canvasX - x, 2) + Math.pow(canvasY - y, 2));
            if (dist < 50) {
              setSelectedId(ann.id);
              clicked = true;
            }
          }
        });
      }

      if (!clicked) {
        setSelectedId(null);
      }
    }
  };

  const handleDelete = () => {
    if (!selectedId) return;

    const updatedData = { ...data };
    
    if (updatedData.points) {
      updatedData.points = updatedData.points.filter(p => p.id !== selectedId);
    }
    if (updatedData.lines) {
      updatedData.lines = updatedData.lines.filter(l => l.id !== selectedId);
    }
    if (updatedData.annotations) {
      updatedData.annotations = updatedData.annotations.filter(a => a.id !== selectedId);
    }

    onUpdate(updatedData);
    setSelectedId(null);
  };

  const selectedPoint = data.points?.find(p => p.id === selectedId);
  const selectedAnnotation = data.annotations?.find(a => a.id === selectedId);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-2 border border-border rounded-lg bg-muted/20 flex-wrap">
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
          variant={tool === 'point' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTool('point')}
          className="h-8"
        >
          <Circle className="h-4 w-4 mr-1" />
          Point
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
        <Button
          variant={tool === 'text' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTool('text')}
          className="h-8"
        >
          <TextIcon className="h-4 w-4 mr-1" />
          Text
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
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="Math">Math</TabsTrigger>
                <TabsTrigger value="Letters">Letters</TabsTrigger>
                <TabsTrigger value="Arrows">Arrows</TabsTrigger>
              </TabsList>
              {Object.entries(SYMBOLS).map(([category, symbols]) => (
                <TabsContent key={category} value={category} className="mt-2">
                  <div className="grid grid-cols-8 gap-1 max-h-40 overflow-y-auto">
                    {symbols.map((symbol, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 text-sm"
                        onClick={() => {
                          if (selectedAnnotation && selectedAnnotation.type === 'text') {
                            const updated = data.annotations?.map(a =>
                              a.id === selectedAnnotation.id
                                ? { ...a, text: (a.text || '') + symbol }
                                : a
                            );
                            onUpdate({ ...data, annotations: updated });
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
        <Popover open={showSettings} onOpenChange={setShowSettings}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              <Square className="h-4 w-4 mr-1" />
              Settings
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-4">
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium mb-1 block">X Min</label>
                  <Input
                    type="number"
                    value={xMin}
                    onChange={(e) => onUpdate({ ...data, xMin: parseFloat(e.target.value) || -10 })}
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">X Max</label>
                  <Input
                    type="number"
                    value={xMax}
                    onChange={(e) => onUpdate({ ...data, xMax: parseFloat(e.target.value) || 10 })}
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">Y Min</label>
                  <Input
                    type="number"
                    value={yMin}
                    onChange={(e) => onUpdate({ ...data, yMin: parseFloat(e.target.value) || -10 })}
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">Y Max</label>
                  <Input
                    type="number"
                    value={yMax}
                    onChange={(e) => onUpdate({ ...data, yMax: parseFloat(e.target.value) || 10 })}
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">Grid Step</label>
                  <Input
                    type="number"
                    value={gridStep}
                    onChange={(e) => onUpdate({ ...data, gridStep: parseFloat(e.target.value) || 1 })}
                    className="h-8 text-sm"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showGrid}
                  onChange={(e) => onUpdate({ ...data, showGrid: e.target.checked })}
                  className="h-4 w-4"
                />
                <label className="text-xs">Show Grid</label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showAxes}
                  onChange={(e) => onUpdate({ ...data, showAxes: e.target.checked })}
                  className="h-4 w-4"
                />
                <label className="text-xs">Show Axes</label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showLabels}
                  onChange={(e) => onUpdate({ ...data, showLabels: e.target.checked })}
                  className="h-4 w-4"
                />
                <label className="text-xs">Show Labels</label>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        {selectedId && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            className="h-8 text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        )}
      </div>

      {/* Coordinate Points Editor - Type to Add Points */}
      <div className="border-2 border-border rounded-lg p-4 bg-muted/20">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Circle className="h-5 w-5 text-primary" />
            <span className="font-semibold text-sm">Coordinate Points (Type to Add)</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const newPoint: CoordinatePoint = {
                id: Date.now().toString(),
                x: 0,
                y: 0,
                color: '#3b82f6',
              };
              onUpdate({
                ...data,
                points: [...(data.points || []), newPoint],
              });
            }}
            className="h-6 text-xs"
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Point
          </Button>
        </div>
        
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {(data.points || []).map((point) => (
            <div key={point.id} className="flex items-center gap-2">
              <Input
                type="number"
                step="0.1"
                value={point.x}
                onChange={(e) => {
                  const updated = data.points?.map(p =>
                    p.id === point.id
                      ? { ...p, x: parseFloat(e.target.value) || 0 }
                      : p
                  );
                  // Update lines that use this point
                  const updatedLines = data.lines?.map(line => {
                    if (line.pointIds?.includes(point.id)) {
                      const newPoints = line.pointIds.map(id => {
                        const pt = id === point.id 
                          ? updated?.find(p => p.id === id)
                          : data.points?.find(p => p.id === id);
                        return pt ? { x: pt.x, y: pt.y } : { x: 0, y: 0 };
                      });
                      return { ...line, points: newPoints };
                    }
                    return line;
                  });
                  onUpdate({ ...data, points: updated, lines: updatedLines });
                }}
                className="bg-background border-border text-sm h-7 w-24"
                placeholder="X"
              />
              <Input
                type="number"
                step="0.1"
                value={point.y}
                onChange={(e) => {
                  const updated = data.points?.map(p =>
                    p.id === point.id
                      ? { ...p, y: parseFloat(e.target.value) || 0 }
                      : p
                  );
                  // Update lines that use this point
                  const updatedLines = data.lines?.map(line => {
                    if (line.pointIds?.includes(point.id)) {
                      const newPoints = line.pointIds.map(id => {
                        const pt = id === point.id 
                          ? updated?.find(p => p.id === id)
                          : data.points?.find(p => p.id === id);
                        return pt ? { x: pt.x, y: pt.y } : { x: 0, y: 0 };
                      });
                      return { ...line, points: newPoints };
                    }
                    return line;
                  });
                  onUpdate({ ...data, points: updated, lines: updatedLines });
                }}
                className="bg-background border-border text-sm h-7 w-24"
                placeholder="Y"
              />
              <Input
                value={point.label || ''}
                onChange={(e) => {
                  const updated = data.points?.map(p =>
                    p.id === point.id
                      ? { ...p, label: e.target.value }
                      : p
                  );
                  onUpdate({ ...data, points: updated });
                }}
                className="bg-background border-border text-sm h-7 flex-1"
                placeholder="Label (optional)"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const updated = data.points?.filter(p => p.id !== point.id);
                  // Also remove this point from any lines that reference it
                  const updatedLines = data.lines?.map(line => {
                    if (line.pointIds?.includes(point.id)) {
                      const newPointIds = line.pointIds.filter(id => id !== point.id);
                      const newPoints = newPointIds.map(id => {
                        const pt = data.points?.find(p => p.id === id);
                        return pt ? { x: pt.x, y: pt.y } : { x: 0, y: 0 };
                      });
                      return {
                        ...line,
                        pointIds: newPointIds,
                        points: newPoints
                      };
                    }
                    return line;
                  }).filter(line => line.pointIds && line.pointIds.length > 0);
                  onUpdate({ ...data, points: updated, lines: updatedLines });
                }}
                className="h-7 w-7 p-0 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
          {(data.points || []).length === 0 && (
            <p className="text-xs text-muted-foreground italic text-center py-2">
              No points. Click "Add Point" to add coordinates, or use the Point tool on the canvas.
            </p>
          )}
        </div>
      </div>

      {/* Lines/Curves Editor - Group Points into Lines */}
      <div className="border-2 border-border rounded-lg p-4 bg-muted/20">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Minus className="h-5 w-5 text-primary" />
            <span className="font-semibold text-sm">Lines & Curves (Group Points)</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const newLine: CoordinateLine = {
                id: Date.now().toString(),
                points: [],
                pointIds: [],
                type: 'line',
                color: `hsl(${(data.lines || []).length * 60 % 360}, 70%, 50%)`,
                name: `Line ${(data.lines || []).length + 1}`,
              };
              onUpdate({
                ...data,
                lines: [...(data.lines || []), newLine],
              });
            }}
            className="h-6 text-xs"
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Line/Curve
          </Button>
        </div>
        
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {(data.lines || []).map((line) => (
            <div key={line.id} className="border border-border rounded p-3 bg-background/50">
              <div className="flex items-center gap-2 mb-2">
                <Input
                  value={line.name || ''}
                  onChange={(e) => {
                    const updated = data.lines?.map(l =>
                      l.id === line.id
                        ? { ...l, name: e.target.value }
                        : l
                    );
                    onUpdate({ ...data, lines: updated });
                  }}
                  className="bg-background border-border text-sm h-7 flex-1"
                  placeholder="Line/Curve name (e.g., y = x²)"
                />
                <Select
                  value={line.type || 'line'}
                  onValueChange={(value: 'line' | 'curve' | 'arrow') => {
                    const updated = data.lines?.map(l =>
                      l.id === line.id
                        ? { ...l, type: value }
                        : l
                    );
                    onUpdate({ ...data, lines: updated });
                  }}
                >
                  <SelectTrigger className="h-7 w-28 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="line">Line</SelectItem>
                    <SelectItem value="curve">Curve</SelectItem>
                    <SelectItem value="arrow">Arrow</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const updated = data.lines?.filter(l => l.id !== line.id);
                    onUpdate({ ...data, lines: updated });
                  }}
                  className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
              
              <div className="text-xs text-muted-foreground mb-2">
                Select points to connect (in order):
              </div>
              
              <div className="flex flex-wrap gap-2">
                {(data.points || []).map((point) => {
                  const isSelected = line.pointIds?.includes(point.id);
                  return (
                    <Button
                      key={point.id}
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        const currentPointIds = line.pointIds || [];
                        let newPointIds: string[];
                        
                        if (isSelected) {
                          // Remove point from line
                          newPointIds = currentPointIds.filter(id => id !== point.id);
                        } else {
                          // Add point to line (maintain order)
                          newPointIds = [...currentPointIds, point.id];
                        }
                        
                        // Update line points based on point IDs
                        const newPoints = newPointIds.map(id => {
                          const p = data.points?.find(pt => pt.id === id);
                          return p ? { x: p.x, y: p.y } : { x: 0, y: 0 };
                        });
                        
                        const updated = data.lines?.map(l =>
                          l.id === line.id
                            ? { ...l, pointIds: newPointIds, points: newPoints }
                            : l
                        );
                        onUpdate({ ...data, lines: updated });
                      }}
                      className="h-6 text-xs"
                    >
                      {point.label || `(${point.x}, ${point.y})`}
                    </Button>
                  );
                })}
              </div>
              
              {(!line.pointIds || line.pointIds.length === 0) && (
                <p className="text-xs text-muted-foreground italic mt-2">
                  No points selected. Click points above to add them to this line/curve.
                </p>
              )}
              
              {line.pointIds && line.pointIds.length > 0 && (
                <div className="mt-2 text-xs text-muted-foreground">
                  Points: {line.pointIds.length} selected
                </div>
              )}
            </div>
          ))}
          {(data.lines || []).length === 0 && (
            <p className="text-xs text-muted-foreground italic text-center py-2">
              No lines/curves. Click "Add Line/Curve" to create one, then select points to connect.
            </p>
          )}
        </div>
      </div>

      {/* Canvas */}
      <div className="border-2 border-border rounded-lg p-4 bg-white">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          onClick={handleCanvasClick}
          onMouseMove={(e) => {
            const rect = canvasRef.current?.getBoundingClientRect();
            if (rect) {
              const canvasX = e.clientX - rect.left;
              const canvasY = e.clientY - rect.top;
              const { x: mathX, y: mathY } = canvasToMath(canvasX, canvasY);
              if (isDrawing && drawStart) {
                setMousePos({ x: mathX, y: mathY });
              } else {
                setMousePos(null);
              }
            }
          }}
          onMouseLeave={() => {
            if (!isDrawing) {
              setMousePos(null);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape' && isDrawing) {
              setIsDrawing(false);
              setDrawStart(null);
              setMousePos(null);
              setTool('select');
            }
          }}
          tabIndex={0}
          className="cursor-crosshair border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      </div>

      {/* Selected Point Editor */}
      {selectedPoint && (
        <div className="p-3 border border-border rounded-lg bg-muted/20">
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs font-medium mb-1 block">X</label>
              <Input
                type="number"
                value={selectedPoint.x}
                onChange={(e) => {
                  const updated = data.points?.map(p =>
                    p.id === selectedPoint.id
                      ? { ...p, x: parseFloat(e.target.value) || 0 }
                      : p
                  );
                  onUpdate({ ...data, points: updated });
                }}
                className="h-8 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Y</label>
              <Input
                type="number"
                value={selectedPoint.y}
                onChange={(e) => {
                  const updated = data.points?.map(p =>
                    p.id === selectedPoint.id
                      ? { ...p, y: parseFloat(e.target.value) || 0 }
                      : p
                  );
                  onUpdate({ ...data, points: updated });
                }}
                className="h-8 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Label</label>
              <Input
                value={selectedPoint.label || ''}
                onChange={(e) => {
                  const updated = data.points?.map(p =>
                    p.id === selectedPoint.id
                      ? { ...p, label: e.target.value }
                      : p
                  );
                  onUpdate({ ...data, points: updated });
                }}
                className="h-8 text-sm"
                placeholder="Label"
              />
            </div>
          </div>
        </div>
      )}

      {/* Selected Annotation Editor */}
      {selectedAnnotation && selectedAnnotation.type === 'text' && (
        <div className="p-3 border border-border rounded-lg bg-muted/20">
          <label className="text-xs font-medium mb-1 block">Annotation Text</label>
          <Input
            value={selectedAnnotation.text || ''}
            onChange={(e) => {
              const updated = data.annotations?.map(a =>
                a.id === selectedAnnotation.id
                  ? { ...a, text: e.target.value }
                  : a
              );
              onUpdate({ ...data, annotations: updated });
            }}
            className="bg-background border-border"
            placeholder="Enter text"
          />
        </div>
      )}

      {/* Instructions */}
      <div className="text-xs text-muted-foreground space-y-1">
        <p>• Select a tool and click on the coordinate system to add elements</p>
        <p>• <strong>Point:</strong> Click to place a point at that coordinate</p>
        <p>• <strong>Line/Arrow:</strong> Click once to start, move mouse, click again to end (press Escape to cancel)</p>
        <p>• <strong>Text:</strong> Click to add a text label (use Symbols button to add math symbols)</p>
        <p>• Click on points or annotations to select and edit them</p>
        <p>• Use Settings to adjust the coordinate range (X Min/Max, Y Min/Max) and display options</p>
        <p>• All elements are editable - select them to modify coordinates, labels, or delete</p>
      </div>
    </div>
  );
}

