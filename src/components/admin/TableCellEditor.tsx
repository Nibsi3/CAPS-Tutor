'use client';

import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { X, Minus, Plus as PlusIcon, Type, AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TableCellEditorProps {
  value: string;
  onChange: (value: string) => void;
  onDelete?: () => void;
  showDelete?: boolean;
  isHeader?: boolean;
  placeholder?: string;
}

const SYMBOLS = {
  Math: ['×', '÷', '±', '≠', '≤', '≥', '≈', '∑', '∏', '∫', '√', '∞', 'π', 'θ', 'α', 'β', 'γ', 'Δ', '°', '²', '³', '½', '¼', '¾'],
  Letters: ['x', 'y', 'z', 'a', 'b', 'c', 'A', 'B', 'C', 'X', 'Y', 'Z', 'n', 'm', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w'],
  Lines: ['─', '│', '├', '┤', '┬', '┴', '┼', '━', '┃', '┏', '┓', '┗', '┛', '┣', '┫', '┳', '┻', '╋'],
  Arrows: ['→', '←', '↑', '↓', '↔', '⇒', '⇐', '⇑', '⇓', '⟶', '⟵', '⟹', '⟸'],
  Currency: ['R', '$', '€', '£', '¥', '¢', '₹'],
  Units: ['m', 'cm', 'mm', 'km', 'kg', 'g', 'mg', 'L', 'mL', 's', 'min', 'h', '°C', '°F', 'K'],
  Special: ['•', '○', '●', '□', '■', '△', '▲', '☆', '★', '✓', '✗', '…', '—', '–'],
};

export function TableCellEditor({
  value,
  onChange,
  onDelete,
  showDelete = false,
  isHeader = false,
  placeholder = 'Cell',
}: TableCellEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showSymbols, setShowSymbols] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [formatting, setFormatting] = useState({
    bold: false,
    italic: false,
    underline: false,
    align: 'left' as 'left' | 'center' | 'right',
  });

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSymbolClick = (symbol: string) => {
    onChange(value + symbol);
    setShowSymbols(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      setIsEditing(false);
    }
    if (e.key === 'Escape') {
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <div className="relative group">
        <div className="flex items-center gap-1">
          <Input
            ref={inputRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={() => setIsEditing(false)}
            onKeyDown={handleKeyDown}
            className={`bg-background border-border text-sm ${isHeader ? 'font-semibold h-8' : 'h-7'} flex-1`}
            placeholder={placeholder}
          />
          <Popover open={showSymbols} onOpenChange={setShowSymbols}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSymbols(!showSymbols);
                }}
              >
                <Type className="h-3 w-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-2" align="start">
              <Tabs defaultValue="Math" className="w-full">
                <TabsList className="grid w-full grid-cols-4 h-8">
                  <TabsTrigger value="Math" className="text-xs">Math</TabsTrigger>
                  <TabsTrigger value="Letters" className="text-xs">Letters</TabsTrigger>
                  <TabsTrigger value="Lines" className="text-xs">Lines</TabsTrigger>
                  <TabsTrigger value="Arrows" className="text-xs">More</TabsTrigger>
                </TabsList>
                {Object.entries(SYMBOLS).slice(0, 4).map(([category, symbols]) => (
                  <TabsContent key={category} value={category} className="mt-2">
                    <div className="grid grid-cols-8 gap-1 max-h-40 overflow-y-auto">
                      {symbols.map((symbol, idx) => (
                        <Button
                          key={idx}
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 text-sm"
                          onClick={() => handleSymbolClick(symbol)}
                        >
                          {symbol}
                        </Button>
                      ))}
                    </div>
                  </TabsContent>
                ))}
                <TabsContent value="Arrows" className="mt-2">
                  <Tabs defaultValue="Arrows" className="w-full">
                    <TabsList className="grid w-full grid-cols-4 h-8">
                      <TabsTrigger value="Arrows" className="text-xs">Arrows</TabsTrigger>
                      <TabsTrigger value="Currency" className="text-xs">Currency</TabsTrigger>
                      <TabsTrigger value="Units" className="text-xs">Units</TabsTrigger>
                      <TabsTrigger value="Special" className="text-xs">Special</TabsTrigger>
                    </TabsList>
                    {Object.entries(SYMBOLS).slice(4).map(([category, symbols]) => (
                      <TabsContent key={category} value={category} className="mt-2">
                        <div className="grid grid-cols-8 gap-1 max-h-40 overflow-y-auto">
                          {symbols.map((symbol, idx) => (
                            <Button
                              key={idx}
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 text-sm"
                              onClick={() => handleSymbolClick(symbol)}
                            >
                              {symbol}
                            </Button>
                          ))}
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                </TabsContent>
              </Tabs>
            </PopoverContent>
          </Popover>
          {showDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.();
              }}
              className="h-7 w-7 p-0 text-destructive hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className={`cursor-text hover:bg-muted/50 p-1 rounded border border-transparent hover:border-border transition-colors min-h-[28px] flex items-center ${
        isHeader ? 'font-semibold' : ''
      } ${!value ? 'text-muted-foreground italic' : ''}`}
      title="Click to edit"
    >
      {value || <span className="text-muted-foreground italic">{placeholder}</span>}
    </div>
  );
}

