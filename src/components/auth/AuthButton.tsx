import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useLocation } from "react-router-dom";
import { getUserLocation } from "@/utils/location";
import { Bot, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import { motion } from "framer-motion";

export const AuthButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        updateUserLocation(session.user.id);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const updateUserLocation = async (userId: string) => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('location_display, latitude, longitude')
        .eq('id', userId)
        .single();
      
      if (!profileError && (!profileData?.location_display || !profileData?.latitude || !profileData?.longitude)) {
        const location = await getUserLocation();
        if (location) {
          await supabase
            .from('profiles')
            .update({
              latitude: location.latitude,
              longitude: location.longitude,
              location_display: location.display,
              country: location.country_code
            })
            .eq('id', userId);
        }
      }
    } catch (error) {
      console.error('Error updating location:', error);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/home`,
        },
      });
      if (error) {
        toast({
          variant: "destructive",
          title: "Google Sign-In Error",
          description: error.message || "Failed to sign in with Google.",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "An unexpected error occurred.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      <div className="bg-gradient-to-br from-[#071B24]/70 to-[#0D2B39]/70 backdrop-blur-xl p-6 sm:p-8 md:p-10 rounded-2xl shadow-2xl relative transform transition-all duration-300 hover:scale-[1.01] border-l border-t border-[#4DBADC]/10">
        <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-[#071B24] p-2 rounded-full border-2 border-[#4DBADC]/20">
          <Bot className="w-7 h-7 sm:w-9 sm:h-9 text-[#4DBADC]" />
        </div>
        
        <div className="text-center space-y-6 pt-8">
          <motion.h2 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white via-[#E0E7FF] to-[#C7D2FE] bg-clip-text text-transparent"
          >
            Welcome to Resume Magic AI
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-[#B8E5F2]/80 text-sm sm:text-base"
          >
            Sign in with Google to unlock your career potential.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Button
              type="button"
              className="w-full flex items-center justify-center gap-3 py-3 text-base sm:text-lg
                         bg-white text-slate-800 border border-slate-300 hover:bg-slate-50 
                         transition-all duration-300 shadow-md hover:shadow-lg rounded-xl group"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-slate-700 border-t-transparent rounded-full animate-spin" />
              ) : (
                <FcGoogle className="w-6 h-6 sm:w-7 sm:h-7 transition-transform duration-300 group-hover:scale-110" />
              )}
              Sign in with Google
            </Button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex items-center justify-center pt-4"
          >
            <Gift className="w-5 h-5 text-amber-400 mr-2" />
            <p className="text-xs text-amber-300/90">
              Get 1 free resume optimization when you sign in!
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
