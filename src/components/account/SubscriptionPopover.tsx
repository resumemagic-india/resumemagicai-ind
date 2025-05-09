import React from 'react';
import { Button } from "@/components/ui/button";
import { CreditCard, Star, Calendar, DownloadCloud, Mail, AlertCircle, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format } from 'date-fns';
import { useSubscription } from '@/hooks/use-subscription';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { useState, useEffect } from 'react';

interface Profile {
  email: string;
  download_count: number;
  free_downloads_remaining: number;
}

interface Subscription {
  id: string;
  plan_type: 'basic' | 'plus';
  status: string;
  created_at: string;
  current_period_end: string;
  current_period_start: string;
  email?: string;
}

export const SubscriptionPopover = () => {
  const { session } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancellationLoading, setCancellationLoading] = useState(false);
  
  const { 
    cancelAtPeriodEnd,
    currentPeriodEnd,
    cancelSubscription
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
          .eq('status', 'active');
        
        if (subError) {
          console.error('Error fetching subscription:', subError);
        } else if (subData && subData.length > 0) {
          // If multiple active subscriptions exist, prioritize Plus over Basic
          const plusSubscription = subData.find(sub => sub.plan_type === 'plus');
          
          if (plusSubscription) {
            console.log('User has Plus subscription, prioritizing it in popover');
            setSubscription(plusSubscription);
          } else {
            setSubscription(subData[0]);
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
      } catch (error) {
        console.error('Error fetching subscription data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSubscriptionData();
  }, [session?.user?.id]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return format(date, 'MMM dd, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const handleCancelSubscription = async () => {
    setCancellationLoading(true);
    try {
      const success = await cancelSubscription();
      if (success) {
        const { data: subData, error: subError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', session?.user?.id)
          .eq('status', 'active');
        
        if (!subError && subData && subData.length > 0) {
          setSubscription(subData[0]);
        }
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
    } finally {
      setCancellationLoading(false);
    }
  };

  const renderSubscriptionContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-4">
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      );
    }

    if (!subscription) {
      return (
        <div className="space-y-3">
          <div className="flex items-center">
            <span className="text-white/70 flex items-center">
              <Star className="h-4 w-4 inline-block mr-2 text-yellow-400" />
              Free Plan
            </span>
          </div>
          {profile && (
            <p className="text-sm text-white/70">
              <DownloadCloud className="h-4 w-4 inline-block mr-2 text-blue-400" />
              {profile.download_count} downloads used
              {profile.free_downloads_remaining > 0 ? 
                ` (${profile.free_downloads_remaining} free download remaining)` : 
                ' (no free downloads remaining)'}
            </p>
          )}
          <Button 
            onClick={() => window.location.href = '/pricing'}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 mt-2"
            size="sm"
          >
            Upgrade
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <div className={`flex items-center justify-between ${
          subscription.plan_type === 'plus' ? 'text-cyan-300' : 'text-purple-300'
        }`}>
          <span className="font-medium">
            {subscription.plan_type === 'plus' ? 'Plus Plan' : 'Basic Plan'} Subscription
          </span>
          {subscription.plan_type === 'plus' && (
            <Badge className="bg-gradient-to-r from-cyan-400 to-blue-500">
              <Star className="h-3 w-3 mr-1" /> PREMIUM
            </Badge>
          )}
        </div>
        
        <p className="text-sm text-white/70">
          {subscription.status === 'active' ? 'Active subscription' : 'Subscription status: ' + subscription.status}
          {cancelAtPeriodEnd && (
            <span className="ml-2 text-yellow-400">
              (Cancels on {formatDate(currentPeriodEnd)})
            </span>
          )}
        </p>
        
        {(subscription.email || profile?.email) && (
          <p className="text-sm text-white/70">
            <Mail className="h-4 w-4 inline-block mr-2 text-purple-400" />
            {subscription.email || profile?.email}
          </p>
        )}
      
        <p className="text-sm text-white/70">
          <Star className="h-4 w-4 inline-block mr-2 text-yellow-400" />
          {subscription.plan_type === 'plus' 
            ? 'Unlimited downloads & premium features' 
            : '8 downloads per month & standard features'}
        </p>
        
        {currentPeriodEnd && (
          <p className="text-sm text-white/70">
            <Calendar className="h-4 w-4 inline-block mr-2 text-blue-400" />
            {cancelAtPeriodEnd 
              ? `Subscription ends on ${formatDate(currentPeriodEnd)}` 
              : `Renews on ${formatDate(currentPeriodEnd)}`
            }
          </p>
        )}
        
        {profile && renderDownloadInfo(profile, subscription)}
        
        {cancelAtPeriodEnd && (
          <Alert className="mt-2 bg-blue-900/20 text-blue-200 border-blue-800 py-2">
            <AlertCircle className="h-4 w-4 text-blue-400" />
            <AlertDescription className="text-xs">
              Your subscription has been canceled but will remain active until {formatDate(currentPeriodEnd)}.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="flex flex-col space-y-2 mt-2">
          {!cancelAtPeriodEnd && (
            <Button 
              onClick={handleCancelSubscription}
              variant="destructive" 
              className="w-full"
              size="sm"
              disabled={cancellationLoading}
            >
              {cancellationLoading ? (
                <span className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Cancelling...
                </span>
              ) : (
                <span className="flex items-center">
                  <X className="w-4 h-4 mr-2" />
                  Cancel Subscription
                </span>
              )}
            </Button>
          )}
          
          <Button 
            onClick={() => window.location.href = '/pricing'}
            variant="outline" 
            className="w-full border-white/20 text-white/80 hover:bg-white/10"
            size="sm"
          >
            {subscription.plan_type === 'basic' ? "Upgrade to Plus" : "View Plans"}
          </Button>
        </div>
      </div>
    );
  };

  const renderDownloadInfo = (profile: Profile, subscription: Subscription | null) => {
    if (!profile) return null;
    
    if (subscription?.plan_type === 'plus') {
      return (
        <p className="text-sm text-white/70">
          <DownloadCloud className="h-4 w-4 inline-block mr-2 text-green-400" />
          {profile.download_count} downloads used (unlimited available)
        </p>
      );
    } else if (subscription?.plan_type === 'basic') {
      const remaining = 8 - (profile.download_count || 0);
      const isLow = remaining <= 2;
      
      return (
        <>
          <p className="text-sm text-white/70">
            <DownloadCloud className="h-4 w-4 inline-block mr-2 text-blue-400" />
            {profile.download_count} downloads used ({remaining} remaining this month)
          </p>
          {isLow && (
            <Alert className="mt-2 bg-amber-900/20 text-amber-200 border-amber-800 py-2">
              <AlertCircle className="h-4 w-4 text-amber-400" />
              <AlertDescription className="text-xs">
                You're running low on downloads this month. Consider upgrading to Plus for unlimited downloads.
              </AlertDescription>
            </Alert>
          )}
        </>
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

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className="relative overflow-hidden group px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-sm transition-all duration-300"
        >
          <span className="relative z-10 flex items-center text-white group-hover:text-purple-200 transition-colors">
            <CreditCard className="w-4 h-4 mr-2" />
            <span className="text-sm">Subscription</span>
          </span>
          <div className="absolute bottom-0 left-0 w-0 h-full bg-gradient-to-r from-purple-600/30 to-blue-600/30 group-hover:w-full transition-all duration-300"></div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4 bg-[#1a2847] border border-white/10 text-white shadow-xl">
        {renderSubscriptionContent()}
      </PopoverContent>
    </Popover>
  );
};
