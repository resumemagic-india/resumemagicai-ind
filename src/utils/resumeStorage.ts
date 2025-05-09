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
