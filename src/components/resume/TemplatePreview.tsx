
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Check } from "lucide-react";
import { ResumeTemplate } from "@/types/resume";

interface TemplatePreviewProps {
  name: ResumeTemplate;
  title: string;
  description: string;
  isSelected: boolean;
  onClick: () => void;
}

export const TemplatePreview: React.FC<TemplatePreviewProps> = ({
  name,
  title,
  description,
  isSelected,
  onClick
}) => {
  // Each template has a different color scheme
  const getTemplateColors = () => {
    switch (name) {
      case 'modern':
        return {
          background: 'from-blue-50 to-blue-100',
          border: 'border-blue-200',
          selectedBorder: 'border-blue-500',
          icon: 'text-blue-500',
          header: 'bg-blue-500 text-white'
        };
      case 'creative':
        return {
          background: 'from-purple-50 to-purple-100',
          border: 'border-purple-200',
          selectedBorder: 'border-purple-500',
          icon: 'text-purple-500',
          header: 'bg-purple-500 text-white'
        };
      case 'hybrid':
        return {
          background: 'from-teal-50 to-teal-100',
          border: 'border-teal-200',
          selectedBorder: 'border-teal-500',
          icon: 'text-teal-500',
          header: 'bg-teal-500 text-white'
        };
      case 'simple':
        return {
          background: 'from-gray-50 to-gray-100',
          border: 'border-gray-200',
          selectedBorder: 'border-gray-500',
          icon: 'text-gray-500',
          header: 'bg-gray-500 text-white'
        };
      case 'professional_modern':
        return {
          background: 'from-indigo-50 to-indigo-100',
          border: 'border-indigo-200',
          selectedBorder: 'border-indigo-500',
          icon: 'text-indigo-500',
          header: 'bg-indigo-500 text-white'
        };
      case 'professional':
        return {
          background: 'from-slate-50 to-slate-100',
          border: 'border-slate-200',
          selectedBorder: 'border-slate-500',
          icon: 'text-slate-500',
          header: 'bg-slate-500 text-white'
        };
    }
  };

  const colors = getTemplateColors();

  return (
    <Card 
      className={`cursor-pointer overflow-hidden transition-all duration-200 
        ${isSelected ? `${colors.selectedBorder} shadow-lg scale-[1.02]` : `${colors.border} hover:shadow-md hover:scale-[1.01]`}
        bg-gradient-to-br ${colors.background}`}
      onClick={onClick}
    >
      <div className={`p-3 ${colors.header} relative`}>
        <h3 className="font-medium">
          {title}
        </h3>
        {isSelected && (
          <div className="absolute right-2 top-2">
            <div className="bg-white rounded-full p-1">
              <Check className={`h-4 w-4 ${colors.icon}`} />
            </div>
          </div>
        )}
      </div>
      <CardContent className="p-3 text-xs text-gray-600 flex flex-col h-28">
        <div className="grow">
          <p>{description}</p>
        </div>
        <div className="border-t pt-2 mt-2 border-gray-200 text-right italic text-xs">
          {isSelected ? 'Selected template' : 'Click to select'}
        </div>
      </CardContent>
    </Card>
  );
};
