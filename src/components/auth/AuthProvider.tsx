import { createContext, useContext, useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import { getUserLocation } from "@/utils/location";

interface AuthContextType {
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signOut: () => Promise<void>;
  isEmailConfirmationFlow: boolean;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  isAuthenticated: false,
  isLoading: true,
  signOut: async () => {},
  isEmailConfirmationFlow: false,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isEmailConfirmationFlow, setIsEmailConfirmationFlow] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const justVerified = useRef(false);
  const initialLoadComplete = useRef(false);

  const updateUserLocation = async (userId: string) => {
    try {
      console.log("Attempting to update location for user:", userId);
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('latitude, longitude, location_display')
        .eq('id', userId)
        .single();
      
      if (!profileError && 
          (!profile.latitude || !profile.longitude || !profile.location_display)) {
        console.log("Location data missing or incomplete, fetching new location data");
        const locationData = await getUserLocation();
        
        if (locationData) {
          console.log("Got location data:", locationData.display);
          const { error: updateError } = await supabase
            .from('profiles')
            .update({
              latitude: locationData.latitude,
              longitude: locationData.longitude,
              location_display: locationData.display,
              country: locationData.country_code
            })
            .eq('id', userId);
            
          if (updateError) {
            console.error("Error updating location in database:", updateError);
          } else {
            console.log("Successfully updated location for user:", userId);
          }
        } else {
          console.log("Could not retrieve location data");
        }
      } else if (profileError) {
        console.error("Error fetching profile:", profileError);
      } else {
        console.log("User already has complete location data");
      }
    } catch (error) {
      console.error('Error in updateUserLocation:', error);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setSession(null);
      setIsAuthenticated(false);
      navigate('/auth', { replace: true });
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error Signing Out",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const checkEmailConfirmationFlow = () => {
    const url = window.location.href;
    
    setIsEmailConfirmationFlow(false);
    
    if (location.hash.includes('type=email_confirmation')) {
      console.log("Email confirmation hash detected");
      setIsEmailConfirmationFlow(true);
      return true;
    }
    
    const searchParams = new URLSearchParams(location.search);
    const redirectParam = searchParams.get('redirect');
    
    if (redirectParam && redirectParam.includes('email-confirmation')) {
      console.log("Email confirmation redirect parameter detected");
      setIsEmailConfirmationFlow(true);
      return true;
    }
    
    if (sessionStorage.getItem('email_confirmation_flow') === 'true') {
      console.log("Email confirmation flow detected from session storage");
      setIsEmailConfirmationFlow(true);
      return true;
    }
    
    return false;
  };

  const checkForRedirectParams = () => {
    console.log("Checking URL for redirects...");
    console.log("Current URL:", window.location.href);
    console.log("Current hash:", location.hash);
    console.log("Current search params:", location.search);
    
    if (!sessionStorage.getItem('original_redirect_url') && 
        (location.hash.includes('type=email_confirmation') || 
         location.search.includes('redirect=email-confirmation'))) {
      sessionStorage.setItem('original_redirect_url', window.location.href);
      sessionStorage.setItem('email_confirmation_flow', 'true');
      console.log("Stored original redirect URL in session storage");
    }
    
    const hashParams = new URLSearchParams(location.hash.substring(1));
    const type = hashParams.get('type');
    const accessToken = hashParams.get('access_token');
    
    const queryParams = new URLSearchParams(location.search);
    const redirectUrl = queryParams.get('redirect');
    
    console.log("Hash type:", type);
    console.log("Access token exists:", !!accessToken);
    console.log("Redirect URL:", redirectUrl);
    
    if (type === 'recovery' && accessToken) {
      console.log("Password reset token detected in URL");
      if (location.pathname !== '/auth') {
        navigate('/auth', { replace: true });
        return true;
      }
    }
    
    if (type === 'email_confirmation' || location.hash.includes('type=email_confirmation')) {
      console.log("Email confirmation token detected in URL hash");
      justVerified.current = true;
      
      if (location.pathname !== '/email-confirmation') {
        navigate('/email-confirmation', { replace: true });
        return true;
      }
    }
    
    if (redirectUrl) {
      console.log("Redirect parameter detected:", redirectUrl);
      
      if (redirectUrl.includes('/email-confirmation') || redirectUrl.includes('email-confirmation')) {
        console.log("Redirect to email confirmation page detected");
        
        sessionStorage.setItem('email_confirmation_flow', 'true');
        
        if (location.pathname !== '/email-confirmation') {
          navigate('/email-confirmation', { replace: true });
          return true;
        }
      }
    }
    
    return false;
  };

  const handlePostVerificationRedirect = () => {
    if (justVerified.current && 
        initialLoadComplete.current &&
        !location.hash.includes('type=') && 
        !location.search.includes('redirect=')) {
      
      console.log("Handling post-verification redirect");
      
      if (sessionStorage.getItem('email_confirmation_flow') === 'true') {
        console.log("Redirecting to email confirmation page after verification");
        
        sessionStorage.removeItem('email_confirmation_flow');
        justVerified.current = false;
        
        if (location.pathname !== '/email-confirmation') {
          navigate('/email-confirmation', { replace: true });
          return true;
        }
      }
    }
    return false;
  };

  useEffect(() => {
    console.log("AuthProvider mounted. Current path:", location.pathname);
    let mounted = true;

    checkEmailConfirmationFlow();
    
    if (checkForRedirectParams()) {
      setIsLoading(false);
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      console.log("Auth state changed:", event, "Session:", !!currentSession);

      if (!mounted) return;

      if (checkForRedirectParams()) {
        return;
      }

      if (event === 'SIGNED_OUT') {
        setSession(null);
        setIsAuthenticated(false);
        if (location.pathname !== '/auth' && location.pathname !== '/email-confirmation') {
          navigate('/auth', { replace: true });
        }
      } else if (event === 'PASSWORD_RECOVERY') {
        console.log("Password recovery event detected");
        setIsLoading(false);
        setIsAuthenticated(false);
        if (location.pathname !== '/auth') {
          navigate('/auth', { replace: true });
        }
      } else if (event === 'USER_UPDATED' && currentSession) {
        setSession(currentSession);
        setIsAuthenticated(true);
        
        setTimeout(async () => {
          if (currentSession.user) {
            await updateUserLocation(currentSession.user.id);
          }
        }, 0);
      } else if (event === 'SIGNED_IN' && currentSession) {
        setSession(currentSession);
        setIsAuthenticated(true);
        
        setTimeout(async () => {
          if (currentSession.user) {
            await updateUserLocation(currentSession.user.id);
            
            if (sessionStorage.getItem('email_confirmation_flow') === 'true') {
              console.log("Email confirmation flow detected during sign-in");
              if (location.pathname !== '/email-confirmation') {
                navigate('/email-confirmation', { replace: true });
              }
            } 
            else if (!checkForRedirectParams() && 
                !handlePostVerificationRedirect() &&
                location.pathname === '/auth' && 
                !location.hash.includes('type=') && 
                !location.search.includes('redirect=')) {
              navigate('/home', { replace: true });
            }
          }
        }, 0);
      } else if (event === 'TOKEN_REFRESHED' && currentSession) {
        setSession(currentSession);
        setIsAuthenticated(true);
      }
      
      setIsLoading(false);
    });

    const checkAuth = async () => {
      try {
        if (checkForRedirectParams()) {
          return;
        }

        console.log("Checking for existing session...");
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (checkForRedirectParams()) {
          return;
        }

        if (currentSession?.access_token) {
          console.log("User is authenticated");
          setSession(currentSession);
          setIsAuthenticated(true);
          
          if (currentSession.user) {
            setTimeout(async () => {
              await updateUserLocation(currentSession.user.id);
            }, 0);
          }
          
          if (sessionStorage.getItem('email_confirmation_flow') === 'true') {
            console.log("Email confirmation flow detected during session check");
            if (location.pathname !== '/email-confirmation') {
              navigate('/email-confirmation', { replace: true });
            }
          }
          else if (!checkForRedirectParams() && 
              !handlePostVerificationRedirect() &&
              location.pathname === '/auth' && 
              !location.hash.includes('type=') && 
              !location.search.includes('redirect=')) {
            navigate('/home', { replace: true });
          }
        } else {
          console.log("User is not authenticated");
          setSession(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Error checking auth status:", error);
        setSession(null);
        setIsAuthenticated(false);
      } finally {
        if (mounted) {
          setIsLoading(false);
          initialLoadComplete.current = true;
          
          setTimeout(() => {
            handlePostVerificationRedirect();
          }, 100);
        }
      }
    };

    checkAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, location.pathname, location.hash, location.search, toast]);

  useEffect(() => {
    if (initialLoadComplete.current) {
      handlePostVerificationRedirect();
    }
    
    checkEmailConfirmationFlow();
  }, [location]);

  return (
    <AuthContext.Provider value={{ 
      session, 
      isAuthenticated, 
      isLoading, 
      signOut,
      isEmailConfirmationFlow 
    }}>
      {children}
    </AuthContext.Provider>
  );
}
