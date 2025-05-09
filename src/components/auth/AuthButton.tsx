import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AuthForm } from "./AuthForm";
import { SignUpForm } from "./SignUpForm";
import { AuthFormValues, SignUpFormValues } from "@/schemas/auth";
import { useNavigate, useLocation } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getUserLocation } from "@/utils/location";
import { Bot, Gift } from "lucide-react";
import { PasswordResetForm } from "./PasswordResetForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import termsContent from '@/marketing/terms-and-conditions.md?raw';
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";

export const AuthButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("signin");
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [emailConfirmed, setEmailConfirmed] = useState(false);
  const isMobile = useIsMobile();
  const [termsMarkdown, setTermsMarkdown] = useState('');

  useEffect(() => {
    console.log("AuthButton component mounted");
    
    const checkPasswordReset = () => {
      const searchParams = new URLSearchParams(location.search);
      const isResetMode = searchParams.get('reset') === 'true';
      
      if (isResetMode) {
        setShowPasswordReset(true);
      }
      
      const hashParams = new URLSearchParams(location.hash.substring(1));
      const type = hashParams.get('type');
      
      if (type === 'recovery') {
        setShowPasswordReset(true);
      }
      
      if (type === 'email_confirmation') {
        setEmailConfirmed(true);
        setActiveTab("signin");
        toast({
          title: "Email Confirmed",
          description: "Your email has been confirmed. Please sign in to continue.",
        });
      }
    };

    checkPasswordReset();
    setTermsMarkdown(termsContent);
  }, [location, toast]);

  const updateUserLocation = async (userId: string) => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('location_display, latitude, longitude')
        .eq('id', userId)
        .single();
      
      if (!profileError && (!profileData.location_display || !profileData.latitude || !profileData.longitude)) {
        console.log("Fetching location data for user...");
        const location = await getUserLocation();
        
        if (location) {
          console.log("Updating user location:", location.display);
          const { error } = await supabase
            .from('profiles')
            .update({
              latitude: location.latitude,
              longitude: location.longitude,
              location_display: location.display,
              country: location.country_code
            })
            .eq('id', userId);

          if (error) {
            console.error('Error updating location:', error);
          } else {
            console.log("Location successfully updated");
          }
        }
      }
    } catch (error) {
      console.error('Error updating location:', error);
    }
  };

  const handleSignIn = async (data: AuthFormValues) => {
    try {
      setIsLoading(true);
      console.log("Attempting to sign in with email/password");
      
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        console.log("Sign-in error:", error.message);
        if (error.message.includes('Invalid login credentials')) {
          toast({
            variant: "destructive",
            title: "Invalid credentials",
            description: "Please check your email and password and try again.",
          });
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: error.message || "An error occurred during sign in",
          });
        }
        return;
      }

      console.log("Sign in successful!");
      if (authData.user) {
        await updateUserLocation(authData.user.id);
      }

      toast({
        title: "Success",
        description: "You have successfully signed in",
      });

      navigate('/home');
    } catch (error: any) {
      console.error("Unexpected sign-in error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "An error occurred during sign in",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (data: SignUpFormValues) => {
    try {
      setIsLoading(true);
      console.log("Attempting to sign up with email/password");
      
      const { data: emailCheck, error: emailError } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', data.email)
        .maybeSingle();
      
      if (emailCheck) {
        console.log("Email already exists:", data.email);
        toast({
          variant: "destructive",
          title: "Email already exists",
          description: "This email is already registered. Please use a different email or try signing in.",
        });
        setIsLoading(false);
        return;
      }
      
      let locationData = null;
      try {
        locationData = await getUserLocation();
        console.log("Pre-fetched location data:", locationData ? locationData.display : "None");
      } catch (locationError) {
        console.warn("Could not pre-fetch location data:", locationError);
      }
      
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            phone_number: data.phoneNumber,
            job_title: data.jobTitle,
            address: data.address,
            country: data.country,
            ...(locationData && {
              latitude: locationData.latitude,
              longitude: locationData.longitude,
              location_display: locationData.display,
              country_code: locationData.country_code
            })
          },
          emailRedirectTo: `${window.location.origin}/auth`
        }
      });

      if (error) {
        console.error("Sign-up error:", error.message);
        if (error.message.includes('User already registered')) {
          toast({
            variant: "destructive",
            title: "Account exists",
            description: "An account with this email already exists. Please sign in instead.",
          });
          setActiveTab("signin");
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: error.message || "An error occurred during sign up",
          });
        }
        return;
      }

      console.log("Sign up successful!");
      if (authData.user && authData.session) {
        console.log("User signed up with immediate session - updating location");
        await updateUserLocation(authData.user.id);
        
        toast({
          title: "Welcome to Resume Magic AI!",
          description: "Your account has been created with 1 free download included. Try it now!",
        });
        
        navigate('/home');
      } else {
        console.log("User signed up, confirmation required - location will be updated on first sign in");
        
        toast({
          title: "Account created",
          description: "Please check your email and confirm your account to get your free download.",
        });
        
        setActiveTab("signin");
      }
    } catch (error: any) {
      console.error("Unexpected sign-up error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "An error occurred during sign up",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (email: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?reset=true`,
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to send password reset email",
        });
        return;
      }

      toast({
        title: "Password Reset Email Sent",
        description: "Check your email for the password reset link",
      });
      
      setShowPasswordReset(false);
      setActiveTab("signin");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "An unexpected error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async (password: string) => {
    try {
      setIsLoading(true);
      
      const hashParams = new URLSearchParams(location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      
      let error;
      
      if (accessToken) {
        const { error: resetError } = await supabase.auth.updateUser({ 
          password: password 
        });
        error = resetError;
      } else {
        const { error: updateError } = await supabase.auth.updateUser({
          password: password,
        });
        error = updateError;
      }

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to update password",
        });
        return;
      }

      toast({
        title: "Password Updated",
        description: "Your password has been updated successfully",
      });
      
      navigate('/auth', { replace: true });
      
      setShowPasswordReset(false);
      setActiveTab("signin");
      
      setTimeout(async () => {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          navigate('/home');
        }
      }, 500);
      
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "An unexpected error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const searchParams = new URLSearchParams(location.search);
  const isResetMode = searchParams.get('reset') === 'true';
  
  const hashParams = new URLSearchParams(location.hash.substring(1));
  const hasResetToken = hashParams.get('type') === 'recovery';

  const showResetForm = isResetMode || hasResetToken || showPasswordReset;

  return (
    <div className="relative w-full max-w-md mx-auto">
      <div className="absolute inset-0 bg-gradient-to-br from-[#4DBADC]/20 via-[#3A9DB8]/20 to-transparent rounded-3xl blur-lg transform -rotate-2"></div>
      <div className="bg-gradient-to-br from-[#071B24]/70 to-[#0D2B39]/70 backdrop-blur-xl p-4 sm:p-6 md:p-8 rounded-2xl shadow-2xl relative transform transition-all duration-300 hover:scale-[1.01] border-l border-t border-[#4DBADC]/10">
        <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-[#071B24] p-2 rounded-full border-2 border-[#4DBADC]/20">
          <Bot className="w-6 h-6 sm:w-8 sm:h-8 text-[#4DBADC]" />
        </div>
        
        {emailConfirmed && (
          <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
            <p className="text-green-400 text-sm text-center">
              Your email has been confirmed successfully!<br />
              Please sign in with your credentials to continue.
            </p>
          </div>
        )}
        
        {showResetForm ? (
          <div className="space-y-3 sm:space-y-4 pt-4">
            <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-white to-[#B8E5F2] bg-clip-text text-transparent">
              {hasResetToken ? "Set New Password" : "Reset Password"}
            </h2>
            <p className="text-[#B8E5F2]/70 text-sm sm:text-base">
              {hasResetToken 
                ? "Enter your new password below" 
                : "We'll send you a link to reset your password"}
            </p>
            <PasswordResetForm 
              isLoading={isLoading} 
              onSubmit={hasResetToken ? handleUpdatePassword : handlePasswordReset} 
              mode={hasResetToken ? "update" : "reset"} 
            />
            {!hasResetToken && (
              <button 
                onClick={() => setShowPasswordReset(false)}
                className="text-[#B8E5F2]/70 text-xs sm:text-sm hover:text-[#B8E5F2] mt-2"
              >
                Back to sign in
              </button>
            )}
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6 pt-4">
            <TabsList className="grid w-full grid-cols-2 bg-[#071B24]/60 p-1 rounded-xl border border-[#4DBADC]/10">
              <TabsTrigger 
                value="signin"
                className="data-[state=active]:bg-gradient-to-r from-[#4DBADC] to-[#3A9DB8] data-[state=active]:text-white rounded-lg transition-all duration-300 text-xs sm:text-sm"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger 
                value="signup"
                className="data-[state=active]:bg-gradient-to-r from-[#4DBADC] to-[#3A9DB8] data-[state=active]:text-white rounded-lg transition-all duration-300 text-xs sm:text-sm"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <div className="space-y-3 sm:space-y-4">
                <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-white to-[#B8E5F2] bg-clip-text text-transparent">
                  Welcome Back
                </h2>
                <p className="text-[#B8E5F2]/70 text-sm sm:text-base">Sign in to continue your journey</p>
                <AuthForm isLoading={isLoading} onSubmit={handleSignIn} />

                {/* Separator text */}
                <div className="flex items-center my-4">
                  <div className="flex-grow border-t border-gray-300"></div>
                  <span className="mx-3 text-gray-400 text-xs sm:text-sm">
                    or continue with Google to skip the signup process
                  </span>
                  <div className="flex-grow border-t border-gray-300"></div>
                </div>

                <Button
                  type="button"
                  className="w-full flex items-center justify-center gap-2 bg-white text-black border border-gray-200 hover:bg-gray-100 mt-2"
                  onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })}
                >
                  <FcGoogle className="w-5 h-5" />
                  Sign in with Google
                </Button>
                <button 
                  onClick={() => setShowPasswordReset(true)}
                  className="text-[#4DBADC] text-xs sm:text-sm hover:text-[#B8E5F2] mt-2"
                >
                  Forgot password?
                </button>
              </div>
            </TabsContent>
            
            <TabsContent value="signup">
              <div className="space-y-3 sm:space-y-4">
                <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-white to-[#B8E5F2] bg-clip-text text-transparent">
                  Create Account
                </h2>
                
                <p className="text-[#B8E5F2]/70 text-sm sm:text-base">Join us to start optimizing your resume</p>
                <SignUpForm isLoading={isLoading} onSubmit={handleSignUp} />
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};
