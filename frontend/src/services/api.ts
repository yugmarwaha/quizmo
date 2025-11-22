import axios from "axios";
import type { Quiz, GenerateQuizRequest } from "../types/quiz";
import { mockQuiz } from "./mockData";

const API_BASE = "http://localhost:8000";

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

// Flag to switch between mock and real API
const USE_MOCK = true;

export const generateQuiz = async (
  lectureText: string,
  courseId?: string
): Promise<Quiz> => {
  if (USE_MOCK) {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return mockQuiz;
  }

  const request: GenerateQuizRequest = {
    lectureText,
    courseId,
  };

  const response = await apiClient.post<Quiz>("/api/generate_quiz", request);
  return response.data;
};
