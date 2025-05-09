
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ResumeTemplate } from "@/types/resume";

interface TemplateSelectorProps {
  selectedTemplate: ResumeTemplate;
  onTemplateChange: (template: ResumeTemplate) => void;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  selectedTemplate,
  onTemplateChange,
}) => {
  const templates = [
    {
      id: "professional",
      name: "Modern",
      description: "Classic professional layout with clean sections",
      image: "/lovable-uploads/97d4e39c-c0fe-4d28-bc16-6fdbe23768c4.png"
    },
    {
      id: "professional_modern",
      name: "Professional Modern",
      description: "Contemporary design with modern styling",
      image: "/lovable-uploads/df6b6371-05c8-4591-9f85-f1325f8876b8.png"
    },
    {
      id: "simple",
      name: "Simple",
      description: "Minimalist approach for clarity",
      image: "/lovable-uploads/f1270df4-d58b-44f7-b53b-64bf981ec296.png"
    },
    {
      id: "modern",
      name: "Professional",
      description: "Formal design for senior positions",
      image: "/lovable-uploads/f576f4f5-d2f9-4771-913b-ba0f9395c02a.png"
    },
    {
      id: "creative",
      name: "Creative",
      description: "Unique layout for creative industries",
      image: "/lovable-uploads/creative_sample.png"
    },
    {
      id: "hybrid",
      name: "Hybrid",
      description: "Focused on technical skills and experience",
      image: "/lovable-uploads/f531c379-d2e9-4680-84be-4397b761df36.png"
    }
  ];

  return (
    <section className="bg-white/5 rounded-lg p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Select Resume Template</h2>
      
      <RadioGroup 
        value={selectedTemplate} 
        onValueChange={(value) => onTemplateChange(value as ResumeTemplate)}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {templates.map((template) => (
          <div key={template.id} className="relative">
            <RadioGroupItem
              value={template.id as ResumeTemplate}
              id={`template-${template.id}`}
              className="sr-only peer"
            />
            <Label
              htmlFor={`template-${template.id}`}
              className="cursor-pointer"
            >
              <Card className={`overflow-hidden transition-all duration-200 ${
                selectedTemplate === template.id ? 
                "ring-2 ring-purple-500 shadow-lg shadow-purple-500/20" : 
                "hover:shadow-md border-white/10 hover:border-white/20"
              }`}>
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img 
                    src={template.image} 
                    alt={template.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-3">
                  <h3 className="font-medium">{template.name}</h3>
                  <p className="text-sm text-white/70">{template.description}</p>
                </CardContent>
              </Card>
            </Label>
            {selectedTemplate === template.id && (
              <div className="absolute top-2 right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </RadioGroup>
    </section>
  );
};

export default TemplateSelector;
