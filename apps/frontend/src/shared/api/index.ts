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

export const api = {
  analyzeTranscript: async (transcript: string): Promise<AnalysisResult> => {
    const response = await fetch(`${BASE_URL}/ingestion/transcript/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript }),
    });
    if (!response.ok) {
      let errorMessage = 'Failed to analyze transcript';
      try {
        const errorBody = await response.json();
        errorMessage = errorBody.message || errorMessage;
      } catch {}
      throw new Error(errorMessage);
    }
    return response.json();
  },
};
