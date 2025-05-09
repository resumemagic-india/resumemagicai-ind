import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { Check, X, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

// Define interface for PhonePe response structure
interface PhonePeOrderResponse {
  order_id: string;
  state: 'PENDING' | 'FAILED' | 'COMPLETED';
  amount: number;
  expire_at?: number;
  payment_details?: Array<{
    payment_mode?: string;
    amount: number;
    transaction_id: string;
    state: 'PENDING' | 'COMPLETED' | 'FAILED';
    error_code?: string;
    detailed_error_code?: string;
    instrument_type?: string;
  }>;
}

// Define interface for our Edge Function response
interface PaymentResponse {
  status: string;
  message: string;
  payment_status: 'success' | 'failed' | 'pending';
  order_details?: any;
  phonepe_response?: PhonePeOrderResponse;
}

const PaymentStatus = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { session } = useAuth();
  const { toast } = useToast();
  const [paymentStatus, setPaymentStatus] = useState<'loading' | 'success' | 'failed' | 'pending'>('loading');
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    // Add a small delay to allow backend callbacks to complete
    const delayedCheck = setTimeout(() => {
      if (session?.user?.id) {
        checkPaymentStatus();
      }
    }, 1000);
    
    return () => clearTimeout(delayedCheck);
  }, [session?.user?.id, location.search, retryCount]);

  const checkPaymentStatus = async () => {
    try {
      // Debug: Show full URL and all parameters
      console.log("Full URL:", window.location.href);
      console.log("All search parameters:", Object.fromEntries(new URLSearchParams(location.search)));

      // Get the merchant order ID from URL parameter - check multiple possible parameter names
      const params = new URLSearchParams(location.search);
      let merchantOrderId = params.get('merchantOrderId') || 
                        params.get('merchant_order_id') || 
                        params.get('orderId') || 
                        params.get('txnId') ||
                        params.get('order_id') ||  // Additional parameter names PhonePe might use
                        params.get('transaction_id');
      const statusParam = params.get('status'); // PhonePe might send a status parameter

      console.log(`Checking payment for orderId: ${merchantOrderId}, status param: ${statusParam}`);
      
      // If merchantOrderId is missing, try to get ANY recent order from the database
      if (!merchantOrderId && session?.user?.id) {
        console.log("No merchant order ID in URL, attempting to find ANY recent order...");
        
        try {
          // Get recent orders with ANY status (not just pending)
          const { data: recentOrders, error: ordersError } = await supabase
            .from('document_purchases')
            .select('merchant_order_id, status, created_at')
            .eq('user_id', session.user.id)
            .order('created_at', { ascending: false })
            .limit(5);  // Get several recent orders
            
          if (ordersError) {
            console.error("Error fetching recent orders:", ordersError);
          } else if (recentOrders && recentOrders.length > 0) {
            // Log found orders for debugging
            console.log("Recent orders found:", recentOrders);
            
            // First try to find a pending order
            const pendingOrder = recentOrders.find(order => order.status === 'pending');
            if (pendingOrder) {
              merchantOrderId = pendingOrder.merchant_order_id;
              console.log(`Found pending order: ${merchantOrderId}`);
            } else {
              // If no pending orders, use the most recent order
              merchantOrderId = recentOrders[0].merchant_order_id;
              console.log(`Using most recent order: ${merchantOrderId} (status: ${recentOrders[0].status})`);
            }
          } else {
            console.log("No orders found for user:", session.user.id);
          }
        } catch (e) {
          console.error("Error fetching recent orders:", e);
        }
      }
      
      // If still no merchantOrderId, show error
      if (!merchantOrderId) {
        console.error("Missing merchant order ID in URL and no recent orders found");
        toast({
          title: "Payment verification failed",
          description: "Could not verify payment status. Missing order information.",
          variant: "destructive",
        });
        setPaymentStatus('failed');
        return;
      }

      // Call our Supabase Edge Function to verify payment
      console.log(`Calling Edge Function for order: ${merchantOrderId}`);
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_FUNCTIONS_URL}/verify-payment?merchantOrderId=${merchantOrderId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`
          }
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API Error (${response.status}):`, errorText);
        throw new Error(`API returned ${response.status}: ${errorText}`);
      }
      
      const data: PaymentResponse = await response.json();
      console.log('Edge function response:', data);
      
      // Check PhonePe state directly if available
      if (data.phonepe_response?.state) {
        console.log(`PhonePe reports state: ${data.phonepe_response.state}`);
        
        if (data.phonepe_response.state === 'COMPLETED') {
          setPaymentStatus('success');
          setPaymentDetails({
            ...data.order_details,
            phonepe_details: data.phonepe_response
          });
          return;
        } else if (data.phonepe_response.state === 'FAILED') {
          // Check for error details
          const errorDetails = data.phonepe_response.payment_details?.[0]?.error_code;
          console.log("Payment failed with error:", errorDetails);
          setPaymentStatus('failed');
          return;
        }
        // If not completed or failed, it's still pending
      }
      
      // Fall back to our own status determination
      if (data.payment_status === 'success') {
        setPaymentStatus('success');
        setPaymentDetails(data.order_details);
      } else if (data.payment_status === 'failed') {
        setPaymentStatus('failed');
      } else {
        // Still pending
        setPaymentStatus('pending');
        
        // If status is still pending and we haven't retried too many times, schedule another check
        if (retryCount < 3) {
          console.log(`Scheduling retry #${retryCount + 1} in 3 seconds`);
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, 3000); // Try again in 3 seconds
        }
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
      toast({
        title: "Error verifying payment",
        description: "Could not verify your payment status. Please contact support.",
        variant: "destructive",
      });
      setPaymentStatus('failed');
    }
  };

  const handleManualCheck = () => {
    setRetryCount(0); // Reset retry count
    checkPaymentStatus(); // Manually trigger check
  };

  const handleGoToHome = () => {
    navigate('/home');
  };

  // Rest of your component remains the same...
  const renderStatusContent = () => {
    // Your existing render code...
    switch (paymentStatus) {
      case 'loading':
        return (
          <div className="text-center py-10">
            <Loader2 className="h-12 w-12 animate-spin text-purple-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800">Verifying Payment...</h2>
            <p className="text-gray-600 mt-2">Please wait while we verify your payment status.</p>
          </div>
        );
      
      // ... other cases remain the same
      
      case 'success':
        return (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Payment Successful!</h2>
            <p className="text-gray-600 mt-2">
              {paymentDetails?.plan_type === 'pay_per_document_in' 
                ? `You have successfully purchased ${paymentDetails.quantity} document${paymentDetails.quantity > 1 ? 's' : ''}.`
                : 'Your subscription has been activated.'}
            </p>
            <div className="mt-6">
              <Button 
                onClick={() => navigate('/dashboard')}
                className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white"
              >
                Go to Dashboard
              </Button>
            </div>
            {paymentDetails?.plan_type === 'pay_per_document_in' && (
              <p className="mt-4 text-sm text-gray-500">
                Your documents will expire after use. Keep track of your remaining documents in your profile.
              </p>
            )}
          </div>
        );
      
      case 'failed':
        return (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Payment Failed</h2>
            <p className="text-gray-600 mt-2">
              Your payment could not be completed. No money has been charged.
            </p>
            <div className="mt-6 space-y-2">
              <Button 
                onClick={() => navigate('/pricing')}
                className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white w-full"
              >
                Try Again
              </Button>
              <Button 
                variant="outline"
                onClick={handleGoToHome}
                className="w-full"
              >
                Back to Home
              </Button>
            </div>
          </div>
        );
        
      case 'pending':
        return (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Payment Pending</h2>
            <p className="text-gray-600 mt-2">
              Your payment is being processed. This may take a few minutes.
            </p>
            <div className="mt-6 space-y-2">
              <Button 
                onClick={handleManualCheck}
                className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white w-full"
              >
                Check Status Again
              </Button>
              <Button 
                variant="outline" 
                onClick={handleGoToHome}
                className="w-full"
              >
                Back to Home
              </Button>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="text-center py-8">
            <p className="text-gray-600">Unknown payment status. Please contact support.</p>
            <Button 
              onClick={handleGoToHome}
              className="mt-4"
            >
              Back to Home
            </Button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md border shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            Payment Status
          </CardTitle>
          <CardDescription className="text-center">
            ResumeMagic AI
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderStatusContent()}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentStatus;
