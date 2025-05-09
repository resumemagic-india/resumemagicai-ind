import { supabase } from "@/integrations/supabase/client";

// Call this before every download attempt (Dashboard, Create Resume, Cover Letter)
export const handleDownload = async (userId: string): Promise<{ allowed: boolean; message?: string }> => {
  // 1. Fetch user profile (for free_downloads_remaining and download_count)
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("free_downloads_remaining, download_count")
    .eq("id", userId)
    .single();

  if (profileError || !profile) {
    return { allowed: false, message: "User profile not found." };
  }

  // 2. If user has free downloads left, use it
  if (profile.free_downloads_remaining > 0) {
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        free_downloads_remaining: profile.free_downloads_remaining - 1,
        download_count: profile.download_count + 1,
      })
      .eq("id", userId);

    if (updateError) {
      return { allowed: false, message: "Failed to update free download." };
    }
    return { allowed: true };
  }

  // 3. If no free downloads, check paid purchases
  const { data: purchases, error: purchasesError } = await supabase
    .from("document_purchases")
    .select("id, remaining_quantity, used_quantity")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (purchasesError) {
    return { allowed: false, message: "Failed to check purchases." };
  }

  // Find the first purchase with remaining_quantity > 0
  const activePurchase = purchases?.find((p: any) => p.remaining_quantity > 0);

  if (activePurchase) {
    // Atomically update purchase and profile
    const { error: updatePurchaseError } = await supabase
      .from("document_purchases")
      .update({
        remaining_quantity: activePurchase.remaining_quantity - 1,
        used_quantity: activePurchase.used_quantity + 1,
      })
      .eq("id", activePurchase.id);

    if (updatePurchaseError) {
      return { allowed: false, message: "Failed to update purchase." };
    }

    // Always increment download_count in profile
    const { error: updateProfileError } = await supabase
      .from("profiles")
      .update({
        download_count: profile.download_count + 1,
      })
      .eq("id", userId);

    if (updateProfileError) {
      return { allowed: false, message: "Failed to update download count." };
    }

    return { allowed: true };
  }

  // 4. No downloads left (free or paid)
  return { allowed: false, message: "No downloads remaining. Redirecting to pricing." };
};

export const getDownloadStatus = async (userId: string) => {
  // Fetch profile for free download and download_count
  const { data: profile } = await supabase
    .from("profiles")
    .select("free_downloads_remaining, download_count")
    .eq("id", userId)
    .single();

  // Fetch purchases for paid downloads
  const { data: purchases } = await supabase
    .from("document_purchases")
    .select("quantity, used_quantity, remaining_quantity")
    .eq("user_id", userId);

  let totalPurchased = 0;
  let totalUsed = 0;
  let totalRemaining = 0;
  if (purchases && purchases.length > 0) {
    purchases.forEach((purchase) => {
      totalPurchased += purchase.quantity || 0;
      totalUsed += purchase.used_quantity || 0;
      totalRemaining += purchase.remaining_quantity || 0;
    });
  }

  const freeDownloads = profile?.free_downloads_remaining || 0;
  const downloadCount = profile?.download_count || 0;

  // If user has free download left, show it
  if (freeDownloads > 0) {
    return {
      freeDownloadsRemaining: freeDownloads,
      purchasedQuantity: 0,
      usedPurchasedDownloads: 0,
      remainingPurchasedDownloads: 0,
      downloadCount,
      downloadsRemaining: 1,
      downloadsUsed: 0,
      hasDownloads: true,
      isFree: true,
    };
  } else {
    // After free download, use purchased
    return {
      freeDownloadsRemaining: 0,
      purchasedQuantity: totalPurchased,
      usedPurchasedDownloads: totalUsed,
      remainingPurchasedDownloads: totalRemaining,
      downloadCount,
      downloadsRemaining: totalRemaining,
      downloadsUsed: totalUsed,
      hasDownloads: totalRemaining > 0,
      isFree: false,
    };
  }
};