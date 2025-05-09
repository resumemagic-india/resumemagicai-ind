import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Sparkles, Brain, Loader2, Info, CheckCircle, Lock } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/use-subscription";

const JobInterviewQuestions = () => {
  const navigate = useNavigate();
  const { session, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const { 
    isPlusSubscription,
    isSubscriptionPlus,
    hasJobInterviewQuestionsAccess,
    loading: subscriptionLoading 
  } = useSubscription();
  const [jobDescription, setJobDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState("");
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !session) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to access this feature",
        variant: "destructive",
      });
      navigate("/auth");
    }
  }, [session, authLoading, navigate, toast]);

  const handleBackToHome = () => {
    navigate("/home");
  };

  const handleGenerateQuestions = async () => {
    if (!jobDescription.trim()) {
      toast({
        title: "Empty Job Description",
        description: "Please enter a job description to generate interview questions",
        variant: "destructive",
      });
      return;
    }

    if (!hasJobInterviewQuestionsAccess) {
      toast({
        title: "Premium Feature",
        description: "This feature is available exclusively for Plus or Premium plan subscribers",
        variant: "destructive",
      });
      navigate("/pricing");
      return;
    }

    try {
      setIsGenerating(true);
      
      const { data, error } = await supabase.functions.invoke('interview-questions', {
        body: { jobDescription },
      });
      
      if (error) {
        throw new Error(error.message || "Failed to generate questions");
      }
      
      setGeneratedQuestions(data.generatedQuestions);
      
      // Scroll to results
      setTimeout(() => {
        if (contentRef.current) {
          contentRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
      
    } catch (error) {
      console.error("Error generating questions:", error);
      toast({
        title: "Error",
        description: "Failed to generate interview questions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const isLoading = authLoading || subscriptionLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#020617] to-[#0F172A] text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-8">
          <Button
            variant="ghost"
            onClick={handleBackToHome}
            className="group flex items-center space-x-2 text-white/80 hover:text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Back to Home</span>
          </Button>

          <div className="flex items-center space-x-2">
            <Brain className="w-8 h-8 text-purple-400" />
            <span className="font-righteous text-2xl bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
              Job Interview Questions
            </span>
          </div>
        </header>

        <div className="relative mb-10">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-xl blur-xl"></div>
          <Card className="relative border border-white/10 bg-white/5 backdrop-blur-sm rounded-xl shadow-xl overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-blue-500"></div>
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 bg-gradient-to-br from-purple-500 to-blue-500 p-3 rounded-full">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold mb-2">Job Interview Questions Generator using Target Job Description</h1>
                  <p className="text-white/70">
                    Prepare for your job interviews with AI-generated questions based on the specific job description.
                    Get comprehensive technical, behavioral, and situational questions tailored to the role.
                  </p>
                  
                  {!hasJobInterviewQuestionsAccess && (
                    <div className="mt-4 flex items-start space-x-3 bg-amber-950/30 border border-amber-500/30 p-3 rounded-lg">
                      <Lock className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-amber-300 font-medium">Premium Feature</p>
                        <p className="text-white/70 text-sm">
                          This feature is available exclusively for Plus or Premium plan subscribers. 
                          <Button 
                            variant="link" 
                            className="p-0 h-auto text-amber-400 hover:text-amber-300" 
                            onClick={() => navigate("/pricing")}
                          >
                            Upgrade now
                          </Button>
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {hasJobInterviewQuestionsAccess && (
                    <div className="mt-4 flex items-start space-x-3 bg-emerald-950/30 border border-emerald-500/30 p-3 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-emerald-300 font-medium">Premium Feature</p>
                        <p className="text-white/70 text-sm">
                          You have access to this premium feature with your {isSubscriptionPlus ? "Premium" : "Plus"} subscription.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-8">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl shadow-xl p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Info className="mr-2 h-5 w-5 text-blue-400" />
              Enter Job Description
            </h2>
            
            <div className="space-y-4">
              <Textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the complete job description here..."
                className="min-h-[200px] bg-white/5 border-white/10 text-white placeholder:text-white/40"
              />
              
              <Button
                onClick={handleGenerateQuestions}
                disabled={isGenerating || !jobDescription.trim()}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Questions...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Interview Questions
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {generatedQuestions && (
            <div 
              ref={contentRef}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl shadow-xl p-6"
            >
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Brain className="mr-2 h-5 w-5 text-purple-400" />
                Generated Interview Questions
              </h2>
              
              <div className="prose prose-invert max-w-none">
                {generatedQuestions.split('\n\n').map((paragraph, index) => (
                  <div key={index} className="mb-4">
                    {paragraph.split('\n').map((line, lineIndex) => {
                      // Check if the line is a heading (starts with #)
                      if (line.startsWith('#')) {
                        const headingLevel = line.match(/^#+/)[0].length;
                        const headingText = line.replace(/^#+\s*/, '');
                        
                        if (headingLevel === 1) {
                          return (
                            <h2 key={lineIndex} className="text-xl font-bold text-purple-300 mt-6 mb-3">
                              {headingText}
                            </h2>
                          );
                        } else {
                          return (
                            <h3 key={lineIndex} className="text-lg font-semibold text-blue-300 mt-4 mb-2">
                              {headingText}
                            </h3>
                          );
                        }
                      } else if (line.startsWith('- ') || line.startsWith('* ')) {
                        // It's a list item
                        return (
                          <div key={lineIndex} className="flex items-start mb-2">
                            <div className="text-purple-400 mr-2 mt-0.5">•</div>
                            <div>{line.replace(/^[-*]\s*/, '')}</div>
                          </div>
                        );
                      } else if (line.match(/^\d+\.\s/)) {
                        // It's a numbered list item
                        const [, number, text] = line.match(/^(\d+)\.\s(.*)/);
                        return (
                          <div key={lineIndex} className="flex items-start mb-2">
                            <div className="text-blue-400 mr-2 w-5 text-right">{number}.</div>
                            <div>{text}</div>
                          </div>
                        );
                      } else if (line.trim() === '') {
                        return <div key={lineIndex} className="h-2"></div>;
                      } else {
                        return <p key={lineIndex} className="mb-2">{line}</p>;
                      }
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-8 text-center text-sm text-white/40">
          <p>
            Use this tool to prepare for your interviews and
            increase your chances of landing your dream job
          </p>
        </div>
      </div>
    </div>
  );
};

export default JobInterviewQuestions;
