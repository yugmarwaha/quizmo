import axios from "axios";

const API_BASE = "http://localhost:8000";

export const generateQuiz = (lectureText: string) => {
  // Mock data for now - backend will replace this
  return Promise.resolve({
    data: {
      quizId: "demo-quiz",
      questions: [
        {
          id: "q1",
          type: "mcq",
          question: "What is machine learning?",
          options: [
            "Study of algorithms",
            "Type of AI",
            "Data science",
            "All of above",
          ],
          answer: "All of above",
          difficulty: "easy",
        },
        {
          id: "q2",
          type: "mcq",
          question: "What is backpropagation?",
          options: [
            "Forward pass",
            "Gradient computation",
            "Loss function",
            "Optimizer",
          ],
          answer: "Gradient computation",
          difficulty: "medium",
        },
      ],
    },
  });
};
