
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Bot, Check, ArrowRight } from "lucide-react";

const EmailConfirmation = () => {
  return (
    <div className="min-h-screen bg-[#0F3847] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="relative w-full">
          <div className="absolute inset-0 bg-gradient-to-br from-[#4DBADC]/20 via-[#3A9DB8]/20 to-transparent rounded-3xl blur-lg transform -rotate-2"></div>
          <div className="bg-gradient-to-br from-[#071B24]/70 to-[#0D2B39]/70 backdrop-blur-xl p-6 md:p-8 rounded-2xl shadow-2xl relative transform transition-all duration-300 hover:scale-[1.01] border-l border-t border-[#4DBADC]/10">
            <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-[#071B24] p-2 rounded-full border-2 border-[#4DBADC]/20">
              <Bot className="w-8 h-8 text-[#4DBADC]" />
            </div>
            
            <div className="mt-6 text-center space-y-6">
              <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
                <Check className="w-8 h-8 text-green-500" />
              </div>
              
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-[#B8E5F2] bg-clip-text text-transparent">
                Email Verified Successfully!
              </h1>
              
              <p className="text-[#B8E5F2] text-base">
                Thank you for confirming your email address. You can now sign in to start using the application.
              </p>
              
              <Button 
                asChild
                className="w-full bg-gradient-to-r from-[#4DBADC] to-[#3A9DB8] hover:opacity-90 transition-all duration-300 mt-4"
              >
                <Link to="/auth">
                  Sign In <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailConfirmation;
