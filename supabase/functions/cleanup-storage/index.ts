import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing environment variables");
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Calculate the date 1 week ago
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    console.log(`Cleaning up files older than ${oneWeekAgo.toISOString()}`);
    
    const bucketsToClean = ["resumes", "optimized_resumes"];
    const results = {
      resumes: { deleted: 0, errors: 0 },
      optimized_resumes: { deleted: 0, errors: 0 }
    };
    
    for (const bucket of bucketsToClean) {
      console.log(`Processing bucket: ${bucket}`);
      
      // List all folders (which are user emails) in the bucket
      const { data: folders, error: foldersError } = await supabase.storage
        .from(bucket)
        .list();
      
      if (foldersError) {
        console.error(`Error listing folders in ${bucket}:`, foldersError.message);
        continue;
      }
      
      console.log(`Found ${folders?.length || 0} folders in ${bucket}`);
      
      // Process each folder
      for (const cfolder of folders || []) {
        // Use cfolder.name here
        if (!cfolder.name) continue; 
        
        // List files in this folder
        const { data: files, error: filesError } = await supabase.storage
          .from(bucket)
          // Use cfolder.name here
          .list(cfolder.name); 
        
        if (filesError) {
          // Use cfolder.name here
          console.error(`Error listing files in ${cfolder.name}:`, filesError.message); 
          continue;
        }
        
        // Use cfolder.name here
        console.log(`Found ${files?.length || 0} files in ${cfolder.name}`); 
        
        // Filter files older than 1 week
        const oldFiles = files?.filter(file => {
          if (!file.created_at) return false;
          const createdAt = new Date(file.created_at);
          return createdAt < oneWeekAgo;
        }) || [];
        
        // Use cfolder.name here
        console.log(`Found ${oldFiles.length} old files to delete in ${cfolder.name}`); 
        
        // Delete old files
        for (const file of oldFiles) {
          // Use cfolder.name here
          const filePath = `${cfolder.name}/${file.name}`; 
          console.log(`Deleting file: ${filePath}`);
          
          const { error: deleteError } = await supabase.storage
            .from(bucket)
            .remove([filePath]);
          
          if (deleteError) {
            console.error(`Error deleting ${filePath}:`, deleteError.message);
            results[bucket as keyof typeof results].errors++;
          } else {
            console.log(`Successfully deleted ${filePath}`);
            results[bucket as keyof typeof results].deleted++;
          }
        }
      }
    }
    
    console.log("Cleanup complete:", results);
    
    return new Response(JSON.stringify({
      success: true,
      message: "Storage cleanup completed",
      results
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error("Error in cleanup-storage function:", error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
});
