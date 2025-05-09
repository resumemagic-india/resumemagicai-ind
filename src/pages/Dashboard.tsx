import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { User, LogOut, ChevronLeft, FileText, Sparkles, ArrowRight, AlertCircle, ExternalLink, FileCheck, Info, Edit } from "lucide-react"; // Added Info, Edit
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth/AuthProvider";
import { ResumeForm } from "@/components/resume/ResumeForm";
import { UserProfileModal } from "@/components/account/UserProfileModal";
import { useLocation, useNavigate } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { motion } from "framer-motion";

const Dashboard = () => {
  const { toast } = useToast();
  const { session, signOut } = useAuth();
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Check if user arrived from template selection on the home page
  useEffect(() => {
    if (location.state?.fromHomePageSelection) {
      const templateId = location.state.templateId;
      const templateType = location.state.templateType;
      console.log(`Template selected from home page: ID ${templateId}, Type: ${templateType}`);
      // Optionally clear the state to prevent re-triggering
      // navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate]); // Added navigate dependency

  const handleSignOut = async () => {
    try {
      await signOut();
      // Optionally navigate to login or home page after sign out
      // navigate('/auth');
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

  const handleNavigateToCreateResume = () => {
    navigate('/create-resume');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#071428] via-[#0a1e3c] to-[#0d1e36] text-white relative overflow-x-hidden"> {/* Added overflow-x-hidden */}
      {/* Enhanced animated background with particle effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/30 via-blue-900/20 to-purple-900/30 z-0"></div>

      {/* Animated orbs with improved animation */}
      {/* Adjusted positions/sizes slightly for better distribution */}
      <div className="absolute top-20 left-5 w-60 h-60 sm:w-72 sm:h-72 bg-blue-500/20 rounded-full filter blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-5 w-64 h-64 sm:w-80 sm:h-80 bg-purple-500/20 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: "2s", animationDuration: "8s" }}></div>
      <div className="absolute top-1/3 right-1/4 w-52 h-52 sm:w-64 sm:h-64 bg-cyan-500/20 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: "3.5s", animationDuration: "10s" }}></div>

      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 z-0 opacity-5" style={{
        backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
        backgroundSize: '30px 30px'
      }}></div>

      {/* Content container with responsive padding */}
      <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-8">
        {/* Top bar with responsive layout */}
        {/* Wrapped in flex-col sm:flex-row for stacking on small screens */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-10 p-3 sm:p-4 rounded-2xl bg-white/5 backdrop-blur-md shadow-lg border border-white/10 space-y-3 sm:space-y-0">
          <Button
            variant="ghost"
            onClick={handleNavigateBack}
            // Adjusted padding/text size for mobile
            className="text-white/90 hover:text-white group transition-all duration-300 flex items-center gap-1 sm:gap-2 self-start sm:self-center"
          >
            <span className="relative overflow-hidden rounded-full bg-white/20 p-1.5 sm:p-2 transition-all duration-300 group-hover:bg-white/30 group-hover:scale-110">
              <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
            </span>
            {/* Adjusted font size */}
            <span className="font-medium text-sm sm:text-base">Back to Home</span>
          </Button>

          {/* Grouped user info and action buttons */}
          {/* Added flex-wrap for very small screens if needed */}
          <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
            {session?.user?.email && (
              // Adjusted padding/margin and text size for mobile
              <div className="flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm rounded-full border border-white/10 animate-fade-in w-full sm:w-auto justify-center">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-full p-1 sm:p-1.5 mr-1.5 sm:mr-2">
                  <User className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </div>
                {/* Adjusted text size and truncation */}
                <span className="text-xs sm:text-sm text-white/90 truncate">{session.user.email}</span>
              </div>
            )}

            {/* Action buttons container */}
            {/* Adjusted spacing and wrapping */}
            <div className="flex items-center justify-center sm:justify-end space-x-2 sm:space-x-3 w-full sm:w-auto flex-wrap">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="sm" // Kept size sm, padding adjusted below
                  onClick={() => navigate('/my-resumes')}
                  // Adjusted padding and text size
                  className="relative overflow-hidden group px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white/10 hover:bg-blue-900/20 backdrop-blur-sm border border-blue-400/20 transition-all duration-300"
                >
                  <span className="relative z-10 flex items-center text-blue-300 group-hover:text-blue-200 transition-colors">
                    <FileCheck className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 group-hover:scale-110 transition-transform duration-300" />
                    {/* Adjusted text size */}
                    <span className="text-xs sm:text-sm">My Resumes</span>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/30 to-purple-600/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setProfileModalOpen(true)}
                  // Adjusted padding and text size
                  className="relative overflow-hidden group px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white/10 hover:bg-white/15 backdrop-blur-sm border border-white/20 transition-all duration-300"
                >
                  <span className="relative z-10 flex items-center text-white group-hover:text-blue-200 transition-colors">
                    <User className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 group-hover:scale-110 transition-transform duration-300" />
                    {/* Adjusted text size */}
                    <span className="text-xs sm:text-sm">Profile</span>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/30 to-purple-600/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  // Adjusted padding and text size
                  className="relative overflow-hidden group px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white/10 hover:bg-white/15 backdrop-blur-sm border border-white/20 transition-all duration-300"
                >
                  <span className="relative z-10 flex items-center text-white group-hover:text-blue-200 transition-colors">
                    {/* Adjusted text size */}
                    <span className="text-xs sm:text-sm">Sign Out</span>
                    <LogOut className="w-3 h-3 sm:w-4 sm:h-4 ml-1.5 sm:ml-2 transition-transform group-hover:translate-x-1" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/30 to-purple-600/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Button>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Main content grid with responsive gap */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
          {/* Left side - Title and info */}
          <div className="lg:col-span-5 space-y-4 sm:space-y-6">
            <div className="relative">
              {/* Adjusted blur effect position/size */}
              <div className="absolute -left-5 -top-5 w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-full blur-xl animate-pulse" style={{ animationDuration: "6s" }}></div>
              {/* Responsive heading size */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold relative">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-300 via-indigo-400 to-purple-300">
                  Resume Enhancement
                </span>
                <div className="absolute -top-1 -right-2 sm:-right-4 text-yellow-300">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" style={{ animationDuration: "3s" }} />
                </div>
              </h1>

              {/* ENHANCED SECTION: Resume upload description */}
              {/* Responsive padding */}
              <div className="mt-4 sm:mt-6 backdrop-blur-sm rounded-xl p-4 sm:p-5 border border-white/10 bg-gradient-to-br from-white/10 to-white/5 shadow-[0_0_15px_rgba(56,189,248,0.15)] transform transition-all duration-500 hover:shadow-[0_0_25px_rgba(56,189,248,0.25)]">
                {/* Adjusted gap and icon size */}
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="flex-shrink-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full p-2 sm:p-2.5 shadow-[0_0_10px_rgba(96,165,250,0.5)] mt-1">
                    <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  {/* Responsive text size */}
                  <p className="text-white/90 leading-relaxed text-sm sm:text-base">
                    <span className="font-semibold text-blue-300">Upload your resume</span> and <span className="font-semibold text-purple-300">paste the job description</span> to receive an <span className="relative inline-block">
                      <span className="relative z-10">AI-optimized resume</span>
                      <span className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-r from-blue-500/30 to-purple-500/30 -z-0"></span>
                    </span> perfectly tailored to your target role. Our sophisticated algorithm analyzes keywords, formats, and content to maximize your interview chances.
                  </p>
                </div>

                {/* Adjusted margin and padding */}
                <div className="mt-4 sm:mt-5 pl-8 sm:pl-10">
                  {/* Responsive heading size */}
                  <h3 className="text-lg sm:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-blue-300 flex items-center">
                    Unlock Your Resume's Potential
                    <span className="ml-1.5 sm:ml-2 bg-gradient-to-r from-yellow-500/80 to-amber-500/80 p-0.5 sm:p-1 rounded-full">
                      <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-white animate-pulse" />
                    </span>
                  </h3>

                  {/* Adjusted spacing and icon size */}
                  <ul className="mt-2 sm:mt-3 space-y-2 sm:space-y-3">
                    <li className="flex items-center space-x-2 sm:space-x-3 group">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-emerald-500/20 to-emerald-500/10 flex items-center justify-center border border-emerald-500/30 group-hover:from-emerald-500/30 group-hover:to-emerald-500/20 transition-colors duration-300 flex-shrink-0">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                      </div>
                      {/* Responsive text size */}
                      <span className="text-sm sm:text-base text-white/80 group-hover:text-white transition-colors duration-300">Get an instant <span className="font-semibold text-emerald-300">ATS Compatibility Score</span></span>
                    </li>

                    <li className="flex items-center space-x-2 sm:space-x-3 group">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-500/10 flex items-center justify-center border border-blue-500/30 group-hover:from-blue-500/30 group-hover:to-blue-500/20 transition-colors duration-300 flex-shrink-0">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-400 animate-pulse" style={{ animationDelay: "0.5s" }}></div>
                      </div>
                      {/* Responsive text size */}
                      <span className="text-sm sm:text-base text-white/80 group-hover:text-white transition-colors duration-300">Analyze <span className="font-semibold text-blue-300">keyword matching</span> with job requirements</span>
                    </li>

                    <li className="flex items-center space-x-2 sm:space-x-3 group">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-500/10 flex items-center justify-center border border-purple-500/30 group-hover:from-purple-500/30 group-hover:to-purple-500/20 transition-colors duration-300 flex-shrink-0">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-purple-400 animate-pulse" style={{ animationDelay: "1s" }}></div>
                      </div>
                      {/* Responsive text size */}
                      <span className="text-sm sm:text-base text-white/80 group-hover:text-white transition-colors duration-300">Receive <span className="font-semibold text-purple-300">detailed optimization insights</span> to improve</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Format compatibility alert */}
            <Alert className="bg-gradient-to-r from-amber-900/40 to-amber-800/40 backdrop-blur-md border border-amber-500/30 text-amber-100 animate-fade-in p-3 sm:p-4" style={{ animationDelay: "0.3s" }}> {/* Adjusted padding */}
              <AlertCircle className="h-4 w-4 text-amber-400 flex-shrink-0" /> {/* Added flex-shrink-0 */}
              {/* Responsive text size */}
              <AlertTitle className="text-amber-200 font-medium text-sm sm:text-base">Format Compatibility Notice</AlertTitle>
              {/* Responsive text size */}
              <AlertDescription className="text-amber-100/90 text-xs sm:text-sm">
                This feature works better for resumes with a single-column format. If your input resume has a multi-column design or uses customized colors and fonts, please utilize our 'Create ATS-Friendly Professional Resumes from Scratch' feature. Our AI will ensure your resume is perfectly formatted to captivate hiring managers.
                <div className="mt-2 sm:mt-3">
                  <Button
                    onClick={handleNavigateToCreateResume}
                    variant="outline"
                    size="sm" // Kept size sm
                    // Adjusted text size
                    className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white border-none shadow-md hover:shadow-lg transition-all duration-300 text-xs sm:text-sm px-3 py-1.5"
                  >
                    Create New Resume
                  </Button>
                </div>
              </AlertDescription>
            </Alert>

            {/* Feature cards */}
            {/* Adjusted gap and padding */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-4 sm:mt-8">
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 sm:p-5 hover:bg-white/15 transition-all duration-300 group shadow-lg hover:shadow-xl hover:-translate-y-1">
                {/* Adjusted icon size and margin */}
                <div className="flex items-center mb-2 sm:mb-3">
                  <div className="p-1.5 sm:p-2 bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-lg group-hover:scale-110 transition-transform">
                    <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-300" />
                  </div>
                  {/* Responsive text size */}
                  <span className="ml-2 font-medium text-sm sm:text-base text-white/90 group-hover:text-white transition-colors">ATS Optimization</span>
                </div>
                {/* Responsive text size */}
                <p className="text-xs sm:text-sm text-white/70 mb-2 sm:mb-3 group-hover:text-white/80 transition-colors">Make your resume ATS-friendly to ensure it gets past automated screenings</p>
                <div className="flex justify-end">
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-white/40 group-hover:text-blue-300 transition-all group-hover:translate-x-1" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 sm:p-5 hover:bg-white/15 transition-all duration-300 group shadow-lg hover:shadow-xl hover:-translate-y-1">
                {/* Adjusted icon size and margin */}
                <div className="flex items-center mb-2 sm:mb-3">
                  <div className="p-1.5 sm:p-2 bg-gradient-to-br from-cyan-500/30 to-emerald-500/30 rounded-lg group-hover:scale-110 transition-transform">
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-300" />
                  </div>
                  {/* Responsive text size */}
                  <span className="ml-2 font-medium text-sm sm:text-base text-white/90 group-hover:text-white transition-colors">AI Enhancement</span>
                </div>
                {/* Responsive text size */}
                <p className="text-xs sm:text-sm text-white/70 mb-2 sm:mb-3 group-hover:text-white/80 transition-colors">Leverage AI to improve your resume's content and visual appeal</p>
                <div className="flex justify-end">
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-white/40 group-hover:text-cyan-300 transition-all group-hover:translate-x-1" />
                </div>
              </div>
            </div>

            {/* Helpful tips card */}
            {/* Adjusted padding */}
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 sm:p-5 shadow-lg">
              {/* Adjusted icon size and margin */}
              <div className="flex items-center mb-2 sm:mb-3">
                <div className="p-1.5 sm:p-2 bg-gradient-to-br from-yellow-500/30 to-orange-500/30 rounded-lg">
                  <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-300" />
                </div>
                {/* Responsive text size */}
                <span className="ml-2 font-medium text-sm sm:text-base text-white/90">Pro Tips</span>
              </div>
              {/* Responsive text size */}
              <ul className="text-xs sm:text-sm text-white/70 space-y-1.5 sm:space-y-2 list-disc list-inside">
                <li>Include relevant keywords from the job description</li>
                <li>Keep formatting clean and consistent</li>
                <li>Quantify achievements with numbers when possible</li>
                <li>Use action verbs to describe your experiences</li>
              </ul>
            </div>
          </div>

          {/* Right side - Resume form */}
          <div className="lg:col-span-7 relative">
            {/* Adjusted blur effect */}
            <div className="absolute -z-10 inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl sm:rounded-3xl blur-lg sm:blur-xl transform rotate-1 sm:rotate-3 scale-100 sm:scale-105"></div>
            {/* Responsive padding */}
            <div className="p-4 sm:p-6 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 rounded-xl shadow-xl relative overflow-hidden">
              {/* Adjusted orb size/position */}
              <div className="absolute top-0 right-0 w-28 h-28 sm:w-40 sm:h-40 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full filter blur-xl sm:blur-2xl transform translate-x-1/4 sm:translate-x-1/3 -translate-y-1/3 sm:-translate-y-1/2"></div>
              <div className="relative z-10">
                {/* Assuming ResumeForm is already responsive or needs separate adjustments */}
                <ResumeForm />
                {/* Informational text about My Resumes */}
                {/* Adjusted padding and margin */}
                <div className="mt-4 sm:mt-6 p-3 sm:p-4 rounded-lg bg-gradient-to-r from-blue-900/40 to-purple-900/40 border border-blue-700/50 shadow-md">
                  {/* Adjusted icon size and margin */}
                  <div className="flex items-center mb-1.5 sm:mb-2">
                    <Info className="w-4 h-4 sm:w-5 sm:h-5 text-blue-300 mr-1.5 sm:mr-2 flex-shrink-0" />
                    {/* Responsive text size */}
                    <h4 className="font-semibold text-sm sm:text-base text-blue-200">Manage Your Resumes</h4>
                  </div>
                  {/* Responsive text size */}
                  <p className="text-xs sm:text-sm text-blue-100/90 mb-2 sm:mb-3">
                    All your generated resumes are saved securely. Visit the 'My Resumes' page to view, download, or even edit your documents online (for DOCX files via Microsoft viewer).
                  </p>
                  <Button
                    variant="outline"
                    size="sm" // Kept size sm
                    onClick={() => navigate('/my-resumes')}
                    // Adjusted text size and padding
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20 group transition-all duration-300 text-xs sm:text-sm px-3 py-1.5"
                  >
                    Go to My Resumes <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1.5 sm:ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Modal */}
      <UserProfileModal
        open={profileModalOpen}
        onOpenChange={setProfileModalOpen}
      />
    </div>
  );
};

export default Dashboard;
