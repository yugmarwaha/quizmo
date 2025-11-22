import { useState } from "react";
import { generateQuiz } from "../services/api";
import type { Quiz } from "../types/quiz";

interface HomeProps {
  onQuizGenerated: (quiz: Quiz) => void;
}

// You can tweak these IDs to match your knowledge_base folders
const COURSES = [
  { id: "cs540", name: "CS 540 – Intro to AI" },
  { id: "econ101", name: "Econ 101 – Microeconomics" },
  { id: "", name: "Custom / Not in list" }, // sends no courseId → no RAG, just lectureText
];

export function Home({ onQuizGenerated }: HomeProps) {
  const [lectureText, setLectureText] = useState("");
  const [numQuestions, setNumQuestions] = useState(10); // currently just UI hint
  const [courseId, setCourseId] = useState<string>("cs540");
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
      // If courseId is "", send undefined so backend treats it as “no course”
      const quiz = await generateQuiz(lectureText, courseId || undefined);
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

      {/* Course selector */}
      <div style={{ marginBottom: "16px" }}>
        <label style={{ display: "block", marginBottom: "4px" }}>
          Course
        </label>
        <select
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
          style={{ padding: "8px", minWidth: "250px" }}
        >
          {COURSES.map((c) => (
            <option key={c.id || "custom"} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <div style={{ fontSize: "12px", color: "#555", marginTop: "4px" }}>
          • Picks RAG context from that course.  
          • Choose "Custom" if it’s not in the list (uses only your pasted text).
        </div>
      </div>

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
        <div style={{ fontSize: "12px", color: "#555", marginTop: "4px" }}>
          (Right now the backend always returns ~8–10 questions; we can wire
          this number into the prompt later if you want.)
        </div>
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
