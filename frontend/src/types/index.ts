// API Types mapped directly from API_CONTRACT.md

export interface Question {
  id: string;
  concept_id: string;
  difficulty_tier: number;
  body: string;
  options: string[];
}

export interface DiagnosticQuestion {
  id: string;
  concept_id: string;
  body: string;
  options: string[];
}

export interface MasteryRecord {
  concept_id: string;
  name?: string;
  p_mastery: number;
  recommended?: boolean;
}

export interface DiagnosticStartResponse {
  questions: DiagnosticQuestion[];
}

export interface DiagnosticSubmitRequest {
  answers: { question_id: string; selected: string }[];
}

export interface DiagnosticSubmitResponse {
  mastery: MasteryRecord[];
}

export interface PathResponse {
  path: MasteryRecord[];
}

export interface QuizNextResponse {
  question: Question;
}

export interface QuizAnswerRequest {
  student_id: string;
  question_id: string;
  selected: string;
}

export interface QuizAnswerResponse {
  correct: boolean;
  p_mastery: number;
  tier_changed: boolean;
  new_tier: number;
  gap_concept_id: string | null;
}

export interface MasteryResponse {
  mastery: MasteryRecord[];
}

export interface HintRequest {
  student_id: string;
  question_id: string;
  attempt_number: number;
}

export interface HintResponse {
  hint: string;
  full_explanation_unlocked: boolean;
  source?: string;
}

export interface PracticeQuestionRequest {
  concept_id: string;
  difficulty_tier: number;
}

export interface PracticeQuestionResponse {
  question: {
    body: string;
    options: string[];
    correct_answer: string;
  };
}

export interface ApiError {
  error: string;
  message: string;
}
