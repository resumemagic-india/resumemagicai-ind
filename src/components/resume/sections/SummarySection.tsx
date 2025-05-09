
import React from 'react';
import { Textarea } from "@/components/ui/textarea";

interface SummarySectionProps {
  summary: string;
  onChange: (value: string) => void;
}

const SummarySection: React.FC<SummarySectionProps> = ({ summary, onChange }) => {
  return (
    <section className="bg-white/5 rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Professional Summary</h2>
      <Textarea
        value={summary}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Describe your professional background and career objectives..."
        className="min-h-[150px] bg-white/10 border-white/20 text-white"
      />
    </section>
  );
};

export default SummarySection;
