export interface Question {
  id: string;
  type: string;
  question: string;
  options: string[];
  answer: string;
  difficulty: string;
}

export interface Quiz {
  quizId: string;
  questions: Question[];
}
