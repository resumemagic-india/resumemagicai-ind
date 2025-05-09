import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CompleteProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: any;
  userId: string;
  onProfileUpdated: () => void;
}

export function CompleteProfileModal({
  open,
  onOpenChange,
  profile,
  userId,
  onProfileUpdated,
}: CompleteProfileModalProps) {
  const { toast } = useToast();
  const [form, setForm] = useState({
    first_name: profile?.first_name || "",
    last_name: profile?.last_name || "",
    phone_number: profile?.phone_number || "",
    job_title: profile?.job_title || "",
    address: profile?.address || "",
  });
  const [loading, setLoading] = useState(false);

  const isProfileComplete =
    form.first_name &&
    form.last_name &&
    form.phone_number &&
    form.job_title &&
    form.address;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isProfileComplete) {
      toast({ title: "All fields are required", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: form.first_name,
        last_name: form.last_name,
        phone_number: form.phone_number,
        job_title: form.job_title,
        address: form.address,
      })
      .eq("id", userId);
    setLoading(false);
    if (error) {
      toast({
        title: "Failed to update profile",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Profile updated!" });
      onOpenChange(false);
      onProfileUpdated();
    }
  };

  // Custom close handler for the Dialog
  const handleAttemptClose = () => {
    if (!isProfileComplete) {
      toast({
        title: "Complete Your Profile",
        description: "Please fill in all required profile fields before closing.",
        variant: "destructive",
      });
      return;
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={isProfileComplete ? onOpenChange : () => {}}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Complete Your Profile</DialogTitle>
          {/* Only render the close button if profile is complete */}
          {isProfileComplete && (
            <DialogClose asChild>
              <button
                type="button"
                aria-label="Close"
                className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
                onClick={() => onOpenChange(false)}
              >
                <span aria-hidden>×</span>
              </button>
            </DialogClose>
          )}
          {/* If not complete, intercept close attempts */}
          {!isProfileComplete && (
            <button
              type="button"
              aria-label="Close"
              className="absolute right-4 top-4 rounded-sm opacity-30 cursor-not-allowed pointer-events-none"
              onClick={handleAttemptClose}
              tabIndex={-1}
              disabled
            >
              <span aria-hidden>×</span>
            </button>
          )}
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            name="first_name"
            placeholder="First Name"
            value={form.first_name}
            onChange={handleChange}
            required
          />
          <Input
            name="last_name"
            placeholder="Last Name"
            value={form.last_name}
            onChange={handleChange}
            required
          />
          <Input
            name="phone_number"
            placeholder="Phone Number"
            value={form.phone_number}
            onChange={handleChange}
            required
          />
          <Input
            name="job_title"
            placeholder="Job Title"
            value={form.job_title}
            onChange={handleChange}
            required
          />
          <Input
            name="address"
            placeholder="Address"
            value={form.address}
            onChange={handleChange}
            required
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
