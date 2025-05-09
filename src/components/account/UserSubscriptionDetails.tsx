import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistance, format } from 'date-fns';
import { FileText, Star, Calendar, ArrowRight, DownloadCloud, Mail, AlertCircle, X, ExternalLink, InfinityIcon } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSubscription } from '@/hooks/use-subscription';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface Subscription {
  id: string;
  plan_type: 'basic' | 'subscription_plus' | 'per_document';
  status: string;
  created_at: string;
  current_period_end: string;
  current_period_start: string;
  email?: string;
  product_name?: string;
}

interface Profile {
  email: string;
  download_count: number;
  free_downloads_remaining: number;
}

interface DocumentPurchase {
  id: string;
  purchase_date: string;
  quantity: number;
  used_quantity: number;
  remaining_quantity: number;
}

export const UserSubscriptionDetails = () => {
  const { session } = useAuth();
  const { toast } = useToast();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [documentPurchases, setDocumentPurchases] = useState<DocumentPurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [stripeLoading, setStripeLoading] = useState(false);
  const navigate = useNavigate();
  
  const { 
    cancelAtPeriodEnd,
    currentPeriodEnd,
    cancelSubscription, 
    cancellationLoading,
    downloadsRemaining,
    totalDownloads,
    isSubscriptionPlus,
    documentPurchases: subscriptionDocumentPurchases,
    totalRemainingDocuments
  } = useSubscription();

  useEffect(() => {
    const fetchSubscriptionData = async () => {
      if (!session?.user?.id) return;
      
      try {
        setLoading(true);
        
        const { data: subData, error: subError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('status', 'active')
          .returns<Subscription[]>(); // Explicitly type the returned data
        
        if (subError) {
          console.error('Error fetching subscription:', subError);
        } else if (subData && subData.length > 0) {
            const subPlus = subData.find(sub => sub.plan_type === 'subscription_plus');
            if (subPlus) {
              setSubscription(subPlus as Subscription);
              console.log('User has Subscription Plus, prioritizing it');
            } else {
              const subBasic = subData.find(sub => sub.plan_type === 'basic');
              if (subBasic) {
                setSubscription(subBasic as Subscription);
                console.log('Setting active subscription: basic');
              } else {
                // Fallback to the first active subscription if neither plus nor basic is found
                setSubscription(subData[0] as Subscription);
                console.log(`Setting first active subscription: ${subData[0].plan_type}`);
              }
            }
          if (subPlus) {
            setSubscription(subPlus as Subscription); // Assert type here
            console.log('User has Subscription Plus, prioritizing it');
          } else {
            setSubscription(subData[0] as Subscription); // Assert type here
            console.log(`Setting active subscription: ${subData[0].plan_type}`);
          }
        } else {
          console.log('No active subscription found for user');
          setSubscription(null);
        }
        
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('email, download_count, free_downloads_remaining')
          .eq('id', session.user.id)
          .single();
          
        if (profileError) {
          console.error('Error fetching profile:', profileError);
        } else if (profileData) {
          setProfile(profileData);
        }
        
        const { data: docPurchasesData, error: docPurchasesError } = await supabase
          .from('document_purchases')
          .select('id, purchase_date, quantity, used_quantity, remaining_quantity')
          .eq('user_id', session.user.id)
          .order('purchase_date', { ascending: false });
          
        if (docPurchasesError) {
          console.error('Error fetching document purchases:', docPurchasesError);
        } else if (docPurchasesData) {
          setDocumentPurchases(docPurchasesData);
        }
      } catch (error) {
        console.error('Error fetching subscription data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSubscriptionData();
  }, [session?.user?.id]);

  const handleNavigateToPricing = () => {
    navigate('/pricing');
  };
  
  const handleCancelSubscription = async () => {
    const success = await cancelSubscription();
    if (success) {
      setShowCancelDialog(false);
    }
  };

  const openStripeCustomerPortal = async () => {
    if (!session) return;
    
    try {
      setStripeLoading(true);
      
      const { data, error } = await supabase.functions.invoke('create-customer-portal');
      
      if (error) {
        console.error('Error creating Stripe customer portal session:', error);
        toast({
          title: "Error",
          description: "Could not open Stripe Customer Portal. Please try again later.",
          variant: "destructive",
        });
        return;
      }
      
      if (data?.url) {
        window.location.href = data.url;
      } else {
        toast({
          title: "Error",
          description: "No portal URL received from server.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error opening Stripe Customer Portal:', error);
      toast({
        title: "Error",
        description: "Could not open Stripe Customer Portal. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setStripeLoading(false);
    }
  };
  
  if (loading) {
    return (
      <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-32" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-48" />
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-5/6" />
        </CardContent>
      </Card>
    );
  }

  const renderDocumentPurchases = () => {
    if (!documentPurchases || documentPurchases.length === 0) return null;
    
    const hasActiveDocuments = documentPurchases.some(p => p.remaining_quantity > 0);
    
    return (
      <div className="mt-3 space-y-2">
        <h4 className="text-sm font-medium text-white/80">Document Purchases</h4>
        
        {documentPurchases.map(purchase => {
          const purchaseDate = new Date(purchase.purchase_date);
          return (
            <div key={purchase.id} className="bg-white/5 rounded-md p-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-white/70">
                  {format(purchaseDate, 'MMM dd, yyyy')}
                </span>
                <Badge className={purchase.remaining_quantity > 0 ? 
                  "bg-green-500 text-white" : 
                  "bg-gray-500 text-white"}>
                  {purchase.remaining_quantity > 0 ? "Active" : "Used"}
                </Badge>
              </div>
              <div className="mt-1 grid grid-cols-3 gap-1">
                <div>
                  <span className="text-white/50">Purchased:</span> 
                  <span className="ml-1 text-white/90">{purchase.quantity}</span>
                </div>
                <div>
                  <span className="text-white/50">Used:</span> 
                  <span className="ml-1 text-white/90">{purchase.used_quantity}</span>
                </div>
                <div>
                  <span className="text-white/50">Remaining:</span> 
                  <span className={`ml-1 ${purchase.remaining_quantity > 0 ? "text-green-400" : "text-white/90"}`}>
                    {purchase.remaining_quantity}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        
        {hasActiveDocuments && (
          <div className="text-xs text-white/70 mt-1">
            You can use these purchases to download resumes and cover letters.
          </div>
        )}
        
        <Button 
          onClick={handleNavigateToPricing}
          variant="outline" 
          size="sm"
          className="w-full mt-2 border-amber-500/30 text-amber-400 hover:bg-amber-950/30 text-xs"
        >
          <FileText className="h-3 w-3 mr-1" /> Buy More Documents
        </Button>
      </div>
    );
  };

  const renderDownloadInfo = () => {
    if (!profile) return null;
    
    if (subscription?.plan_type === 'subscription_plus') {
      return (
        <p className="text-sm text-white/70">
          <InfinityIcon className="h-4 w-4 inline-block mr-2 text-green-400" />
          Unlimited downloads with your monthly subscription
        </p>
      );
    } else if (subscription?.plan_type === 'basic') {
      const remaining = downloadsRemaining || 0;
      const total = totalDownloads || 8;
      const usedCount = total - remaining;
      const isLow = remaining <= 2 && remaining > 0;
      
      return (
        <>
          <p className="text-sm text-white/70">
            <DownloadCloud className="h-4 w-4 inline-block mr-2 text-blue-400" />
            {usedCount} of {total} downloads used ({remaining} remaining)
            {profile.free_downloads_remaining > 0 && ` (plus ${profile.free_downloads_remaining} free download)`}
          </p>
          {isLow && (
            <Alert className="mt-2 bg-amber-900/20 text-amber-200 border-amber-800">
              <AlertCircle className="h-4 w-4 text-amber-400" />
              <AlertDescription className="text-xs">
                You're running low on downloads. Consider upgrading to Subscription Plus for unlimited downloads.
              </AlertDescription>
            </Alert>
          )}
          {remaining === 0 && (
            <Alert className="mt-2 bg-red-900/20 text-red-200 border-red-800">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-xs">
                You've used all your downloads. Purchase another plan to continue downloading.
              </AlertDescription>
            </Alert>
          )}
        </>
      );
    } else if (totalRemainingDocuments > 0) {
      return (
        <p className="text-sm text-white/70">
          <FileText className="h-4 w-4 inline-block mr-2 text-amber-400" />
          You have {totalRemainingDocuments} document{totalRemainingDocuments !== 1 ? 's' : ''} remaining from your purchases
        </p>
      );
    } else {
      return (
        <p className="text-sm text-white/70">
          <DownloadCloud className="h-4 w-4 inline-block mr-2 text-blue-400" />
          {profile.download_count} downloads used
          {profile.free_downloads_remaining > 0 ? 
            ` (${profile.free_downloads_remaining} free download remaining)` : 
            ' (no free downloads remaining)'}
        </p>
      );
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return format(date, 'MMM dd, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getSubscriptionDisplayName = () => {
    if (!subscription) return '';
    
    if (subscription.product_name) {
      return subscription.product_name;
    }
    
    if (subscription.plan_type === 'subscription_plus') {
      return 'Subscription Plus';
    }
    if (subscription.plan_type === 'basic') {
      return 'Basic Plan';
    }
    if (subscription.plan_type === 'per_document') {
      return 'Pay Per Document';
    }
    
    return 'Unknown Plan';
  };

  const CancelDialog = () => (
    <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
      <DialogContent className="bg-slate-900 border border-slate-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">Cancel Subscription?</DialogTitle>
          <DialogDescription className="text-white/70">
            Your subscription will remain active until the end of your current billing period on {formatDate(currentPeriodEnd)}.
            You won't be charged again after this date.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowCancelDialog(false)}
            className="border-white/20 text-white hover:bg-white/10"
          >
            Keep Subscription
          </Button>
          <Button 
            variant="destructive"
            onClick={handleCancelSubscription}
            disabled={cancellationLoading}
          >
            {cancellationLoading ? "Processing..." : "Yes, Cancel Subscription"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  if (!subscription && documentPurchases.length > 0 && totalRemainingDocuments > 0) {
    return (
      <>
        <Card className="bg-white/5 backdrop-blur-sm border border-white/10 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-yellow-600/5"></div>
          <div className="absolute top-0 right-0">
            <Badge className="bg-gradient-to-r from-amber-400 to-yellow-500 m-2 text-white">
              <FileText className="h-3 w-3 mr-1" /> PAY PER DOCUMENT
            </Badge>
          </div>
          
          <CardHeader className="relative">
            <CardTitle className="text-lg font-medium text-amber-300">
              Document Purchases
            </CardTitle>
            <CardDescription className="text-white/70">
              You have {totalRemainingDocuments} document{totalRemainingDocuments !== 1 ? 's' : ''} remaining
            </CardDescription>
          </CardHeader>
          
          <CardContent className="relative">
            {profile?.email && (
              <p className="text-sm text-white/70 mb-4">
                <Mail className="h-4 w-4 inline-block mr-2 text-purple-400" />
                {profile.email}
              </p>
            )}
            
            {renderDocumentPurchases()}
          </CardContent>
          
          <CardFooter className="relative space-y-2 flex-col">
            <Button 
              onClick={handleNavigateToPricing}
              className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white"
            >
              Purchase More Documents
            </Button>
            
            <Button 
              onClick={handleNavigateToPricing}
              variant="outline" 
              className="w-full border-white/20 text-white/80 hover:bg-white/10"
            >
              View All Plans <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </>
    );
  }

  if (!subscription) {
    return (
      <Card className="bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-white font-medium text-lg">No Active Subscription</CardTitle>
          <CardDescription className="text-white/70">
            You're currently on the free plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          {profile?.email && (
            <p className="text-sm text-white/70 mb-2">
              <Mail className="h-4 w-4 inline-block mr-2 text-purple-400" />
              {profile.email}
            </p>
          )}
          {renderDownloadInfo()}
          <p className="text-sm text-white/70 mt-2">
            Unlock more features with our subscription plans
          </p>
          
          {documentPurchases.length > 0 && renderDocumentPurchases()}
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleNavigateToPricing}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            View Plans <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <>
      <CancelDialog />
      
      <Card className="bg-white/5 backdrop-blur-sm border border-white/10 overflow-hidden relative">
        {subscription.plan_type === 'subscription_plus' && (
          <div className="absolute top-0 right-0">
            <Badge className="bg-gradient-to-r from-green-400 to-teal-500 m-2">
              <InfinityIcon className="h-3 w-3 mr-1" /> UNLIMITED
            </Badge>
          </div>
        )}
        {subscription.plan_type === 'per_document' && (
          <div className="absolute top-0 right-0">
            <Badge className="bg-gradient-to-r from-amber-400 to-yellow-500 m-2">
              <FileText className="h-3 w-3 mr-1" /> PAY PER DOCUMENT
            </Badge>
          </div>
        )}
        <div className={`absolute inset-0 opacity-10 ${
          subscription.plan_type === 'subscription_plus'
            ? 'bg-gradient-to-br from-green-500/20 to-teal-600/20'
            : subscription.plan_type === 'per_document'
                ? 'bg-gradient-to-br from-amber-500/20 to-yellow-600/20'
                : 'bg-gradient-to-br from-purple-500/20 to-purple-600/20'
        }`}></div>
        
        <CardHeader className="relative">
          <CardTitle className={`text-lg font-medium ${
            subscription.plan_type === 'subscription_plus'
              ? 'text-green-300'
              : subscription.plan_type === 'per_document'
                  ? 'text-amber-300'
                  : 'text-purple-300'
          }`}>
            {getSubscriptionDisplayName()} 
            {subscription.plan_type === 'subscription_plus' ? ' Monthly' : (subscription.plan_type === 'basic' ? ' Plan' : '')}
          </CardTitle>
          <CardDescription className="text-white/70">
            {subscription.status === 'active' ? 'Active subscription' : 'Subscription status: ' + subscription.status}
            {cancelAtPeriodEnd && (
              <span className="ml-2 text-yellow-400">
                (Cancels on {formatDate(currentPeriodEnd)})
              </span>
            )}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="relative space-y-2">
          {(subscription.email || profile?.email) && (
            <p className="text-sm text-white/70">
              <Mail className="h-4 w-4 inline-block mr-2 text-purple-400" />
              {subscription.email || profile?.email}
            </p>
          )}
        
          <p className="text-sm text-white/70">
            <Star className="h-4 w-4 inline-block mr-2 text-yellow-400" />
            {subscription.plan_type === 'subscription_plus' 
              ? 'Unlimited downloads & premium features' 
              : subscription.plan_type === 'per_document'
                  ? 'Pay per document - only pay for what you use'
                  : '8 downloads & standard features'}
          </p>
          
          <p className="text-sm text-white/70">
            <Calendar className="h-4 w-4 inline-block mr-2 text-blue-400" />
            {currentPeriodEnd 
              ? subscription.plan_type === 'subscription_plus'
                ? cancelAtPeriodEnd
                  ? `Subscription ends on ${formatDate(currentPeriodEnd)}`
                  : `Next billing date: ${formatDate(currentPeriodEnd)}`
                : `Active until ${formatDate(currentPeriodEnd)}`
              : 'Active subscription'}
          </p>
          
          {renderDownloadInfo()}
          
          {documentPurchases.length > 0 && renderDocumentPurchases()}
          
          {cancelAtPeriodEnd && (
            <Alert className="mt-2 bg-blue-900/20 text-blue-200 border-blue-800">
              <AlertCircle className="h-4 w-4 text-blue-400" />
              <AlertDescription className="text-xs">
                Your subscription has been canceled but will remain active until {formatDate(currentPeriodEnd)}.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        
        <CardFooter className="relative space-y-2 flex-col">
          {cancelAtPeriodEnd ? (
            <Button 
              onClick={handleNavigateToPricing}
              variant="outline" 
              className="w-full border-white/20 text-white/80 hover:bg-white/10"
            >
              Reactivate Subscription
            </Button>
          ) : (
            subscription.plan_type === 'subscription_plus' && (
              <Button 
                onClick={() => setShowCancelDialog(true)}
                variant="outline" 
                className="w-full border-rose-500/30 text-rose-400 hover:bg-rose-950/30"
              >
                <X className="h-4 w-4 mr-2" /> Cancel Subscription
              </Button>
            )
          )}
          
          {subscription.plan_type === 'per_document' && (
            <Button 
              onClick={handleNavigateToPricing}
              className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700"
            >
              <FileText className="h-4 w-4 mr-2" /> Purchase More Documents
            </Button>
          )}
          
          <Button 
            onClick={handleNavigateToPricing}
            variant="outline" 
            className="w-full border-white/20 text-white/80 hover:bg-white/10"
          >
            {subscription.plan_type === 'subscription_plus' 
              ? "View Other Plans"
              : "Upgrade to Subscription Plus"}
          </Button>
        </CardFooter>
      </Card>
    </>
  );
};
