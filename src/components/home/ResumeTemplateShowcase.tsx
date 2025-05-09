import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Check, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ResumeTemplate } from "@/types/resume";
import { motion } from "framer-motion";

type ResumeTemplateItem = {
  id: number;
  name: string;
  image: string;
  description: string;
  backendType: ResumeTemplate;
};

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0, scale: 0.95 },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 100, damping: 12 }
  },
};

export const ResumeTemplateShowcase = () => {
  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);

  const resumeTemplates: ResumeTemplateItem[] = [
    {
      id: 1,
      name: "Professional",
      image: "/lovable-uploads/97d4e39c-c0fe-4d28-bc16-6fdbe23768c4.png",
      description: "Classic professional layout with clean sections",
      backendType: "professional"
    },
    {
      id: 2,
      name: "Professional Modern",
      image: "/lovable-uploads/df6b6371-05c8-4591-9f85-f1325f8876b8.png",
      description: "Contemporary design with modern styling",
      backendType: "professional_modern"
    },
    {
      id: 3, 
      name: "Simple",
      image: "/lovable-uploads/f1270df4-d58b-44f7-b53b-64bf981ec296.png",
      description: "Minimalist approach for clarity",
      backendType: "simple"
    },
    {
      id: 4,
      name: "modern",
      image: "/lovable-uploads/f576f4f5-d2f9-4771-913b-ba0f9395c02a.png",
      description: "Formal design for senior positions",
      backendType: "modern"
    },
    {
      id: 5,
      name: "Creative",
      image: "/lovable-uploads/creative_sample.png",
      description: "Unique layout for creative industries",
      backendType: "creative"
    },
    {
      id: 6,
      name: "Hybrid",
      image: "/lovable-uploads/f531c379-d2e9-4680-84be-4397b761df36.png",
      description: "Focused on technical skills and experience",
      backendType: "hybrid"
    }
  ];
  
  const handleTemplateSelect = (id: number) => {
    setSelectedTemplate(id);
    const template = resumeTemplates.find(t => t.id === id);
    if (template) {
      navigate('/dashboard', { 
        state: { 
          templateId: id,
          templateType: template.backendType,
          fromHomePageSelection: true 
        } 
      });
    }
  };
  
  return (
    <motion.div 
      className="w-full"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div 
        className="mb-8 text-center"
        variants={itemVariants}
      >
        <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-400 mb-2 animate-text-gradient">
          Choose Your Winning Template
        </h2>
        <motion.div 
          className="w-20 h-0.5 mx-auto bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full mb-3"
          initial={{ width: 0 }}
          animate={{ width: "5rem" }}
          transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
        />
        <p className="text-lg text-white/70 max-w-3xl mx-auto">
          Pick a professional, ATS-friendly design proven to land more interviews.
        </p>
      </motion.div>
      
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={containerVariants}
      >
        {resumeTemplates.map((template) => (
          <motion.div
            key={template.id}
            variants={itemVariants}
            whileHover={{ y: -5, scale: 1.03 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
          >
            <Card 
              className={`
                relative overflow-hidden group border rounded-xl
                transition-all duration-300 ease-in-out cursor-pointer
                bg-gradient-to-br from-white/10 via-white/5 to-transparent
                backdrop-blur-lg shadow-lg
                ${selectedTemplate === template.id 
                  ? 'border-purple-500 shadow-purple-500/30 ring-2 ring-purple-500/50'
                  : 'border-white/15 hover:border-purple-400/50 hover:shadow-purple-500/20'
                }
              `}
            >
              <div className="relative aspect-[3/4] overflow-hidden">
                <motion.img 
                  src={template.image} 
                  alt={`${template.name} Resume Template`}
                  className="w-full h-full object-cover object-top"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />
                
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent p-3">
                  <h3 className="text-white font-semibold text-base truncate">{template.name}</h3>
                </div>
                
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent flex flex-col items-center justify-end p-4 text-center"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <Sparkles className="w-6 h-6 text-purple-300 mb-2" /> 
                  <h3 className="text-white font-bold text-lg mb-1">{template.name}</h3>
                  <p className="text-white/80 text-sm mb-4 px-2">{template.description}</p>
                  <Button
                    onClick={() => handleTemplateSelect(template.id)}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white w-full shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                    size="sm"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Use Template
                  </Button>
                </motion.div>
                
                {selectedTemplate === template.id && (
                  <motion.div 
                    className="absolute top-2 right-2 z-10"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.1 }}
                  >
                    <span className="bg-gradient-to-br from-green-400 to-emerald-500 text-white p-1.5 rounded-full flex items-center justify-center shadow-lg">
                      <Check className="h-4 w-4" />
                    </span>
                  </motion.div>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};
