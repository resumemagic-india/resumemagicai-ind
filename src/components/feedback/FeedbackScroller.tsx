
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Star, Quote } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type Feedback = {
  id: string;
  username: string;
  role: string;
  rating: number;
  detailed_feedback: string | null;
};

export const FeedbackScroller = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        setIsLoading(true);
        console.log("Fetching feedbacks from Supabase...");
        
        // Query the actual feedback table from Supabase
        const { data, error } = await supabase
          .from("feedback")
          .select("id, username, role, rating, detailed_feedback")
          .gte("rating", 4) // Only get 4-5 star reviews
          .not("detailed_feedback", "is", null) // Only get reviews with detailed feedback
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching feedbacks:", error);
          throw error;
        }
        
        console.log("Fetched feedback data:", data);
        
        // Only use the data from the database, no sample fallback
        setFeedbacks(data || []);
      } catch (error) {
        console.error("Error in feedback fetch:", error);
        // Set empty array instead of falling back to sample data
        setFeedbacks([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeedbacks();
  }, []);

  useEffect(() => {
    if (feedbacks.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % feedbacks.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [feedbacks]);

  // If still loading, show skeleton
  if (isLoading) {
    return (
      <div className="w-80 backdrop-blur-lg bg-gradient-to-br from-[#0F3847]/70 to-[#0D2B39]/70 rounded-xl p-4 border border-[#4DBADC]/20 shadow-lg">
        <h3 className="text-lg font-medium text-[#B8E5F2] flex items-center gap-2 mb-3">
          <Quote className="w-5 h-5 text-[#4DBADC]" />
          User Feedback
        </h3>
        <Skeleton className="h-24 bg-[#0D2B39]/50" />
      </div>
    );
  }

  // If no feedbacks found, don't display anything
  if (feedbacks.length === 0) {
    return null;
  }

  return (
    <div className="w-80 backdrop-blur-lg bg-gradient-to-br from-[#0F3847]/70 to-[#0D2B39]/70 rounded-xl p-4 border border-[#4DBADC]/20 shadow-lg">
      <h3 className="text-lg font-medium text-[#B8E5F2] flex items-center gap-2 mb-3">
        <Quote className="w-5 h-5 text-[#4DBADC]" />
        User Feedback
      </h3>
      
      <ScrollArea className="h-40 overflow-hidden">
        <div className="transition-all duration-500 ease-in-out">
          {feedbacks.map((feedback, index) => (
            <Card 
              key={feedback.id}
              className={`bg-[#0D2B39]/80 border-[#4DBADC]/20 mb-4 transition-opacity duration-500 ${
                index === currentIndex ? "opacity-100" : "opacity-0 absolute -z-10"
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <p className="font-medium text-white">{feedback.username}</p>
                    <p className="text-sm text-[#B8E5F2]/70">{feedback.role}</p>
                  </div>
                  <div className="flex">
                    {Array.from({ length: feedback.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#4DBADC] text-[#4DBADC]" />
                    ))}
                  </div>
                </div>
                
                {feedback.detailed_feedback && (
                  <p className="mt-2 text-[#B8E5F2] italic text-sm">
                    "{feedback.detailed_feedback.length > 120 
                      ? `${feedback.detailed_feedback.substring(0, 120)}...` 
                      : feedback.detailed_feedback}"
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
        
        {feedbacks.length > 1 && (
          <div className="flex justify-center gap-1 mt-2">
            {feedbacks.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex ? "bg-[#4DBADC]" : "bg-[#4DBADC]/30"
                }`}
                onClick={() => setCurrentIndex(index)}
                aria-label={`Review ${index + 1}`}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
