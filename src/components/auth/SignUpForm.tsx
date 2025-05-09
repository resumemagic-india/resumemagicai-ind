import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SignUpFormValues, signUpSchema } from "@/schemas/auth";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import termsContent from "@/marketing/terms-and-conditions.md?raw";

interface SignUpFormProps {
  isLoading: boolean;
  onSubmit: (data: SignUpFormValues) => Promise<void>;
}

// List of countries for the dropdown
const countries = [
  "United States",
  "Canada",
  "United Kingdom",
  "Australia",
  "Germany",
  "France",
  "Japan",
  "China",
  "Brazil",
  "India",
  "Spain",
  "Italy",
  "Mexico",
  "South Korea",
  "Netherlands",
  "Russia",
  "Switzerland",
  "Sweden",
  "Singapore",
  "New Zealand",
];

export const SignUpForm = ({ isLoading, onSubmit }: SignUpFormProps) => {
  const { toast } = useToast();
  const [emailSent, setEmailSent] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [termsMarkdown, setTermsMarkdown] = useState("");

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      phoneNumber: "",
      jobTitle: "",
      address: "",
      country: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  });

  useEffect(() => {
    setTermsMarkdown(termsContent);
  }, []);

  const checkEmailExists = async (email: string): Promise<boolean> => {
    try {
      setCheckingEmail(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("email")
        .eq("email", email)
        .maybeSingle();

      if (error) {
        console.error("Error checking email:", error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error("Error checking email existence:", error);
      return false;
    } finally {
      setCheckingEmail(false);
    }
  };

  const handleSubmit = async (data: SignUpFormValues) => {
    try {
      const emailExists = await checkEmailExists(data.email);

      if (emailExists) {
        toast({
          variant: "destructive",
          title: "Email already in use",
          description:
            "This email is already registered. Please use a different email or try signing in.",
        });
        return;
      }

      await onSubmit(data);
      setEmailSent(true);
      toast({
        title: "Verification email sent!",
        description: "Please check your email to confirm your account.",
      });
    } catch (error: any) {
      console.error("Sign up error:", error);

      if (error?.message?.includes("User already registered")) {
        toast({
          variant: "destructive",
          title: "Email already in use",
          description:
            "This email is already registered. Please use a different email or try signing in.",
        });
      } else {
        toast({
          title: "Error",
          description:
            error?.message || "Something went wrong. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  if (emailSent) {
    return (
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-semibold text-black">Check your email</h2>
        <p className="text-black">
          We've sent you a confirmation link to your email address. Please
          click the link to activate your account.
        </p>
        <p className="text-black text-sm">
          The confirmation email might take a few minutes to arrive. Don't
          forget to check your spam folder.
        </p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <Alert className="bg-gradient-to-r from-[#9b87f5]/20 to-[#7E69AB]/20 border-[#9b87f5]/30 mb-4">
          <InfoIcon className="h-4 w-4 text-[#9b87f5]" />
          <AlertDescription className="text-white text-sm">
            Ensure to provide accurate information when completing the signup
            form below, as our AI may utilize these details in output documents
            if needed.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">First Name *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your first name"
                    className="bg-white/50 border-gray-200 focus:border-[#9b87f5] focus:ring-[#9b87f5] transition-all duration-300"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Last Name *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your last name"
                    className="bg-white/50 border-gray-200 focus:border-[#9b87f5] focus:ring-[#9b87f5] transition-all duration-300"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Email *</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="bg-white/50 border-gray-200 focus:border-[#9b87f5] focus:ring-[#9b87f5] transition-all duration-300"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Phone Number *</FormLabel>
              <FormControl>
                <Input
                  type="tel"
                  placeholder="Enter your phone number with country code (e.g. +1 555-123-4567)"
                  className="bg-white/50 border-gray-200 focus:border-[#9b87f5] focus:ring-[#9b87f5] transition-all duration-300"
                  {...field}
                />
              </FormControl>
              <p className="text-xs text-white/70 mt-1">
                Please include your country code (e.g. +1, +44, +61)
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="jobTitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Job Title *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter your current job title"
                  className="bg-white/50 border-gray-200 focus:border-[#9b87f5] focus:ring-[#9b87f5] transition-all duration-300"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Address *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter your address"
                  className="bg-white/50 border-gray-200 focus:border-[#9b87f5] focus:ring-[#9b87f5] transition-all duration-300"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="country"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Country *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="bg-white/50 border-gray-200 focus:border-[#9b87f5] focus:ring-[#9b87f5] transition-all duration-300">
                    <SelectValue placeholder="Select your country" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-white">
                  {countries.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Password *</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  className="bg-white/50 border-gray-200 focus:border-[#9b87f5] focus:ring-[#9b87f5] transition-all duration-300"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Confirm Password *</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Confirm your password"
                  className="bg-white/50 border-gray-200 focus:border-[#9b87f5] focus:ring-[#9b87f5] transition-all duration-300"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="acceptTerms"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="border-white/50 data-[state=checked]:bg-[#9b87f5] data-[state=checked]:border-[#9b87f5]"
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="text-sm text-white">
                  I accept the{" "}
                  <Dialog>
                    <DialogTrigger className="text-[#9b87f5] hover:underline">
                      Terms and Conditions
                    </DialogTrigger>
                    <DialogContent className="max-h-[80vh] overflow-y-auto w-[90vw] max-w-md sm:max-w-lg md:max-w-xl bg-gradient-to-br from-[#071B24]/95 to-[#0D2B39]/95 backdrop-blur-xl border border-[#4DBADC]/20 text-[#B8E5F2]">
                      <DialogHeader>
                        <DialogTitle className="text-lg font-bold mb-4 text-white">
                          Terms and Conditions
                        </DialogTitle>
                      </DialogHeader>
                      <div className="prose prose-sm max-w-none dark:prose-invert text-gray-300">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {termsMarkdown}
                        </ReactMarkdown>
                      </div>
                    </DialogContent>
                  </Dialog>
                </FormLabel>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-[#9b87f5] to-[#7E69AB] hover:opacity-90 transition-all duration-300 text-white"
          disabled={isLoading || checkingEmail}
        >
          {(isLoading || checkingEmail) ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
          ) : null}
          Sign Up
        </Button>
      </form>
    </Form>
  );
};
