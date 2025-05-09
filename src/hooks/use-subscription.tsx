import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { getUserLocation } from '@/utils/location';
import { getDownloadStatus } from '@/utils/downloadManager'; // <-- NEW

interface SubscriptionStatus {
  isSubscribed: boolean;
  isBasicSubscription: boolean;
  isPerDocumentSubscription: boolean;
  isSubscriptionPlus: boolean;
  downloadCount: number;
  freeDownloadsRemaining: number;
  downloadLimitReached: boolean;
  email?: string;
  currentPeriodEnd?: string;
  location?: string;
  country?: string;
  cancelAtPeriodEnd?: boolean;
  downloadsRemaining?: number;
  totalDownloads?: number;
  hasUnlimitedDownloads: boolean;
  hasInterviewPrepAccess: boolean;
  hasPremiumTemplates: boolean;
  hasPrioritySupport: boolean;
  hasJobInterviewQuestionsAccess: boolean;
  hasCareerRoadmapAccess: boolean;
  isAdmin: boolean;
  documentPurchases?: Array<{
    id: string;
    purchase_date: string;
    quantity: number;
    used_quantity: number;
    remaining_quantity: number;
  }>;
  totalRemainingDocuments: number;
  interviewGenerations: number;
}

export const useSubscription = () => {
  const { session } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<SubscriptionStatus>({
    isSubscribed: false,
    isBasicSubscription: false,
    isPerDocumentSubscription: false,
    isSubscriptionPlus: false,
    downloadCount: 0,
    freeDownloadsRemaining: 0,
    downloadLimitReached: false,
    hasUnlimitedDownloads: false,
    hasInterviewPrepAccess: false,
    hasPremiumTemplates: false,
    hasPrioritySupport: false,
    hasJobInterviewQuestionsAccess: false,
    hasCareerRoadmapAccess: false,
    isAdmin: false,
    documentPurchases: [],
    totalRemainingDocuments: 0,
    interviewGenerations: 0,
  });
  const [loading, setLoading] = useState(true);
  const [cancellationLoading, setCancellationLoading] = useState(false);

  const checkSubscriptionStatus = async () => {
    try {
      setLoading(true);

      if (!session?.user?.id) return;

      // --- Download counts and status from downloadManager ---
      const downloadStatus = await getDownloadStatus(session.user.id);

      // --- Fetch other profile/subscription info as before ---
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('email, location_display, country, interview_generations')
        .eq('id', session.user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return;
      }

      const fetchedInterviewGenerations = profileData?.interview_generations ?? 0;

      // Define admin emails
      const ADMIN_EMAILS = ['arshinsandeep@gmail.com', 'resumemagicai@gmail.com'];
      const isAdmin = ADMIN_EMAILS.includes(profileData?.email ?? '');
      console.log('User email:', profileData?.email, 'Is admin:', isAdmin);

      const { data: documentPurchasesData, error: documentPurchasesError } = await supabase
        .from('document_purchases')
        .select('id, purchase_date, quantity, used_quantity, remaining_quantity')
        .eq('user_id', session.user.id)
        .order('purchase_date', { ascending: false });

      if (documentPurchasesError) {
        console.error('Error fetching document purchases:', documentPurchasesError);
      }

      const documentPurchases = documentPurchasesData || [];
      const totalDocumentPurchases = documentPurchases.reduce((total, purchase) => total + purchase.quantity, 0);
      const totalRemainingDocuments = documentPurchases.reduce((total, purchase) => total + purchase.remaining_quantity, 0);

      console.log('Document purchases:', documentPurchases);
      console.log('Total documents purchased:', totalDocumentPurchases);
      console.log('Total remaining documents:', totalRemainingDocuments);

      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('subscriptions')
        .select('plan_type, status, current_period_end, stripe_subscription_id, downloads_remaining, total_downloads, is_one_time_purchase, stripe_product_id')
        .eq('user_id', session.user.id)
        .eq('status', 'active');

      if (subscriptionError) {
        console.error('Error fetching subscription:', subscriptionError);
        return;
      }

      console.log('Subscription data:', subscriptionData);

      const userEmail = profileData?.email || session.user.email;
      const locationDisplay = profileData?.location_display;
      const country = profileData?.country;

      if (!locationDisplay) {
        try {
          const locationData = await getUserLocation();
          if (locationData) {
            await supabase
              .from('profiles')
              .update({
                latitude: locationData.latitude,
                longitude: locationData.longitude,
                location_display: locationData.display,
                country: locationData.country_code
              })
              .eq('id', session.user.id);
          }
        } catch (error) {
          console.error('Error updating location:', error);
        }
      }

      let activeSubscription = null;
      let hasSubscriptionPlus = false;
      let hasPerDocumentPlan = false;

      if (subscriptionData && subscriptionData.length > 0) {
        const SUBSCRIPTION_PLUS_PRODUCT_ID = import.meta.env.VITE_STRIPE_SUB_PLUS_PRODUCT_ID;
        const PER_DOCUMENT_PRODUCT_ID = import.meta.env.VITE_STRIPE_PER_DOC_PRODUCT_ID;

        const subscriptionPlusByProductId = subscriptionData.find(sub =>
          sub.stripe_product_id === SUBSCRIPTION_PLUS_PRODUCT_ID && sub.status === 'active'
        );

        const subscriptionPlusByType = subscriptionData.find(sub =>
          sub.plan_type && String(sub.plan_type) === 'subscription_plus' && sub.status === 'active'
        );

        const perDocumentSubscription = subscriptionData.find(sub =>
          (sub.stripe_product_id === PER_DOCUMENT_PRODUCT_ID || String(sub.plan_type) === 'per_document') &&
          sub.status === 'active' &&
          (sub.downloads_remaining !== undefined && sub.downloads_remaining > 0)
        );

        if (subscriptionPlusByProductId) {
          activeSubscription = subscriptionPlusByProductId;
          hasSubscriptionPlus = true;
          console.log('User has an active Subscription Plus plan identified by product ID, prioritizing it');
        } else if (subscriptionPlusByType) {
          activeSubscription = subscriptionPlusByType;
          hasSubscriptionPlus = true;
          console.log('User has an active Subscription Plus plan identified by plan type, prioritizing it');
        } else if (perDocumentSubscription) {
          activeSubscription = perDocumentSubscription;
          hasPerDocumentPlan = true;
          console.log('User has an active Pay Per Document plan with remaining downloads', perDocumentSubscription.downloads_remaining);
        } else {
          activeSubscription = subscriptionData[0];
          console.log('User has an active subscription (fallback):', activeSubscription.plan_type);
        }
      }

      let cancelAtPeriodEnd = false;
      if (activeSubscription?.stripe_subscription_id) {
        try {
          const { data, error } = await supabase.functions.invoke('check-subscription-status', {
            body: { subscriptionId: activeSubscription.stripe_subscription_id }
          });

          if (data && !error) {
            cancelAtPeriodEnd = data.cancel_at_period_end;
            console.log('Subscription cancel_at_period_end status:', cancelAtPeriodEnd);
          } else if (error) {
            console.error('Error checking subscription status:', error);
          }
        } catch (e) {
          console.error('Failed to invoke check-subscription-status function:', e);
        }
      }

      const isSubscribed = !!activeSubscription;
      const isBasicSubscription = isSubscribed && !hasSubscriptionPlus && !hasPerDocumentPlan && String(activeSubscription?.plan_type) === 'basic';
      const isPerDocumentSubscription = hasPerDocumentPlan;
      const isSubscriptionPlus = hasSubscriptionPlus;

      const currentPeriodEnd = activeSubscription?.current_period_end;

      const downloadLimitReached = !isAdmin && !downloadStatus.hasDownloads;

      console.log(`Downloads - Count: ${downloadStatus.downloadCount}, Free Remaining: ${downloadStatus.freeDownloadsRemaining}, Plan Remaining: ${downloadStatus.downloadsRemaining}, Total Allowed: ${downloadStatus.downloadsUsed}, Limit Reached: ${downloadLimitReached}`);

      const hasUnlimitedDownloads = isSubscriptionPlus || isAdmin;

      const hasInterviewPrepAccess = isSubscriptionPlus || isAdmin;

      const hasPremiumTemplates = isSubscriptionPlus || (isSubscribed && downloadStatus.hasDownloads) || isAdmin;
      const hasPrioritySupport = isSubscriptionPlus || isAdmin;
      const hasJobInterviewQuestionsAccess = isSubscriptionPlus || isAdmin;

      const hasCareerRoadmapAccess = isSubscriptionPlus || isAdmin;

      setStatus({
        isSubscribed,
        isBasicSubscription,
        isPerDocumentSubscription,
        isSubscriptionPlus,
        downloadCount: downloadStatus.downloadCount,
        freeDownloadsRemaining: isAdmin ? 999 : downloadStatus.freeDownloadsRemaining,
        downloadLimitReached,
        email: userEmail,
        currentPeriodEnd,
        location: locationDisplay,
        country,
        cancelAtPeriodEnd,
        downloadsRemaining: downloadStatus.downloadsRemaining,
        totalDownloads: downloadStatus.downloadsUsed,
        hasUnlimitedDownloads,
        hasInterviewPrepAccess,
        hasPremiumTemplates,
        hasPrioritySupport,
        hasJobInterviewQuestionsAccess,
        hasCareerRoadmapAccess,
        documentPurchases,
        totalRemainingDocuments,
        isAdmin,
        interviewGenerations: fetchedInterviewGenerations,
      });

    } catch (error) {
      console.error('Error in checkSubscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadAttempt = async (): Promise<boolean> => {
    if (!session?.user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to download documents",
        variant: "destructive",
      });
      return false;
    }

    try {
      if (status.isSubscriptionPlus || status.isAdmin) {
        console.log('User has Subscription Plus, allowing download');
        return true;
      }

      const { data: purchases, error: purchasesError } = await supabase
        .from('document_purchases')
        .select('id, quantity, used_quantity, remaining_quantity')
        .eq('user_id', session.user.id)
        .gt('remaining_quantity', 0);
        
      if (purchasesError) {
        console.error('Error checking document purchases:', purchasesError);
      } else if (purchases && purchases.length > 0) {
        const totalRemaining = purchases.reduce((total, purchase) => 
          total + (purchase.remaining_quantity || 0), 0);
          
        console.log(`User has ${totalRemaining} purchased documents remaining`);
        
        if (totalRemaining > 0) {
          return true;
        }
      }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('free_downloads_remaining')
        .eq('id', session.user.id)
        .single();
        
      if (profileError) {
        console.error('Error checking free downloads:', profileError);
      } else if (profileData?.free_downloads_remaining && profileData.free_downloads_remaining > 0) {
        console.log(`User has ${profileData.free_downloads_remaining} free downloads remaining`);
        return true;
      }

      toast({
        title: "No downloads remaining",
        description: "Please purchase more documents to continue",
        variant: "destructive",
      });
      
      navigate('/pricing');
      return false;
    } catch (error) {
      console.error('Error in handleDownloadAttempt:', error);
      toast({
        title: "Error checking download availability",
        description: "Please try again later",
        variant: "destructive",
      });
      return false;
    }
  };

  const cancelSubscription = async (): Promise<boolean> => {
    try {
      setCancellationLoading(true);

      if (!session) {
        toast({
          title: "Not logged in",
          description: "Please log in to cancel your subscription.",
          variant: "destructive",
        });
        return false;
      }

      const { data, error } = await supabase.functions.invoke('cancel-subscription');

      console.log('Cancel subscription response:', data, error);

      if (error) {
        console.error('Error canceling subscription:', error);
        toast({
          title: "Cancellation failed",
          description: error.message || "There was an error processing your cancellation request.",
          variant: "destructive",
        });
        return false;
      }

      if (data?.noSubscription) {
        toast({
          title: "No active subscription",
          description: data.message || "You don't have an active subscription to cancel.",
          variant: "destructive",
        });
        return false;
      }

      if (data?.success) {
        await checkSubscriptionStatus();

        toast({
          title: "Subscription canceled",
          description: data.message || "Your subscription will remain active until the end of the current billing period.",
        });
        return true;
      } else {
        toast({
          title: "Cancellation failed",
          description: data?.message || "There was an error processing your cancellation request.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('Error in cancelSubscription:', error);
      toast({
        title: "Cancellation failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
        variant: "destructive",
      });
      return false;
    } finally {
      setCancellationLoading(false);
    }
  };

  const canAccessMockInterview = status.isSubscriptionPlus || status.isAdmin || (status.interviewGenerations ?? 0) < 1;

  const incrementInterviewGenerations = async () => {
    if (status.isSubscriptionPlus || status.isAdmin) return;
    if (!session?.user?.id) return;

    if ((status.interviewGenerations ?? 0) >= 1) {
      console.log("User has already used their free interview generation.");
      return;
    }

    const newCount = (status.interviewGenerations ?? 0) + 1;
    const { error } = await supabase
      .from('profiles')
      .update({ interview_generations: newCount })
      .eq('id', session.user.id);

    if (!error) {
      setStatus(prevStatus => ({
        ...prevStatus,
        interviewGenerations: newCount
      }));
      console.log("Incremented interview generations count to:", newCount);
    } else {
      console.error("Failed to update interview generations count in DB:", error);
    }
  };

  useEffect(() => {
    if (session?.user?.id) {
      checkSubscriptionStatus();
    } else {
      setLoading(false);
    }
  }, [session?.user?.id]);

  return {
    ...status,
    loading,
    cancellationLoading,
    checkSubscriptionStatus,
    handleDownloadAttempt,
    cancelSubscription,
    canAccessMockInterview,
    incrementInterviewGenerations,
  };
};
