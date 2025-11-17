'use client';

import { PaperEditorV3 } from '@/components/paper-editor-v3';
import type { ExtractedPaper } from '@/components/paper-editor-v3';
import { useToast } from '@/hooks/use-toast';

export default function PaperEditorV3Page() {
  const { toast } = useToast();

  const handleSave = (paper: ExtractedPaper) => {
    // Here you could save to Appwrite, Firebase, or local storage
    console.log('Saving paper:', paper);
    
    // For now, save to localStorage
    localStorage.setItem('edited-paper', JSON.stringify(paper));
    
    toast({
      title: 'Paper Saved',
      description: 'Paper saved to local storage successfully'
    });
  };

  const handleExport = (paper: ExtractedPaper) => {
    console.log('Exporting paper:', paper);
  };

  return (
    <div className="min-h-screen">
      <PaperEditorV3 
        onSave={handleSave}
        onExport={handleExport}
      />
    </div>
  );
}
