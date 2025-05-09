
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { resumeText, timeframe, deviceInfo, filePath } = await req.json();
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openAIApiKey) {
      console.error('Missing OPENAI_API_KEY environment variable');
      return new Response(JSON.stringify({ 
        error: 'OpenAI API key not configured. Please add it to your Supabase secrets.' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate the resumeText to ensure it's usable content
    const cleanedResumeText = resumeText.trim();
    
    if (!cleanedResumeText || cleanedResumeText.length < 50 || 
        /^PK\u0003\u0004/.test(cleanedResumeText) || // Check for DOCX binary header
        /%PDF/.test(cleanedResumeText.substring(0, 20))) { // Check for PDF binary header
      console.error('Resume text appears to be binary/corrupted or too short:', 
                   cleanedResumeText.substring(0, 100) + '...');
      
      return new Response(JSON.stringify({ 
        error: 'Unable to extract readable text from your resume file. Please try a plain text version of your resume or check if the file is corrupted.',
        errorType: 'text_extraction_failed' 
      }), {
        status: 422, // Unprocessable Entity
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Processing career roadmap analysis request. Device info: ${deviceInfo || 'Not provided'}`);
    console.log(`Timeframe requested: ${timeframe} years`);
    console.log(`Resume text length: ${cleanedResumeText.length} characters`);
    
    if (filePath) {
      console.log(`Resume file stored at: ${filePath} in resumesroadmapanalysis bucket`);
    }

    // Using OpenAI API endpoint with gpt-4o-mini model
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a career development expert and futurist who specializes in analyzing resumes and 
            career development. Based on a resume, you provide detailed, actionable insights 
            about how a career could evolve over the next ${timeframe} years, given industry trends and emerging 
            technologies.
            
            VERY IMPORTANT: You must ONLY use information provided in the message. NEVER use placeholder text, 
            no matter what. NEVER write things like "[insert job title]" or "[industry]" or any other 
            placeholder text. If specific information is missing, make reasonable inferences but never 
            mention placeholders.
            
            If the message doesn't contain much useful information about the person's career, provide
            generic career development advice based on whatever limited information is available 
            without mentioning that the information is limited.
            
            Structure your response with these sections:
            1. Career Summary: A brief overview of their current position and trajectory
            2. Skills to Develop: Key skills they should learn to stay competitive
            3. Opportunities: Potential roles or industries they could transition to
            4. Timeline: A suggested roadmap over the ${timeframe}-year period
            5. Recommendations: Specific steps they should take (courses, certifications, projects)
            
            Focus on being specific, practical and forward-looking. Consider technological trends, industry 
            disruptions, and in-demand skills for the future. Highlight both technical and soft skills they 
            should develop. Be optimistic but realistic.`
          },
          { 
            role: 'user', 
            content: `Here is my professional information:\n\n${cleanedResumeText}\n\nPlease analyze my background and provide a ${timeframe}-year 
            career roadmap that will help me advance in my career and prepare for future industry changes.` 
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const roadmapAnalysis = data.choices[0].message.content;

    return new Response(JSON.stringify({ roadmapAnalysis }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in career-roadmap-analysis function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      suggestion: "Please try uploading a plain text (.txt) version of your resume or ensure your document is not password protected." 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
