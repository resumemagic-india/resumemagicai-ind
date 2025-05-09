import { AuthButton } from "@/components/auth/AuthButton";
import { useAuth } from "@/components/auth/AuthProvider";
import { Navigate, Link } from "react-router-dom";
import { 
    CircleUser, Database, FileCheck, Bot, Sparkles, FileText, 
    PenTool, Briefcase, Zap, Cog, Instagram, Award, Star, Users, 
    TrendingUp, BadgeCheck, Brain, Layout, ListChecks, FileEdit, 
    Code, Target
} from "lucide-react";
import { FeedbackScroller } from "@/components/feedback/FeedbackScroller";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UserGuide } from "@/components/guide/UserGuide";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
// @ts-ignore
import termsContent from "@/marketing/terms-and-conditions.md?raw";

const Auth = () => {
  const { isAuthenticated, isLoading } = useAuth();

  const features = [
    { icon: FileText, title: "ATS Resumes" },
    { icon: Layout, title: "Resume Enhance" },
    { icon: FileEdit, title: "Cover Letters" },
    { icon: Brain, title: "AI Interviews" },
    { icon: TrendingUp, title: "Career Analysis" },
    { icon: ListChecks, title: "Interview Q's" },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0D2B39] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#4DBADC] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    },
  };

  return (
    <div className="min-h-screen relative bg-[#071B24] text-[#B8E5F2] flex flex-col overflow-x-hidden">
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-[#071B24] via-[#0D2B39] to-[#0F3847]"
          animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          style={{ backgroundSize: '200% 200%' }}
        />
        <div 
          className="absolute inset-0 opacity-[0.07]"
          style={{ 
            backgroundImage: 'radial-gradient(circle, #4DBADC 0.5px, transparent 0.5px)',
            backgroundSize: '30px 30px',
          }}>
        </div>
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              repeating-linear-gradient(45deg, #4DBADC 0, #4DBADC 1px, transparent 1px, transparent 50px),
              repeating-linear-gradient(-45deg, #4DBADC 0, #4DBADC 1px, transparent 1px, transparent 50px)
            `,
            maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 70%)',
            animation: 'moveLines 30s linear infinite',
          }}
        />
        <motion.div 
          className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-[#4DBADC]/5 rounded-full blur-[150px]"
          animate={{ scale: [1, 1.1, 1], x: [-20, 20, -20], y: [-10, 10, -10] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-[#1A85A4]/5 rounded-full blur-[150px]"
          animate={{ scale: [1, 1.05, 1], x: [30, -30, 30], y: [15, -15, 15] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        />
        <motion.div 
          className="absolute top-1/3 right-[5%] w-1/4 h-1/4 bg-[#5ECBE8]/3 rounded-full blur-[100px]"
          animate={{ scale: [1, 1.08, 1], rotate: [0, 10, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        <motion.div 
          className="absolute bottom-[10%] left-[10%] w-1/5 h-1/5 bg-[#4DBADC]/3 rounded-full blur-[80px]"
          animate={{ x: [-15, 15, -15], y: [5, -5, 5] }}
          transition={{ duration: 19, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        />
        <motion.div 
          className="absolute top-[15%] right-[10%] w-16 h-16 opacity-[0.04] text-[#4DBADC]"
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 1.2, type: "spring", stiffness: 100 }}
        >
          <Code className="w-full h-full" />
        </motion.div>
        <motion.div 
          className="absolute bottom-[20%] left-[5%] w-12 h-12 opacity-[0.04] text-[#4DBADC]"
          initial={{ scale: 0, rotate: 45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 1.4, type: "spring", stiffness: 100 }}
        >
          <Target className="w-full h-full" />
        </motion.div>
        <motion.div 
          className="absolute top-[60%] right-[25%] w-10 h-10 opacity-[0.03] text-[#4DBADC]"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1.6, type: "spring", stiffness: 100 }}
        >
          <Brain className="w-full h-full" />
        </motion.div>
      </div>

      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 100 }}
        className="relative z-20 w-full bg-gradient-to-r from-[#071B24]/80 to-[#0D2B39]/80 border-b border-[#4DBADC]/20 backdrop-blur-md py-2"
      >
        <div className="max-w-screen-xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 px-4">
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
      </motion.div>

      <div className="relative z-10 px-4 flex-1 max-w-screen-xl mx-auto w-full flex flex-col-reverse md:flex-row">
        <motion.div 
          className="md:w-1/2 py-10 flex flex-col"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.header 
            className="pt-6 pb-6 flex justify-center md:justify-start items-center"
            variants={itemVariants}
          >
            <div className="flex items-center mb-2 relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-[#4DBADC] to-[#1A85A4] rounded-full blur opacity-40 group-hover:opacity-70 transition duration-700 animate-pulse-slow"></div>
              <div className="relative bg-[#0D2B39] p-3 rounded-full border border-[#4DBADC]/30 shadow-lg">
                <Bot className="w-8 h-8 text-[#4DBADC] group-hover:text-white transition-colors duration-300" />
              </div>
              <h1 className="font-righteous text-4xl ml-4 bg-clip-text text-transparent bg-gradient-to-r from-[#4DBADC] via-[#5ECBE8] to-[#1A85A4] drop-shadow-lg group-hover:from-[#5ECBE8] group-hover:to-[#4DBADC] transition-all duration-500">
                Resume Magic AI
              </h1>
            </div>
          </motion.header>

          <motion.div 
            className="mb-8 px-4 md:px-0"
            variants={itemVariants}
          >
            <h3 className="text-lg font-medium text-center md:text-left text-[#B8E5F2]/90 mb-4">Unlock Your Potential With:</h3>
            <motion.div 
              className="grid grid-cols-2 sm:grid-cols-3 gap-3"
              variants={containerVariants}
            >
              {features.map((feature, index) => (
                <motion.div 
                  key={index} 
                  className="flex items-center space-x-2 p-2 rounded-lg bg-[#0F3847]/40 border border-[#4DBADC]/10 backdrop-blur-sm hover:bg-[#0F3847]/70 hover:border-[#4DBADC]/30 transition-all duration-200 cursor-default shadow-md hover:shadow-lg"
                  variants={itemVariants}
                  whileHover={{ scale: 1.05, y: -2 }}
                >
                  <div className="p-1.5 bg-[#0D2B39]/50 rounded border border-[#4DBADC]/20 shadow-inner">
                    <feature.icon className="w-4 h-4 text-[#4DBADC]" />
                  </div>
                  <span className="text-xs text-[#B8E5F2]/80">{feature.title}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div 
            className="flex-1 flex flex-col items-center justify-center py-6 px-4 md:justify-start"
          >
            <div className="w-full max-w-md relative space-y-6">
              <div className="absolute -inset-1.5 bg-gradient-to-r from-[#4DBADC] via-[#5ECBE8] to-[#1A85A4] rounded-2xl blur-md opacity-60 animate-pulse-slow"></div>
              <div> 
                <AuthButton />
              </div>
            </div>
          </motion.div>
        </motion.div>

        <motion.div 
          className="md:w-1/2 relative flex items-center justify-center p-4 mt-16 md:mt-0 md:pt-48"
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 80 }}
        >
          <div className="absolute top-4 md:top-8 left-0 right-0 z-20 px-4 md:px-10">
            <motion.div 
              className="relative"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <div className="absolute -inset-px bg-gradient-to-r from-[#4DBADC]/50 via-[#5ECBE8]/50 to-[#4DBADC]/50 rounded-xl blur-sm"></div>
              
              <div className="relative bg-gradient-to-br from-[#071B24]/80 to-[#0D2B39]/80 border border-[#4DBADC]/30 rounded-xl p-4 md:p-6 backdrop-blur-md shadow-xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-radial from-[#4DBADC]/10 via-transparent to-transparent opacity-50"></div>
                
                <Sparkles className="absolute -top-3 -left-3 text-[#4DBADC] w-6 h-6 animate-pulse" />
                <Sparkles className="absolute -bottom-3 -right-3 text-[#4DBADC] w-6 h-6 animate-pulse" />
                
                <h2 className="relative z-10 text-xl md:text-2xl font-bold mb-2 text-white text-center">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#4DBADC] to-white">
                    Your Career Breakthrough
                  </span>
                </h2>
                
                <p className="relative z-10 text-sm md:text-base text-[#B8E5F2] leading-relaxed text-center">
                  Create <span className="font-bold text-white">ATS-friendly resumes</span> tailored to your target job description <span className="font-bold text-white">in just a minute</span>, boosting your chances of landing interviews. Join the many users already finding success with our app to secure their <span className="italic text-[#4DBADC]">dream jobs</span>.
                </p>
              </div>
            </motion.div>
          </div>
          
          <div className="relative w-full max-w-lg">
            <div className="absolute inset-0 bg-[#4DBADC]/10 rounded-full blur-3xl animate-pulse-slow"></div>
            
            <motion.div 
              className="relative flex flex-col items-center mt-28 md:mt-24"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              <img 
                src="/lovable-uploads/f8b6c98c-220f-4ffd-a189-72a7ae5969c5.png" 
                alt="AI Resume Assistant Robot" 
                className="w-full max-w-[500px] h-auto z-10 drop-shadow-[0_0_40px_rgba(77,186,220,0.5)]"
              />
              
              {[
                { icon: FileCheck, className: "top-[10%] -right-8", delay: 0.6 },
                { icon: CircleUser, className: "bottom-[30%] -left-12", delay: 0.7 },
                { icon: Database, className: "top-1/3 left-[-15%]", delay: 0.8 },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  className={`absolute backdrop-blur-sm p-3 rounded-lg border border-[#4DBADC]/10 bg-[#0F3847]/30 shadow-lg ${item.className}`}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: item.delay, type: "spring", stiffness: 150 }}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <item.icon className="w-8 h-8 text-[#4DBADC]" />
                </motion.div>
              ))}
              
              <motion.div 
                className="absolute top-[15%] right-[-5%] h-32 w-24 backdrop-blur-sm rounded-lg border border-[#4DBADC]/10 bg-[#0F3847]/30 p-2 flex flex-col gap-1 shadow-lg transform rotate-6"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.9, type: "spring" }}
                whileHover={{ rotate: 0, scale: 1.05 }}
              >
                <div className="h-4 w-full bg-[#4DBADC]/20 rounded"></div>
                <div className="h-3 w-3/4 bg-[#4DBADC]/20 rounded"></div>
                <div className="h-3 w-full bg-[#4DBADC]/20 rounded"></div>
                <div className="h-3 w-2/3 bg-[#4DBADC]/20 rounded"></div>
                <div className="h-3 w-4/5 bg-[#4DBADC]/20 rounded"></div>
              </motion.div>
              
              <div className="absolute bottom-0 w-32 h-4 bg-[#4DBADC] rounded-full blur-xl opacity-40 animate-pulse"></div>
            </motion.div>
            
            <motion.div 
              className="absolute top-10 right-20"
              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.0 }}
            >
              <Sparkles className="text-[#4DBADC] opacity-70 animate-pulse w-6 h-6" />
            </motion.div>
            <motion.div 
              className="absolute bottom-20 left-10"
              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.1 }}
            >
              <Sparkles className="text-[#4DBADC] opacity-70 animate-pulse w-5 h-5" />
            </motion.div>
          </div>
        </motion.div>
      </div>
      
      <motion.div 
        className="py-12 md:py-16 relative z-10 backdrop-blur-lg border-t border-[#4DBADC]/10 bg-gradient-to-b from-[#0F3847]/80 to-[#0D2B39]/80"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
      >
        <div className="max-w-screen-xl mx-auto px-4">
          <motion.div className="text-center mb-12" variants={itemVariants}>
            <h2 className="text-2xl md:text-3xl font-semibold text-white mb-3 relative inline-block">
              <span className="relative z-10">AI-Powered Resume Assistance</span>
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-2/3 h-1 bg-gradient-to-r from-transparent via-[#4DBADC] to-transparent rounded-full"></div>
            </h2>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: FileText, title: "Smart Resume Analysis", description: "Our AI evaluates your resume against industry standards and provides instant optimization suggestions." },
              { icon: PenTool, title: "Professional Templates", description: "Choose from a variety of ATS-friendly resume designs optimized for your industry and career stage." },
              { icon: Zap, title: "Interview Preparation", description: "Practice with our AI interview coach to prepare for common questions and improve your responses." }
            ].map((item, index) => (
              <motion.div 
                key={index}
                className="relative group backdrop-blur-lg rounded-xl p-6 transition-all duration-300 bg-gradient-to-br from-[#0F3847]/40 to-[#0D2B39]/40 border border-[#4DBADC]/10 hover:border-[#4DBADC]/30 shadow-md hover:shadow-xl overflow-hidden"
                variants={itemVariants}
                whileHover={{ y: -5 }}
              >
                <div className="absolute inset-0 bg-gradient-radial from-[#4DBADC]/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative z-10 flex items-center mb-4">
                  <div className="p-2 bg-[#0F3847]/50 rounded-lg mr-3 border border-[#4DBADC]/20 group-hover:border-[#4DBADC]/40 transition-colors">
                    <item.icon className="w-6 h-6 text-[#4DBADC]" />
                  </div>
                  <h3 className="text-white font-medium text-lg">{item.title}</h3>
                </div>
                <p className="relative z-10 text-[#B8E5F2] text-sm">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
      
      <motion.div 
        className="relative z-20 w-full bg-gradient-to-r from-[#071B24] to-[#0D2B39] border-y border-[#4DBADC]/20 py-4 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-[#4DBADC]/10">
                <Award className="w-6 h-6 text-[#4DBADC]" />
              </div>
              <div className="text-center md:text-left">
                <h3 className="text-white text-sm font-medium">Top-Rated Resume Builder</h3>
                <div className="flex items-center mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-3 h-3 fill-[#4DBADC] text-[#4DBADC]" />
                  ))}
                  <span className="text-[#B8E5F2] text-xs ml-1">Highly Rated</span>
                </div>
              </div>
            </div>
            
            <div className="h-8 border-l border-[#4DBADC]/20 hidden md:block"></div>
            
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-[#4DBADC]/10">
                <Users className="w-6 h-6 text-[#4DBADC]" />
              </div>
              <div className="text-center md:text-left">
                <h3 className="text-white text-sm font-medium">Trusted by Job Seekers</h3>
                <p className="text-[#B8E5F2] text-xs">Users found success with our platform</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      
      <div className="relative z-10 flex justify-end max-w-screen-xl mx-auto px-4 py-8">
        <FeedbackScroller />
      </div>
      
      <footer className="relative z-20 py-6 border-t border-[#4DBADC]/10 bg-gradient-to-b from-[#0D2B39]/90 to-[#071B24]/90 backdrop-blur-md">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[#B8E5F2]/50 text-sm">
              © 2025 ResumeMagic AI Services. All rights reserved.
            </p>
            <div className="flex items-center space-x-4">
              <UserGuide />
              <Link to="/pricing" className="text-[#B8E5F2]/50 hover:text-[#B8E5F2] text-sm hover:underline transition-colors duration-200">
                Pricing
              </Link>
              {/* Terms & Conditions Dialog */}
              <Dialog>
                <DialogTrigger className="text-[#B8E5F2]/50 hover:text-[#B8E5F2] text-sm hover:underline transition-colors duration-200">
                  Terms & Conditions
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto bg-[#0D2B39] border-[#4DBADC]/30 text-[#B8E5F2]">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold mb-4 text-white flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-[#4DBADC]" />
                      Terms and Conditions
                    </DialogTitle>
                  </DialogHeader>
                  <div className="prose prose-sm prose-invert max-w-none text-[#B8E5F2]/90">
                    <ReactMarkdown>{termsContent}</ReactMarkdown>
                  </div>
                </DialogContent>
              </Dialog>
              <Dialog>
                <DialogTrigger className="text-[#B8E5F2]/50 hover:text-[#B8E5F2] text-sm hover:underline transition-colors duration-200">
                  Contact
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="text-lg font-bold mb-4">Contact Information</DialogTitle>
                  </DialogHeader>
                  <div className="prose prose-sm max-w-none text-gray-700 mt-2">
                    <p>customer_support@resumemagic-ai.com</p>
                  </div>
                </DialogContent>
              </Dialog>
              <a 
                href="https://www.instagram.com/resumemagic_ai?igsh=bnd0Z2VhcjN0NjNj&utm_source=qr" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center text-[#B8E5F2]/50 hover:text-[#B8E5F2] text-sm hover:underline transition-colors duration-200"
              >
                <Instagram className="w-4 h-4 mr-1" />
                Instagram
              </a>
            </div>
          </div>
        </div>
      </footer>
      
      <style>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.7; }
        }
        @keyframes moveLines {
          0% { background-position: 0 0; }
          100% { background-position: 100px 100px; }
        }
      `}</style>
    </div>
  );
};

export default Auth;
