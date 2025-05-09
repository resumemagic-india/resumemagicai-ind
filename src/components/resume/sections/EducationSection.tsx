
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Minus } from "lucide-react";
import { Education } from '@/types/resume';

interface EducationSectionProps {
  education: Education[];
  onEducationChange: (education: Education[]) => void;
}

const EducationSection: React.FC<EducationSectionProps> = ({
  education,
  onEducationChange,
}) => {
  const addEducation = () => {
    onEducationChange([
      ...education,
      { id: Date.now().toString(), degree: "", institution: "", startDate: "", endDate: "" },
    ]);
  };

  return (
    <section className="bg-white/5 rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Education</h2>
        <Button 
          onClick={addEducation}
          className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Education
        </Button>
      </div>
      
      {education.map((edu, index) => (
        <div key={edu.id} className="mb-4 p-4 bg-white/10 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Education {index + 1}</h3>
            {education.length > 1 && (
              <Button
                onClick={() => onEducationChange(education.filter(item => item.id !== edu.id))}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
                size="sm"
              >
                <Minus className="w-4 h-4 mr-2" />
                Remove
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Input
              placeholder="Degree"
              value={edu.degree}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => 
                onEducationChange(education.map(item => 
                  item.id === edu.id ? { ...item, degree: event.target.value } : item
                ))
              }
              className="bg-white/10 border-white/20 text-white"
            />
            <Input
              placeholder="Institution"
              value={edu.institution}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => 
                onEducationChange(education.map(item => 
                  item.id === edu.id ? { ...item, institution: event.target.value } : item
                ))
              }
              className="bg-white/10 border-white/20 text-white"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="date"
              placeholder="Start Date"
              value={edu.startDate}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => 
                onEducationChange(education.map(item => 
                  item.id === edu.id ? { ...item, startDate: event.target.value } : item
                ))
              }
              className="bg-white/10 border-white/20 text-white"
            />
            <Input
              type="date"
              placeholder="End Date"
              value={edu.endDate}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => 
                onEducationChange(education.map(item => 
                  item.id === edu.id ? { ...item, endDate: event.target.value } : item
                ))
              }
              className="bg-white/10 border-white/20 text-white"
            />
          </div>
        </div>
      ))}
    </section>
  );
};

export default EducationSection;
