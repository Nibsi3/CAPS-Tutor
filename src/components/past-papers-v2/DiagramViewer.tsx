'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ZoomIn, ZoomOut, RotateCw, Download } from 'lucide-react';
import { EditorQuestion } from '@/lib/past-papers-v2/types';
import { appwriteConfig } from '@/appwrite/config';

interface DiagramViewerProps {
  question: EditorQuestion;
  onUpdate?: (question: EditorQuestion) => void;
  editable?: boolean;
}

export function DiagramViewer({ question, onUpdate, editable = false }: DiagramViewerProps) {
  const diagramData = question.diagramData || {};
  const [zoom, setZoom] = useState(1);
  const [label, setLabel] = useState<string>(diagramData.label || '');
  const [title, setTitle] = useState<string>(diagramData.title || '');

  // Get image URL - check both diagramData.imageFileId and question.imageFileId
  const getImageUrl = () => {
    const imageFileId = diagramData.imageFileId || question.imageFileId;
    console.log('[DiagramViewer] imageFileId:', imageFileId);
    console.log('[DiagramViewer] diagramData:', diagramData);
    console.log('[DiagramViewer] question.imageFileId:', question.imageFileId);
    
    if (imageFileId) {
      const QUESTION_IMAGES_BUCKET_ID = '690dafea0021f232399e';
      // Appwrite endpoint already includes /v1, so path should be /storage/buckets/... not /storage/v1/buckets/...
      const url = `${appwriteConfig.endpoint}/storage/buckets/${QUESTION_IMAGES_BUCKET_ID}/files/${imageFileId}/view?project=${appwriteConfig.projectId}`;
      console.log('[DiagramViewer] Constructed image URL:', url);
      return url;
    }
    if (diagramData.imageData) {
      console.log('[DiagramViewer] Using imageData (base64)');
      return diagramData.imageData;
    }
    console.log('[DiagramViewer] No image URL available');
    return null;
  };

  const imageUrl = getImageUrl();

  const handleZoomIn = () => {
    setZoom(Math.min(zoom + 0.1, 3));
  };

  const handleZoomOut = () => {
    setZoom(Math.max(zoom - 0.1, 0.5));
  };

  const handleReset = () => {
    setZoom(1);
  };

  const handleSave = () => {
    if (onUpdate) {
      const updatedQuestion: EditorQuestion = {
        ...question,
        diagramData: {
          ...diagramData,
          label,
          title,
        },
      };
      onUpdate(updatedQuestion);
    }
  };

  if (!imageUrl) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          No diagram image available
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Diagram Viewer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Editable fields */}
          {editable && (
            <>
              <div className="grid gap-2">
                <Label>Diagram Label</Label>
                <Input
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="e.g., Diagram 1, Figure 2"
                />
              </div>
              <div className="grid gap-2">
                <Label>Title/Description</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Diagram title or description"
                />
              </div>
            </>
          )}

          {/* Display label and title if not editable */}
          {!editable && (label || title) && (
            <div className="space-y-1">
              {label && <p className="font-semibold">{label}</p>}
              {title && <p className="text-sm text-muted-foreground">{title}</p>}
            </div>
          )}

          {/* Zoom Controls */}
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={handleZoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm w-16 text-center">{Math.round(zoom * 100)}%</span>
            <Button type="button" variant="outline" size="sm" onClick={handleZoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={handleReset}>
              <RotateCw className="h-4 w-4" />
            </Button>
          </div>

          {/* Image Display */}
          <div className="border rounded-md overflow-auto bg-muted/50 p-4">
            <div
              className="inline-block"
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: 'top left',
              }}
            >
              {imageUrl.startsWith('data:') ? (
                <img
                  src={imageUrl}
                  alt={label || title || 'Diagram'}
                  className="max-w-full h-auto"
                  onError={(e) => {
                    console.error('[DiagramViewer] Image load error:', e);
                    console.error('[DiagramViewer] Failed URL:', imageUrl);
                  }}
                  onLoad={() => {
                    console.log('[DiagramViewer] Image loaded successfully:', imageUrl);
                  }}
                />
              ) : (
                <img
                  src={imageUrl}
                  alt={label || title || 'Diagram'}
                  className="max-w-full h-auto"
                  onError={(e) => {
                    console.error('[DiagramViewer] Image load error:', e);
                    console.error('[DiagramViewer] Failed URL:', imageUrl);
                  }}
                  onLoad={() => {
                    console.log('[DiagramViewer] Image loaded successfully:', imageUrl);
                  }}
                />
              )}
            </div>
          </div>

          {/* Save button for editable mode */}
          {editable && onUpdate && (
            <Button onClick={handleSave} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Save Diagram Data
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

