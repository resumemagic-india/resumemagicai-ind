import { useNavigate } from "react-router-dom";
// Removed Button import as it's not used directly here
import { FileText, Layout, FileEdit, Brain, Sparkles, CreditCard, ListChecks, TrendingUp, Beaker, Lock } from "lucide-react"; 
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSubscription } from "@/hooks/use-subscription";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion } from "framer-motion"; 

export const QuickNavigation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { 
    isBasicSubscription, 
    isPlusSubscription,
    isSubscriptionPlus,
    hasInterviewPrepAccess,
    hasCareerRoadmapAccess,
    hasJobInterviewQuestionsAccess
  } = useSubscription();
  
  const navigationItems = [
    {
      title: "Create ATS-friendly Professional Resumes from Scratch",
      description: "",
      icon: FileText,
      path: "/create-resume",
      color: "from-blue-500 to-blue-600",
      twoLines: true
    },
    {
      title: "Enhance your Current Resume as per the Target Job Description",
      description: "",
      icon: Layout,
      path: "/dashboard",
      color: "from-purple-500 to-purple-600",
      popular: true,
      mostPopular: true,
      showReminder: true,
      twoLines: true
    },
    {
      title: "Generate Customized Cover Letters",
      description: "",
      icon: FileEdit,
      path: "/cover-letter",
      color: "from-emerald-500 to-emerald-600"
    },
    {
      title: "Career Roadmap Analysis",
      description: isSubscriptionPlus 
        ? "Included in your Premium plan" 
        : isPlusSubscription 
        ? "Included in your Plus plan" 
        : "Premium feature",
      icon: TrendingUp,
      path: "/career-roadmap",
      color: "from-amber-500 to-cyan-500",
      experimental: true,
      premium: !hasCareerRoadmapAccess
    },
    {
      title: "AI Mock Interviews & Feedback",
      description: isSubscriptionPlus 
        ? "Included in your Premium plan" 
        : isPlusSubscription 
        ? "Included in your Plus plan" 
        : "Premium feature",
      icon: Brain,
      path: "/interview-prep",
      color: "from-blue-400 to-purple-500",
      premium: !hasInterviewPrepAccess
    },
    {
      title: "Job Interview Questions Generator using Target Job Description",
      description: isSubscriptionPlus 
        ? "Included in your Premium plan" 
        : isPlusSubscription 
        ? "Included in your Plus plan" 
        : "Premium feature",
      icon: ListChecks,
      path: "/job-interview-questions",
      color: "from-purple-400 to-blue-400",
      premium: !hasJobInterviewQuestionsAccess,
      twoLines: true
    },
    {
      title: "Pricing Details",
      description: isSubscriptionPlus 
        ? "You have Premium plan" 
        : isPlusSubscription 
        ? "You have Plus plan" 
        : isBasicSubscription 
        ? "You have Basic plan" 
        : "Upgrade for more features",
      icon: CreditCard,
      path: "/pricing",
      color: "from-amber-500 to-amber-600"
    }
  ];
  
  const handleNavigation = (item: typeof navigationItems[0]) => {
    if (item.showReminder) {
      toast({
        title: "Choose a Template",
        description: "Please select a resume layout from the templates below, or the system will use the default template.",
        variant: "default"
      });
      
      const templateSection = document.querySelector('.resume-templates');
      if (templateSection) {
        templateSection.scrollIntoView({ behavior: 'smooth' });
      } else {
        setTimeout(() => navigate(item.path), 1500);
      }
    } else if (item.premium && !isPlusSubscription && !isSubscriptionPlus) {
      toast({
        title: "Premium Feature",
        description: "This feature requires a Plus or Premium subscription. Please upgrade to access.",
        variant: "default"
      });
      navigate('/pricing');
    } else {
      navigate(item.path);
    }
  };
  
  return (
    <TooltipProvider delayDuration={100}> 
      <div className="flex flex-col space-y-4 w-full">
        <h2 className="text-xl sm:text-2xl font-semibold text-white mb-2 pb-3 relative">
          <span className="relative z-10 flex items-center">
            <span className="bg-gradient-to-r from-cyan-400 to-purple-500 w-1 h-6 rounded-full mr-3"></span>
            Quick Navigation
          </span>
          <div className="absolute bottom-0 left-0 w-1/3 h-px bg-gradient-to-r from-cyan-400/50 via-purple-500/50 to-transparent"></div>
        </h2>
        
        <div className="space-y-3">
          {navigationItems.map((item, index) => (
            <Tooltip key={index}>
              <TooltipTrigger asChild> 
                <motion.button
                  onClick={() => handleNavigation(item)}
                  className={`relative group w-full h-auto py-3.5 px-4 flex items-center justify-between text-left rounded-lg transition-all duration-300 overflow-hidden border border-white/10 bg-gradient-to-br from-white/5 via-white/10 to-transparent hover:border-white/20`}
                  whileHover={{ 
                    scale: 1.02,
                    boxShadow: `0 0 15px rgba(255, 255, 255, 0.1), 0 0 5px rgba(255, 255, 255, 0.05)`
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${item.color} transition-all duration-300 group-hover:w-1.5`}></div>
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 bg-gradient-radial ${item.color} blur-xl`}></div>
                  <div className="flex items-center flex-1 min-w-0 pl-3 pr-2 z-10"> 
                    <motion.div 
                      className="mr-3 flex-shrink-0"
                      whileHover={{ scale: 1.1 }}
                    >
                      <item.icon className={`h-5 w-5 ${item.premium ? 'text-amber-300' : 'text-cyan-300'} transition-colors duration-300`} />
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-medium text-base text-white whitespace-normal leading-tight line-clamp-3 max-w-full flex items-center`}>
                        {item.title}
                        {!isMobile && item.premium && (
                          <Lock className="w-3 h-3 text-amber-300 ml-1.5 flex-shrink-0" />
                        )}
                      </h3>
                      {!isMobile && item.description && (
                        <p className="text-xs text-white/60 truncate mt-0.5">{item.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 flex-shrink-0 z-10">
                    {!isMobile && item.mostPopular && (
                      <Badge variant="outline" className="border-purple-400/50 text-purple-300 text-xs px-1.5 py-0.5 flex items-center gap-1 whitespace-nowrap bg-purple-900/30">
                        <Sparkles className="h-3 w-3" /> Popular
                      </Badge>
                    )}
                    {!isMobile && item.experimental && (
                      <Badge variant="outline" className="border-cyan-400/50 text-cyan-300 text-xs px-1.5 py-0.5 flex items-center gap-1 whitespace-nowrap bg-cyan-900/30">
                        <Beaker className="h-3 w-3" /> Beta
                      </Badge>
                    )}
                    <svg className="w-4 h-4 text-white/50 group-hover:text-white/80 transition-colors duration-300 group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </div>
                </motion.button>
              </TooltipTrigger>
              <TooltipContent 
                side="right" 
                align="center"
                className="max-w-[250px] text-sm p-3 bg-black/90 border-white/10 text-white rounded-md shadow-lg backdrop-blur-sm z-50"
              >
                {item.title} 
                {item.premium && !isPlusSubscription && !isSubscriptionPlus && (
                  <div className="mt-1 text-xs text-amber-300">Requires Plus/Premium Plan</div>
                )}
                {item.experimental && (
                  <div className="mt-1 text-xs text-cyan-300">Experimental Feature</div>
                )}
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
};
