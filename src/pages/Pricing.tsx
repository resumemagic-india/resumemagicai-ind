import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, LogOut, Check, Download, Zap } from "lucide-react"; 
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/utils/location"; 
import { Skeleton } from "@/components/ui/skeleton";

const Pricing = () => { 
  const navigate = useNavigate();
  const { session, signOut } = useAuth();
  const { toast } = useToast();
  const [currentSubscription, setCurrentSubscription] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // General loading for subscription check
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false); // For payment buttons

  // Pay Per Document Plan
  const [perDocQuantity, setPerDocQuantity] = useState(1);
  const perDocPrice = 99; // Price per document
  const perDocTotal = Math.max(1, perDocQuantity) * perDocPrice;

  // Subscription Plus Plan
  const subPlusPrice = 1599; // Price for Subscription Plus
  const subPlusPlanIdentifier = 'plus'; // Use the correct enum value from your DB

  const indiaCurrency = 'INR'; 
  
  useEffect(() => {
    const checkSubscription = async () => {
      setIsLoading(true);
      try {
        if (!session?.user?.id) {
          setIsLoading(false);
          return;
        }
        // Check only for the main subscription plan
        const { data, error } = await supabase
          .from('subscriptions')
          .select('plan_type, status')
          .eq('user_id', session.user.id)
          .eq('status', 'active')
          .eq('plan_type', subPlusPlanIdentifier)
          .maybeSingle(); 

        if (error && error.code !== 'PGRST116') { 
          console.error('Error fetching subscription:', error);
          toast({
            title: "Error fetching subscription",
            description: "Could not load your current plan details.",
            variant: "destructive",
          });
        } else if (data) {
          setCurrentSubscription(String(data.plan_type));
        } else {
          setCurrentSubscription(null);
        }
      } catch (error) {
        console.error('Error checking subscription:', error);
        toast({
          title: "Error checking subscription",
          description: "An unexpected error occurred.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkSubscription();
  }, [session?.user?.id, toast]);

  const handleNavigateBack = () => {
    navigate('/home'); 
  };

  const handlePhonePePayment = async (planIdentifier: string, quantity: number = 1) => {
    if (!session?.user?.id) {
      toast({
        title: "Authentication required",
        description: "Please sign in to make a purchase.",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    if (planIdentifier === subPlusPlanIdentifier && currentSubscription === subPlusPlanIdentifier) {
      toast({
        title: "Already Subscribed",
        description: "You are already subscribed to the Subscription Plus plan.",
      });
      return;
    }

    setIsPaymentProcessing(true);
    try {
      const apiUrl = `${import.meta.env.VITE_API_URL1}/api/create-phonepe-order`;
      console.log('Calling API endpoint:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          // Add this line to help identify source
          'Origin': window.location.origin
        },
        // Add these options for better CORS handling
        mode: 'cors',
        credentials: 'same-origin',
        body: JSON.stringify({ 
          user_id: session.user.id, 
          quantity: planIdentifier === 'pay_per_document_in' ? quantity : 1,
          plan_type: planIdentifier
        }),
      });
      
      if (!response.ok) {
        const errText = await response.text();
        console.error(`API Error (${response.status}):`, errText);
        throw new Error(`API returned ${response.status}: ${errText}`);
      }
      
      const data = await response.json();
      
      // First, store the purchase in Supabase to track it
      if (data.merchant_order_id) {
        await supabase.from('document_purchases').insert({
          user_id: session.user.id,
          merchant_order_id: data.merchant_order_id,
          quantity: planIdentifier === 'pay_per_document_in' ? quantity : 1,
          amount: planIdentifier === 'pay_per_document_in' ? perDocTotal : subPlusPrice,
          status: 'pending',
          used_quantity: 0,  // Initialize used_quantity as 0
          plan_type: planIdentifier
        });
      }
      
      // Then redirect to PhonePe
      if (data.checkout_page_url) {
        window.location.href = data.checkout_page_url;
      } else {
        toast({
          title: "Payment Error",
          description: data.error || "Could not initiate payment. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error initiating PhonePe payment:', error);
      let errorMessage = "An unexpected error occurred while initiating payment.";
      
      // More detailed error message
      if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
        errorMessage = "Could not connect to the payment server. Please check your internet connection or try again later.";
      }
      
      toast({
        title: "Payment Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsPaymentProcessing(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error signing out",
        description: error instanceof Error ? error.message : "An error occurred",
      });
    }
  };

  const formatPrice = (price: number) => {
    const numericPrice = Number(price);
    if (isNaN(numericPrice)) {
      return 'N/A';
    }
    return formatCurrency(numericPrice, indiaCurrency);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <Button
            variant="ghost"
            onClick={handleNavigateBack}
            className="text-white/80 hover:text-white"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          {session ? (
             <div className="flex flex-col items-end space-y-2">
              <span className="text-sm text-white/60">{session.user?.email}</span>
              <Button
                variant="ghost"
                onClick={handleSignOut}
                className="text-white/80 hover:text-white"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          ) : (
            <Button onClick={() => navigate('/auth')} className="bg-cyan-500 hover:bg-cyan-600 text-white">
              Sign In / Sign Up
            </Button>
          )}
        </div>

        {/* Page Title */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 via-red-500 to-yellow-400">
            Choose Your Plan
          </h1>
           <Badge variant="outline" className="mt-2 border-green-500 text-green-400">Pricing in INR (₹)</Badge>
          <p className="mt-4 text-white/60 max-w-2xl mx-auto">
            Select the plan that fits your needs. All payments are processed securely via PhonePe.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Pay Per Document Plan Card */}
          <Card className="relative bg-white border-white/20 overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/10 hover:border-amber-500/30">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-yellow-600/5"></div>
            <div className="absolute top-0 right-0">
              <Badge className="bg-gradient-to-r from-amber-400 to-yellow-500 m-4 text-white">
                <Download className="h-3 w-3 mr-1" /> PAY PER DOCUMENT
              </Badge>
            </div>
            <CardHeader className="relative z-10">
              <CardTitle className="text-2xl font-bold text-gray-800">Pay Per Document</CardTitle>
              <CardDescription className="text-gray-600">
                Buy only what you need. Perfect for occasional users.
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="mb-6 flex items-center gap-4">
                <span className="text-lg text-gray-700">Quantity:</span>
                <input
                  type="number"
                  value={perDocQuantity}
                  onChange={e => {
                    const val = Math.floor(Number(e.target.value));
                    setPerDocQuantity(isNaN(val) || val < 1 ? 1 : val);
                  }}
                  className="w-24 px-2 py-1 border rounded text-gray-900 text-center"
                  disabled={isPaymentProcessing}
                  title="Enter the number of documents"
                  placeholder="Quantity"
                />
              </div>
              <div className="mb-4">
                <span className="text-3xl font-bold text-gray-800">
                  {formatPrice(perDocTotal)}
                  <span className="text-base text-gray-600 ml-1">/one-time</span>
                </span>
              </div>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span>{perDocQuantity} Resume/Cover Letter Download{perDocQuantity > 1 ? 's' : ''}</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Access to all generation features for these downloads</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span>ATS-Optimized Templates</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter className="relative z-10 mt-auto pt-6">
              <Button
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white"
                onClick={() => handlePhonePePayment('pay_per_document_in', perDocQuantity)}
                disabled={isPaymentProcessing || isLoading}
              >
                {isPaymentProcessing ? 'Processing...' : 'Purchase Now'}
              </Button>
            </CardFooter>
          </Card>

          {/* Subscription Plus Plan Card */}
          <Card className="relative bg-white border-white/20 overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 hover:border-purple-500/30">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-indigo-600/5"></div>
             <div className="absolute top-0 right-0">
              <Badge className="bg-gradient-to-r from-purple-500 to-indigo-600 m-4 text-white">
                <Zap className="h-3 w-3 mr-1" /> SUBSCRIPTION
              </Badge>
            </div>
            <CardHeader className="relative z-10">
              <CardTitle className="text-2xl font-bold text-gray-800">Subscription Plus</CardTitle>
              <CardDescription className="text-gray-600">
                Unlimited access to all features for a month.
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="mb-6">
                {isLoading ? (
                  <Skeleton className="h-12 w-32" />
                ) : (
                  <div className="flex flex-col">
                    <span className="text-3xl font-bold text-gray-800">
                      {formatPrice(subPlusPrice)}
                      <span className="text-base text-gray-600 ml-1">/month</span>
                    </span>
                  </div>
                )}
              </div>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Unlimited Resume/Cover Letter Downloads</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Unlimited Mock Interviews</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Career Roadmap Analysis</span>
                </li>
                 <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Interview Question Generation</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span>All ATS-Optimized Templates</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter className="relative z-10 mt-auto pt-6">
              <Button
                className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white"
                onClick={() => handlePhonePePayment(subPlusPlanIdentifier)}
                disabled={isPaymentProcessing || isLoading || currentSubscription === subPlusPlanIdentifier}
              >
                {isLoading ? 'Loading...' : 
                  isPaymentProcessing ? 'Processing...' :
                  currentSubscription === subPlusPlanIdentifier ? 'Currently Subscribed' : 'Subscribe Now'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Pricing;