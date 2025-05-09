
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, ArrowLeft, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const roles = [
  { value: "student", label: "Student" },
  { value: "professional", label: "Professional" },
  { value: "other", label: "Other" },
];

const Feedback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { session } = useAuth();
  // Only allow valid download types or null
  const downloadType = location.state?.downloadType || null;
  const sourcePage = location.state?.sourcePage || 'unknown';

  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [detailedFeedback, setDetailedFeedback] = useState("");

  const handleBack = () => {
    navigate(sourcePage === 'home' ? '/home' : '/dashboard');
  };

  const handleSignOff = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !role || !rating) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (!session?.user) {
        toast({
          title: "Error",
          description: "You must be logged in to submit feedback",
          variant: "destructive",
        });
        return;
      }

      const feedbackData = {
        user_id: session.user.id,
        username,
        role,
        rating,
        detailed_feedback: detailedFeedback || null,
        download_type: downloadType,
        source_page: sourcePage
      };

      const { error } = await supabase
        .from('feedback')
        .insert([feedbackData]);

      if (error) {
        console.error('Submission error:', error);
        throw error;
      }

      toast({
        title: "Success",
        description: "Thank you for your feedback!",
      });
      navigate(sourcePage === 'home' ? '/home' : '/dashboard');
    } catch (error) {
      console.error('Feedback submission error:', error);
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col px-4">
      <div className="w-full max-w-xl mx-auto pt-6 flex justify-between">
        <Button
          variant="ghost"
          onClick={handleBack}
          className="text-white hover:bg-white/10"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="flex flex-col items-end space-y-2">
          <span className="text-sm text-white/60">{session?.user?.email}</span>
          <Button
            variant="ghost"
            onClick={handleSignOff}
            className="text-white hover:bg-white/10"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Off
          </Button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-xl w-full space-y-8 bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-2">Your Feedback Matters!</h2>
            <p className="text-white/60">Help us improve your resume optimization experience</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Your Name</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-royal-400"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Your Role</label>
              <Select required value={role} onValueChange={setRole}>
                <SelectTrigger className="w-full bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= (hoveredRating || rating)
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-white/20"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Detailed Feedback</label>
              <Textarea
                value={detailedFeedback}
                onChange={(e) => setDetailedFeedback(e.target.value)}
                className="min-h-[120px] bg-white/5 border-white/10 text-white placeholder:text-white/40"
                placeholder="Share your thoughts about the application..."
              />
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className="flex-1 bg-transparent border-white/10 text-white hover:bg-white/5"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-royal-600 to-royal-400 text-white hover:from-royal-700 hover:to-royal-500"
              >
                Submit Feedback
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Feedback;
