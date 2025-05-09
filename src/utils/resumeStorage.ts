import { supabase } from "@/integrations/supabase/client";
import { format } from 'date-fns'; // Import date-fns for timestamp formatting
import { useNavigate } from "react-router-dom"; // Add this import if using hooks in components

export const uploadResumeToStorage = async (file: File) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user?.email) return null;

  const fileExt = file.name.split('.').pop();
  const userEmail = session.user.email;
  const fileName = `${userEmail}/${crypto.randomUUID()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('resumes')
    .upload(fileName, file);

  if (uploadError) {
    console.error('Error uploading to Supabase:', uploadError);
    return null;
  }

  return fileName;
};

export const saveOptimizedResume = async (fileData: string, originalFileName: string, fileType: string) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.email) return null;

    const byteCharacters = atob(fileData);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: fileType });

    const userEmail = session.user.email;

    // --- Create Timestamp ---
    const timestamp = format(new Date(), 'yyyyMMdd_HHmmss'); // Format: YYYYMMDD_HHMMSS

    // --- Construct New Filename ---
    // Remove original extension if present, handle potential lack of extension
    const nameWithoutExt = originalFileName.includes('.') 
      ? originalFileName.substring(0, originalFileName.lastIndexOf('.')) 
      : originalFileName;
    // Get the correct extension based on fileType
    const fileExt = fileType === 'application/pdf' ? 'pdf' : 'docx'; 
    
    // New filename format: original_name_timestamp.ext
    const newFileName = `${nameWithoutExt}_${timestamp}.${fileExt}`; 
    
    // Path in Supabase: userEmail/newFileName
    const path = `${userEmail}/${newFileName}`; 
    // --- End Filename Construction ---

    console.log(`Saving optimized resume to path: ${path}`); // Log the new path

    const { data, error } = await supabase.storage
      .from('optimizedresumes')
      .upload(path, blob, {
        contentType: fileType,
        upsert: false // Keep false to avoid accidental overwrites if somehow names collide
      });

    if (error) {
      console.error('Error saving optimized resume:', error);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('optimizedresumes')
      .getPublicUrl(path);

    // Clean potential double slashes in URL (good practice)
    const cleanPublicUrl = publicUrl.replace(/([^:]\/)\/+/g, "$1");

    return {
      path,
      publicUrl: cleanPublicUrl
    };
  } catch (error) {
    console.error('Error in saveOptimizedResume:', error);
    return null;
  }
};

export async function getOptimizedResumes() {
  console.log("Attempting to fetch optimized resumes..."); // Log start

  // 1. Get user
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  // 2. Check user
  if (userError) {
    console.error('Error fetching user:', userError.message);
    return []; // Return empty on error
  }
  if (!user) {
    console.error('No user found. User might not be logged in.');
    return []; // Return empty if no user
  }
  console.log("User found:", user.id); // Log user found

  // 3. Get email
  const email = user.email;
  if (!email) {
      console.error('User found but email is missing.');
      return []; // Return empty if email is missing
  }
  console.log("User email:", email); // Log email

  // 4. List files
  const listPath = `${email}/`;
  console.log("Listing files from storage path:", listPath); // Log path being listed
  const { data, error: listError } = await supabase.storage
    .from("optimizedresumes") // Ensure bucket name is correct
    .list(listPath, { 
      limit: 100, 
      offset: 0,
      // Optionally sort by creation date directly from Supabase
      // sortBy: { column: 'created_at', order: 'desc' }, 
    });

  // 5. Check list result
  if (listError) {
      console.error('Error listing files in Supabase storage:', listError.message);
      return []; // Return empty on list error
  }
  if (!data) {
      // This case is less common if there's no error, but good to check
      console.error('No data returned from storage list, but no error reported.');
      return [];
  }
  console.log("Storage list raw data:", data); // Log the raw data returned

  // 6. Filter and Construct URLs
  const files = data
    .filter((file) => file.name && file.id) // Filter out potential empty objects or folders (using id is safer)
    .map((file) => ({
      name: file.name,
      path: `${email}/${file.name}`,
      // Ensure your project ref ID is correct here
      publicUrl: `https://fhgjwfczltqpzuhxuhuv.supabase.co/storage/v1/object/public/optimizedresumes/${email}/${file.name}`,
      created_at: file.created_at, // <-- Add created_at timestamp
    }));

  console.log("Processed files:", files); // Log the final array
  return files;
}

export const deleteOptimizedResume = async (filePath: string): Promise<boolean> => {
  try {
    // No need to get session here, RLS policy will handle authorization based on the logged-in user
    console.log(`Attempting to delete file from Supabase: ${filePath}`);

    const { data, error } = await supabase.storage
      .from('optimizedresumes')
      .remove([filePath]); // Pass the full path (e.g., 'user@example.com/resume_timestamp.pdf')

    if (error) {
      console.error('Error deleting file from Supabase Storage:', error);
      return false; // Indicate failure
    }

    console.log('Successfully deleted file from Supabase:', data);
    return true; // Indicate success

  } catch (error) {
    console.error('Unexpected error in deleteOptimizedResume:', error);
    return false; // Indicate failure
  }
};

