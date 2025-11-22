import { useState } from "react";
import { generateQuiz } from "../services/api";
import type { Quiz } from "../types/quiz";

interface HomeProps {
  onQuizGenerated: (quiz: Quiz) => void;
}

export function Home({ onQuizGenerated }: HomeProps) {
  const [lectureText, setLectureText] = useState("");
  const [numQuestions, setNumQuestions] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!lectureText.trim()) {
      setError("Please enter some lecture text");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const quiz = await generateQuiz(lectureText);
      onQuizGenerated(quiz);
    } catch (err) {
      setError("Failed to generate quiz. Make sure your backend is running.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
      <h1>AI Quiz Generator</h1>
      <p>Paste your lecture notes or transcript below</p>

      <textarea
        value={lectureText}
        onChange={(e) => setLectureText(e.target.value)}
        placeholder="Paste your lecture text here..."
        rows={10}
        style={{
          width: "100%",
          padding: "10px",
          fontSize: "14px",
          marginBottom: "20px",
        }}
      />

      <div style={{ marginBottom: "20px" }}>
        <label>Number of questions: </label>
        <select
          value={numQuestions}
          onChange={(e) => setNumQuestions(Number(e.target.value))}
          style={{ padding: "5px", marginLeft: "10px" }}
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={15}>15</option>
          <option value={20}>20</option>
        </select>
      </div>

      {error && (
        <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>
      )}

      <button
        onClick={handleGenerate}
        disabled={isLoading}
        style={{
          padding: "12px 24px",
          fontSize: "16px",
          backgroundColor: isLoading ? "#ccc" : "#007bff",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: isLoading ? "not-allowed" : "pointer",
        }}
      >
        {isLoading ? "Generating Quiz..." : "Generate Quiz"}
      </button>
    </div>
  );
}
