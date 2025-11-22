export type QuestionType = "mcq" | "tf" | "fill";
export interface Question {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[] | null;
  answer: string;
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
}

export interface UserAnswer {
  questionId: string;
  selectedAnswer: string;
  isCorrect: boolean;
}
