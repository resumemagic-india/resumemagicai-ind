
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FileText, FileEdit, Bot, MessageSquare, Map, ListChecks } from "lucide-react";

export const UserGuide = () => {
  return (
    <Dialog>
      <DialogTrigger className="text-[#B8E5F2]/50 hover:text-[#B8E5F2] text-sm hover:underline transition-colors duration-200">
        User Guide
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto w-[95vw] max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold mb-4">Resume Magic AI - User Guide</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="dashboard" className="mt-4">
          <TabsList className="grid grid-cols-3 md:grid-cols-6 mb-4">
            <TabsTrigger value="dashboard" className="text-xs md:text-sm">Dashboard</TabsTrigger>
            <TabsTrigger value="resume" className="text-xs md:text-sm">Create Resume</TabsTrigger>
            <TabsTrigger value="cover-letter" className="text-xs md:text-sm">Cover Letter</TabsTrigger>
            <TabsTrigger value="interview-prep" className="text-xs md:text-sm">Interview Prep</TabsTrigger>
            <TabsTrigger value="questions" className="text-xs md:text-sm">Interview Questions</TabsTrigger>
            <TabsTrigger value="career" className="text-xs md:text-sm">Career Roadmap</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="space-y-4">
            <div className="flex items-start">
              <ListChecks className="h-6 w-6 mr-3 text-cyan-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold">Dashboard Overview</h3>
                <p className="text-sm text-muted-foreground mt-1">The dashboard is your central hub for all Resume Magic AI features.</p>
              </div>
            </div>
            
            <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-md">
              <h4 className="font-medium mb-2">How to Use the Dashboard:</h4>
              <ol className="list-decimal pl-5 space-y-2 text-sm">
                <li>Navigate through the various features using the quick navigation menu on the left side.</li>
                <li>View your subscription status and remaining downloads at the top of the page.</li>
                <li>Explore resume templates in the showcase section to find a style that suits your needs.</li>
                <li>Access your profile and account settings by clicking the Profile button in the top right.</li>
                <li>Track your progress through the resume creation process with the status indicators.</li>
              </ol>
            </div>
            
            <div className="border-l-4 border-cyan-500 pl-4 text-sm">
              <p className="font-medium">Pro Tip:</p>
              <p className="text-muted-foreground">Keep track of your download credits or subscription end date in the header section. This helps you manage your plan effectively.</p>
            </div>
          </TabsContent>
          
          <TabsContent value="resume" className="space-y-4">
            <div className="flex items-start">
              <FileText className="h-6 w-6 mr-3 text-cyan-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold">Creating Your Resume</h3>
                <p className="text-sm text-muted-foreground mt-1">Build a professional, ATS-friendly resume customized for your target job.</p>
              </div>
            </div>
            
            <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-md">
              <h4 className="font-medium mb-2">Step-by-Step Resume Creation:</h4>
              <ol className="list-decimal pl-5 space-y-2 text-sm">
                <li>Click on "Create Resume" in the navigation menu.</li>
                <li>Choose a template style that fits your industry and career level.</li>
                <li>Fill in your personal information, including name, contact details, and location.</li>
                <li>Add your professional summary - this is your chance to make a great first impression.</li>
                <li>List your work experience, including job titles, companies, dates, and key achievements.</li>
                <li>Include your education, certifications, and relevant skills.</li>
                <li>Upload the job description to optimize your resume for ATS scanning.</li>
                <li>Click "Generate Resume" to let our AI optimize your content.</li>
                <li>Review the final document and make any necessary adjustments.</li>
                <li>Download your resume in PDF format when you're satisfied with the result.</li>
              </ol>
            </div>
            
            <div className="border-l-4 border-cyan-500 pl-4 text-sm">
              <p className="font-medium">Pro Tip:</p>
              <p className="text-muted-foreground">For the best ATS score, use specific keywords from the job description and quantify your achievements with numbers whenever possible.</p>
            </div>
          </TabsContent>
          
          <TabsContent value="cover-letter" className="space-y-4">
            <div className="flex items-start">
              <FileEdit className="h-6 w-6 mr-3 text-cyan-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold">Generate Cover Letter</h3>
                <p className="text-sm text-muted-foreground mt-1">Create personalized cover letters that complement your resume and speak directly to employers.</p>
              </div>
            </div>
            
            <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-md">
              <h4 className="font-medium mb-2">Cover Letter Generation Process:</h4>
              <ol className="list-decimal pl-5 space-y-2 text-sm">
                <li>Navigate to the "Cover Letter" section from the dashboard.</li>
                <li>Enter the job title and company name you're applying to.</li>
                <li>Paste in the job description to allow our AI to identify key requirements.</li>
                <li>Highlight 2-3 of your most relevant skills or experiences for this position.</li>
                <li>Specify any particular achievements or qualifications you want to emphasize.</li>
                <li>Choose the tone you prefer (professional, enthusiastic, confident, etc.).</li>
                <li>Click "Generate Cover Letter" to create your personalized document.</li>
                <li>Review and edit the content to ensure it sounds authentic to your voice.</li>
                <li>Format the letter according to your preferences.</li>
                <li>Download the finalized cover letter in PDF format.</li>
              </ol>
            </div>
            
            <div className="border-l-4 border-cyan-500 pl-4 text-sm">
              <p className="font-medium">Pro Tip:</p>
              <p className="text-muted-foreground">Always personalize your cover letter with specific details about the company to show you've done your research. Our AI can help suggest company-specific talking points.</p>
            </div>
          </TabsContent>
          
          <TabsContent value="interview-prep" className="space-y-4">
            <div className="flex items-start">
              <Bot className="h-6 w-6 mr-3 text-cyan-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold">Interview Preparation</h3>
                <p className="text-sm text-muted-foreground mt-1">Practice with our AI interview coach to build confidence and improve your responses.</p>
              </div>
            </div>
            
            <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-md">
              <h4 className="font-medium mb-2">Using the Interview Preparation Tool:</h4>
              <ol className="list-decimal pl-5 space-y-2 text-sm">
                <li>Select "Interview Preparation" from the navigation menu.</li>
                <li>Input the job title and company you're interviewing for.</li>
                <li>Paste the job description to customize the practice questions.</li>
                <li>Select the type of interview you want to practice (behavioral, technical, etc.).</li>
                <li>Start the practice interview session.</li>
                <li>The AI will ask you questions one at a time - respond as you would in an actual interview.</li>
                <li>Receive feedback on your answers, including suggestions for improvement.</li>
                <li>Practice difficult questions multiple times to refine your responses.</li>
                <li>Review a summary of your performance at the end of the session.</li>
                <li>Save your best responses for future reference.</li>
              </ol>
            </div>
            
            <div className="border-l-4 border-cyan-500 pl-4 text-sm">
              <p className="font-medium">Pro Tip:</p>
              <p className="text-muted-foreground">Use the STAR method (Situation, Task, Action, Result) when answering behavioral questions. Our AI coach will guide you through this structure.</p>
            </div>
          </TabsContent>
          
          <TabsContent value="questions" className="space-y-4">
            <div className="flex items-start">
              <MessageSquare className="h-6 w-6 mr-3 text-cyan-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold">Interview Questions Generator</h3>
                <p className="text-sm text-muted-foreground mt-1">Get a customized list of likely interview questions for your specific job application.</p>
              </div>
            </div>
            
            <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-md">
              <h4 className="font-medium mb-2">Generating Interview Questions:</h4>
              <ol className="list-decimal pl-5 space-y-2 text-sm">
                <li>Navigate to "Interview Questions" from the dashboard.</li>
                <li>Enter the job title, industry, and seniority level.</li>
                <li>Paste the job description for better question customization.</li>
                <li>Select the types of questions you want to prepare for (technical, behavioral, situational, etc.).</li>
                <li>Click "Generate Questions" to create your personalized question list.</li>
                <li>Review the generated questions, organized by category.</li>
                <li>For each question, you can view suggested approach strategies.</li>
                <li>Add your own answer notes for each question.</li>
                <li>Mark questions as "prepared" once you've practiced them.</li>
                <li>Export the question list with your notes for offline review.</li>
              </ol>
            </div>
            
            <div className="border-l-4 border-cyan-500 pl-4 text-sm">
              <p className="font-medium">Pro Tip:</p>
              <p className="text-muted-foreground">Focus on the questions marked as "high priority" first - these are the ones most likely to come up based on the job description analysis.</p>
            </div>
          </TabsContent>
          
          <TabsContent value="career" className="space-y-4">
            <div className="flex items-start">
              <Map className="h-6 w-6 mr-3 text-cyan-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold">Career Roadmap</h3>
                <p className="text-sm text-muted-foreground mt-1">Plan your professional development with a personalized career progression path.</p>
              </div>
            </div>
            
            <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-md">
              <h4 className="font-medium mb-2">Creating Your Career Roadmap:</h4>
              <ol className="list-decimal pl-5 space-y-2 text-sm">
                <li>Access the "Career Roadmap" feature from the navigation menu.</li>
                <li>Enter your current job title, industry, and years of experience.</li>
                <li>Specify your career goal or target position.</li>
                <li>List your current skills, qualifications, and areas of expertise.</li>
                <li>Identify any preferred industries or work environments.</li>
                <li>Click "Generate Career Roadmap" to create your personalized path.</li>
                <li>Review the suggested progression stages, including potential roles at each level.</li>
                <li>Explore recommended skills to develop for each stage.</li>
                <li>View suggested courses, certifications, or educational paths.</li>
                <li>Save your roadmap and track your progress as you advance in your career.</li>
              </ol>
            </div>
            
            <div className="border-l-4 border-cyan-500 pl-4 text-sm">
              <p className="font-medium">Pro Tip:</p>
              <p className="text-muted-foreground">Update your career roadmap every 6-12 months to reflect new skills you've acquired and evolving industry trends. The AI will help you adjust your path accordingly.</p>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="mt-6 pt-4 border-t text-sm text-center text-muted-foreground">
          <p>For additional support, contact customer_support@resumemagic-ai.com</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
