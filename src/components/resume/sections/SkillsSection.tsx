
import React from 'react';
import { Textarea } from "@/components/ui/textarea";

interface SkillsSectionProps {
  skills: {
    technical: string;
    soft: string;
  };
  onSkillsChange: (skills: { technical: string; soft: string }) => void;
}

const SkillsSection: React.FC<SkillsSectionProps> = ({ skills, onSkillsChange }) => {
  return (
    <section className="bg-white/5 rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Skills</h2>
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Technical Skills</label>
          <Textarea
            placeholder="Enter technical skills (e.g., Python, JavaScript, Photoshop)"
            value={skills.technical}
            onChange={(e) => onSkillsChange({ ...skills, technical: e.target.value })}
            className="bg-white/10 border-white/20 text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Soft Skills</label>
          <Textarea
            placeholder="Enter soft skills (e.g., Leadership, Communication, Team Management)"
            value={skills.soft}
            onChange={(e) => onSkillsChange({ ...skills, soft: e.target.value })}
            className="bg-white/10 border-white/20 text-white"
          />
        </div>
      </div>
    </section>
  );
};

export default SkillsSection;
