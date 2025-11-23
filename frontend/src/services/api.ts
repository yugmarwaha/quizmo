import axios from "axios";
import type {
  Quiz,
  GenerateQuizRequest,
  GenerateRecommendationsRequest,
  GenerateRecommendationsResponse,
} from "../types/quiz";
import { mockQuiz } from "./mockData";

const API_BASE = "http://localhost:8000";

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

// Flag to switch between mock and real API
const USE_MOCK = false;

export const generateQuiz = async (
  lectureText: string,
  courseId?: string,
  numQuestions?: number
): Promise<Quiz> => {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return mockQuiz;
  }

  const request: GenerateQuizRequest = { lectureText, courseId, numQuestions };

  try {
    const response = await apiClient.post<Quiz>("/api/generate_quiz", request);
    return response.data;
  } catch (err) {
    console.error("Failed to generate quiz", err);
    throw err;
  }
};

export const generateRecommendations = async (
  performanceData: GenerateRecommendationsRequest["performanceData"]
): Promise<GenerateRecommendationsResponse> => {
  const request: GenerateRecommendationsRequest = { performanceData };

  try {
    const response = await apiClient.post<GenerateRecommendationsResponse>(
      "/api/generate_recommendations",
      request
    );
    return response.data;
  } catch (err) {
    console.error("Failed to generate recommendations", err);
    throw err;
  }
};

export async function saveQuiz(quiz: Quiz): Promise<Quiz> {
  const res = await fetch(`${API_BASE}/api/quizzes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(quiz),
  });

  if (!res.ok) {
    throw new Error(`Failed to save quiz: ${res.status}`);
  }

  return res.json();
}

export async function listQuizzes(): Promise<Quiz[]> {
  const res = await fetch(`${API_BASE}/api/quizzes`);
  if (!res.ok) {
    throw new Error(`Failed to list quizzes: ${res.status}`);
  }
  return res.json();
}

export async function getQuiz(quizId: string): Promise<Quiz> {
  const res = await fetch(`${API_BASE}/api/quizzes/${quizId}`);
  if (!res.ok) {
    throw new Error(`Failed to get quiz: ${res.status}`);
  }
  return res.json();
}