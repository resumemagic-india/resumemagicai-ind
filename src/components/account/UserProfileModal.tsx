import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, User, Download, Calendar, Mail, Phone, MapPin, Briefcase, Edit, Save, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router-dom";
import { UserDocumentPurchases } from './UserDocumentPurchases';

interface UserProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface UserProfile {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  phone_number: string | null;
  job_title: string | null;
  address: string | null;
  country: string | null;
  download_count: number;
  created_at: string;
}

interface EditableFields {
  phone_number: string;
  address: string;
  job_title: string;
}

export function UserProfileModal({ open, onOpenChange }: UserProfileModalProps) {
  const { session, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [documentPurchases, setDocumentPurchases] = useState<any[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<EditableFields>({
    defaultValues: {
      phone_number: "",
      address: "",
      job_title: ""
    }
  });

  useEffect(() => {
    if (open) {
      setLoading(true);
      setError(null);
      setIsEditing(false);
      setIsDeleting(false);
      fetchUserProfile();
    }
  }, [open]);

  useEffect(() => {
    if (profile) {
      form.reset({
        phone_number: profile.phone_number || "",
        address: profile.address || "",
        job_title: profile.job_title || ""
      });
    }
  }, [profile, form]);

  const fetchUserProfile = async () => {
    if (!session?.user?.id) {
      setLoading(false);
      setError("User not authenticated");
      return;
    }

    try {
      console.log("Fetching profile for user ID:", session.user.id);

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile:", error);
        setError(error.message);
        toast({
          variant: "destructive",
          title: "Error fetching profile",
          description: error.message
        });
        return;
      }

      if (!data) {
        console.warn("No profile found for user ID:", session.user.id);
        setError("Profile not found");
        return;
      }

      console.log("Profile fetched successfully:", data);
      setProfile(data);

      // Also fetch document purchases
      const { data: purchases, error: purchasesError } = await supabase
        .from('document_purchases')
        .select('*')
        .eq('user_id', session.user.id)
        .order('purchase_date', { ascending: false });

      if (purchasesError) {
        console.error("Error fetching document purchases:", purchasesError);
      } else {
        setDocumentPurchases(purchases || []);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unexpected error occurred";
      console.error("Unexpected error:", err);
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Unexpected error",
        description: "Failed to load profile information"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChanges = async (data: EditableFields) => {
    if (!session?.user?.id || !profile) return;

    setUpdating(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          phone_number: data.phone_number,
          address: data.address,
          job_title: data.job_title
        })
        .eq('id', session.user.id);

      if (error) {
        console.error("Error updating profile:", error);
        toast({
          variant: "destructive",
          title: "Update failed",
          description: error.message
        });
        return;
      }

      setProfile({
        ...profile,
        phone_number: data.phone_number,
        address: data.address,
        job_title: data.job_title
      });

      setIsEditing(false);
      toast({
        title: "Profile updated",
        description: "Your information has been successfully updated"
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unexpected error occurred";
      toast({
        variant: "destructive",
        title: "Update failed",
        description: errorMessage
      });
    } finally {
      setUpdating(false);
    }
  };

  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };

  const handleDeleteAccount = async () => {
    if (!session?.user?.id) {
      toast({ variant: "destructive", title: "Error", description: "User not authenticated." });
      return;
    }
    setIsDeleting(true);
    try {
      const { data, error: functionError } = await supabase.functions.invoke('delete-user-account');

      if (functionError) {
        console.error("Error invoking delete-user-account function:", functionError);
        let errorMessage = functionError.message || "Could not delete account.";
        if (functionError.context && functionError.context.error) {
          errorMessage = functionError.context.error.message || errorMessage;
        }
        throw new Error(errorMessage);
      }

      console.log("Delete function response:", data);

      toast({
        title: "Account Deleted",
        description: "Your account has been permanently deleted.",
      });

      await signOut();
      onOpenChange(false);
      navigate('/auth');
    } catch (err) {
      console.error("Error during account deletion process:", err);
      toast({
        variant: "destructive",
        title: "Deletion Failed",
        description: err instanceof Error ? err.message : "An unexpected error occurred.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-[#0F172A] border border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl text-center">My Account</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : error ? (
          <div className="py-6 text-center text-red-400">
            <p>Error: {error}</p>
            <Button
              onClick={fetchUserProfile}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              Try Again
            </Button>
          </div>
        ) : profile ? (
          <>
            <div className="flex justify-end mb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleEditMode}
                disabled={updating || isDeleting}
                className="text-cyan-400 hover:text-cyan-300 hover:bg-gray-800"
              >
                {isEditing ? (
                  <>
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </>
                ) : (
                  <>
                    <Edit className="h-4 w-4 mr-1" />
                    Edit Profile
                  </>
                )}
              </Button>
            </div>

            {isEditing ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSaveChanges)} className="space-y-4">
                  <div className="bg-[#1E293B] rounded-lg p-4 space-y-4">
                    <div className="flex items-center space-x-3">
                      <User className="h-5 w-5 text-cyan-400" />
                      <div className="w-full">
                        <p className="text-gray-400 text-sm">Name</p>
                        <p className="font-medium">
                          {profile.first_name && profile.last_name
                            ? `${profile.first_name} ${profile.last_name}`
                            : "Not provided"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-purple-400" />
                      <div className="w-full">
                        <p className="text-gray-400 text-sm">Email</p>
                        <p className="font-medium">{profile.email || "Not provided"}</p>
                      </div>
                    </div>

                    <FormField
                      control={form.control}
                      name="phone_number"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center space-x-3">
                            <Phone className="h-5 w-5 text-emerald-400 shrink-0" />
                            <div className="w-full">
                              <FormLabel className="text-gray-400 text-sm">Phone</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  className="bg-[#0F172A] border border-gray-700 text-white"
                                  placeholder="Enter your phone number"
                                />
                              </FormControl>
                            </div>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center space-x-3">
                            <MapPin className="h-5 w-5 text-red-400 shrink-0" />
                            <div className="w-full">
                              <FormLabel className="text-gray-400 text-sm">Address</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  className="bg-[#0F172A] border border-gray-700 text-white"
                                  placeholder="Enter your address"
                                />
                              </FormControl>
                            </div>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="job_title"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center space-x-3">
                            <Briefcase className="h-5 w-5 text-amber-400 shrink-0" />
                            <div className="w-full">
                              <FormLabel className="text-gray-400 text-sm">Job Title</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  className="bg-[#0F172A] border border-gray-700 text-white"
                                  placeholder="Enter your job title"
                                />
                              </FormControl>
                            </div>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="bg-[#1E293B] rounded-lg p-4 space-y-4">
                    <div className="flex items-center space-x-3">
                      <Download className="h-5 w-5 text-blue-400" />
                      <div>
                        <p className="text-gray-400 text-sm">Resume Downloads</p>
                        <p className="font-medium text-xl">{profile.download_count}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-indigo-400" />
                      <div>
                        <p className="text-gray-400 text-sm">Member Since</p>
                        <p className="font-medium">
                          {new Date(profile.created_at).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-500"
                    disabled={updating}
                  >
                    {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                  </Button>
                </form>
              </Form>
            ) : (
              <div className="space-y-4">
                <div className="bg-[#1E293B] rounded-lg p-4 space-y-4">
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-cyan-400" />
                    <div>
                      <p className="text-gray-400 text-sm">Name</p>
                      <p className="font-medium">
                        {profile.first_name && profile.last_name
                          ? `${profile.first_name} ${profile.last_name}`
                          : "Not provided"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-purple-400" />
                    <div>
                      <p className="text-gray-400 text-sm">Email</p>
                      <p className="font-medium">{profile.email || "Not provided"}</p>
                    </div>
                  </div>

                  {profile.phone_number && (
                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-emerald-400" />
                      <div>
                        <p className="text-gray-400 text-sm">Phone</p>
                        <p className="font-medium">{profile.phone_number}</p>
                      </div>
                    </div>
                  )}

                  {(profile.address || profile.country) && (
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-red-400" />
                      <div>
                        <p className="text-gray-400 text-sm">Address</p>
                        <p className="font-medium">
                          {profile.address && profile.country
                            ? `${profile.address}, ${profile.country}`
                            : profile.address || profile.country || "Not provided"}
                        </p>
                      </div>
                    </div>
                  )}

                  {profile.job_title && (
                    <div className="flex items-center space-x-3">
                      <Briefcase className="h-5 w-5 text-amber-400" />
                      <div>
                        <p className="text-gray-400 text-sm">Job Title</p>
                        <p className="font-medium">{profile.job_title}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-[#1E293B] rounded-lg p-4 space-y-4">
                  <div className="flex items-center space-x-3">
                    <Download className="h-5 w-5 text-blue-400" />
                    <div>
                      <p className="text-gray-400 text-sm">Resume Downloads</p>
                      <p className="font-medium text-xl">{profile.download_count}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-indigo-400" />
                    <div>
                      <p className="text-gray-400 text-sm">Member Since</p>
                      <p className="font-medium">
                        {new Date(profile.created_at).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {documentPurchases.length > 0 && (
                  <div className="mt-4">
                    <UserDocumentPurchases purchases={documentPurchases} />
                  </div>
                )}

                <div className="mt-6 pt-4 border-t border-red-500/30">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        className="w-full"
                        disabled={isDeleting}
                      >
                        {isDeleting ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          "Delete Account"
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-slate-900 border border-slate-700 text-white">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-red-400">Delete Account Confirmation</AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-300">
                          Are you absolutely sure you want to delete your account? This action cannot be undone.
                          This will permanently delete your account and all associated data (profile, resumes, etc.).
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="text-white border-slate-600 hover:bg-slate-700">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteAccount}
                          disabled={isDeleting}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          {isDeleting ? "Deleting..." : "Yes, Delete Account"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  <p className="text-xs text-center text-red-400/80 mt-2">
                    Account deletion is permanent and cannot be reversed.
                  </p>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="py-6 text-center text-gray-400">
            <p>Unable to load profile information.</p>
          </div>
        )}

        <DialogFooter>
          {!isEditing && (
            <Button onClick={() => onOpenChange(false)} className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 mt-4">
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
