export type ResumeTemplate = 'modern' | 'creative' | 'hybrid' | 'simple' | 'professional_modern' | 'professional';

export interface UnifiedResumeRequest {
  headerDetails: {
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    address: string;
    job_title?: string;
  };
  resumeDetails: {
    summary: string;
    work_experience: WorkExperience[];
    education: Education[];
    skills: {
      technical: string;
      soft: string;
    };
    certifications: Certification[];
    achievements: Achievement[];
    custom_sections: CustomSection[];
    job_url?: string;
    job_description?: string;
  };
  templateType?: ResumeTemplate;
}

interface WorkExperience {
  id: string;
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  projects: Project[];
}

interface Project {
  id: string;
  name: string;
  description: string;
  tools: string;
  responsibilities: string;
}

interface Education {
  id: string;
  degree: string;
  institution: string;
  startDate: string;
  endDate: string;
}

interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  date: string;
}

interface CustomSection {
  id: string;
  title: string;
  content: string;
}
