export interface Question {
  id: string;
  question: string;
  options: string[];
  answer: string;
  difficulty: "easy" | "medium" | "hard";
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
