
export type ResumeTemplate = 'modern' | 'creative' | 'hybrid' | 'simple' | 'professional_modern' | 'professional';

export interface HeaderDetails {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  address: string;
  job_title?: string;
  linkedin?: string;  // Added for the backend API
  github?: string;    // Added for the backend API
  website?: string;   // Added for the backend API
}

export interface Project {
  id: string;
  name: string;
  description: string;
  tools: string;
  responsibilities: string;
}

export interface WorkExperience {
  id: string;
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  currentlyWorking?: boolean;
  projects: Project[];
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  startDate: string;
  endDate: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  date: string;
}

export interface CustomSection {
  id: string;
  title: string;
  content: string;
}

export interface ResumeDetails {
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
}

export interface UnifiedResumeRequest {
  headerDetails: HeaderDetails;
  resumeDetails: ResumeDetails;
}

export interface UnifiedResumeResponse {
  file_data: string;
  file_name: string;
  mimetype: string;
}

export interface PreviewResponse {
  preview_html: string;
  optimized_text: string;
}
