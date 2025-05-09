import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FileText, Loader2 } from 'lucide-react';
import { Separator } from "@/components/ui/separator";

interface PurchasedDownloadsDisplayProps {
  userId: string | null | undefined;
  isSubscriptionPlus: boolean; // To hide if user has unlimited
}

export const PurchasedDownloadsDisplay: React.FC<PurchasedDownloadsDisplayProps> = ({ userId, isSubscriptionPlus }) => {
  const { toast } = useToast();
  const [purchasedQuantity, setPurchasedQuantity] = useState(0);
  const [usedPurchasedDownloads, setUsedPurchasedDownloads] = useState(0);
  const [remainingPurchasedDownloads, setRemainingPurchasedDownloads] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocumentPurchases = async () => {
      if (!userId) {
        setLoading(false);
        setPurchasedQuantity(0);
        setUsedPurchasedDownloads(0);
        setRemainingPurchasedDownloads(0);
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('document_purchases')
          .select('quantity, used_quantity, remaining_quantity')
          .eq('user_id', userId);

        if (error) {
          console.error("Error fetching document purchases:", error);
          toast({
            variant: "destructive",
            title: "Error fetching purchase details",
            description: error.message,
          });
          setPurchasedQuantity(0);
          setUsedPurchasedDownloads(0);
          setRemainingPurchasedDownloads(0);
          return;
        }

        if (data) {
          let totalQty = 0;
          let totalUsed = 0;
          let totalRemaining = 0;
          data.forEach(purchase => {
            totalQty += purchase.quantity || 0;
            totalUsed += purchase.used_quantity || 0;
            totalRemaining += purchase.remaining_quantity || 0;
          });
          setPurchasedQuantity(totalQty);
          setUsedPurchasedDownloads(totalUsed);
          setRemainingPurchasedDownloads(totalRemaining);
        }
      } catch (e) {
        console.error("Error in fetchDocumentPurchases:", e);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not load purchase details.",
        });
        setPurchasedQuantity(0);
        setUsedPurchasedDownloads(0);
        setRemainingPurchasedDownloads(0);
      } finally {
        setLoading(false);
      }
    };

    fetchDocumentPurchases();
  }, [userId, toast]);

  if (loading) {
    return (
      <>
        <Separator orientation="vertical" className="mx-2 h-4 bg-white/20" />
        <div className="flex items-center" title="Loading Purchased Documents...">
          <Loader2 className="w-3 h-3 mr-1 text-amber-300 animate-spin" />
          <span className="text-xs text-white/80">Loading credits...</span>
        </div>
      </>
    );
  }

  // Don't show if user has unlimited (Plus subscription) or no purchases
  if (isSubscriptionPlus || purchasedQuantity === 0) {
    return null;
  }

  return (
    <>
      <Separator orientation="vertical" className="mx-2 h-4 bg-white/20" />
      <div className="flex items-center" title="Purchased Documents">
        <FileText className="w-3 h-3 mr-1 text-amber-300" />
        <span className="text-xs text-white/80">
          Purchased: {remainingPurchasedDownloads} / {purchasedQuantity}
        </span>
        <span className="text-xs text-white/70 ml-1">(Used: {usedPurchasedDownloads})</span>
      </div>
    </>
  );
};