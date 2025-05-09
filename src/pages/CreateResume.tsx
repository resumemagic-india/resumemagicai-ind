
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Eye, LogOut, File, ChevronLeft, Plus, Minus, Loader2, AlertTriangle, Star, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ResumeTemplate, WorkExperience, Education, Certification, Achievement } from "@/types/resume";
import TemplateSelector from "@/components/resume/TemplateSelector";
import SummarySection from "@/components/resume/sections/SummarySection";
import WorkExperienceSection from "@/components/resume/sections/WorkExperienceSection";
import EducationSection from "@/components/resume/sections/EducationSection";
import SkillsSection from "@/components/resume/sections/SkillsSection";
import { useAuth } from "@/components/auth/AuthProvider";
//import { updateDownloadCount } from "@/utils/resumeStorage";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useSubscription } from "@/hooks/use-subscription";
import { useIsMobile } from "@/hooks/use-mobile";
import { Separator } from "@/components/ui/separator";

const CreateResume = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { session, signOut } = useAuth();
  const { handleDownloadAttempt, downloadLimitReached, isBasicSubscription, isPlusSubscription, freeDownloadsRemaining } = useSubscription();
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(false);
  const [loadingDocx, setLoadingDocx] = useState(false);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ResumeTemplate>('modern');
  const [jobDescriptionError, setJobDescriptionError] = useState<string | null>(null);

  const [summary, setSummary] = useState("");
  const [workExperiences, setWorkExperiences] = useState<WorkExperience[]>([
    {
      id: "1",
      title: "",
      company: "",
      startDate: "",
      endDate: "",
      projects: [{ id: "1", name: "", description: "", tools: "", responsibilities: "" }],
    },
  ]);
  const [education, setEducation] = useState<Education[]>([
    { id: "1", degree: "", institution: "", startDate: "", endDate: "" },
  ]);
  const [skills, setSkills] = useState({ technical: "", soft: "" });
  const [certifications, setCertifications] = useState<Certification[]>([
    { id: "1", name: "", issuer: "", date: "" },
  ]);
  const [achievements, setAchievements] = useState<Achievement[]>([
    { id: "1", title: "", description: "", date: "" },
  ]);
  const [jobDescription, setJobDescription] = useState("");
  const [customSections, setCustomSections] = useState<{ id: string; title: string; content: string }[]>([]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasChanges]);

  useEffect(() => {
    setHasChanges(true);
  }, [summary, workExperiences, education, skills, certifications, achievements, customSections, jobDescription]);

  const handleSubmit = async (event: React.MouseEvent<HTMLButtonElement>, downloadType: 'docx' | 'pdf') => {
    // Reset previous error state
    setJobDescriptionError(null);
    
    if (!jobDescription.trim()) {
      setJobDescriptionError("Job description is required for resume optimization");
      toast({
        title: "Missing Job Description",
        description: "Please paste a job description to optimize your resume",
        variant: "destructive",
      });
      return;
    }

    // Check if user can download based on their subscription
    const canProceed = await handleDownloadAttempt();
    if (!canProceed) return;

    if (downloadType === 'docx') {
      setLoadingDocx(true);
    } else {
      setLoadingPdf(true);
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error("No user session found");
      }

      console.log("Fetching profile information for header formatting");
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileError) throw profileError;

      const headerDetails = {
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        email: profile.email || "",
        phone_number: profile.phone_number || "",
        address: profile.address || "",
        job_title: profile.job_title || "",
        linkedin: "", // Added for backend API compatibility
        github: "",   // Added for backend API compatibility
        website: ""   // Added for backend API compatibility
      };

      console.log("Preparing resume details for API");
      const resumeDetails = {
        summary,
        work_experience: workExperiences.map(exp => ({
          ...exp,
          projects: exp.projects.map(proj => ({
            ...proj
          }))
        })),
        education: education.map(edu => ({
          ...edu
        })),
        skills,
        certifications: certifications.map(cert => ({
          ...cert
        })),
        achievements: achievements.map(ach => ({
          ...ach
        })),
        custom_sections: customSections,
        job_description: jobDescription
      };

      console.log("Using selected template:", selectedTemplate);

      console.log("Sending request to unified-resume endpoint");

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/unified-resume`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          headerDetails,
          resumeDetails,
          templateType: selectedTemplate,
          downloadType,
          deviceInfo: {
            isMobile: window.innerWidth < 768,
            screenWidth: window.innerWidth,
            userAgent: navigator.userAgent
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('Content-Type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        console.log("Response data:", data);

        if (!data.file_data) {
          throw new Error("No file data received from server");
        }

        console.log("Processing file data for download");
        const binaryString = window.atob(data.file_data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        const blob = new Blob([bytes], { 
          type: downloadType === 'pdf' 
            ? 'application/pdf' 
            : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        });
        
        const fileName = data.file_name || `resume.${downloadType}`;
        const url = window.URL.createObjectURL(blob);
        
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        console.log("Updating download count after successful download");
        await updateDownloadCount();
        
        toast({
          title: "Success",
          description: `Your resume has been generated and downloaded in ${downloadType.toUpperCase()} format`,
        });

        setHasChanges(false);
      } else {
        throw new Error("Unexpected response format from server");
      }
    } catch (error) {
      console.error("Error creating resume:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create resume",
        variant: "destructive",
      });
    } finally {
      if (downloadType === 'docx') {
        setLoadingDocx(false);
      } else {
        setLoadingPdf(false);
      }
    }
  };

  const handleNavigateBack = () => {
    if (hasChanges) {
      const confirmed = window.confirm('You have unsaved changes. Are you sure you want to leave?');
      if (!confirmed) {
        return;
      }
    }
    navigate('/home');
  };

  const handleSignOut = async () => {
    if (hasChanges) {
      const confirmed = window.confirm('You have unsaved changes. Are you sure you want to sign out?');
      if (!confirmed) {
        return;
      }
    }
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Error signing out",
        description: "An error occurred while signing out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const addWorkExperience = () => {
    setWorkExperiences([
      ...workExperiences,
      {
        id: Date.now().toString(),
        title: "",
        company: "",
        startDate: "",
        endDate: "",
        projects: [],
      },
    ]);
  };

  const addProject = (experienceId: string) => {
    setWorkExperiences(
      workExperiences.map((exp) =>
        exp.id === experienceId
          ? {
              ...exp,
              projects: [
                ...exp.projects,
                { id: Date.now().toString(), name: "", description: "", tools: "", responsibilities: "" },
              ],
            }
          : exp
      )
    );
  };

  const addEducation = () => {
    setEducation([
      ...education,
      { id: Date.now().toString(), degree: "", institution: "", startDate: "", endDate: "" },
    ]);
  };

  const addCertification = () => {
    setCertifications([
      ...certifications,
      { id: Date.now().toString(), name: "", issuer: "", date: "" },
    ]);
  };

  const addAchievement = () => {
    setAchievements([
      ...achievements,
      { id: Date.now().toString(), title: "", description: "", date: "" },
    ]);
  };

  const addCustomSection = () => {
    setCustomSections([
      ...customSections,
      { id: Date.now().toString(), title: "", content: "" },
    ]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#071428] via-[#0a1e3c] to-[#0d1e36] text-white relative overflow-hidden">
      {/* Enhanced animated background with particle effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/30 via-blue-900/20 to-purple-900/30 z-0"></div>
      
      {/* Animated orbs with improved animation */}
      <div className="absolute top-40 left-20 w-72 h-72 bg-blue-500/20 rounded-full filter blur-3xl animate-pulse"></div>
      <div className="absolute bottom-40 right-20 w-80 h-80 bg-purple-500/20 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: "2s", animationDuration: "8s" }}></div>
      <div className="absolute top-1/4 right-1/3 w-64 h-64 bg-cyan-500/20 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: "3.5s", animationDuration: "10s" }}></div>
      
      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 z-0 opacity-5" style={{ 
        backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
        backgroundSize: '30px 30px'
      }}></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Enhanced header with glass effect to match Dashboard */}
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

        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
            Create Your Resume
          </h1>
          <p className="mt-2 text-white/60">
            Fill in your details below and let our AI optimize your resume for your target role.
          </p>
        </div>

        <Alert className="mb-6 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30">
          <AlertTriangle className="h-5 w-5 text-blue-400" />
          <AlertTitle>Resume Optimization Tip</AlertTitle>
          <AlertDescription className="text-white/80">
            For best results with AI optimization, provide a detailed job description. Our system will tailor your resume to highlight relevant skills and experience.
          </AlertDescription>
        </Alert>

        <TemplateSelector
          selectedTemplate={selectedTemplate}
          onTemplateChange={setSelectedTemplate}
        />

        {downloadLimitReached && (
          <Alert variant="destructive" className="bg-amber-50 border-amber-300 text-amber-800 my-4">
            <AlertTitle className="text-amber-900 font-semibold">
              {isBasicSubscription ? "Basic plan limit reached" : "Free usage limit reached"}
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
          <Alert className="bg-blue-50 border-blue-200 text-blue-800 my-4">
            <AlertTitle className="text-blue-900 font-semibold">Free Download Available</AlertTitle>
            <AlertDescription>
              You have {freeDownloadsRemaining} free download remaining. Subscribe for more downloads.
            </AlertDescription>
          </Alert>
        )}

        {isPlusSubscription && (
          <Alert className="bg-gradient-to-r from-cyan-50 to-blue-50 border-cyan-200 text-cyan-800 my-4">
            <Star className="h-4 w-4 text-cyan-600" />
            <AlertTitle className="text-cyan-900 font-semibold">Plus Plan Active</AlertTitle>
            <AlertDescription>
              You have unlimited downloads with your Plus subscription. Enjoy all premium features!
            </AlertDescription>
          </Alert>
        )}

        {isBasicSubscription && !downloadLimitReached && (
          <Alert className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200 text-purple-800 my-4">
            <Star className="h-4 w-4 text-purple-600" />
            <AlertTitle className="text-purple-900 font-semibold">Basic Plan Active</AlertTitle>
            <AlertDescription>
              Your Basic plan includes up to 9 downloads per month (1 free + 8 basic).
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-8">
          <section className="bg-white/5 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Job Description</h2>
            <div className="space-y-4">
              <Textarea
                placeholder="Paste the job description here..."
                value={jobDescription}
                onChange={(e) => {
                  setJobDescription(e.target.value);
                  if (e.target.value.trim()) {
                    setJobDescriptionError(null);
                  }
                }}
                className={`min-h-[200px] bg-white/10 border-white/20 text-white ${
                  jobDescriptionError ? "border-red-500 focus:border-red-500" : ""
                }`}
              />
              {jobDescriptionError && (
                <p className="text-red-500 text-sm">{jobDescriptionError}</p>
              )}
              <p className="text-sm text-white/60 italic">
                Adding a detailed job description helps our AI better optimize your resume for this specific role.
              </p>
            </div>
          </section>

          <SummarySection 
            summary={summary}
            onChange={setSummary}
          />

          <WorkExperienceSection
            experiences={workExperiences}
            onExperienceChange={setWorkExperiences}
          />

          <EducationSection
            education={education}
            onEducationChange={setEducation}
          />

          <SkillsSection
            skills={skills}
            onSkillsChange={setSkills}
          />

          <section className="bg-white/5 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Certifications & Licenses</h2>
              <Button 
                onClick={addCertification}
                className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Certification
              </Button>
            </div>
            {certifications.map((cert, index) => (
              <div key={cert.id} className="mb-4 p-4 bg-white/10 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Certification {index + 1}</h3>
                  {certifications.length > 1 && (
                    <Button
                      onClick={() => setCertifications(certifications.filter(c => c.id !== cert.id))}
                      className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
                      size="sm"
                    >
                      <Minus className="w-4 h-4 mr-2" />
                      Remove
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <Input
                    placeholder="Certification Name"
                    value={cert.name}
                    onChange={(e) => setCertifications(certifications.map(c => c.id === cert.id ? { ...c, name: e.target.value } : c))}
                    className="bg-white/10 border-white/20 text-white"
                  />
                  <Input
                    placeholder="Issuing Organization"
                    value={cert.issuer}
                    onChange={(e) => setCertifications(certifications.map(c => c.id === cert.id ? { ...c, issuer: e.target.value } : c))}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
                <Input
                  type="date"
                  placeholder="Date"
                  value={cert.date}
                  onChange={(e) => setCertifications(certifications.map(c => c.id === cert.id ? { ...c, date: e.target.value } : c))}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
            ))}
          </section>

          <section className="bg-white/5 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Achievements & Awards</h2>
              <Button 
                onClick={addAchievement}
                className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Achievement
              </Button>
            </div>
            {achievements.map((achievement, index) => (
              <div key={achievement.id} className="mb-4 p-4 bg-white/10 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Achievement {index + 1}</h3>
                  {achievements.length > 1 && (
                    <Button
                      onClick={() => setAchievements(achievements.filter(a => a.id !== achievement.id))}
                      className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
                      size="sm"
                    >
                      <Minus className="w-4 h-4 mr-2" />
                      Remove
                    </Button>
                  )}
                </div>
                <Input
                  placeholder="Achievement Title"
                  value={achievement.title}
                  onChange={(e) => setAchievements(achievements.map(a => a.id === achievement.id ? { ...a, title: e.target.value } : a))}
                  className="mb-4 bg-white/10 border-white/20 text-white"
                />
                <Textarea
                  placeholder="Achievement Description"
                  value={achievement.description}
                  onChange={(e) => setAchievements(achievements.map(a => a.id === achievement.id ? { ...a, description: e.target.value } : a))}
                  className="mb-4 bg-white/10 border-white/20 text-white"
                />
                <Input
                  type="date"
                  placeholder="Date"
                  value={achievement.date}
                  onChange={(e) => setAchievements(achievements.map(a => a.id === achievement.id ? { ...a, date: e.target.value } : a))}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
            ))}
          </section>

          <section className="bg-white/5 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Custom Sections</h2>
              <Button 
                onClick={addCustomSection}
                className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Section
              </Button>
            </div>
            {customSections.map((section, index) => (
              <div key={section.id} className="mb-4 p-4 bg-white/10 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Section {index + 1}</h3>
                  <Button
                    onClick={() => setCustomSections(customSections.filter(s => s.id !== section.id))}
                    className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
                    size="sm"
                  >
                    <Minus className="w-4 h-4 mr-2" />
                    Remove
                  </Button>
                </div>
                <Input
                  placeholder="Section Title"
                  value={section.title}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => 
                    setCustomSections(customSections.map(item => 
                      item.id === section.id ? { ...item, title: event.target.value } : item
                    ))
                  }
                  className="mb-4 bg-white/10 border-white/20 text-white"
                />
                <Textarea
                  placeholder="Section Content"
                  value={section.content}
                  onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => 
                    setCustomSections(customSections.map(item => 
                      item.id === section.id ? { ...item, content: event.target.value } : item
                    ))
                  }
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
            ))}
          </section>

          <div className="flex justify-end gap-4 mt-8">
            <Button
              onClick={(e) => handleSubmit(e, 'docx')}
              disabled={loadingDocx || loadingPdf || downloadLimitReached}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
            >
              {loadingDocx ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing DOCX...
                </>
              ) : (
                <>
                  <File className="w-4 h-4 mr-2" />
                  Download DOCX
                </>
              )}
            </Button>
            <Button
              onClick={(e) => handleSubmit(e, 'pdf')}
              disabled={loadingDocx || loadingPdf || downloadLimitReached}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
            >
              {loadingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing PDF...
                </>
              ) : (
                <>
                  <File className="w-4 h-4 mr-2" />
                  Download PDF
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateResume;