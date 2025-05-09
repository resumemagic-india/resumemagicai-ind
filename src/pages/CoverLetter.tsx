import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ChevronLeft, LogOut, Loader2, SendHorizontal, Copy, Download, Star, User, FileText, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import jsPDF from 'jspdf';
import { updateDownloadCount } from "@/utils/resumeStorage";
import { detectMobileDevice } from "@/hooks/use-mobile";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useSubscription } from "@/hooks/use-subscription";
import { useIsMobile } from "@/hooks/use-mobile";
import { UserProfileModal } from "@/components/account/UserProfileModal";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Profile {
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone_number: string | null;
  job_title: string | null;
  address: string | null;
}

const CoverLetter = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { session, signOut } = useAuth();
  const isMobile = useIsMobile();
  const { handleDownloadAttempt, downloadLimitReached, isBasicSubscription, isSubscriptionPlus, 
         freeDownloadsRemaining, isPerDocumentSubscription, totalRemainingDocuments,
         downloadsRemaining, totalDownloads } = useSubscription();
  const [workExperience, setWorkExperience] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [hrName, setHrName] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (session?.user?.id) {
        const { data, error } = await supabase
          .from('profiles')
          .select('first_name, last_name, email, phone_number, job_title, address')
          .eq('id', session.user.id)
          .single();

        if (error) {
          toast({
            variant: "destructive",
            title: "Error fetching profile",
            description: error.message,
          });
        } else {
          setProfile(data);
        }
      }
    };

    fetchProfile();
  }, [session?.user?.id, toast]);

  const handleNavigateBack = () => {
    navigate('/home');
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error signing out",
        description: error instanceof Error ? error.message : "An error occurred",
      });
    }
  };

  const generateCoverLetter = async () => {
    if (!workExperience || !jobDescription || !companyName) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please provide work experience, job description, and company name.",
      });
      return;
    }

    setIsGenerating(true);
    setCoverLetter('');
    try {
      const response = await supabase.functions.invoke('generate-cover-letter', {
        body: {
          workExperience,
          jobDescription,
          profile,
          companyName,
          hrName,
          deviceInfo: detectMobileDevice() ? 'mobile' : 'desktop'
        },
      });

      if (response.error) throw new Error(response.error.message);
      setCoverLetter(response.data.coverLetter);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error generating cover letter",
        description: error instanceof Error ? error.message : "An error occurred",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyToClipboard = async () => {
    if (!coverLetter) return;
    
    try {
      await navigator.clipboard.writeText(coverLetter);
      toast({
        title: "Copied to clipboard",
        description: "Cover letter has been copied to your clipboard.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to copy",
        description: "Please try copying manually.",
      });
    }
  };

  const handleExportToPDF = async () => {
    if (!coverLetter) return;

    const canProceed = await handleDownloadAttempt();
    if (!canProceed) return;

    try {
      const pdf = new jsPDF();
      
      pdf.setFontSize(12);
      const lineHeight = 7;
      
      const isMobileDevice = detectMobileDevice();
      console.log(`Exporting cover letter as PDF. Mobile device: ${isMobileDevice}`);
      
      const splitText = pdf.splitTextToSize(coverLetter, 180);
      
      let yPosition = 20;
      splitText.forEach(line => {
        if (yPosition > 280) {
          pdf.addPage();
          yPosition = 20;
        }
        pdf.text(line, 15, yPosition);
        yPosition += lineHeight;
      });
      
      pdf.save(`cover-letter-${companyName.toLowerCase().replace(/\s+/g, '-')}.pdf`);

      console.log("Cover letter downloaded");
      
      toast({
        title: "Export successful",
        description: "Cover letter has been exported as a PDF document.",
      });
    } catch (error) {
      console.error("PDF export error:", error);
      toast({
        variant: "destructive",
        title: "Failed to export",
        description: "There was an error generating the PDF.",
      });
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
                  <Settings className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="space-y-4">
              {downloadLimitReached && (
                <Alert variant="destructive" className="bg-amber-900/30 border-amber-700 text-amber-200">
                  <AlertTitle className="text-amber-100 font-semibold">
                    {isBasicSubscription ? "Basic plan limit reached" : (isPerDocumentSubscription ? "No Documents Remaining" : "Free usage limit reached")}
                  </AlertTitle>
                  <AlertDescription>
                    {isBasicSubscription 
                      ? "You've used your downloads for this plan. Upgrade to Subscription Plus for unlimited downloads or purchase more documents."
                      : isPerDocumentSubscription
                        ? "You've used all your purchased documents. Purchase more to continue downloading."
                        : "You've used your free download. Please subscribe or purchase documents to continue."}
                    <div className="mt-2">
                      <Button 
                        onClick={() => navigate('/pricing')} 
                        variant="outline" 
                        className="bg-amber-600 text-white hover:bg-amber-700 border-none text-xs h-8"
                      >
                        View Plans / Purchase
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {!downloadLimitReached && freeDownloadsRemaining > 0 && !isBasicSubscription && !isSubscriptionPlus && !isPerDocumentSubscription && (
                <Alert className="bg-blue-900/30 border-blue-700 text-blue-200">
                  <AlertTitle className="text-blue-100 font-semibold">Free Download Available</AlertTitle>
                  <AlertDescription>
                    You have {freeDownloadsRemaining} free download remaining. Subscribe or purchase documents for more.
                  </AlertDescription>
                </Alert>
              )}

              {isPerDocumentSubscription && totalRemainingDocuments > 0 && (
                <Alert className="bg-gradient-to-r from-amber-900/30 to-yellow-900/30 border-amber-700 text-amber-200">
                  <FileText className="h-4 w-4 text-amber-400" />
                  <AlertTitle className="text-amber-100 font-semibold">Document Purchase Active</AlertTitle>
                  <AlertDescription>
                    You have {totalRemainingDocuments} document download{totalRemainingDocuments !== 1 ? 's' : ''} remaining.
                  </AlertDescription>
                </Alert>
              )}

              {isSubscriptionPlus && (
                <Alert className="bg-gradient-to-r from-cyan-900/30 to-blue-900/30 border-cyan-700 text-cyan-200">
                  <Star className="h-4 w-4 text-cyan-400" />
                  <AlertTitle className="text-cyan-100 font-semibold">Subscription Plus Active</AlertTitle>
                  <AlertDescription>
                    Unlimited downloads and premium features enabled.
                  </AlertDescription>
                </Alert>
              )}

              {isBasicSubscription && !downloadLimitReached && (
                <Alert className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border-purple-700 text-purple-200">
                  <Star className="h-4 w-4 text-purple-400" />
                  <AlertTitle className="text-purple-100 font-semibold">Basic Plan Active</AlertTitle>
                  <AlertDescription>
                    Downloads remaining: {downloadsRemaining ?? 0} / {totalDownloads ?? 8}.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {profile && (
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-base font-medium text-white/80">Your Details (for context)</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-white/60 space-y-1">
                  <p>{profile.first_name} {profile.last_name}</p>
                  <p>{profile.email}</p>
                  {profile.phone_number && <p>{profile.phone_number}</p>}
                  {profile.job_title && <p>{profile.job_title}</p>}
                  {profile.address && <p>{profile.address}</p>}
                </CardContent>
              </Card>
            )}

            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-3 text-cyan-300">1. Company & Role Details</h2>
                <div className="space-y-4 p-4 bg-white/5 rounded-lg border border-white/10">
                  <div>
                    <label htmlFor="companyName" className="text-sm text-white/80 mb-1 block">Company Name Applying For *</label>
                    <Input
                      id="companyName"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="E.g., Google, Acme Corp"
                      className="bg-white/10 border-white/20 focus:border-cyan-400 focus:ring-cyan-400"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="hrName" className="text-sm text-white/80 mb-1 block">HR/Hiring Manager Name (Optional)</label>
                    <Input
                      id="hrName"
                      value={hrName}
                      onChange={(e) => setHrName(e.target.value)}
                      placeholder="E.g., Jane Doe (if known)"
                      className="bg-white/10 border-white/20 focus:border-cyan-400 focus:ring-cyan-400"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <h2 className="text-lg font-semibold mb-3 text-blue-300">2. Your Experience Summary *</h2>
                <Textarea
                  value={workExperience}
                  onChange={(e) => setWorkExperience(e.target.value)}
                  placeholder="Briefly summarize your key skills and experiences relevant to the role. Example: '5+ years in software development, specializing in React and Node.js. Proven ability to lead projects and deliver high-quality code.'"
                  className="min-h-[150px] bg-white/10 border-white/20 text-white focus:border-blue-400 focus:ring-blue-400"
                  required
                />
              </div>
              
              <div>
                <h2 className="text-lg font-semibold mb-3 text-purple-300">3. Job Description *</h2>
                <Textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the full job description here. The more detail, the better the AI can tailor the cover letter."
                  className="min-h-[200px] bg-white/10 border-white/20 text-white focus:border-purple-400 focus:ring-purple-400"
                  required
                />
              </div>
              
              <Button
                onClick={generateCoverLetter}
                disabled={isGenerating || !workExperience || !jobDescription || !companyName}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-lg py-3 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Generating Your Cover Letter...
                  </>
                ) : (
                  <>
                    <SendHorizontal className="w-5 h-5 mr-2" />
                    Generate Cover Letter
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="lg:sticky lg:top-8 h-fit">
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm min-h-[60vh] flex flex-col">
              <CardHeader className="flex flex-row justify-between items-center border-b border-white/10 pb-3">
                <CardTitle className="text-lg font-semibold text-white/90">Generated Cover Letter</CardTitle>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleCopyToClipboard} 
                    disabled={!coverLetter || isGenerating}
                    className="bg-white/10 border-white/20 text-white/80 hover:bg-white/20"
                  >
                    <Copy className="w-3 h-3 mr-1.5" /> Copy
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleExportToPDF} 
                    disabled={!coverLetter || isGenerating || downloadLimitReached}
                    className="bg-white/10 border-white/20 text-white/80 hover:bg-white/20 disabled:opacity-50"
                  >
                    <Download className="w-3 h-3 mr-1.5" /> PDF
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex-grow p-4 pt-6">
                {isGenerating && (
                  <div className="flex flex-col items-center justify-center h-full text-white/60">
                    <Loader2 className="w-8 h-8 mb-4 animate-spin text-cyan-400" />
                    <p>Generating your personalized cover letter...</p>
                    <p className="text-xs mt-1">This may take a moment.</p>
                  </div>
                )}
                {!isGenerating && !coverLetter && (
                  <div className="flex flex-col items-center justify-center h-full text-white/50">
                    <FileText className="w-12 h-12 mb-4" />
                    <p>Your generated cover letter will appear here.</p>
                    <p className="text-sm mt-1">Fill in the details on the left and click "Generate".</p>
                  </div>
                )}
                {!isGenerating && coverLetter && (
                  <div className="prose prose-sm prose-invert max-w-none whitespace-pre-wrap text-white/90">
                    {coverLetter}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <UserProfileModal 
        open={profileModalOpen} 
        onOpenChange={setProfileModalOpen} 
      />
    </div>
  );
};

export default CoverLetter;