export const canDownload = async (): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      console.log('No user session found for download check');
      return false;
    }
    
    // First check if the user is an admin - admins can always download
    const { data: isAdminData, error: adminCheckError } = await supabase.rpc(
      'is_admin',
      { user_id: session.user.id }
    );
    
    if (adminCheckError) {
      console.error('Error checking admin status:', adminCheckError);
    } else if (isAdminData) {
      console.log('User is an admin - unlimited downloads allowed');
      return true;
    }
    
    // Check if user has an active subscription
    const { data: activeSubscriptions, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('plan_type, status, downloads_remaining, is_one_time_purchase, stripe_product_id')
      .eq('user_id', session.user.id)
      .eq('status', 'active');
    
    if (!subscriptionError && activeSubscriptions && activeSubscriptions.length > 0) {
      // First check for a subscription_plus product ID (unlimited downloads)
      const subscriptionPlusByProductId = activeSubscriptions.find(sub => 
        sub.stripe_product_id === 'prod_S4dzQmVpcKbUH8'
      );
      
      if (subscriptionPlusByProductId) {
        console.log('User has a Subscription Plus plan with unlimited downloads');
        return true;
      }
      
      // Then check for a subscription with plan_type indicating subscription_plus
      const subscriptionPlusByType = activeSubscriptions.find(sub => 
        sub.plan_type && String(sub.plan_type) === 'subscription_plus'
      );
      
      if (subscriptionPlusByType) {
        console.log('User has a Subscription Plus plan with unlimited downloads');
        return true;
      }
      
      // Check for a "Pay Per Document" subscription with remaining downloads
      const perDocumentSubscriptions = activeSubscriptions.filter(sub => 
        (sub.stripe_product_id === 'prod_S8XF1GjVC6VRFk' || String(sub.plan_type) === 'per_document') &&
        sub.is_one_time_purchase === true
      );
      
      const perDocWithDownloads = perDocumentSubscriptions.find(sub => 
        (sub.downloads_remaining || 0) > 0
      );
      
      if (perDocWithDownloads) {
        console.log(`User has Pay Per Document subscription with ${perDocWithDownloads.downloads_remaining} downloads remaining`);
        return true;
      }
      
      // Next check for a valid Plus subscription with remaining downloads
      const plusSubscriptions = activeSubscriptions.filter(sub => 
        String(sub.plan_type) === 'plus' && sub.is_one_time_purchase === true
      );
      
      // Check if any Plus subscription has remaining downloads
      const plusWithDownloads = plusSubscriptions.find(sub => 
        (sub.downloads_remaining || 0) > 0
      );
      
      if (plusWithDownloads) {
        console.log(`User has Plus subscription with ${plusWithDownloads.downloads_remaining} downloads remaining`);
        return true;
      }
      
      // Check for a Basic subscription with remaining downloads
      const basicSubscriptions = activeSubscriptions.filter(sub => 
        String(sub.plan_type) === 'basic' && sub.is_one_time_purchase === true
      );
      
      // Check if any Basic subscription has remaining downloads
      const basicWithDownloads = basicSubscriptions.find(sub => 
        (sub.downloads_remaining || 0) > 0
      );
      
      if (basicWithDownloads) {
        console.log(`User has Basic subscription with ${basicWithDownloads.downloads_remaining} downloads remaining`);
        return true;
      }
    }
    
    // If no subscription with remaining downloads, check free downloads
    const { data: profileData, error: fetchError } = await supabase
      .from('profiles')
      .select('free_downloads_remaining')
      .eq('id', session.user.id)
      .single();
      
    if (fetchError) {
      console.error('Error fetching current download count:', fetchError);
      return false;
    }
    
    const freeDownloadsRemaining = profileData?.free_downloads_remaining || 0;
    console.log(`User has ${freeDownloadsRemaining} free downloads remaining`);
    return freeDownloadsRemaining > 0;
  } catch (error) {
    console.error('Error in canDownload:', error);
    return false;
  }
};

export async function updateDownloadCount(): Promise<boolean> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return false;

    // Find the oldest purchase with remaining_quantity > 0
    const { data: purchases, error } = await supabase
      .from('document_purchases')
      .select('id, used_quantity, remaining_quantity')
      .eq('user_id', session.user.id)
      .gt('remaining_quantity', 0)
      .order('purchase_date', { ascending: true });

    if (error) {
      console.error('Error fetching purchases:', error);
      return false;
    }

    if (purchases && purchases.length > 0) {
      const purchase = purchases[0];
      // Atomically update used_quantity and remaining_quantity
      const { error: updateError } = await supabase
        .from('document_purchases')
        .update({
          used_quantity: purchase.used_quantity + 1,
          remaining_quantity: purchase.remaining_quantity - 1
        })
        .eq('id', purchase.id);

      if (updateError) {
        console.error('Error updating purchase:', updateError);
        return false;
      }

      // Optionally update profile download_count for analytics
      await supabase
        .from('profiles')
        .update({ download_count: supabase.rpc('increment', { x: 1 }) })
        .eq('id', session.user.id);

      return true;
    }

    // No remaining purchased documents
    return false;
  } catch (error) {
    console.error('Error in updateDownloadCount:', error);
    return false;
  }
}

// Helper function to get current download count
const getCurrentDownloadCount = async (userId: string): Promise<number> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('download_count')
      .eq('id', userId)
      .single();
      
    if (error) {
      console.error('Error fetching current download count:', error);
      return 0;
    }
    
    return data?.download_count || 0;
  } catch (error) {
    console.error('Error in getCurrentDownloadCount:', error);
    return 0;
  }
};

export const downloadFile = async (blob: Blob, fileName: string): Promise<{success: boolean, message?: string}> => {
  try {
    const canUserDownload = await canDownload();
    if (!canUserDownload) {
      window.location.href = "/pricing"; // Redirect to pricing page
      return { success: false, message: "No downloads remaining. Redirecting to pricing." };
    }
    
    // Create download link
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }, 100);
    
    // Update download count after successful download
    await updateDownloadCount();
    console.log("Download count updated after file download");
    
    return { success: true };
  } catch (error) {
    console.error('Error downloading file:', error);
    return { success: false, message: "Error downloading file" };
  }
};
