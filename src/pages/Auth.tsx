import { AuthButton } from "@/components/auth/AuthButton";
import { useAuth } from "@/components/auth/AuthProvider";
import { Navigate, Link } from "react-router-dom";
import { 
    Bot, Sparkles, FileText, Zap, Instagram, Award, Star, Users, 
    TrendingUp, BadgeCheck, Brain, Layout, ListChecks, FileEdit, 
    Code, Target, Briefcase, UsersRound, MessageSquareQuote
} from "lucide-react";
import { FeedbackScroller } from "@/components/feedback/FeedbackScroller";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UserGuide } from "@/components/guide/UserGuide";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
// @ts-ignore
import termsContent from "@/marketing/terms-and-conditions.md?raw";
import React from "react";

const Auth = () => {
  const { isAuthenticated, isLoading } = useAuth();

  const features = [
    { icon: FileText, title: "ATS-Optimized Resumes", description: "Craft resumes that impress bots and humans alike." },
    { icon: Brain, title: "AI Interview Coach", description: "Practice and get feedback to ace your interviews." },
    { icon: Layout, title: "Stunning Templates", description: "Choose from modern, professional designs." },
    { icon: TrendingUp, title: "Career Insights", description: "Analyze your path and identify growth areas." },
    { icon: FileEdit, title: "Impactful Cover Letters", description: "Generate compelling cover letters in minutes." },
    { icon: ListChecks, title: "Targeted Interview Q's", description: "Get questions tailored to your desired job." },
  ];

  const templateSlides = [
    { src: "/lovable-uploads/97d4e39c-c0fe-4d28-bc16-6fdbe23768c4.png", alt: "Professional Resume Template", name: "Modern Professional" },
    { src: "/lovable-uploads/df6b6371-05c8-4591-9f85-f1325f8876b8.png", alt: "Professional Modern Resume Template", name: "Sleek Professional" },
    { src: "/lovable-uploads/f1270df4-d58b-44f7-b53b-64bf981ec296.png", alt: "Simple Resume Template", name: "Clean & Simple" },
    { src: "/lovable-uploads/f576f4f5-d2f9-4771-913b-ba0f9395c02a.png", alt: "Modern Resume Template", name: "Executive Modern" },
    { src: "/lovable-uploads/creative_sample.png", alt: "Creative Resume Template", name: "Bold Creative" },
    { src: "/lovable-uploads/f531c379-d2e9-4680-84be-4397b761df36.png", alt: "Hybrid Resume Template", name: "Tech Hybrid" },
  ];

  const [currentSlideIndex, setCurrentSlideIndex] = React.useState(0);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentSlideIndex((prevIndex) =>
        prevIndex === templateSlides.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000);
    return () => clearTimeout(timer);
  }, [currentSlideIndex, templateSlides.length]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#07101B] to-[#020617] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#60A5FA] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 }
    },
  };

  const fadeInItem = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, duration: 0.5 }},
  };

  const heroImageContainerVariants = {
    initial: { opacity: 0, scale: 0.9, y: 30 },
    animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.7, ease: [0.6, -0.05, 0.01, 0.99], delay: 0.3 } },
  };

  const slideVariants = {
    enter: (direction: number) => {
      return {
        x: direction > 0 ? 300 : -300,
        opacity: 0,
        scale: 0.9,
      };
    },
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => {
      return {
        zIndex: 0,
        x: direction < 0 ? 300 : -300,
        opacity: 0,
        scale: 0.9,
      };
    },
  };

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-[#07101B] to-[#020617] text-slate-200 flex flex-col overflow-x-hidden font-sans">
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.div 
          className="absolute -top-1/3 -left-1/4 w-3/5 h-3/5 bg-gradient-radial from-[#3B82F6]/15 via-transparent to-transparent rounded-full"
          animate={{ scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute -bottom-1/3 -right-1/4 w-3/5 h-3/5 bg-gradient-radial from-[#818CF8]/10 via-transparent to-transparent rounded-full"
          animate={{ scale: [1, 1.1, 1], opacity: [0.6, 0.9, 0.6] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 5 }}
        />
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{ 
            backgroundImage: 'linear-gradient(to right, #60A5FA 0.5px, transparent 0.5px), linear-gradient(to bottom, #60A5FA 0.5px, transparent 0.5px)',
            backgroundSize: '40px 40px',
          }}>
        </div>
      </div>

      <motion.header
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 90 }}
        className="relative z-20 w-full py-3 sm:py-4 border-b border-[#60A5FA]/10 bg-[#020617]/50 backdrop-blur-md"
      >
        <div className="max-w-screen-xl mx-auto flex items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 bg-gradient-to-br from-[#3B82F6] to-[#818CF8] rounded-lg shadow-lg group-hover:scale-105 transition-transform">
              <Bot className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <h1 className="font-righteous text-2xl sm:text-3xl bg-clip-text text-transparent bg-gradient-to-r from-slate-100 via-slate-300 to-slate-100 group-hover:opacity-80 transition-opacity">
              Resume Magic AI
            </h1>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
            <div className="flex items-center p-1.5 px-2 bg-[#60A5FA]/10 rounded-full border border-[#60A5FA]/20">
              <Star className="w-3 h-3 sm:w-4 sm:h-4 text-amber-400 mr-1.5" />
              <span className="text-slate-300">Top Rated</span>
            </div>
            <div className="hidden sm:flex items-center p-1.5 px-2 bg-[#60A5FA]/10 rounded-full border border-[#60A5FA]/20">
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-400 mr-1.5" />
              <span className="text-slate-300">Emerging AI</span>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="relative z-10 flex-1 w-full max-w-screen-xl mx-auto px-4 py-8 sm:py-12 flex flex-col lg:flex-row items-center lg:gap-12">
        <motion.div 
          className="lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.h2 
            variants={fadeInItem}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-slate-50 via-slate-200 to-blue-300 bg-clip-text text-transparent leading-tight"
          >
            Craft Your Future, <span className="block sm:inline">One Resume at a Time.</span>
          </motion.h2>
          <motion.p 
            variants={fadeInItem}
            className="text-slate-300/90 text-base sm:text-lg md:text-xl mb-8 max-w-xl"
          >
            Leverage AI to build job-winning resumes and cover letters in minutes. Get personalized interview coaching and land your dream job faster.
          </motion.p>
          
          <motion.div variants={fadeInItem} className="w-full max-w-sm lg:max-w-md mb-10 lg:mb-0">
            <AuthButton />
          </motion.div>

          <motion.div variants={fadeInItem} className="mt-8 flex flex-wrap justify-center lg:justify-start gap-3 text-xs text-slate-400">
              <span className="flex items-center"><BadgeCheck className="w-4 h-4 text-green-400 mr-1.5"/> ATS-Friendly</span>
              <span className="flex items-center"><Sparkles className="w-4 h-4 text-yellow-400 mr-1.5"/> AI-Powered</span>
              <span className="flex items-center"><Briefcase className="w-4 h-4 text-sky-400 mr-1.5"/> Professional Templates</span>
          </motion.div>
        </motion.div>

        <motion.div 
          className="lg:w-1/2 mt-16 lg:mt-0 flex flex-col justify-center items-center"
          variants={heroImageContainerVariants}
          initial="initial"
          animate="animate"
        >
          <div className="w-full max-w-md lg:max-w-lg aspect-[4/3] bg-gradient-to-br from-[#3B82F6]/10 to-[#818CF8]/10 rounded-3xl shadow-2xl border border-[#60A5FA]/20 relative overflow-hidden p-2">
            <AnimatePresence initial={false} custom={currentSlideIndex}>
              <motion.img
                key={currentSlideIndex}
                src={templateSlides[currentSlideIndex].src}
                alt={templateSlides[currentSlideIndex].alt}
                custom={currentSlideIndex}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.3 },
                  scale: { duration: 0.3 }
                }}
                className="absolute inset-0 w-full h-full object-contain rounded-2xl p-1"
              />
            </AnimatePresence>
            <div className="absolute bottom-2 left-2 right-2 p-2 bg-black/50 backdrop-blur-sm rounded-b-2xl text-center">
                <p className="text-white text-sm font-semibold">{templateSlides[currentSlideIndex].name}</p>
            </div>
          </div>
          <motion.div 
            className="mt-6 text-center p-4 bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10 border border-green-400/30 rounded-xl shadow-lg max-w-md lg:max-w-lg"
            initial={{opacity: 0, y: 20}}
            animate={{opacity:1, y: 0}}
            transition={{delay: 0.6, duration: 0.5}}
          >
            <div className="flex items-center justify-center mb-2">
              <BadgeCheck className="w-6 h-6 text-green-400 mr-2" />
              <h4 className="text-lg font-semibold text-green-300">HR Approved & Proven to Get Hired!</h4>
            </div>
            <p className="text-sm text-slate-300/90">
              Our templates are designed with industry best practices. Thousands have successfully landed interviews using these formats.
            </p>
          </motion.div>
        </motion.div>
      </main>

      <motion.section 
        className="py-12 sm:py-16 relative z-10 bg-[#020617]/30 backdrop-blur-sm border-t border-[#60A5FA]/10"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
      >
        <div className="max-w-screen-xl mx-auto px-4">
          <motion.h3 
            variants={fadeInItem}
            className="text-3xl sm:text-4xl font-bold text-center mb-10 sm:mb-14 bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent"
          >
            Everything You Need to Succeed
          </motion.h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                className="relative group bg-gradient-to-br from-[#0F172A]/70 to-[#1E293B]/60 border border-[#60A5FA]/20 rounded-xl p-6 shadow-lg hover:shadow-sky-500/20 transition-all duration-300 hover:border-[#60A5FA]/40"
                variants={fadeInItem}
                whileHover={{ y: -6, scale: 1.03 }}
              >
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-radial from-[#60A5FA]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 rounded-xl"></div>
                <div className="relative z-10 flex items-start mb-4">
                  <div className="p-3 bg-gradient-to-br from-[#3B82F6] to-[#60A5FA] rounded-lg mr-4 shadow-md group-hover:from-[#60A5FA] group-hover:to-[#3B82F6] transition-colors">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg sm:text-xl font-semibold text-slate-100 mb-1">{feature.title}</h4>
                  </div>
                </div>
                <p className="relative z-10 text-slate-300/80 text-sm sm:text-base">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <div className="relative z-10 py-10 sm:py-14 max-w-screen-xl mx-auto w-full px-4">
        <motion.h3 
          initial={{opacity:0, y:20}}
          whileInView={{opacity:1, y:0}}
          viewport={{once: true, amount: 0.3}}
          transition={{duration:0.5}}
          className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12 text-slate-200"
        >
          Loved by Job Seekers
        </motion.h3>
        <FeedbackScroller />
      </div>

      <footer className="relative z-20 py-6 sm:py-8 border-t border-[#60A5FA]/10 bg-[#020617]/70 backdrop-blur-md">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-400/80 text-xs sm:text-sm">
              © {new Date().getFullYear()} ResumeMagic AI. All rights reserved.
            </p>
            <div className="flex items-center space-x-3 sm:space-x-4">
              <UserGuide />
              <Link to="/pricing" className="text-slate-400 hover:text-sky-400 text-xs sm:text-sm hover:underline transition-colors duration-200">
                Pricing
              </Link>
              <Dialog>
                <DialogTrigger className="text-slate-400 hover:text-sky-400 text-xs sm:text-sm hover:underline transition-colors duration-200">
                  Terms
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-[#0A1220] border-[#60A5FA]/30 text-slate-300">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold mb-3 text-slate-100 flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-sky-400" />
                      Terms and Conditions
                    </DialogTitle>
                  </DialogHeader>
                  <div className="prose prose-sm prose-invert max-w-none text-slate-300/90">
                    <ReactMarkdown>{termsContent}</ReactMarkdown>
                  </div>
                </DialogContent>
              </Dialog>
              <a 
                href="https://www.instagram.com/resumemagic_ai" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center text-slate-400 hover:text-pink-500 text-xs sm:text-sm hover:underline transition-colors duration-200"
              >
                <Instagram className="w-4 h-4 mr-1" />
                Instagram
              </a>
            </div>
          </div>
        </div>
      </footer>
      
      <style>{`
        body {
          font-family: 'Inter', sans-serif;
        }
        .font-righteous {
          font-family: 'Righteous', cursive; 
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(1.05); }
        }
        .aspect-\\[4\\/3\\] {
            position: relative;
            width: 100%;
            padding-bottom: 75%;
        }
        .aspect-\\[4\\/3\\] > img {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
        }
      `}</style>
    </div>
  );
};

export default Auth;
