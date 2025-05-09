
import { Sparkles, Bot, BadgeCheck, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ResumeForm } from "@/components/resume/ResumeForm";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D2B39] via-[#164356] to-[#0D2B39]">
      {/* Top Banner */}
      <div className="w-full bg-gradient-to-r from-[#071B24]/80 to-[#0D2B39]/80 border-b border-[#4DBADC]/20 backdrop-blur-md py-2">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center p-1 bg-[#4DBADC]/10 rounded-full">
              <BadgeCheck className="w-4 h-4 text-[#4DBADC]" />
            </div>
            <span className="text-[#B8E5F2] text-xs">
              <span className="font-semibold">Top Rated</span> by Verified Users
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center p-1 bg-[#4DBADC]/10 rounded-full">
              <TrendingUp className="w-4 h-4 text-[#4DBADC]" />
            </div>
            <span className="text-[#B8E5F2] text-xs">
              <span className="font-semibold">One of the Emerging AI Applications</span> in 2025
            </span>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Bot className="text-[#4DBADC] h-6 w-6" />
          <div className="text-white text-2xl font-righteous">Resume Magic AI</div>
        </div>
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#" className="text-white hover:text-[#4DBADC]">Home</a>
          <a href="#" className="text-white hover:text-[#4DBADC]">Blog</a>
          <a href="#" className="text-white hover:text-[#4DBADC]">About</a>
          <a href="#" className="text-white hover:text-[#4DBADC]">Contact</a>
        </nav>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Side - Content */}
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="text-left mb-8">
              <h1 className="font-righteous text-5xl md:text-6xl font-bold flex items-center gap-2 mb-6">
                <span className="text-white">
                  Resume Magic AI
                </span>
                <span className="relative">
                  <Sparkles className="absolute -top-6 -right-6 text-[#4DBADC] animate-[pulse_3s_ease-in-out_infinite] w-8 h-8" />
                </span>
              </h1>
              <p className="text-[#B8E5F2] text-xl font-poppins max-w-2xl">
                Make your resume stand out with AI enhancements and professional templates
              </p>
            </div>

            {/* Feature Posters */}
            <div className="space-y-8">
              <Card className="bg-[#071B24]/90 backdrop-blur-sm border-[#4DBADC]/20 transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-[#4DBADC]/10">
                <CardHeader className="p-0">
                  <img 
                    src="/lovable-uploads/06d55bb0-1da5-4522-a1f9-96a90a3c4fb4.png"
                    alt="AI Resume Enhancement" 
                    className="w-full h-[400px] object-cover rounded-t-lg"
                  />
                  <div className="p-6">
                    <CardTitle className="text-xl text-white">AI-Powered Enhancement</CardTitle>
                    <CardDescription className="text-[#B8E5F2]/70">
                      Our AI technology optimizes your resume content for maximum impact
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>

              <Card className="bg-[#071B24]/90 backdrop-blur-sm border-[#4DBADC]/20 transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-[#4DBADC]/10">
                <CardHeader className="p-0">
                  <img 
                    src="/lovable-uploads/55bfb5bd-31ee-42f3-9e01-06fc4a32a154.png"
                    alt="Professional Templates" 
                    className="w-full h-[400px] object-cover rounded-t-lg"
                  />
                  <div className="p-6">
                    <CardTitle className="text-xl text-white">Professional Templates</CardTitle>
                    <CardDescription className="text-[#B8E5F2]/70">
                      Choose from a variety of ATS-friendly resume templates
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>

              <Card className="bg-[#071B24]/90 backdrop-blur-sm border-[#4DBADC]/20 transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-[#4DBADC]/10">
                <CardHeader className="p-0">
                  <img 
                    src="/lovable-uploads/d7394c2a-2927-41d9-bd2d-5188c82e4ad1.png"
                    alt="Professional Network" 
                    className="w-full h-[400px] object-cover rounded-t-lg"
                  />
                  <div className="p-6">
                    <CardTitle className="text-xl text-white">Join Our Professional Network</CardTitle>
                    <CardDescription className="text-[#B8E5F2]/70">
                      Connect with like-minded professionals and grow your career
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>
            </div>
          </div>

          {/* Right Side - Auth and Form */}
          <div className="space-y-8">
            <div className="flex flex-col space-y-8">
              <div className="flex gap-4 justify-end">
                <Button asChild variant="outline" className="text-[#4DBADC] border-[#4DBADC] hover:bg-[#4DBADC]/10">
                  <Link to="/auth">Sign In</Link>
                </Button>
                <Button asChild variant="default" className="bg-[#4DBADC] hover:bg-[#3A9DB8] text-white">
                  <Link to="/auth?signup=true">Sign Up</Link>
                </Button>
              </div>
              <img 
                src="/lovable-uploads/e799adbf-54bf-4f4a-b4eb-3ff2d35f32d0.png"
                alt="Resume Magic AI Robot" 
                className="w-full h-[400px] object-contain rounded-lg transform transition-all duration-300 hover:scale-105 drop-shadow-[0_0_30px_rgba(77,186,220,0.3)]"
              />
            </div>

            {/* Resume Form Section */}
            <Card className="backdrop-blur-md bg-[#071B24]/90 border border-[#4DBADC]/20 shadow-xl">
              <CardHeader>
                <CardTitle className="text-[#4DBADC]">Try It Now</CardTitle>
                <CardDescription className="text-[#B8E5F2]/70">
                  Get started with our AI resume builder - no sign-up required for a preview
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResumeForm />
              </CardContent>
            </Card>

            <div className="text-center mt-4 text-white/60 text-sm">
              <p className="mt-1">Contact: customer_support@resumemagic-ai.com | Website: www.resumemagic-ai.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
