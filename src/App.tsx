import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { Toaster } from "@/components/ui/toaster";
import Dashboard from "@/pages/Dashboard";
import Auth from "@/pages/Auth";
import NotFound from "@/pages/NotFound";
import CreateResume from "@/pages/CreateResume";
import Home from "@/pages/Home";
import Feedback from "@/pages/Feedback";
import CoverLetter from "@/pages/CoverLetter";
import InterviewPrep from "@/pages/InterviewPrep";
import JobInterviewQuestions from "@/pages/JobInterviewQuestions";
import Pricing from "@/pages/Pricing";
import EmailConfirmation from "@/pages/EmailConfirmation";
import CareerRoadmap from "@/pages/CareerRoadmap";
import MyResumesPage from "@/pages/MyResumesPage"; // <-- Import the new page
import PaymentStatus from "@/pages/PaymentStatus"; // <-- Import PaymentStatus page
import { useAuth } from "@/components/auth/AuthProvider";

/* Removed duplicate App function */

function AuthRedirectCatcher({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    console.log("AuthRedirectCatcher checking URL: ", location.pathname);
    console.log("Hash: ", location.hash);
    console.log("Search params: ", location.search);
    
    // Store the original URL in session storage if it contains email confirmation parameters
    if ((location.hash.includes('type=email_confirmation') || 
         location.search.includes('redirect=email-confirmation'))) {
      sessionStorage.setItem('original_redirect_url', window.location.href);
      sessionStorage.setItem('email_confirmation_flow', 'true');
      console.log("Stored original redirect URL in session storage");
    }
    
    // Check hash parameters for auth tokens
    if (location.hash.includes('type=recovery')) {
      console.log("RESET URL DETECTED!", location.pathname);
      // If we're not already on the auth page, redirect immediately
      if (location.pathname !== '/auth') {
        navigate('/auth', { replace: true });
      }
    }
    
    // Check specifically for email confirmation in hash
    if (location.hash.includes('type=email_confirmation')) {
      console.log("EMAIL CONFIRMATION URL DETECTED in hash!", location.pathname);
      // Redirect to email confirmation page
      if (location.pathname !== '/email-confirmation') {
        navigate('/email-confirmation', { replace: true });
      }
    }
    
    // Check query parameters for redirects (after Supabase processes confirmation)
    const searchParams = new URLSearchParams(location.search);
    const redirectParam = searchParams.get('redirect');
    
    if (redirectParam) {
      console.log("Redirect parameter found:", redirectParam);
      
      // Check if the redirect param is pointing to email-confirmation
      if (redirectParam.includes('/email-confirmation') || redirectParam.includes('email-confirmation')) {
        console.log("EMAIL CONFIRMATION REDIRECT DETECTED in search params!", location.pathname);
        sessionStorage.setItem('email_confirmation_flow', 'true');
        if (location.pathname !== '/email-confirmation') {
          navigate('/email-confirmation', { replace: true });
        }
      }
    }
  }, [location, navigate]);
  
  return <>{children}</>;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, isEmailConfirmationFlow } = useAuth();
  const location = useLocation();
  
  // Special case for email confirmation flow - don't redirect to auth
  if (isEmailConfirmationFlow || location.pathname === '/email-confirmation') {
    return <>{children}</>;
  }
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated, isLoading, isEmailConfirmationFlow } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // This effect might be for analytics or other side effects on route change
    // console.log("Route changed:", location.pathname); 
  }, [location]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Unauthenticated state
  if (!isAuthenticated && !isEmailConfirmationFlow) {
    return (
      <Routes>
        <Route path="/" element={<Navigate to="/auth" replace />} />
        <Route path="/auth" element={<Auth />} />
        {/* Add Pricing route here for unauthenticated users */}
        <Route path="/pricing" element={<Pricing />} /> 
        {/* Also ensure email confirmation is accessible */}
        <Route path="/email-confirmation" element={<EmailConfirmation />} /> 
        <Route path="/payment-status" element={<PaymentStatus />} /> {/* Add PaymentStatus route */}
        {/* Catch-all redirects unknown paths back to Auth for unauthenticated users */}
        <Route path="*" element={<Navigate to="/auth" replace />} /> 
      </Routes>
    );
  }

  // Authenticated state (or email confirmation)
  return (
    <Routes>
      <Route 
        path="/" 
        element={<Navigate to={isAuthenticated ? "/home" : "/auth"} />} 
      />
      <Route 
        path="/auth" 
        // If authenticated and not in email flow, redirect from /auth to /home
        element={isAuthenticated && !isEmailConfirmationFlow ? <Navigate to="/home" /> : <Auth />} 
      />
      <Route path="/email-confirmation" element={<EmailConfirmation />} />
      
      {/* --- Protected Routes --- */}
      <Route path="/home" element={
        <ProtectedRoute>
          <Home />
        </ProtectedRoute>
      } />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/create-resume" element={
        <ProtectedRoute>
          <CreateResume />
        </ProtectedRoute>
      } />
      <Route path="/cover-letter" element={
        <ProtectedRoute>
          <CoverLetter />
        </ProtectedRoute>
      } />
       <Route path="/interview-prep" element={
        <ProtectedRoute>
          <InterviewPrep />
        </ProtectedRoute>
      } />
       <Route path="/job-interview-questions" element={
        <ProtectedRoute>
          <JobInterviewQuestions />
        </ProtectedRoute>
      } />
       <Route path="/career-roadmap" element={
        <ProtectedRoute>
          <CareerRoadmap />
        </ProtectedRoute>
      } />
       <Route path="/my-resumes" element={ // <-- Route for MyResumesPage
        <ProtectedRoute>
          <MyResumesPage />
        </ProtectedRoute>
      } />
      <Route path="/payment-status" element={<PaymentStatus />} /> {/* Add PaymentStatus route */}
      
      {/* --- Public/Semi-Public Routes (Accessible when authenticated too) --- */}
      {/* Keep Pricing route here as well for authenticated users */}
      <Route path="/pricing" element={<Pricing />} /> 
      
      {/* Catch-all for authenticated users */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthRedirectCatcher>
        <AuthProvider>
          <AppRoutes />
          <Toaster />
        </AuthProvider>
      </AuthRedirectCatcher>
    </Router>
  );
}

export default App;
