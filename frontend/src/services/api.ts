import type {
  DiagnosticStartResponse,
  DiagnosticSubmitRequest,
  DiagnosticSubmitResponse,
  PathResponse,
  QuizNextResponse,
  QuizAnswerRequest,
  QuizAnswerResponse,
  MasteryResponse,
  HintRequest,
  HintResponse,
  PracticeQuestionRequest,
  PracticeQuestionResponse
} from "../types";

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// We hardcode a valid token for 'student-1' for integration testing
// since auth UI is skipped for this MVP.
const getToken = () => {
  return localStorage.getItem('supabase_token') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJzdHVkZW50LTEifQ.4rq1NmaoH2lbBco-aQqekLvotDf9YmSn6KaXUM33kUE';
};

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getToken()}`
});

const fetchApi = async <T>(endpoint: string, options?: RequestInit): Promise<T> => {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      ...getHeaders(),
      ...options?.headers,
    }
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.message || `API Error: ${res.status}`);
  }

  return res.json();
};

export const api = {
  health: (): Promise<{ status: string }> => fetchApi('/health'),

  startDiagnostic: (): Promise<DiagnosticStartResponse> => fetchApi('/diagnostic/start'),

  submitDiagnostic: (data: DiagnosticSubmitRequest): Promise<DiagnosticSubmitResponse> => 
    fetchApi('/diagnostic/submit', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getPath: (studentId: string): Promise<PathResponse> => 
    fetchApi(`/path/${studentId}`),

  getNextQuiz: (studentId: string): Promise<QuizNextResponse> => 
    fetchApi(`/quiz/next/${studentId}`),

  submitQuizAnswer: (data: QuizAnswerRequest): Promise<QuizAnswerResponse> => 
    fetchApi('/quiz/answer', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMastery: (studentId: string): Promise<MasteryResponse> => 
    fetchApi(`/mastery/${studentId}`),

  getHint: (data: HintRequest): Promise<HintResponse> => 
    fetchApi('/ai/hint', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getPracticeQuestion: (data: PracticeQuestionRequest): Promise<PracticeQuestionResponse> => 
    fetchApi('/ai/practice-question', {
      method: 'POST',
      body: JSON.stringify(data),
    })
};
