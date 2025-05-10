import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, FileDown, X, AlertTriangle } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/components/auth/AuthProvider";
import { handleDownload } from "@/utils/downloadManager"; // Use new download logic

interface ResumePreviewCardProps {
  previewUrl: string;
  previewType: 'pdf' | 'docx';
  onClose: () => void;
}

export const ResumePreviewCard: React.FC<ResumePreviewCardProps> = ({
  previewUrl,
  previewType,
  onClose,
}) => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const { session } = useAuth();
  const [isDownloading, setIsDownloading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [previewError, setPreviewError] = useState<string | null>(null);

  // Create better preview URLs for different file types
  const getViewerUrl = () => {
    if (previewType === 'pdf') {
      return previewUrl;
    } else {
      return `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(previewUrl)}`;
    }
  };

  const handleDownloadClick = async () => {
    try {
      setIsDownloading(true);

      if (!session?.user?.id) {
        toast({
          title: "Not signed in",
          description: "Please sign in to download.",
          variant: "destructive",
        });
        setIsDownloading(false);
        return;
      }

      // Check download permission and update count
      const result = await handleDownload(session.user.id);
      if (!result.allowed) {
        toast({
          title: "No downloads remaining",
          description: "Please purchase more downloads to continue.",
          variant: "destructive",
        });
        window.location.href = "/pricing";
        setIsDownloading(false);
        return;
      }

      // Fetch the file content
      const response = await fetch(previewUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
      }

      // Convert to blob
      const blob = await response.blob();

      // Create a descriptive filename
      const fileName = `optimizedresume.${previewType}`;

      // Download the file
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Download successful",
        description: `Your resume has been downloaded in ${previewType.toUpperCase()} format.`,
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download failed",
        description: "There was a problem downloading your resume. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleOpenInNewTab = () => {
    let urlToOpen: string;
    if (previewType === 'docx') {
      urlToOpen = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(previewUrl)}`;
    } else {
      urlToOpen = previewUrl;
    }
    window.open(urlToOpen, '_blank', 'noopener,noreferrer');
  };

  useEffect(() => {
    const checkUrl = async () => {
      setIsLoading(true);
      setPreviewError(null);

      try {
        const response = await fetch(previewUrl, { method: 'HEAD' });
        if (!response.ok) {
          setPreviewError(`File not accessible (${response.status}). Please try downloading instead.`);
        }
      } catch (error) {
        setPreviewError("Network error. Please try downloading instead.");
      } finally {
        setIsLoading(false);
      }
    };

    if (previewUrl) {
      checkUrl();
    }
  }, [previewUrl]);

  const handleIframeError = () => {
    setPreviewError("The file preview could not be loaded. Please try downloading the file instead.");
    setIsLoading(false);
  };

  return (
    <Card className={`relative bg-white rounded-lg shadow-xl overflow-hidden border-2 border-royal-300 ${isMobile ? 'mx-0 my-4 w-full' : ''}`}>
      <div className="absolute top-2 right-2 z-10 flex space-x-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="bg-white hover:bg-gray-100"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <CardHeader className="p-4 bg-royal-50 border-b border-royal-200">
        <CardTitle className="text-lg font-semibold text-royal-800">
          Your Optimized Resume ({previewType.toUpperCase()})
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className={`w-full ${isMobile ? 'h-[400px]' : 'h-[500px]'} overflow-hidden relative`}>
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="animate-pulse text-royal-600">Loading preview...</div>
            </div>
          )}
          
          {previewError ? (
            <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gray-50">
              <Alert variant="destructive" className="max-w-md">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Preview Error</AlertTitle>
                <AlertDescription>
                  {previewError}
                </AlertDescription>
              </Alert>
              <p className="mt-4 text-sm text-gray-500 text-center">
                Your resume was successfully generated and can still be downloaded using the button below.
              </p>
            </div>
          ) : (
            <iframe 
              src={getViewerUrl()}
              className="w-full h-full" 
              title="Resume Preview"
              onError={handleIframeError}
              frameBorder="0"
            />
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 p-3 bg-gray-50 border-t border-gray-200">
          <Button 
            variant="outline"
            onClick={handleOpenInNewTab}
            className="bg-white border-royal-300 text-royal-700 hover:bg-royal-50 w-full sm:w-auto"
          >
            <Eye className="h-4 w-4 mr-2" />
            Open in New Tab
          </Button>
          <Button 
            onClick={handleDownloadClick}
            disabled={isDownloading}
            className="bg-royal-600 hover:bg-royal-700 text-white w-full sm:w-auto"
          >
            <FileDown className="h-4 w-4 mr-2" />
            {isDownloading ? "Downloading..." : "Download"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
