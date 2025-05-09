import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Minus } from "lucide-react";
import { WorkExperience } from '@/types/resume';

interface WorkExperienceSectionProps {
  experiences: WorkExperience[];
  onExperienceChange: (experiences: WorkExperience[]) => void;
}

const WorkExperienceSection: React.FC<WorkExperienceSectionProps> = ({
  experiences,
  onExperienceChange,
}) => {
  const addExperience = () => {
    onExperienceChange([
      ...experiences,
      {
        id: Date.now().toString(),
        title: "",
        company: "",
        startDate: "",
        endDate: "",
        currentlyWorking: false,
        projects: [],
      },
    ]);
  };

  const addProject = (experienceId: string) => {
    onExperienceChange(
      experiences.map((exp) =>
        exp.id === experienceId
          ? {
              ...exp,
              projects: [
                ...exp.projects,
                { id: Date.now().toString(), name: "", description: "", tools: "", responsibilities: "" },
              ],
            }
          : exp
      )
    );
  };

  return (
    <section className="bg-white/5 rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Work Experience</h2>
        <Button 
          onClick={addExperience}
          className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Experience
        </Button>
      </div>
      
      {experiences.map((exp, index) => (
        <div key={exp.id} className="mb-6 p-4 bg-white/10 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Experience {index + 1}</h3>
            {experiences.length > 1 && (
              <Button
                onClick={() => onExperienceChange(experiences.filter(w => w.id !== exp.id))}
                className="bg-red-500 hover:bg-red-600 text-white"
                size="sm"
              >
                <Minus className="w-4 h-4 mr-2" />
                Remove
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Input
              placeholder="Job Title"
              value={exp.title}
              onChange={(e) =>
                onExperienceChange(
                  experiences.map((w) =>
                    w.id === exp.id ? { ...w, title: e.target.value } : w
                  )
                )
              }
              className="bg-white/10 border-white/20 text-white"
            />
            <Input
              placeholder="Company"
              value={exp.company}
              onChange={(e) =>
                onExperienceChange(
                  experiences.map((w) =>
                    w.id === exp.id ? { ...w, company: e.target.value } : w
                  )
                )
              }
              className="bg-white/10 border-white/20 text-white"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <label htmlFor={`start-date-${exp.id}`} className="text-sm font-medium text-white">
                Start Date
              </label>
              <Input
                id={`start-date-${exp.id}`}
                type="date"
                placeholder="Start Date"
                value={exp.startDate}
                onChange={(e) =>
                  onExperienceChange(
                    experiences.map((w) =>
                      w.id === exp.id ? { ...w, startDate: e.target.value } : w
                    )
                  )
                }
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            {!exp.currentlyWorking && (
              <div className="space-y-2">
                <label htmlFor={`end-date-${exp.id}`} className="text-sm font-medium text-white">
                  End Date
                </label>
                <Input
                  id={`end-date-${exp.id}`}
                  type="date"
                  placeholder="End Date"
                  value={exp.endDate}
                  onChange={(e) =>
                    onExperienceChange(
                      experiences.map((w) =>
                        w.id === exp.id ? { ...w, endDate: e.target.value } : w
                      )
                    )
                  }
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2 mb-4">
            <Checkbox
              id={`currently-working-${exp.id}`}
              checked={exp.currentlyWorking}
              onCheckedChange={(checked) =>
                onExperienceChange(
                  experiences.map((w) =>
                    w.id === exp.id ? { ...w, currentlyWorking: checked as boolean, endDate: checked ? "Present" : "" } : w
                  )
                )
              }
            />
            <label
              htmlFor={`currently-working-${exp.id}`}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-white"
            >
              Currently Working Here
            </label>
          </div>

          <div className="mt-4">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold">Projects</h4>
              <Button
                onClick={() => addProject(exp.id)}
                className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Project
              </Button>
            </div>
            
            {exp.projects.map((project, pIndex) => (
              <div key={project.id} className="mb-4 p-4 bg-white/5 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <h5 className="text-md font-semibold">Project {pIndex + 1}</h5>
                  {exp.projects.length > 1 && (
                    <Button
                      onClick={() => {
                        onExperienceChange(
                          experiences.map(w =>
                            w.id === exp.id
                              ? { ...w, projects: w.projects.filter(p => p.id !== project.id) }
                              : w
                          )
                        );
                      }}
                      className="bg-red-500 hover:bg-red-600 text-white"
                      size="sm"
                    >
                      <Minus className="w-4 h-4 mr-2" />
                      Remove
                    </Button>
                  )}
                </div>
                
                <Input
                  placeholder="Project Name"
                  value={project.name}
                  onChange={(e) =>
                    onExperienceChange(
                      experiences.map((w) =>
                        w.id === exp.id
                          ? {
                              ...w,
                              projects: w.projects.map((p) =>
                                p.id === project.id
                                  ? { ...p, name: e.target.value }
                                  : p
                              ),
                            }
                          : w
                      )
                    )
                  }
                  className="mb-2 bg-white/10 border-white/20 text-white"
                />
                
                <Textarea
                  placeholder="Project Description"
                  value={project.description}
                  onChange={(e) =>
                    onExperienceChange(
                      experiences.map((w) =>
                        w.id === exp.id
                          ? {
                              ...w,
                              projects: w.projects.map((p) =>
                                p.id === project.id
                                  ? { ...p, description: e.target.value }
                                  : p
                              ),
                            }
                          : w
                      )
                    )
                  }
                  className="mb-2 bg-white/10 border-white/20 text-white"
                />
                
                <Input
                  placeholder="Tools Used"
                  value={project.tools}
                  onChange={(e) =>
                    onExperienceChange(
                      experiences.map((w) =>
                        w.id === exp.id
                          ? {
                              ...w,
                              projects: w.projects.map((p) =>
                                p.id === project.id
                                  ? { ...p, tools: e.target.value }
                                  : p
                              ),
                            }
                          : w
                      )
                    )
                  }
                  className="mb-2 bg-white/10 border-white/20 text-white"
                />
                
                <Textarea
                  placeholder="Project Responsibilities"
                  value={project.responsibilities}
                  onChange={(e) =>
                    onExperienceChange(
                      experiences.map((w) =>
                        w.id === exp.id
                          ? {
                              ...w,
                              projects: w.projects.map((p) =>
                                p.id === project.id
                                  ? { ...p, responsibilities: e.target.value }
                                  : p
                              ),
                            }
                          : w
                      )
                    )
                  }
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
};

export default WorkExperienceSection;
