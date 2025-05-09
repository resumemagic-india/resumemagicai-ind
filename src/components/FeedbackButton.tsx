
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";

const FeedbackButton = () => {
  const navigate = useNavigate();

  return (
    <Button
      onClick={() => navigate('/feedback')}
      className="fixed bottom-4 left-4 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg"
    >
      <MessageSquare className="w-4 h-4 mr-2" />
      Rate & Provide Feedback
    </Button>
  );
};

export default FeedbackButton;
