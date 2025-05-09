
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Mail, Lock } from "lucide-react";
import { passwordResetSchema, passwordUpdateSchema, PasswordResetValues, PasswordUpdateValues } from "@/schemas/auth";
import { useIsMobile } from "@/hooks/use-mobile";

interface PasswordResetFormProps {
  isLoading: boolean;
  mode: "reset" | "update";
  onSubmit: (emailOrPassword: string) => Promise<void>;
}

export const PasswordResetForm = ({ isLoading, mode, onSubmit }: PasswordResetFormProps) => {
  const isMobile = useIsMobile();
  
  // Initialize form based on mode
  const resetForm = useForm<PasswordResetValues>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: {
      email: "",
    },
  });

  const updateForm = useForm<PasswordUpdateValues>({
    resolver: zodResolver(passwordUpdateSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const handleResetSubmit = async (data: PasswordResetValues) => {
    try {
      await onSubmit(data.email);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleUpdateSubmit = async (data: PasswordUpdateValues) => {
    try {
      await onSubmit(data.password);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  // Render different form based on mode
  if (mode === "reset") {
    return (
      <Form {...resetForm}>
        <form onSubmit={resetForm.handleSubmit(handleResetSubmit)} className="space-y-3 sm:space-y-4">
          <FormField
            control={resetForm.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white text-xs sm:text-sm">Email</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#4DBADC] h-3 w-3 sm:h-4 sm:w-4" />
                    <Input 
                      type="email"
                      placeholder="Enter your email"
                      className="bg-[#071B24]/50 border-[#4DBADC]/30 focus:border-[#4DBADC] focus:ring-[#4DBADC] pl-8 sm:pl-10 text-white placeholder:text-[#B8E5F2]/40 transition-all duration-300 text-xs sm:text-sm h-9 sm:h-10"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-red-400 text-xs" />
              </FormItem>
            )}
          />
          
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-[#4DBADC] to-[#3A9DB8] hover:opacity-90 transition-all duration-300 mt-2 text-xs sm:text-sm h-9 sm:h-10" 
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            ) : null}
            Send Reset Link
          </Button>
        </form>
      </Form>
    );
  } else {
    return (
      <Form {...updateForm}>
        <form onSubmit={updateForm.handleSubmit(handleUpdateSubmit)} className="space-y-3 sm:space-y-4">
          <FormField
            control={updateForm.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white text-xs sm:text-sm">New Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#4DBADC] h-3 w-3 sm:h-4 sm:w-4" />
                    <Input 
                      type="password"
                      placeholder="Enter your new password"
                      className="bg-[#071B24]/50 border-[#4DBADC]/30 focus:border-[#4DBADC] focus:ring-[#4DBADC] pl-8 sm:pl-10 text-white placeholder:text-[#B8E5F2]/40 transition-all duration-300 text-xs sm:text-sm h-9 sm:h-10"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-red-400 text-xs" />
              </FormItem>
            )}
          />
          
          <FormField
            control={updateForm.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white text-xs sm:text-sm">Confirm Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#4DBADC] h-3 w-3 sm:h-4 sm:w-4" />
                    <Input 
                      type="password"
                      placeholder="Confirm your new password"
                      className="bg-[#071B24]/50 border-[#4DBADC]/30 focus:border-[#4DBADC] focus:ring-[#4DBADC] pl-8 sm:pl-10 text-white placeholder:text-[#B8E5F2]/40 transition-all duration-300 text-xs sm:text-sm h-9 sm:h-10"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-red-400 text-xs" />
              </FormItem>
            )}
          />
          
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-[#4DBADC] to-[#3A9DB8] hover:opacity-90 transition-all duration-300 mt-2 text-xs sm:text-sm h-9 sm:h-10" 
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            ) : null}
            Update Password
          </Button>
        </form>
      </Form>
    );
  }
};
