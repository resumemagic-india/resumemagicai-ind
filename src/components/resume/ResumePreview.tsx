import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Monitor, Smartphone, Undo2, Redo2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { UnifiedResumeRequest, PreviewResponse } from '@/types/resume';
import { getResumePreview } from '@/services/resumeService';
import { useAuth } from '@/components/auth/AuthProvider';

interface ResumePreviewProps {
  resumeData: UnifiedResumeRequest;
  onSave: (editedContent: string) => void;
}

const ResumePreview: React.FC<ResumePreviewProps> = ({ resumeData, onSave }) => {
  const [previewHtml, setPreviewHtml] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { session } = useAuth();

  useEffect(() => {
    generatePreview();
  }, [resumeData]);

  const generatePreview = async () => {
    if (!session?.access_token) return;
    
    setIsLoading(true);
    try {
      const data = await getResumePreview(resumeData, session.access_token);
      setPreviewHtml(data.preview_html);
      // Initialize history with the first preview
      setHistory([data.preview_html]);
      setHistoryIndex(0);
    } catch (error) {
      console.error('Error generating preview:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate preview",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!previewRef.current) return;

    const currentContent = previewRef.current.innerHTML;
    onSave(currentContent);

    setHistory(prevHistory => [...prevHistory.slice(0, historyIndex + 1), currentContent]);
    setHistoryIndex(historyIndex + 1);
    setIsEditing(false);

    toast({
      title: "Saved!",
      description: "Your changes have been saved.",
    });
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setPreviewHtml(history[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setPreviewHtml(history[historyIndex + 1]);
    }
  };

  useEffect(() => {
    if (previewRef.current && history[historyIndex]) {
      previewRef.current.innerHTML = history[historyIndex];
    }
  }, [historyIndex]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 p-5">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 rounded-lg shadow-md">
        <div className="flex flex-wrap gap-2 mb-4">
          <Button
            variant={previewMode === 'desktop' ? 'default' : 'secondary'}
            onClick={() => setPreviewMode('desktop')}
            className="gap-2"
          >
            <Monitor className="h-4 w-4" />
            Desktop View
          </Button>
          <Button
            variant={previewMode === 'mobile' ? 'default' : 'secondary'}
            onClick={() => setPreviewMode('mobile')}
            className="gap-2"
          >
            <Smartphone className="h-4 w-4" />
            Mobile View
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {!isEditing ? (
            <Button onClick={handleEdit}>
              Edit Resume
            </Button>
          ) : (
            <>
              <Button onClick={handleSave} variant="default">
                Save Changes
              </Button>
              <Button
                onClick={handleUndo}
                variant="outline"
                disabled={historyIndex <= 0}
              >
                <Undo2 className="h-4 w-4" />
              </Button>
              <Button
                onClick={handleRedo}
                variant="outline"
                disabled={historyIndex >= history.length - 1}
              >
                <Redo2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>
      
      <div
        ref={previewRef}
        dangerouslySetInnerHTML={{ __html: previewHtml }}
        contentEditable={isEditing}
        className={cn(
          "prose prose-sm max-w-none dark:prose-invert",
          "min-h-[29.7cm] w-full bg-white p-8 shadow-lg",
          previewMode === 'mobile' && "max-w-md mx-auto",
          isEditing && "ring-2 ring-primary",
          !isEditing && "pointer-events-none select-none"
        )}
      />
    </div>
  );
};

export default ResumePreview;
