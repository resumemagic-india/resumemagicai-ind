import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Brain, Loader2, Mic, MicOff } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/use-subscription";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ConversationTurn {
  role: 'user' | 'assistant';
  content: string;
}

interface CustomWindow extends Window {
  SpeechRecognition: any;
  webkitSpeechRecognition: any;
}
declare var window: CustomWindow;

// Fixed image paths using underscore instead of space
const gifUrl = "/ai_avatars/ezgif-273ea9ea45c647.gif"; // Direct reference to the file
const staticImageUrl = "/ai_avatars/ezgif-273ea9ea45c647-static.png"; // Direct reference to the file

const MockInterviewPage = () => {
  const navigate = useNavigate();
  const { session, isLoading } = useAuth();
  const { toast } = useToast();

  const {
    canAccessMockInterview,
    incrementInterviewGenerations,
    isSubscriptionPlus,
    interviewGenerations,
    // ...other values
  } = useSubscription();

  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [uploadedResumePath, setUploadedResumePath] = useState<string | null>(null);
  const [jobDescriptionText, setJobDescriptionText] = useState("");
  const [selectedPersona, setSelectedPersona] = useState("Friendly HR");
  const personas = [
    "Friendly HR",
    "Technical Lead",
    "Executive Manager",
    "Stress Interviewer",
    "Behavioral Specialist",
    "Startup Founder"
  ];
  const [interviewState, setInterviewState] = useState<'setup' | 'interviewing' | 'feedback' | 'loading' | 'error'>('setup');
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [isMicActive, setIsMicActive] = useState(false);
  const [aiMessage, setAiMessage] = useState("AI: Welcome! Let's begin...");
  const [conversationHistory, setConversationHistory] = useState<ConversationTurn[]>([]);
  const [isProcessingAnswer, setIsProcessingAnswer] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceQueueRef = useRef<SpeechSynthesisUtterance[]>([]);
  const currentUtteranceIndexRef = useRef<number>(0);

  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [currentTranscript, aiMessage, conversationHistory]);

  useEffect(() => {
    if (!isLoading && !session && !hasCheckedAuth) {
      setHasCheckedAuth(true);
      toast({
        title: "Authentication Required",
        description: "Please sign in to access the mock interview feature",
        variant: "destructive",
      });
      navigate("/auth");
    }
    if (session) {
      setHasCheckedAuth(true);
    }
  }, [session, isLoading, navigate, toast, hasCheckedAuth]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    const speakNext = () => {
      if (currentUtteranceIndexRef.current < utteranceQueueRef.current.length) {
        const utterance = utteranceQueueRef.current[currentUtteranceIndexRef.current];

        utterance.onstart = () => {
          if (!isSpeaking) setIsSpeaking(true);
        };

        utterance.onend = () => {
          currentUtteranceIndexRef.current++;
          if (currentUtteranceIndexRef.current < utteranceQueueRef.current.length) {
            speakNext();
          } else {
            setIsSpeaking(false);
          }
        };

        utterance.onerror = (event) => {
          console.error(`SpeechSynthesis Error on chunk ${currentUtteranceIndexRef.current + 1}:`, event.error);
          console.error('SpeechSynthesis Error Details:', event);
          utteranceQueueRef.current = [];
          currentUtteranceIndexRef.current = 0;
          setIsSpeaking(false);
        };

        window.speechSynthesis.speak(utterance);
      } else {
         setIsSpeaking(false);
      }
    };

    if ((interviewState === 'interviewing' || interviewState === 'feedback') &&
        aiMessage &&
        aiMessage !== "AI: Thinking..." &&
        !isSpeaking) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        utteranceQueueRef.current = [];
        currentUtteranceIndexRef.current = 0;

        const textToSpeak = aiMessage.startsWith("AI: ") ? aiMessage.substring(4) : aiMessage;

        const sentences = textToSpeak.match(/[^.!?]+[.!?]?/g) || [textToSpeak];

        if (sentences.length > 0) {
          utteranceQueueRef.current = sentences
            .map(sentence => sentence.trim())
            .filter(sentence => sentence.length > 0)
            .map(sentence => new SpeechSynthesisUtterance(sentence));

          currentUtteranceIndexRef.current = 0;

          if (utteranceQueueRef.current.length > 0) {
             speakNext();
          }

        }

      }
    }

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        utteranceQueueRef.current = [];
        currentUtteranceIndexRef.current = 0;
        if (isSpeaking) {
           setIsSpeaking(false);
        }
      }
    };
  }, [aiMessage, interviewState]);

  const avatarSrc = isSpeaking ? gifUrl : staticImageUrl;

  let aiStatusText = "AI Ready";
  if (isSpeaking) {
    aiStatusText = "AI Speaking...";
  } else if (isMicActive) {
    aiStatusText = "AI Listening...";
  } else if (isProcessingAnswer) {
    aiStatusText = "AI Thinking...";
  }

  const handleBackToHome = () => {
    navigate("/home");
  };

  const handleStartInterview = async () => {
    if (!canAccessMockInterview) {
      toast({
        title: "Limit reached",
        description: "You have used your free mock interview. Upgrade to Plus for unlimited access.",
        variant: "destructive",
      });
      navigate("/pricing");
      return;
    }

    if (!isSubscriptionPlus) {
      await incrementInterviewGenerations();
    }

    if (!resumeFile || !jobDescriptionText.trim()) {
      toast({
        title: "Input Required",
        description: "Please upload your resume file and provide the job description.",
        variant: "destructive",
      });
      return;
    }
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setInterviewState('loading');
    setAiMessage("AI: Preparing your interview...");
    setConversationHistory([]);
    setCurrentTranscript("");

    try {
      const fileExt = resumeFile.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `resumes/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(filePath, resumeFile);

      if (uploadError) {
        console.error("Upload Error:", uploadError);
        throw new Error(`Failed to upload resume: ${uploadError.message}`);
      }
      setUploadedResumePath(filePath);

      const { data, error: functionError } = await supabase.functions.invoke('mock-interview-orchestrator', {
        body: {
          resumeFilePath: filePath,
          jobDescriptionText,
          selectedPersona,
        },
      });

      if (functionError) {
        throw new Error(functionError.message || "Failed to start interview function");
      }

      if (data && data.nextQuestion) {
        const firstQuestion = data.nextQuestion;
        setAiMessage(`AI: ${firstQuestion}`);
        setConversationHistory([{ role: 'assistant', content: firstQuestion }]);
        setInterviewState('interviewing');
      } else {
        throw new Error("Received invalid response from server.");
      }

    } catch (error) {
      console.error("Error starting interview:", error);
      toast({
        title: "Interview Start Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
        variant: "destructive",
      });
      setAiMessage("AI: Sorry, I couldn't start the interview. Please try again.");
      setInterviewState('error');
    }
  };

  const handleSendAnswer = async (userAnswer: string) => {
    const trimmedAnswer = userAnswer.trim();
    if (!trimmedAnswer) return;
    if (!uploadedResumePath) {
      toast({ title: "Error", description: "Resume file context lost.", variant: "destructive" });
      setInterviewState('error');
      return;
    }

    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setIsSpeaking(false);

    setIsProcessingAnswer(true);
    setCurrentTranscript("");
    const currentHistory = [...conversationHistory, { role: 'user' as const, content: trimmedAnswer }];
    setConversationHistory(currentHistory);
    setAiMessage("AI: Thinking...");

    try {
      const { data, error } = await supabase.functions.invoke('mock-interview-orchestrator', {
        body: {
          resumeFilePath: uploadedResumePath,
          jobDescriptionText,
          selectedPersona,
          userAnswer: trimmedAnswer,
          conversationHistory: currentHistory,
        },
      });

      if (error) {
        throw new Error(error.message || "Failed to get next question");
      }

      if (data && data.nextQuestion) {
        const nextQuestion = data.nextQuestion;
        setAiMessage(`AI: ${nextQuestion}`);
        setConversationHistory(prev => [...prev, { role: 'assistant', content: nextQuestion }]);
      } else if (data && data.feedback) {
        const feedback = data.feedback;
        setAiMessage(`AI: ${feedback}`);
        setInterviewState('feedback');
      } else {
        throw new Error("Received invalid response from server.");
      }
    } catch (error) {
      console.error("Error sending answer:", error);
      toast({
        title: "Error Processing Answer",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
        variant: "destructive",
      });
      setAiMessage("AI: Sorry, I encountered an error. Please try again or restart.");
    } finally {
      setIsProcessingAnswer(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) {
        toast({ title: "Invalid File Type", description: "Please upload a PDF or DOCX file.", variant: "destructive" });
        setResumeFile(null);
        event.target.value = '';
      } else if (file.size > 5 * 1024 * 1024) {
        toast({ title: "File Too Large", description: "Please upload a file smaller than 5MB.", variant: "destructive" });
        setResumeFile(null);
        event.target.value = '';
      } else {
        setResumeFile(file);
        setUploadedResumePath(null);
      }
    } else {
      setResumeFile(null);
      setUploadedResumePath(null);
    }
  };

  const handleMicToggle = () => {
    if (isSpeaking) {
      toast({ title: "Please Wait", description: "Wait for the interviewer to finish speaking.", variant: "default" });
      return;
    }

    if (isProcessingAnswer) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({
        title: "Browser Not Supported",
        description: "Your browser does not support Speech Recognition.",
        variant: "destructive",
      });
      return;
    }

    if (isMicActive) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    } else {
      setCurrentTranscript("");

      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        setIsMicActive(true);
        setCurrentTranscript("Listening...");
      };

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcriptPart = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcriptPart + ' ';
          } else {
            interimTranscript += transcriptPart;
          }
        }

        setCurrentTranscript(prev => {
            const existingFinal = prev === "Listening..." ? "" : prev.replace(/\s*\.\.\.$/, '');
            const newFinal = finalTranscript.trim();
            const currentInterim = interimTranscript.trim() ? interimTranscript.trim() + "..." : "";

            return (newFinal ? newFinal + " " : existingFinal + " ") + currentInterim;
        });
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        let errorMessage = event.error;
        if (event.error === 'no-speech') {
            errorMessage = "No speech detected. Please try again.";
        } else if (event.error === 'audio-capture') {
            errorMessage = "Microphone error. Please check permissions and hardware.";
        } else if (event.error === 'not-allowed') {
            errorMessage = "Microphone access denied. Please allow access in your browser settings.";
        }
        toast({ title: "Mic Error", description: errorMessage, variant: "destructive" });
        setIsMicActive(false);
        setCurrentTranscript("");
      };

      recognitionRef.current.onend = () => {
        setIsMicActive(false);
        setCurrentTranscript(prev => {
            const cleaned = prev.replace("Listening...", "").replace(/\s*\.\.\.$/, '').trim();
            return cleaned;
        });
      };

      recognitionRef.current.start();
    }
  };

  const canRecord = !isMicActive && !isProcessingAnswer && !isSpeaking;
  const canStop = isMicActive;
  const canSend = !isMicActive && !isProcessingAnswer && !isSpeaking && !!currentTranscript.trim() && currentTranscript !== "Listening...";

  let micButtonText = "Record Answer";
  if (isMicActive) {
    micButtonText = "Stop Recording";
  } else if (currentTranscript && currentTranscript !== "Listening...") {
    micButtonText = "Re-record Answer";
  }

  if (isLoading && !hasCheckedAuth) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#020617] to-[#0F172A] text-white">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8 space-y-3 sm:space-y-0">
          <Button
            variant="ghost"
            onClick={handleBackToHome}
            className="group flex items-center space-x-2 text-white/80 hover:text-white hover:bg-white/10 self-start sm:self-center"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Back to Home</span>
          </Button>

          <div className="flex items-center space-x-2 self-center">
            <Brain className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" />
            <span className="font-righteous text-xl sm:text-2xl bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              AI Mock Interview
            </span>
          </div>
          <div className="hidden sm:block w-[150px]"></div>
        </header>

        {interviewState === 'setup' && (
          <div className="space-y-6 sm:space-y-8">
            <Card className="relative border border-white/10 bg-white/5 backdrop-blur-sm rounded-xl shadow-xl overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
              <CardContent className="p-4 sm:p-6">
                <h1 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-center sm:text-left">Prepare for your Mock Interview</h1>
                <p className="text-sm sm:text-base text-white/70 mb-4 sm:mb-6">
                  Upload your resume and paste the target job description below. Then, choose an interviewer persona to begin.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label htmlFor="resumeFile" className="block text-sm font-medium text-white/80 mb-1 sm:mb-2">Your Resume (PDF or DOCX)</label>
                    <Input
                      id="resumeFile"
                      type="file"
                      accept=".pdf,.docx"
                      onChange={handleFileChange}
                      className="bg-white/5 border-white/10 text-white file:mr-4 file:py-2 file:px-3 sm:file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 text-xs sm:text-sm"
                    />
                    {resumeFile && <p className="text-xs text-white/60 mt-1">Selected: {resumeFile.name}</p>}
                  </div>
                  <div>
                    <label htmlFor="jobDescriptionText" className="block text-sm font-medium text-white/80 mb-1 sm:mb-2">Job Description</label>
                    <Textarea
                      id="jobDescriptionText"
                      placeholder="Paste the job description text here..."
                      value={jobDescriptionText}
                      onChange={(e) => setJobDescriptionText(e.target.value)}
                      className="min-h-[150px] sm:min-h-[200px] bg-white/5 border-white/10 text-white placeholder:text-white/40 text-sm sm:text-base"
                    />
                  </div>
                </div>
                <div className="mt-4 sm:mt-6">
                  <label htmlFor="persona" className="block text-sm font-medium text-white/80 mb-1 sm:mb-2">Interviewer Persona</label>
                  <Select
                    value={selectedPersona}
                    onValueChange={setSelectedPersona}
                  >
                    <SelectTrigger
                      id="persona"
                      className="w-full bg-white/5 border-white/10 text-white data-[placeholder]:text-white/60 text-sm sm:text-base"
                    >
                      <SelectValue placeholder="Select a persona" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0F172A] border-white/20 text-white">
                      {personas.map((persona) => (
                        <SelectItem
                          key={persona}
                          value={persona}
                          className="hover:bg-white/10 focus:bg-white/10 cursor-pointer text-sm sm:text-base"
                        >
                          {persona}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Alert className={`mt-4 text-sm sm:text-base ${isSubscriptionPlus || interviewGenerations < 1 ? 'bg-blue-900/30 border-blue-700/50 text-blue-200' : 'bg-red-900/30 border-red-700/50 text-red-200'}`}>
                   <AlertDescription>
                     {isSubscriptionPlus ? (
                       "Unlimited mock interviews with Plus!"
                     ) : interviewGenerations < 1 ? (
                       "1 free mock interview available!"
                     ) : (
                       "You have used your free mock interview. Upgrade to Plus for unlimited access."
                     )}
                   </AlertDescription>
                </Alert>
                <Button
                  onClick={handleStartInterview}
                  disabled={!resumeFile || !jobDescriptionText.trim()}
                  className="w-full mt-6 sm:mt-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Start Mock Interview
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {(interviewState === 'interviewing' || interviewState === 'feedback') && (
          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 items-start">
            <div className="w-full lg:w-1/3 lg:sticky lg:top-8">
              <Card className="h-[40vh] sm:h-[50vh] lg:h-[calc(100vh-10rem)] overflow-hidden p-0 flex items-center justify-center bg-black rounded-xl shadow-lg">
                <img
                  src={avatarSrc}
                  key={avatarSrc}
                  alt={`${selectedPersona} Avatar`}
                  className="w-full h-full object-cover"
                />
              </Card>
              <div className="text-center mt-3 sm:mt-4">
                <p className="text-base sm:text-xl font-semibold">
                  Interviewing with: {selectedPersona}
                </p>
                <p className={`text-sm sm:text-lg italic ${
                  isSpeaking ? 'text-blue-300 animate-pulse' :
                  isMicActive ? 'text-green-300' :
                  isProcessingAnswer ? 'text-purple-300 animate-pulse' :
                  'text-white/60'
                }`}>
                  {aiStatusText}
                </p>
              </div>
            </div>

            <div className="w-full lg:w-2/3 space-y-4">
              <Card className="h-[50vh] sm:h-[60vh] lg:h-[calc(100vh-20rem)] overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 bg-white/5 border border-white/10 rounded-xl shadow-lg scroll-smooth">
                <h3 className="font-semibold text-base sm:text-lg mb-2 sticky top-0 bg-gradient-to-b from-[#0F172A]/90 via-[#0F172A]/90 to-transparent pb-2 backdrop-blur-sm z-10">Conversation</h3>
                {conversationHistory.map((turn, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      turn.role === 'user' ? 'justify-end' : 'justify-start'
                    } items-end space-x-2`}
                  >
                    {turn.role === 'assistant' && (
                      <>
                        <img
                          src={staticImageUrl}
                          alt="AI Avatar"
                          className="w-5 h-5 sm:w-6 sm:h-6 rounded-full mb-1 flex-shrink-0"
                        />
                        <Card className="p-2 sm:p-3 max-w-[80%] sm:max-w-[85%] bg-muted rounded-lg rounded-bl-none text-black">
                          <p className="text-xs sm:text-sm whitespace-pre-wrap">{turn.content}</p>
                        </Card>
                      </>
                    )}
                    {turn.role === 'user' && (
                      <Card className="p-2 sm:p-3 max-w-[80%] sm:max-w-[85%] bg-blue-600 text-white rounded-lg rounded-br-none">
                        <p className="text-xs sm:text-sm whitespace-pre-wrap">{turn.content}</p>
                      </Card>
                    )}
                  </div>
                ))}
                {(isMicActive || (currentTranscript && currentTranscript !== "Listening...")) && (
                   <div className="flex justify-end items-start space-x-2">
                     <Card className={`p-2 sm:p-3 max-w-[80%] sm:max-w-[85%] bg-blue-700 text-white rounded-lg rounded-br-none border border-blue-400 ${isMicActive ? 'animate-pulse' : ''}`}>
                       <p className="text-xs sm:text-sm italic">{currentTranscript || "..."}</p>
                     </Card>
                   </div>
                )}
                {isProcessingAnswer && aiMessage === "AI: Thinking..." && (
                   <div className="flex justify-start items-end space-x-2">
                     <img src={staticImageUrl} alt="AI Avatar" className="w-5 h-5 sm:w-6 sm:h-6 rounded-full mb-1 flex-shrink-0" />
                     <Card className="p-2 sm:p-3 max-w-[80%] sm:max-w-[85%] bg-muted rounded-lg rounded-bl-none text-black">
                       <p className="text-xs sm:text-sm italic">Thinking...</p>
                     </Card>
                   </div>
                )}
                <div ref={messagesEndRef} />
              </Card>

              {interviewState === 'interviewing' && ( // Only show controls during interview
                <Card className="bg-white/5 border border-white/10 rounded-xl p-3 sm:p-4 shadow-lg">
                  <h3 className="font-semibold text-base sm:text-lg mb-2">Controls</h3>
                  {/* Stack buttons on small screens */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      onClick={handleMicToggle}
                      variant="outline"
                      // Changed inactive state colors to blue, kept red for active state
                      className={`w-full flex items-center justify-center space-x-2 text-sm sm:text-base ${
                        isMicActive
                          ? 'text-red-400 border-red-400/50 hover:bg-red-900/30' // Active (Stop Recording) state
                          : 'text-blue-300 border-blue-500/50 hover:bg-blue-900/30' // Inactive (Record/Re-record) state
                      }`}
                      disabled={!canRecord && !canStop} // Simplified disabled logic
                    >
                      {isMicActive ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                      <span>{micButtonText}</span>
                    </Button>

                    <Button
                      onClick={() => handleSendAnswer(currentTranscript)}
                      className="w-full bg-green-600 hover:bg-green-700 flex items-center justify-center space-x-2 text-sm sm:text-base"
                      disabled={!canSend} // Use canSend state
                    >
                      {isProcessingAnswer ? (
                        <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Processing...</>
                      ) : (
                        <>Send Answer</>
                      )}
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          </div>
        )}

        {interviewState === 'loading' && (
          <div className="flex flex-col justify-center items-center h-64 text-center">
            <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 animate-spin text-blue-400" />
            <p className="ml-0 mt-4 sm:ml-4 sm:mt-0 text-base sm:text-lg">Preparing your interview...</p>
          </div>
        )}

        {interviewState === 'feedback' && (
           <Card className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-6 mt-6">
              <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Interview Feedback</h2>
              <p className="text-sm sm:text-base text-white/80 whitespace-pre-wrap">{aiMessage.startsWith("AI: ") ? aiMessage.substring(4) : aiMessage}</p>
              <Button onClick={() => setInterviewState('setup')} className="mt-4 text-sm sm:text-base">Start New Interview</Button>
           </Card>
        )}

        {interviewState === 'error' && (
          <Card className="bg-red-900/20 border border-red-700 rounded-xl p-4 sm:p-6 mt-6">
            <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-red-300">Error</h2>
            <p className="text-sm sm:text-base text-white/80">{aiMessage.startsWith("AI: ") ? aiMessage.substring(4) : aiMessage}</p>
            <Button onClick={() => setInterviewState('setup')} className="mt-4 text-sm sm:text-base">Try Again</Button>
          </Card>
        )}

        <div className="mt-6 sm:mt-8 text-center text-xs sm:text-sm text-white/40">
          <p>
            Use this AI Mock Interview to practice and build confidence.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MockInterviewPage;
