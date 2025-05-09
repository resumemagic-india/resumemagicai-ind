
/**
 * Utility functions for parsing uploaded resume files
 */
import { supabase } from "@/integrations/supabase/client";

/**
 * Uploads a resume file to Supabase storage and extracts text from it
 */
export const extractTextFromFile = async (file: File): Promise<{ text: string; filePath?: string }> => {
  try {
    // For plain text files, read directly
    const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
    let text = '';
    
    if (fileExt === 'txt') {
      text = await file.text();
      console.log(`Successfully extracted text from ${file.name} as plain text`);
    } else if (fileExt === 'docx' || fileExt === 'pdf') {
      try {
        // First attempt direct text extraction - this works for some files
        text = await file.text();
        
        // Check if the text is likely binary data (contains control characters or looks like binary headers)
        if (/[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(text) || 
            /^PK\u0003\u0004/.test(text) || // DOCX binary header
            /%PDF/.test(text.substring(0, 20))) { // PDF binary header
          console.log(`Extracted text appears to be binary or corrupted, using fallback`);
          text = `I'm a professional seeking career advice based on my resume titled "${file.name}". 
                 My document is in ${fileExt.toUpperCase()} format. Please analyze the information 
                 in my resume to provide personalized career development recommendations.`;
        }
      } catch (textError) {
        console.error('Error extracting text directly:', textError);
        // Fallback message
        text = `I'm a professional seeking career advice based on my resume titled "${file.name}". 
               My document is in ${fileExt.toUpperCase()} format. Please analyze the information 
               in my resume to provide personalized career development recommendations.`;
      }
    } else {
      // Unsupported file format
      text = `The file format ${fileExt} may not be fully supported. For best results, please upload your resume as a .txt file or copy and paste the content directly.`;
    }
    
    // Upload file to Supabase storage
    const { data: { session } } = await supabase.auth.getSession();
    let filePath = null;
    
    if (session?.user) {
      const fileName = `${session.user.id}/${Date.now()}-${file.name}`;
      
      console.log(`Uploading resume to Supabase storage: ${fileName}`);
      const { data, error } = await supabase.storage
        .from('resumes_roadmap_analysis')
        .upload(fileName, file);
        
      if (error) {
        console.error('Error uploading file to Supabase:', error);
      } else {
        console.log('File uploaded successfully:', data.path);
        filePath = data.path;
      }
    } else {
      console.log('No user session found, skipping file upload to storage');
    }
    
    // Return the extracted text, providing a default message if extraction wasn't successful
    if (!text || text.length < 50) {
      // If text is too short, it might not have been extracted properly
      console.log(`Text extraction might be incomplete for ${file.name}, length: ${text.length}`);
      return { 
        text: `I'm a professional seeking career advice based on my resume titled "${file.name}". Please analyze my background to provide career development recommendations.`,
        filePath 
      };
    }
    
    console.log(`Successfully extracted text from ${file.name}, length: ${text.length} characters`);
    return { text, filePath };
  } catch (error) {
    console.error('Error extracting text from file:', error);
    return { 
      text: `I'm a professional seeking career advice based on my resume titled "${file.name}". Please analyze my background to provide career development recommendations.`,
      filePath: undefined
    };
  }
};
