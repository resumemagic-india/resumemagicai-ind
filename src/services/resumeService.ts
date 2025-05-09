
import { UnifiedResumeRequest, UnifiedResumeResponse, PreviewResponse } from "@/types/resume";

const API_URL = import.meta.env.VITE_API_URL;

export const generateUnifiedResume = async (
  data: UnifiedResumeRequest,
  accessToken: string
): Promise<UnifiedResumeResponse> => {
  const response = await fetch(`${API_URL}/api/unified-resume`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    credentials: 'include',
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to generate resume');
  }

  return response.json();
};

export const getResumePreview = async (
  data: UnifiedResumeRequest,
  accessToken: string
): Promise<PreviewResponse> => {
  const response = await fetch(`${API_URL}/api/preview-resume`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    credentials: 'include',
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to generate preview');
  }

  return response.json();
};
