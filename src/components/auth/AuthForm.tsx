
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
import { AuthFormValues, authSchema } from "@/schemas/auth";
import { Mail, Lock } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface AuthFormProps {
  isLoading: boolean;
  onSubmit: (data: AuthFormValues) => Promise<void>;
}

export const AuthForm = ({ isLoading, onSubmit }: AuthFormProps) => {
  const form = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const isMobile = useIsMobile();

  const handleSubmit = async (data: AuthFormValues) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3 sm:space-y-4">
        <FormField
          control={form.control}
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

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white text-xs sm:text-sm">Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#4DBADC] h-3 w-3 sm:h-4 sm:w-4" />
                  <Input 
                    type="password"
                    placeholder="Enter your password"
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
          Sign In
        </Button>
      </form>
    </Form>
  );
};
