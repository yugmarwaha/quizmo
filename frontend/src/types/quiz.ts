export type QuestionType = "mcq" | "tf" | "mcq_multi" | "fill";
export interface Question {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[] | null;
  answer: string | string[];
  explanation?: string | null;
  difficulty: "easy" | "medium" | "hard";
  source_chunk_index?: number | null;
}

export interface Quiz {
  id: string;
  title: string;
  questions: Question[];
}

export interface GenerateQuizRequest {
  lectureText: string;
  courseId?: string;
  numQuestions?: number;
}

export interface UserAnswer {
  questionId: string;
  selectedAnswer: string;
  isCorrect: boolean;
  timeSpent?: number; // in seconds
}

export interface PerformanceData {
  quiz: Quiz;
  userAnswers: UserAnswer[];
  totalTime: number;
  scorePercentage: number;
}

export type RecommendationType =
  | "study_focus"
  | "time_management"
  | "learning_strategy"
  | "motivation"
  | "next_steps";

export interface Recommendation {
  type: RecommendationType;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
}

export interface GenerateRecommendationsRequest {
  performanceData: PerformanceData;
}

export interface GenerateRecommendationsResponse {
  recommendations: Recommendation[];
  overallAssessment: string;
  improvementAreas: string[];
}

export interface SavedQuiz {
  id: string;
  quiz: Quiz;
  userAnswers: UserAnswer[];
  scorePercentage: number;
  totalTime: number;
  dateTaken: string;
}
