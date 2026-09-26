import type {
  PathResponse,
  MasteryResponse,
  DiagnosticQuestion,
  MasteryRecord,
  Question,
  HintResponse,
  PracticeQuestionResponse
} from "../types";

export const mockDiagnosticQuestions: DiagnosticQuestion[] = [
  {
    id: "dq1",
    concept_id: "c1",
    body: "What is the primary function of a variable?",
    options: ["To store data", "To loop over items", "To perform math", "To show text"]
  },
  {
    id: "dq2",
    concept_id: "c2",
    body: "Which keyword is used for conditional execution?",
    options: ["if", "for", "while", "return"]
  }
];

export const mockMastery: MasteryRecord[] = [
  { concept_id: "c1", name: "Variables", p_mastery: 0.8, recommended: false },
  { concept_id: "c2", name: "Control Flow", p_mastery: 0.6, recommended: true },
  { concept_id: "c3", name: "Loops", p_mastery: 0.3, recommended: false },
  { concept_id: "c4", name: "Functions", p_mastery: 0.1, recommended: false },
];

export const mockPath: PathResponse = {
  path: mockMastery
};

export const mockMasteryResponse: MasteryResponse = {
  mastery: mockMastery
};

export const mockQuizQuestion: Question = {
  id: "q10",
  concept_id: "c2",
  difficulty_tier: 2,
  body: "What happens if an `else` block is used without an `if` block?",
  options: [
    "Syntax Error",
    "Runs perfectly",
    "Ignored by compiler",
    "Throws a warning"
  ]
};

export const mockHint1: HintResponse = {
  hint: "Think about the structure of conditional statements. Can an alternative exist without a primary condition?",
  full_explanation_unlocked: false
};

export const mockHint2: HintResponse = {
  hint: "An `else` block must always follow an `if` or `else if` block. Using it on its own results in a Syntax Error because the language doesn't know what condition it's an alternative to.",
  full_explanation_unlocked: true,
  source: "generated"
};

export const mockPractice: PracticeQuestionResponse = {
  question: {
    body: "Write an if-else statement that checks if x is greater than 10.",
    options: [
      "if x > 10: ... else: ...",
      "if x < 10: ... else: ...",
      "if x == 10: ... else: ...",
      "if (x > 10) then ... else ..."
    ],
    correct_answer: "if x > 10: ... else: ..."
  }
};
