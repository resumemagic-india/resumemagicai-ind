
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-device-info',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { workExperience, jobDescription, profile, companyName, hrName, deviceInfo } = await req.json();
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log(`Processing cover letter request. Device info: ${deviceInfo || 'Not provided'}`);

    const userDetails = profile ? `
${profile.first_name} ${profile.last_name}
${profile.email}
${profile.phone_number}
${profile.job_title}
${profile.address}`.trim() : '';

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
            content: `You are an expert at writing professional cover letters. Create a well-formatted cover letter with these rules:

1. Start with the proper heading (no date).
2. Address the letter appropriately (use HR name if provided, otherwise "Dear Hiring Manager").
3. Organize the content into 3-4 clear paragraphs.
4. End with a professional closing.
5. Use proper spacing throughout the letter.
6. Format should be clean and consistent.
7. Keep paragraphs concise and focused.
8. Do not use any markdown or special formatting characters.
9. The content should be plain text with line breaks but no complex formatting.
10. Use simple paragraph breaks and avoid any special characters.
11. DO NOT use placeholders like [Company Name] or [Company Address]. Always use the actual company name provided.`
          },
          {
            role: 'user',
            content: `Please write a cover letter using these details:

Sender's Information:
${userDetails}

Company Name: ${companyName || 'The Company'}
${hrName ? `HR/Hiring Manager: ${hrName}` : ''}

Work Experience:
${workExperience}

Job Description:
${jobDescription}`
          }
        ],
      }),
    });

    const data = await response.json();
    let coverLetter = data.choices[0].message.content;
    
    // Clean up any remaining dates or placeholders that might have been generated
    coverLetter = coverLetter.replace(/\[Today's Date\]/gi, '');
    coverLetter = coverLetter.replace(/\[Date\]/gi, '');
    coverLetter = coverLetter.replace(/\*\*/g, '');
    coverLetter = coverLetter.replace(/\*/g, '');
    coverLetter = coverLetter.replace(/\[Company Name\]/gi, companyName || 'The Company');
    coverLetter = coverLetter.replace(/\[Company Address\]/gi, '');
    
    // Ensure proper paragraph spacing for consistent display
    coverLetter = coverLetter.replace(/\n\n+/g, '\n\n'); // Normalize multiple line breaks

    return new Response(
      JSON.stringify({ coverLetter }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
