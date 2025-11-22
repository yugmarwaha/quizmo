import type { Quiz } from "../types/quiz";

export const mockQuiz: Quiz = {
  id: "mock-quiz-1",
  title: "Sample Quiz on Machine Learning",
  questions: [
    {
      id: "q1",
      question: "What is supervised learning?",
      options: [
        "Learning with labeled data",
        "Learning without any data",
        "Learning with unlabeled data only",
        "Learning from reinforcement",
      ],
      answer: "Learning with labeled data",
      difficulty: "easy",
    },
    {
      id: "q2",
      question: "Which algorithm is used for classification?",
      options: ["Linear Regression", "Logistic Regression", "K-means", "PCA"],
      answer: "Logistic Regression",
      difficulty: "medium",
    },
    {
      id: "q3",
      question: "What does CNN stand for?",
      options: [
        "Computer Neural Network",
        "Convolutional Neural Network",
        "Connected Neural Network",
        "Centralized Neural Network",
      ],
      answer: "Convolutional Neural Network",
      difficulty: "easy",
    },
    {
      id: "q4",
      question: "What is backpropagation used for?",
      options: [
        "Forward pass computation",
        "Training neural networks",
        "Data preprocessing",
        "Model evaluation",
      ],
      answer: "Training neural networks",
      difficulty: "medium",
    },
    {
      id: "q5",
      question:
        "Which activation function is most commonly used in hidden layers?",
      options: ["Sigmoid", "ReLU", "Softmax", "Linear"],
      answer: "ReLU",
      difficulty: "hard",
    },
  ],
};
