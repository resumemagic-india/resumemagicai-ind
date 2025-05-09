import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getOptimizedResumes, deleteOptimizedResume } from "@/utils/resumeStorage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  FileText, 
  Download, 
  Eye, 
  Loader2, 
  ChevronLeft, 
  Inbox, 
  Trash2,
  Edit // <-- Import Edit icon
} from "lucide-react";
import { ResumePreviewCard } from "@/components/resume/ResumePreviewCard";
import { motion } from "framer-motion";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"; // <-- Import Tooltip components

// Define the interface for the resume file structure
interface ResumeFile {
  name: string;
  path: string;
  publicUrl: string;
  created_at?: string; 
}

// Animation variants for the grid container and items
const gridContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  },
};

const gridItemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { type: "spring", stiffness: 100 } 
  },
};

const MyResumesPage = () => {
  const [resumes, setResumes] = useState<ResumeFile[]>([]); 
  const [loading, setLoading] = useState(true);
  const [previewingResume, setPreviewingResume] = useState<ResumeFile | null>(null); 
  const [resumeToDelete, setResumeToDelete] = useState<ResumeFile | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    setLoading(true);
    getOptimizedResumes()
      .then((files) => {
        const sortedFiles = (files as ResumeFile[]).sort((a, b) => {
          const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
          const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
          return dateB - dateA;
        });
        setResumes(sortedFiles);
      })
      .catch(error => {
        console.error("Error fetching resumes:", error);
        toast({ variant: "destructive", title: "Error", description: "Could not fetch resumes." });
      })
      .finally(() => {
        setLoading(false);
      });
  }, [toast]);

  const handleDeleteConfirm = async () => {
    if (!resumeToDelete) return;

    setIsDeleting(true);
    try {
      const success = await deleteOptimizedResume(resumeToDelete.path);
      if (success) {
        setResumes(prevResumes => prevResumes.filter(r => r.path !== resumeToDelete.path));
        toast({ title: "Success", description: `"${resumeToDelete.name}" deleted.` });
      } else {
        toast({ variant: "destructive", title: "Error", description: "Could not delete resume." });
      }
    } catch (error) {
      console.error("Error deleting resume:", error);
      toast({ variant: "destructive", title: "Error", description: "An unexpected error occurred during deletion." });
    } finally {
      setIsDeleting(false);
      setResumeToDelete(null);
    }
  };

  const getPreviewType = (fileName: string): 'pdf' | 'docx' | null => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (extension === 'pdf') return 'pdf';
    if (extension === 'docx') return 'docx';
    return null;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString(undefined, { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return 'Invalid Date';
    }
  };

  // Function to open the Microsoft viewer/editor URL
  const handleOpenForEditing = (url: string) => {
    const editUrl = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(url)}`;
    window.open(editUrl, '_blank', 'noopener,noreferrer');
  };
  
  return (
    <TooltipProvider delayDuration={100}> 
      <div className="min-h-screen bg-gradient-to-br from-[#050f1f] via-[#0a1e3c] to-[#1a0a2e] text-white p-4 md:p-8 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <Button
              variant="ghost"
              onClick={() => navigate('/home')} 
              className="mb-6 text-white/90 hover:text-white group transition-all duration-300 flex items-center gap-2 px-0 hover:bg-transparent"
            >
              <span className="relative overflow-hidden rounded-full bg-white/10 p-2 transition-all duration-300 group-hover:bg-white/20 group-hover:scale-110">
                <ChevronLeft className="w-4 h-4" />
              </span>
              <span className="font-medium">Back to Home</span>
            </Button>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2 }}
            className="text-3xl md:text-4xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-teal-300 via-blue-400 to-purple-400"
          >
            My Optimized Resumes
          </motion.h1>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-10 w-10 animate-spin text-blue-400" />
            </div>
          ) : resumes.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              transition={{ delay: 0.3 }}
              className="text-center py-20 flex flex-col items-center"
            >
              <Inbox className="h-20 w-20 mx-auto text-blue-400/50 mb-6" />
              <p className="text-2xl font-semibold text-gray-300 mb-2">Your Resume Vault is Empty</p>
              <p className="text-gray-400 max-w-md mx-auto">Looks like you haven't optimized any resumes yet. Let's create your first masterpiece!</p>
              <Button 
                onClick={() => navigate('/dashboard')} 
                className="mt-8 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Optimize a Resume Now
              </Button>
            </motion.div>
          ) : (
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              variants={gridContainerVariants}
              initial="hidden"
              animate="visible"
            >
              {resumes.map((resume) => {
                const previewType = getPreviewType(resume.name);
                return (
                  <motion.div key={resume.path} variants={gridItemVariants}>
                    <Card 
                      className="bg-gradient-to-br from-white/5 via-white/[0.03] to-transparent backdrop-blur-lg border border-white/10 text-white overflow-hidden transition-all duration-300 hover:border-blue-400/60 hover:shadow-2xl hover:shadow-blue-500/15 flex flex-col justify-between h-full group"
                    >
                      <div>
                        <CardHeader className="pb-2 relative">
                          <CardTitle className="text-sm font-medium flex items-start gap-2 text-blue-300 group-hover:text-blue-200 transition-colors duration-300">
                            <FileText className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <span className="break-words line-clamp-3" title={resume.name}>{resume.name}</span>
                          </CardTitle>
                          <CardDescription className="text-xs text-gray-400 pt-1 group-hover:text-gray-300 transition-colors duration-300">
                            Created: {formatDate(resume.created_at)}
                          </CardDescription>
                          <span className={`absolute top-2 right-2 text-xs font-bold px-1.5 py-0.5 rounded ${previewType === 'pdf' ? 'bg-red-600/70' : 'bg-blue-600/70'} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
                            {previewType?.toUpperCase()}
                          </span>
                        </CardHeader>
                      </div>
                      <CardContent className="flex justify-end items-center space-x-1 pt-3 pb-3 px-4 border-t border-white/10 mt-auto">
                        {previewType && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="text-blue-300 hover:bg-blue-500/20 hover:text-blue-200 h-8 w-8"
                                onClick={() => setPreviewingResume(resume)}
                              >
                                <Eye className="w-4 h-4" /> 
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="bg-slate-800 text-white border-slate-700">
                              <p>Preview</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                        {previewType === 'docx' && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="text-green-400 hover:bg-green-500/20 hover:text-green-300 h-8 w-8"
                                onClick={() => handleOpenForEditing(resume.publicUrl)}
                              >
                                <Edit className="w-4 h-4" /> 
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="bg-slate-800 text-white border-slate-700 max-w-xs text-center">
                              <p className="font-semibold mb-1">Edit Online (via Microsoft)</p>
                              <p className="text-xs text-slate-300">Opens in Microsoft viewer. Editing may require a Microsoft account login.</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              asChild 
                              variant="ghost" 
                              size="icon"
                              className="text-blue-300 hover:bg-blue-500/20 hover:text-blue-200 h-8 w-8"
                            >
                              <a href={resume.publicUrl} download={resume.name} target="_blank" rel="noopener noreferrer">
                                <Download className="w-4 h-4" /> 
                              </a>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="bg-slate-800 text-white border-slate-700">
                            <p>Download</p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="text-red-400 hover:bg-red-500/20 hover:text-red-300 h-8 w-8"
                              onClick={() => setResumeToDelete(resume)}
                            >
                              <Trash2 className="w-4 h-4" /> 
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="bg-slate-800 text-white border-slate-700">
                            <p>Delete</p>
                          </TooltipContent>
                        </Tooltip>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>

        {previewingResume && getPreviewType(previewingResume.name) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <div className="absolute inset-0" onClick={() => setPreviewingResume(null)}></div> 
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="relative z-[110] w-full max-w-4xl bg-gray-900 rounded-lg shadow-xl overflow-hidden border border-white/10"
            > 
              <ResumePreviewCard
                previewUrl={previewingResume.publicUrl}
                previewType={getPreviewType(previewingResume.name)!}
                onClose={() => setPreviewingResume(null)}
              />
            </motion.div>
          </motion.div>
        )}

        <AlertDialog open={!!resumeToDelete} onOpenChange={(open) => !open && setResumeToDelete(null)}>
          <AlertDialogContent className="bg-slate-900 border border-slate-700 text-white">
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription className="text-slate-400">
                This action cannot be undone. This will permanently delete the resume file:
                <br />
                <strong className="text-slate-300 break-all">{resumeToDelete?.name}</strong>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel 
                className="bg-transparent border border-slate-600 hover:bg-slate-700 text-slate-300"
                disabled={isDeleting}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteConfirm} 
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={isDeleting}
              >
                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {isDeleting ? 'Deleting...' : 'Yes, delete file'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
};

export default MyResumesPage;