import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { User, LogOut, ChevronLeft, Upload, ArrowRight, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth/AuthProvider";
import { UserProfileModal } from "@/components/account/UserProfileModal";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CareerRoadmapAnalysis } from "@/components/career/CareerRoadmapAnalysis";
import { ResumeUpload } from "@/components/resume/ResumeUpload";
import { extractTextFromFile } from "@/utils/fileParser";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const CareerRoadmap = () => {
  const { toast } = useToast();
  const { session, signOut } = useAuth();
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const navigate = useNavigate();
  const [resumeText, setResumeText] = useState("");
  const [timeframe, setTimeframe] = useState("2");
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState("");
  const [activeTab, setActiveTab] = useState("input");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [storedFilePath, setStoredFilePath] = useState<string | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  
  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error during sign out:", error);
      toast({
        variant: "destructive",
        title: "Error signing out",
        description: "An unexpected error occurred",
      });
    }
  };

  const handleNavigateBack = () => {
    navigate('/home');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    
    if (file) {
      setResumeFile(file);
      setAnalysisError(null);
      
      toast({
        title: "Processing resume",
        description: "Extracting text from your resume...",
      });
      
      try {
        const { text, filePath } = await extractTextFromFile(file);
        setResumeText(text);
        
        if (filePath) {
          setStoredFilePath(filePath);
          console.log("Resume stored in Supabase at path:", filePath);
          toast({
            title: "Resume saved",
            description: "Your resume has been uploaded and processed successfully.",
          });
        } else {
          toast({
            title: "Resume processed",
            description: "Your resume has been processed successfully.",
          });
        }
      } catch (error) {
        console.error("Error processing resume file:", error);
        toast({
          title: "Processing failed",
          description: "Could not extract text from your resume. Please try again with a different file.",
          variant: "destructive",
        });
      }
    }
  };
  
  const handleRemoveFile = () => {
    setResumeFile(null);
    setResumeText("");
    setAnalysisError(null);
    
    if (storedFilePath && session?.user) {
      console.log("Marking file for cleanup:", storedFilePath);
      // We don't delete immediately to avoid interrupting the user flow
      // Actual deletion can be handled by a background process or on session end
    }
    
    setStoredFilePath(null);
  };

  const handleAnalyzeResume = async () => {
    if (!resumeFile) {
      toast({
        title: "Resume required",
        description: "Please upload a resume file to analyze",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setAnalysisError(null);
    
    try {
      console.log("Starting career roadmap analysis...");
      console.log("Timeframe selected:", timeframe);
      
      // Construct the API URL manually with the Supabase project ID
      const apiUrl = `https://ynfyvoljmkxtiezfxcku.supabase.co/functions/v1/career-roadmap-analysis`;
      console.log("Calling API:", apiUrl);
      
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          resumeText,
          timeframe,
          deviceInfo: navigator.userAgent,
          filePath: storedFilePath
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("API response not OK:", response.status, response.statusText);
        console.error("Error data:", data);
        
        setAnalysisError(data.error || `Failed to analyze resume: ${response.status} ${response.statusText}`);
        
        toast({
          title: "Analysis failed",
          description: data.error || "We couldn't analyze your resume. Please try again with a different file format.",
          variant: "destructive",
        });
        return;
      }

      console.log("Analysis received successfully");
      setAnalysisResult(data.roadmapAnalysis);
      setActiveTab("results");
      
      toast({
        title: "Analysis complete",
        description: `Your ${timeframe}-year career roadmap is ready to view`,
      });
    } catch (error) {
      console.error("Error analyzing resume:", error);
      setAnalysisError("An unexpected error occurred while analyzing your resume. Please try again later.");
      
      toast({
        title: "Analysis failed",
        description: "We couldn't analyze your resume. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#071428] via-[#0a1e3c] to-[#0d1e36] text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/30 via-blue-900/20 to-purple-900/30 z-0"></div>
      
      <div className="absolute top-40 left-20 w-72 h-72 bg-blue-500/20 rounded-full filter blur-3xl animate-pulse"></div>
      <div className="absolute bottom-40 right-20 w-80 h-80 bg-purple-500/20 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: "2s", animationDuration: "8s" }}></div>
      <div className="absolute top-1/4 right-1/3 w-64 h-64 bg-cyan-500/20 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: "3.5s", animationDuration: "10s" }}></div>
      
      <div className="absolute inset-0 z-0 opacity-5" style={{ 
        backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
        backgroundSize: '30px 30px'
      }}></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex justify-between items-center mb-10 p-4 rounded-2xl bg-white/5 backdrop-blur-md shadow-lg border border-white/10">
          <Button
            variant="ghost"
            onClick={handleNavigateBack}
            className="text-white/90 hover:text-white group transition-all duration-300 flex items-center gap-2"
          >
            <span className="relative overflow-hidden rounded-full bg-white/20 p-2 transition-all duration-300 group-hover:bg-white/30 group-hover:scale-110">
              <ChevronLeft className="w-4 h-4" />
            </span>
            <span className="font-medium">Back to Home</span>
          </Button>
          
          <div className="flex items-center space-x-4">
            {session?.user?.email && (
              <div className="hidden md:flex items-center px-4 py-2 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm rounded-full border border-white/10 animate-fade-in">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-full p-1.5 mr-2">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm text-white/90">{session.user.email}</span>
              </div>
            )}
            
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setProfileModalOpen(true)}
                className="relative overflow-hidden group px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 backdrop-blur-sm border border-white/20 transition-all duration-300"
              >
                <span className="relative z-10 flex items-center text-white group-hover:text-blue-200 transition-colors">
                  <User className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                  <span className="text-sm">Profile</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/30 to-purple-600/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleSignOut}
                className="relative overflow-hidden group px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 backdrop-blur-sm border border-white/20 transition-all duration-300"
              >
                <span className="relative z-10 flex items-center text-white group-hover:text-blue-200 transition-colors">
                  <span className="text-sm">Sign Out</span>
                  <LogOut className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/30 to-purple-600/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-6 mb-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400">
              Career Roadmap Analysis
            </span>
          </h1>
          <p className="text-lg text-white/70 max-w-3xl">
            Get a predictive analysis of your career path based on your resume. Our AI will analyze your skills and experience 
            to provide a roadmap for success in the next 2-5 years.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-5xl mx-auto">
          <TabsList className="grid w-full grid-cols-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-1">
            <TabsTrigger 
              value="input" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600/30 data-[state=active]:to-purple-600/30 rounded-lg"
            >
              Upload Resume
            </TabsTrigger>
            <TabsTrigger 
              value="results" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600/30 data-[state=active]:to-purple-600/30 rounded-lg"
              disabled={!analysisResult}
            >
              Analysis Results
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="input" className="mt-6">
            <Card className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl shadow-lg overflow-hidden">
              <CardHeader>
                <CardTitle className="text-2xl text-white/90">Resume Analysis</CardTitle>
                <CardDescription className="text-white/60">
                  Upload your resume to get career path predictions and skill recommendations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {analysisError && (
                  <Alert variant="destructive" className="bg-red-900/20 border-red-800">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error Processing Resume</AlertTitle>
                    <AlertDescription className="mt-2">
                      {analysisError}
                      <p className="mt-2 text-sm">
                        Try uploading a plain text (.txt) version of your resume for best results, or ensure your document is not password protected.
                      </p>
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="resume-upload" className="text-white/80">Upload Resume</Label>
                  <ResumeUpload 
                    file={resumeFile} 
                    onFileChange={handleFileChange} 
                    onRemoveFile={handleRemoveFile} 
                  />
                  <p className="text-sm text-white/50 mt-1">
                    Supported formats: .docx, .pdf, .txt (recommended for best results)
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="timeframe" className="text-white/80">Future Timeframe</Label>
                  <div className="w-full max-w-xs">
                    <RadioGroup 
                      value={timeframe} 
                      onValueChange={setTimeframe}
                      className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-6"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem 
                          value="2" 
                          id="r1" 
                          className="text-blue-400 border-white/20"
                        />
                        <Label htmlFor="r1" className="text-white/80">Next 2 Years</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem 
                          value="5" 
                          id="r2" 
                          className="text-blue-400 border-white/20"
                        />
                        <Label htmlFor="r2" className="text-white/80">Next 5 Years</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end space-x-4 border-t border-white/10 pt-4">
                <Button 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium"
                  onClick={handleAnalyzeResume}
                  disabled={isLoading || !resumeFile}
                >
                  {isLoading ? (
                    <>
                      <span className="mr-2">Analyzing</span>
                      <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                    </>
                  ) : (
                    <>
                      <span>Analyze Career Path</span>
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="results" className="mt-6">
            {analysisResult && (
              <CareerRoadmapAnalysis 
                analysis={analysisResult} 
                timeframe={timeframe}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      <UserProfileModal 
        open={profileModalOpen} 
        onOpenChange={setProfileModalOpen} 
      />
    </div>
  );
};

export default CareerRoadmap;
