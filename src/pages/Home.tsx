import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // <-- Ensure this is imported
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { User, LogOut, Download, InfinityIcon, X, Calendar, Instagram, Sparkles, Zap, FileCheck, Bot, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth/AuthProvider";
import { UserProfileModal } from "@/components/account/UserProfileModal";
import { QuickNavigation } from "@/components/home/QuickNavigation";
import { ResumeTemplateShowcase } from "@/components/home/ResumeTemplateShowcase";
import { Separator } from "@/components/ui/separator";
import { useSubscription } from "@/hooks/use-subscription";
import { UserGuide } from "@/components/guide/UserGuide";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { CompleteProfileModal } from "@/components/account/CompleteProfileModal";
import { PurchasedDownloadsDisplay } from "@/components/home/PurchasedDownloadsDisplay"; // <-- Import the new component

// Animation Variants
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

// Slightly enhanced orb animation
const orbVariants = {
  animate: (custom: { delay: number; duration: number; scale: number[]; opacityRange: number[] }) => ({
    scale: custom.scale,
    opacity: custom.opacityRange, // Use range for more variation
    x: [-15, 15, -10, 10, -15], // Slightly wider movement
    y: [10, -10, 15, -15, 10],
    transition: {
      duration: custom.duration,
      ease: "easeInOut",
      repeat: Infinity,
      delay: custom.delay,
      repeatType: "mirror" as const // Makes movement smoother
    }
  })
};

const Home = () => {
  const { toast } = useToast();
  const { session, signOut } = useAuth();
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const isMobile = useIsMobile();
  const { 
    isSubscribed, 
    isBasicSubscription,
    isSubscriptionPlus,
    downloadsRemaining, // This is for free/subscription-specific downloads
    totalDownloads,     // This is for free/subscription-specific downloads
    currentPeriodEnd,
    cancelAtPeriodEnd,
    cancelSubscription,
    cancellationLoading,
    canAccessMockInterview,
    loading // This is general subscription loading
  } = useSubscription();
  const navigate = useNavigate(); // <-- Initialize useNavigate

  const [profile, setProfile] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    setProfile(data);
    // Show modal if any required field is missing
    if (
      !data?.first_name ||
      !data?.last_name ||
      !data?.phone_number ||
      !data?.job_title ||
      !data?.address
    ) {
      setShowModal(true);
    }
  };

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line
  }, []);

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

  const handleCancelSubscription = async () => {
    try {
      const success = await cancelSubscription();
      if (success) {
        setCancelDialogOpen(false);
        toast({
          title: "Subscription Cancelled",
          description: "Your subscription will remain active until the end of the current billing period",
        });
      }
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      toast({
        variant: "destructive",
        title: "Error cancelling subscription",
        description: "An unexpected error occurred",
      });
    }
  };

  const handleMockInterviewClick = () => {
    if (loading) return; // Wait for subscription status to load!
    if (!canAccessMockInterview) {
      navigate("/pricing");
    } else {
      navigate("/interview-prep");
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return format(date, 'MMM dd, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getPlanBadge = () => {
    if (isSubscriptionPlus) {
      return <Badge className="bg-gradient-to-r from-green-400 to-teal-500 mr-2 shadow-md">PLUS UNLIMITED</Badge>;
    } else if (isBasicSubscription) {
      return <Badge className="bg-gradient-to-r from-purple-400 to-purple-600 mr-2 shadow-md">BASIC</Badge>;
    }
    return null;
  };

  const inlineGradientStyle = {
    background: `linear-gradient(
      -45deg, 
      #071428, /* Dark Blue */
      #0a1e3c, /* Slightly Lighter Dark Blue */
      #1a2a45, /* Indigo/Purple Hue */
      #2a3a5a, /* Muted Blue/Grey */
      #0d1e36  /* Darker Base */
    )`,
    backgroundSize: '400% 400%',
    animation: 'animated-gradient 25s ease infinite' // Assumes keyframes are loaded
  };

  return (
    <div 
      className="min-h-screen text-white relative overflow-hidden" 
      style={inlineGradientStyle} 
    > 
      
      {/* Motion Orbs with updated variants */}
      <motion.div 
        className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full filter blur-3xl" // Adjusted position/size slightly
        variants={orbVariants}
        animate="animate"
        custom={{ delay: 0, duration: 20, scale: [1, 1.15, 1], opacityRange: [0.05, 0.15, 0.05] }} // Adjusted values
      />
      <motion.div 
        className="absolute bottom-20 right-10 w-80 h-80 bg-purple-500 rounded-full filter blur-3xl" // Adjusted position/size slightly
        variants={orbVariants}
        animate="animate"
        custom={{ delay: 2, duration: 25, scale: [1, 1.1, 1], opacityRange: [0.08, 0.18, 0.08] }} // Adjusted values
      />
      <motion.div 
        className="absolute top-1/3 right-1/4 w-64 h-64 bg-cyan-500 rounded-full filter blur-3xl" // Adjusted position/size slightly
        variants={orbVariants}
        animate="animate"
        custom={{ delay: 4, duration: 22, scale: [1, 1.12, 1], opacityRange: [0.06, 0.16, 0.06] }} // Adjusted values
      />
      
      {/* Dot Pattern Overlay */}
      <div className="absolute inset-0 z-0 opacity-10" style={{ // Slightly increased opacity
        backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
        backgroundSize: '35px 35px' // Slightly larger dots
      }}></div>

      <motion.div 
        className="relative z-10 max-w-7xl mx-auto px-4 py-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header Section - Mostly unchanged, ensure backdrop-blur-md is effective */}
        <motion.div 
          variants={itemVariants}
          className="flex justify-between items-center mb-10 p-4 rounded-2xl bg-white/5 backdrop-blur-md shadow-lg border border-white/10" // Ensure backdrop-blur-md
        >
          {/* Logo and Title */}
          <motion.div 
            className="flex items-center space-x-2 group"
            whileHover={{ scale: 1.03 }}
          >
            {/* Logo */}
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full blur opacity-70 group-hover:opacity-100 transition duration-300"></div>
              <motion.div 
                className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full flex items-center justify-center relative"
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <span className="font-bold text-white">RM</span>
              </motion.div>
            </div>
            {/* Title with Bouncing Dot */}
            <div className="relative"> {/* Container for text and dot */}
              <span className="font-righteous text-2xl bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500">
                Resume Magic AI
              </span>
              {/* Bouncing Dot for 'I' */}
              <motion.div
                className="absolute w-[0.3em] h-[0.3em] bg-gradient-to-r from-blue-300 to-purple-400 rounded-full" // Dot style - size relative to font
                style={{ 
                  // Fine-tune these values based on your font and text size
                  right: '0.1em',  // Position horizontally near the end of 'AI'
                  top: '0.15em'   // Position vertically near the top of 'I'
                }}
                animate={{ y: [0, -4, 0] }} // Bounce animation (adjust vertical distance as needed)
                transition={{ 
                  duration: 0.6,          // Speed of bounce
                  repeat: Infinity, 
                  ease: "easeInOut", 
                  repeatDelay: 0.8      // Pause between bounces
                }}
              />
            </div>
          </motion.div>
          
          <div className="flex items-center space-x-4">
            {session?.user?.email && (
              <motion.div 
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="hidden md:flex items-center px-4 py-2 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm rounded-full border border-white/10"
              >
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-full p-1.5 mr-2 shadow-inner">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm text-white/90">{session.user.email}</span>
                
                {isSubscribed && (
                  <>
                    <Separator orientation="vertical" className="mx-2 h-4 bg-white/20" />
                    {getPlanBadge()}
                    {isSubscriptionPlus ? (
                      <div className="flex items-center">
                        <InfinityIcon className="w-3 h-3 mr-1 text-teal-300" />
                        <span className="text-xs text-white/80">Unlimited</span>
                        {cancelAtPeriodEnd && currentPeriodEnd && (
                          <>
                            <Separator orientation="vertical" className="mx-2 h-4 bg-white/20" />
                            <div className="flex items-center text-yellow-300">
                              <Calendar className="w-3 h-3 mr-1" />
                              <span className="text-xs">Active until {formatDate(currentPeriodEnd)}</span>
                            </div>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Download className="w-3 h-3 mr-1 text-cyan-300" />
                        <span className="text-xs text-white/80">
                          {downloadsRemaining}/{totalDownloads}
                        </span>
                      </div>
                    )}
                  </>
                )}

                {/* Use the new component here */}
                <PurchasedDownloadsDisplay userId={session?.user?.id} isSubscriptionPlus={isSubscriptionPlus} />

                {!isSubscribed && downloadsRemaining === 0 && (
                  <>
                    <Separator orientation="vertical" className="mx-2 h-4 bg-white/20" />
                    <div className="flex items-center" title="Free Downloads Used">
                      <Download className="w-3 h-3 mr-1 text-red-400" />
                      <span className="text-xs text-white/80">
                        Free Download Used
                      </span>
                    </div>
                  </>
                )}
              </motion.div>
            )}
            
            <div className="flex items-center space-x-3">
              {isSubscriptionPlus && !cancelAtPeriodEnd && (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setCancelDialogOpen(true)}
                    className="relative overflow-hidden group px-4 py-2 rounded-full bg-white/5 hover:bg-rose-950/30 backdrop-blur-sm transition-all duration-300 text-rose-400 border border-rose-500/30"
                  >
                    <span className="relative z-10 flex items-center text-rose-400 group-hover:text-rose-300 transition-colors">
                      <X className="w-4 h-4 mr-2" />
                      <span className="text-sm">Cancel</span>
                    </span>
                    <div className="absolute bottom-0 left-0 w-0 h-full bg-gradient-to-r from-rose-950/20 to-rose-900/20 group-hover:w-full transition-all duration-300"></div>
                  </Button>
                </motion.div>
              )}
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/my-resumes')} // <-- Change onClick to navigate
                  className="relative overflow-hidden group px-4 py-2 rounded-full bg-white/10 hover:bg-blue-900/20 backdrop-blur-sm border border-blue-400/20 transition-all duration-300"
                >
                  <span className="relative z-10 flex items-center text-blue-300 group-hover:text-blue-200 transition-colors">
                    <FileCheck className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                    <span className="text-sm">My Resumes</span>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/30 to-purple-600/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setProfileModalOpen(true)}
                  className="relative overflow-hidden group px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 backdrop-blur-sm border border-white/20 transition-all duration-300"
                >
                  <span className="relative z-10 flex items-center text-white group-hover:text-blue-200 transition-colors">
                    <User className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                    {!isMobile && <span className="text-sm">Profile</span>}
                    {isMobile && <span className="text-sm font-medium text-white bg-black/30 px-2 py-0.5 rounded-full">Profile</span>}
                    {isMobile && isSubscribed && getPlanBadge()}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/30 to-purple-600/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleSignOut}
                  className="relative overflow-hidden group px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 backdrop-blur-sm border border-white/20 transition-all duration-300"
                >
                  <span className="relative z-10 flex items-center text-white group-hover:text-blue-200 transition-colors">
                    {!isMobile && <span className="text-sm">Sign Out</span>}
                    {isMobile && <span className="text-sm font-medium text-white bg-black/30 px-2 py-0.5 rounded-full">Sign Out</span>}
                    <LogOut className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/30 to-purple-600/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>
        
        {/* === Enhanced Main Content Block === */}
        <motion.div 
          className="mt-16 mb-20 text-center relative" // Increased margins
          variants={itemVariants} 
        >
          {/* Use a more prominent glassmorphism effect with brighter border */}
          <motion.div 
            className="relative p-10 md:p-16 rounded-3xl bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-lg border border-cyan-400/30 shadow-2xl shadow-blue-500/10 overflow-hidden transition-shadow duration-300 group" // Added group class
            whileHover={{ 
              boxShadow: "0 0 40px rgba(56, 189, 248, 0.2), 0 0 15px rgba(192, 132, 252, 0.15)", // Brighter, multi-color glow
              borderColor: "rgba(56, 189, 248, 0.5)" // Brighter border on hover
            }} 
          >
            {/* Inner decorative elements - Enhanced animations */}
            <motion.div 
              className="absolute -top-5 -left-5 w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full opacity-50 blur-lg group-hover:opacity-80 group-hover:scale-110 transition-all duration-300"
              animate={{ rotate: 360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            />
            <motion.div 
              className="absolute -bottom-5 -right-5 w-20 h-20 bg-gradient-to-tl from-purple-500 to-indigo-600 rounded-full opacity-50 blur-lg group-hover:opacity-80 group-hover:scale-110 transition-all duration-300"
               animate={{ rotate: -360 }}
               transition={{ duration: 18, repeat: Infinity, ease: "linear", delay: 1 }}
            />
            
            {/* Subtle floating icons */}
            <motion.div 
              className="absolute top-10 right-10 opacity-50 group-hover:opacity-80 transition-opacity" 
              animate={{ y: [-4, 4, -4] }} 
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <Sparkles className="w-5 h-5 text-cyan-300" />
            </motion.div>
            <motion.div 
              className="absolute bottom-10 left-10 opacity-50 group-hover:opacity-80 transition-opacity" 
              animate={{ y: [4, -4, 4] }} 
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            >
              <Zap className="w-5 h-5 text-yellow-300" />
            </motion.div>

            {/* Top accent - more subtle */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-cyan-500/0 via-cyan-400/80 to-cyan-500/0 rounded-full"></div>
              
            {/* Enhanced Heading */}
            <motion.h1 
              className="text-5xl md:text-7xl font-bold relative inline-block mb-5 bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-400 animate-text-gradient glow-text-shadow" // Apply animation and custom shadow class
              variants={itemVariants} 
            >
              Craft Your Future Career
            </motion.h1>
            
            {/* Underline effect */}
            <motion.div 
              className="w-32 h-1 mx-auto bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full mb-8"
              initial={{ width: 0 }}
              animate={{ width: "8rem" }} // 8rem = 128px = w-32
              transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
            />
              
            {/* Enhanced Description */}
            <motion.p 
              className="mt-6 text-lg md:text-xl text-white/80 max-w-3xl mx-auto leading-relaxed px-4 md:px-8"
              variants={itemVariants} 
            >
              Elevate your professional path with our <strong className="text-cyan-300 font-semibold">AI-driven resume suite</strong>. 
              Choose from <strong className="text-purple-300 font-semibold">Hybrid, Modern, & Pro</strong> templates, 
              intelligently designed for ultimate career impact.
            </motion.p>
            
            <div className="flex justify-center mt-10">
              <Button
                onClick={handleMockInterviewClick}
                className="px-10 py-5 text-xl font-extrabold rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 shadow-2xl hover:from-purple-500 hover:to-cyan-400 transition-all duration-300 flex items-center gap-3 border-2 border-transparent hover:border-cyan-300 group"
                style={{ minWidth: "fit-content" }}
              >
                <span className="relative flex items-center">
                  <Bot className="w-7 h-7 mr-3 text-yellow-300 animate-bounce-slow group-hover:text-cyan-200" />
                  <span>
                    <span className="text-white font-bold">Experience Your <span className="text-cyan-200">First AI Mock Interview</span></span>
                    <span className="text-white font-extrabold"> — Absolutely Free!</span>
                  </span>
                </span>
              </Button>
            </div>
          </motion.div>

          {/* Arrow indicator - slightly adjusted */}
          <motion.div 
            className="flex justify-center mt-8" // Increased margin
            variants={itemVariants}
            animate={{ y: [0, 8, 0] }} // Slightly larger movement
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          >
             <div className="w-16 h-16 relative group"> {/* Smaller container */}
               <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-full blur-lg group-hover:blur-xl transition-all duration-300 animate-pulse"></div>
               <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white/70 group-hover:text-white transition-colors">
                 <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> {/* Slightly larger arrow */}
                   <path d="M12 5V19M12 19L19 12M12 19L5 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                 </svg>
               </div>
             </div>
          </motion.div>
        </motion.div>
        
        {/* Grid Section */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-10 gap-8 mt-8" 
          variants={containerVariants} 
        >
          {/* Quick Navigation */}
          <motion.div 
            className="lg:col-span-3 space-y-6"
            variants={itemVariants}
          >
            <motion.div 
              className="sticky top-8 border border-white/10 rounded-xl p-5 bg-white/5 backdrop-blur-sm shadow-xl transition-all duration-300 hover:border-cyan-400/30" // Removed hover shadow, added motion shadow
              whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(34, 211, 238, 0.1), 0 4px 6px -4px rgba(34, 211, 238, 0.1)" }}
            >
              <QuickNavigation />
            </motion.div>
          </motion.div>
          
          {/* Resume Showcase */}
          <motion.div 
            className="lg:col-span-7"
            variants={itemVariants}
          >
            <motion.div 
              className="resume-templates border border-white/10 rounded-xl p-5 bg-white/5 backdrop-blur-sm shadow-xl transition-all duration-300 hover:border-purple-400/30" // Removed hover shadow, added motion shadow
              whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(192, 132, 252, 0.1), 0 4px 6px -4px rgba(192, 132, 252, 0.1)" }}
            >
              <ResumeTemplateShowcase />
            </motion.div>
          </motion.div>
        </motion.div>
        
        {/* Footer */}
        <motion.div 
          className="w-full mt-12 text-center"
          variants={itemVariants}
        >
          {/* ... Footer content ... */}
           <div className="flex flex-col md:flex-row items-center justify-between space-y-2 md:space-y-0 text-white/60 hover:text-white/80 transition-colors p-4 rounded-lg bg-white/5 border border-white/10">
             <p>© 2025 ResumeMagic AI Services. All rights reserved.</p>
             <div className="flex items-center space-x-4">
               <UserGuide />
               <span className="text-cyan-400">customer_support@resumemagic-ai.com</span>
               <motion.a 
                 href="https://www.instagram.com/resumemagic_ai?igsh=bnd0Z2VhcjN0NjNj&utm_source=qr" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="flex items-center text-cyan-400 hover:text-cyan-300 transition-colors"
                 whileHover={{ scale: 1.05 }}
               >
                 <Instagram className="w-4 h-4 mr-1" />
                 Instagram
               </motion.a>
             </div>
           </div>
        </motion.div>
      </motion.div>
      
      {/* Modals remain unchanged */}
      <UserProfileModal 
        open={profileModalOpen} 
        onOpenChange={setProfileModalOpen} 
      />

      <CompleteProfileModal
        open={showModal}
        onOpenChange={setShowModal}
        profile={profile}
        userId={userId || ""}
        onProfileUpdated={fetchProfile}
      />

      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        {/* ... Dialog content ... */}
         <DialogContent className="bg-slate-900 border border-slate-800 text-white">
           <DialogHeader>
             <DialogTitle className="text-white">Cancel Subscription?</DialogTitle>
             <DialogDescription className="text-white/70">
               Your subscription will remain active until the end of your current billing period on {formatDate(currentPeriodEnd)}.
               You won't be charged again after this date.
             </DialogDescription>
           </DialogHeader>
           <DialogFooter className="flex flex-col sm:flex-row gap-2">
             <Button 
               variant="outline" 
               onClick={() => setCancelDialogOpen(false)}
               className="border-white/20 text-white hover:bg-white/10"
             >
               Keep Subscription
             </Button>
             <Button 
               variant="destructive"
               onClick={handleCancelSubscription}
               disabled={cancellationLoading}
             >
               {cancellationLoading ? "Processing..." : "Yes, Cancel Subscription"}
             </Button>
           </DialogFooter>
         </DialogContent>
      </Dialog>
    </div>
  );
};

export default Home;

<style>
{`
@keyframes bounce-slow {
  0%, 100% { transform: translateY(0);}
  50% { transform: translateY(-8px);}
}
.animate-bounce-slow {
  animation: bounce-slow 1.6s infinite;
}
`}
</style>
