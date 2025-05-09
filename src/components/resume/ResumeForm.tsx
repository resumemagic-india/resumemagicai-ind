import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { FileDown, Loader2, Target, Zap, Sparkles, Star, Save, Eye, Gift, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { uploadResumeToStorage, saveOptimizedResume } from "@/utils/resumeStorage";
import { ResumeUpload } from "./ResumeUpload";
import { ATSScoreDisplay } from "./ATSScoreDisplay";
import { ResumePreviewCard } from "./ResumePreviewCard";
import { useNavigate, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ResumeTemplate } from "@/types/resume";
import { TemplatePreview } from "./TemplatePreview";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useSubscription } from "@/hooks/use-subscription";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion } from "framer-motion";
import ResumeATSFeedback from "./ResumeATSFeedback";
import { handleDownload } from "@/utils/downloadManager"; // <-- Use new download logic

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit

interface ATSScore {
  overall_score: number;
  keyword_match: number;
  format_compatibility: number;
  matches_found: number;
  total_keywords: number;
  matched_keywords?: string[];
  missing_keywords?: string[];
  suggestion?: string;
  steps_performed?: string[];
}

export const ResumeForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const {
    downloadLimitReached,
    isBasicSubscription,
    isPlusSubscription,
    freeDownloadsRemaining,
    downloadsRemaining,
    purchasedQuantity,
    usedPurchasedDownloads,
    remainingPurchasedDownloads,
    checkSubscriptionStatus,
  } = useSubscription();

  const [jobDescription, setJobDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isLoadingDocx, setIsLoadingDocx] = useState(false);
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ResumeTemplate>("modern");
  const [atsScore, setAtsScore] = useState<ATSScore | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [previewType, setPreviewType] = useState<'pdf' | 'docx' | null>(null);
  const [showMyResumesLink, setShowMyResumesLink] = useState(false);

  useEffect(() => {
    if (location.state?.templateType) {
      const templateFromHome = location.state.templateType as ResumeTemplate;
      if (['modern', 'creative', 'hybrid', 'simple', 'professional_modern', 'professional'].includes(templateFromHome)) {
        setSelectedTemplate(templateFromHome);
        toast({
          title: "Template Selected",
          description: `${templateFromHome.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} template has been selected`,
        });
      }
    }
  }, [location.state?.templateType, toast]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const fileType = selectedFile.type;
      const isValidType = fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || 
                         fileType === "application/pdf";
      
      if (!isValidType) {
        toast({
          title: "Invalid file type",
          description: "Please upload either a .docx or .pdf file",
          variant: "destructive",
        });
        return;
      }

      if (selectedFile.size > MAX_FILE_SIZE) {
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 10MB",
          variant: "destructive",
        });
        return;
      }
      
      setFile(selectedFile);

      const fileName = await uploadResumeToStorage(selectedFile);
      if (fileName) {
        toast({
          title: "File uploaded",
          description: "Your resume has been uploaded successfully",
        });
      } else {
        toast({
          title: "Upload error",
          description: "Failed to upload resume to storage",
          variant: "destructive",
        });
      }
    }
  };

  const getUserDetails = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!profile) return null;

      return {
        firstName: profile.first_name,
        lastName: profile.last_name,
        email: profile.email,
        phoneNumber: profile.phone_number,
        jobTitle: profile.job_title,
        address: profile.address
      };
    } catch (error) {
      console.error('Error fetching user details:', error);
      return null;
    }
  };

  // Unified download logic
  const handleDownloadClick = async (format: 'pdf' | 'docx') => {
    if (!file || !jobDescription) {
      toast({
        title: "Missing information",
        description: "Please provide both a resume file and job description",
        variant: "destructive",
      });
      return;
    }

    // Use new download logic
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Not signed in",
        description: "Please sign in to download.",
        variant: "destructive",
      });
      return;
    }

    const result = await handleDownload(user.id);
    if (!result.allowed) {
      toast({
        title: "No downloads remaining",
        description: "Please purchase more downloads to continue.",
        variant: "destructive",
      });
      navigate("/pricing");
      return;
    }

    if (format === 'docx') {
      setIsLoadingDocx(true);
    } else {
      setIsLoadingPdf(true);
    }

    setPreviewUrl(null);
    setIsPreviewVisible(false);
    setPreviewType(null);

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("jobDescription", jobDescription);
    formData.append("format", format);
    formData.append("template", selectedTemplate);

    const userDetails = await getUserDetails();
    if (userDetails) {
      formData.append("userDetails", JSON.stringify(userDetails));
    }

    const endpoint = "/api/optimize";
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
        method: "POST",
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
        mode: 'cors',
        credentials: 'same-origin',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('Content-Type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();

        if (data.ats_score) {
          setAtsScore(data.ats_score);
        }

        if (data.file_data) {
          const savedFile = await saveOptimizedResume(
            data.file_data,
            data.file_name || `optimized-resume.${format}`,
            format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          );

          if (savedFile && savedFile.publicUrl) {
            setPreviewUrl(savedFile.publicUrl);
            setPreviewType(format);
            setIsPreviewVisible(true);
            setShowMyResumesLink(true);
            toast({
              title: "Generation Complete!",
              description: `Your optimized resume is ready for preview and saved to your account.`,
            });
          } else {
            setShowMyResumesLink(false);
            toast({
              title: "Preview Error",
              description: "Could not save the file for preview.",
              variant: "destructive",
            });
          }

          // Refresh download info in UI
          if (typeof checkSubscriptionStatus === "function") {
            await checkSubscriptionStatus();
          }
        } else {
          setShowMyResumesLink(false);
          throw new Error("No file data received from server");
        }
      } else {
        setShowMyResumesLink(false);
        throw new Error("Unexpected response format from server");
      }
    } catch (error) {
      setShowMyResumesLink(false);
      console.error("Resume optimization error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to optimize resume. Please try again.",
        variant: "destructive",
      });
    } finally {
      if (format === 'docx') {
        setIsLoadingDocx(false);
      } else {
        setIsLoadingPdf(false);
      }
    }
  };

  const handleFeedback = (downloadType: 'docx' | 'pdf') => {
    navigate('/feedback', { 
      state: { 
        downloadType,
        sourcePage: 'dashboard'
      } 
    });
  };

  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
      <Card className="bg-gradient-to-br from-royal-50 via-royal-100/50 to-royal-200/50 border-2 border-royal-200 shadow-lg overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 bg-royal-500 rounded-full p-3">
              <Target className="h-6 w-6 text-white animate-pulse" />
            </div>
          </div>
        </CardContent>
      </Card>

      {downloadLimitReached && (
        <Alert variant="destructive" className="bg-amber-50 border-amber-300 text-amber-800">
          <AlertTitle className="text-amber-900 font-semibold">
            {isBasicSubscription ? "Basic plan limit reached" : "Free download used"}
          </AlertTitle>
          <AlertDescription>
            {isBasicSubscription 
              ? "You've reached the limit of 9 downloads on your Basic plan (1 free + 8 basic). Please upgrade to Plus for unlimited downloads."
              : "You've used your 1 free download. Please subscribe to continue using our services."}
            <div className="mt-2">
              <Button 
                onClick={() => navigate('/pricing')} 
                variant="outline" 
                className="bg-amber-600 text-white hover:bg-amber-700 border-none"
              >
                View Pricing Plans
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {!downloadLimitReached && freeDownloadsRemaining > 0 && !isBasicSubscription && !isPlusSubscription && (
        <Alert className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200 text-emerald-800">
          <Gift className="h-4 w-4 text-emerald-600" />
          <AlertTitle className="text-emerald-900 font-semibold">Free Download Available</AlertTitle>
          <AlertDescription>
            You have 1 free download to optimize your resume. Make it count!
          </AlertDescription>
        </Alert>
      )}

      {isPlusSubscription && (
        <Alert className="bg-gradient-to-r from-cyan-50 to-blue-50 border-cyan-200 text-cyan-800">
          <Star className="h-4 w-4 text-cyan-600" />
          <AlertTitle className="text-cyan-900 font-semibold">Plus Plan Active</AlertTitle>
          <AlertDescription>
            You have unlimited downloads with your Plus subscription. Enjoy all premium features!
          </AlertDescription>
        </Alert>
      )}

      {isBasicSubscription && !downloadLimitReached && (
        <Alert className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200 text-purple-800">
          <Star className="h-4 w-4 text-purple-600" />
          <AlertTitle className="text-purple-900 font-semibold">Basic Plan Active</AlertTitle>
          <AlertDescription>
            Your Basic plan includes up to 9 downloads per month (1 free + 8 basic).
          </AlertDescription>
        </Alert>
      )}

      {isPreviewVisible && previewUrl && previewType && (
        <ResumePreviewCard
          previewUrl={previewUrl}
          previewType={previewType}
          onClose={() => {
            setIsPreviewVisible(false);
          }}
        />
      )}

      {showMyResumesLink && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-4 p-4 rounded-lg bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-700/50 text-center shadow-lg"
        >
          <p className="text-blue-200 text-sm mb-2">
            Your generated resume is saved! Find all your optimized resumes here:
          </p>
          <Link to="/my-resumes">
            <Button
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 group transition-all duration-300"
            >
              Go to My Resumes
              <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
          </Link>
        </motion.div>
      )}

      <div className="space-y-2">
        <label className="block text-sm font-bold text-white">Job Description</label>
        <Textarea
          placeholder="Paste the job description here..."
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          className="min-h-[200px] bg-gradient-to-br from-royal-50 to-white border-royal-200 text-royal-900 placeholder:text-royal-400 focus-visible:ring-royal-400 focus-visible:border-royal-300 transition-colors duration-200"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-bold text-white">Resume (.docx or .pdf)</label>
        <ResumeUpload 
          file={file}
          onFileChange={handleFileChange}
          onRemoveFile={() => setFile(null)}
        />
      </div>
      
      {atsScore && <ResumeATSFeedback ats_score={atsScore} />}

      <div className="grid grid-cols-2 gap-4">
        <Button
          type="button"
          className="relative overflow-hidden group bg-gradient-to-r from-royal-600 via-royal-500 to-royal-400 hover:from-royal-700 hover:via-royal-600 hover:to-royal-500 text-white transition-all duration-300"
          disabled={isLoadingDocx || isLoadingPdf || !file || !jobDescription || downloadLimitReached}
          onClick={() => handleDownloadClick('docx')}
        >
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          {isLoadingDocx ? (
            <>
              <Loader2 className="animate-spin mr-2" />
              Generating...
            </>
          ) : (
            <>
              <Zap className="mr-2 h-4 w-4" />
              {freeDownloadsRemaining > 0 && !isBasicSubscription && !isPlusSubscription
                ? "Use Free Generation (DOCX)"
                : "Generate DOCX"}
            </>
          )}
        </Button>

        <Button
          type="button"
          className="relative overflow-hidden group bg-gradient-to-r from-red-600 via-red-500 to-red-400 hover:from-red-700 hover:via-red-600 hover:to-red-500 text-white transition-all duration-300"
          disabled={isLoadingDocx || isLoadingPdf || !file || !jobDescription || downloadLimitReached}
          onClick={() => handleDownloadClick('pdf')}
        >
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          {isLoadingPdf ? (
            <>
              <Loader2 className="animate-spin mr-2" />
              Generating...
            </>
          ) : (
            <>
              <Zap className="mr-2 h-4 w-4" />
              {freeDownloadsRemaining > 0 && !isBasicSubscription && !isPlusSubscription
                ? "Use Free Generation (PDF)"
                : "Generate PDF"}
            </>
          )}
        </Button>
      </div>

      <footer className="text-center space-y-4">
        <Button
          type="button"
          onClick={() => handleFeedback(isLoadingDocx ? 'docx' : 'pdf')}
          className="bg-gradient-to-r from-purple-600 to-purple-400 text-white hover:from-purple-700 hover:to-purple-500"
        >
          <Star className="w-4 h-4 mr-2" />
          Rate & Provide Feedback
        </Button>
        <p className="text-white/40 text-sm">Powered by advanced AI technology</p>
      </footer>
    </form>
  );
};
