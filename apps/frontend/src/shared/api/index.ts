const BASE_URL = 'http://localhost:3001';

export interface AnalysisResult {
  participants: string[];
  decisions: {
    content: string;
    rationale: string;
    participants: string[];
  }[];
  transcript: string[];
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('synapse_token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (!response.ok) {
    let errorMessage = 'Request failed';
    try {
      const body = await response.json();
      errorMessage = body.message || errorMessage;
    } catch {}
    throw new Error(errorMessage);
  }
  return response.json();
}

export const api = {
  analyzeTranscript: async (transcript: string): Promise<AnalysisResult> =>
    request('/ingestion/transcript/analyze', {
      method: 'POST',
      body: JSON.stringify({ transcript }),
    }),

  register: async (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    company?: string;
  }): Promise<{ access_token: string }> =>
    request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),

  login: async (data: {
    email: string;
    password: string;
  }): Promise<{ access_token: string }> =>
    request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),

  forgotPassword: async (email: string): Promise<{ message: string }> =>
    request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),

  resetPassword: async (data: {
    token: string;
    password: string;
  }): Promise<{ message: string }> =>
    request('/auth/reset-password', { method: 'POST', body: JSON.stringify(data) }),

  getMe: async (): Promise<{
    firstName: string;
    lastName: string;
    email: string;
    company?: string;
    isPaid: boolean;
  }> => request('/auth/me'),
};
