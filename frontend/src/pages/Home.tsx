import { useState } from "react";
import { generateQuiz } from "../services/api";
import type { Quiz } from "../types/quiz";
import styles from "./Home.module.css";

interface HomeProps {
  onQuizGenerated: (quiz: Quiz) => void;
}

const COURSES = [
  { id: "cs540", name: "CS 540 – Intro to AI" },
  { id: "econ101", name: "Econ 101 – Microeconomics" },
  { id: "", name: "Custom / Not in list" },
];

export function Home({ onQuizGenerated }: HomeProps) {
  const [lectureText, setLectureText] = useState("");
  const [numQuestions, setNumQuestions] = useState(10);
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
      const quiz = await generateQuiz(
        lectureText,
        courseId || undefined,
        numQuestions
      );
      onQuizGenerated(quiz);
    } catch (err) {
      setError("Failed to generate quiz. Make sure your backend is running.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>AI Quiz Generator</h1>
        <p className={styles.subtitle}>
          Paste your lecture notes or transcript below
        </p>
      </div>

      {/* Course selector */}
      <div className={styles.formGroup}>
        <label className={styles.label}>Course</label>
        <select
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
          className={styles.select}
          disabled={isLoading}
        >
          {COURSES.map((c) => (
            <option key={c.id || "custom"} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {/* <div className={styles.hint}>
          • Picks RAG context from that course.
          <br />• Choose "Custom" if it's not in the list (uses only your pasted
          text).
        </div> */}
      </div>

      {/* Textarea */}
      <div className={styles.formGroup}>
        <label className={styles.label}>Lecture Text</label>
        <textarea
          value={lectureText}
          onChange={(e) => setLectureText(e.target.value)}
          placeholder="Paste your lecture text here..."
          rows={12}
          className={styles.textarea}
          disabled={isLoading}
        />
      </div>

      {/* Number of questions */}
      <div className={styles.formGroup}>
        <label className={styles.label}>Number of questions</label>
        <select
          value={numQuestions}
          onChange={(e) => setNumQuestions(Number(e.target.value))}
          className={styles.select}
          disabled={isLoading}
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={15}>15</option>
          <option value={20}>20</option>
        </select>
        {/* <div className={styles.hint}>
          (Right now the backend always returns ~8–10 questions; we can wire
          this number into the prompt later if you want.)
        </div> */}
      </div>

      {/* Error */}
      {error && (
        <div className={styles.error}>
          <p className={styles.errorText}>{error}</p>
        </div>
      )}

      {/* Loading Message */}
      {isLoading && (
        <div className={styles.loadingMessage}>
          <p>
            🤖 AI is analyzing your text and generating questions...
          </p>
          <p>This may take 10-20 seconds depending on text length.</p>
        </div>
      )}

      {/* Button */}
      <button
        onClick={handleGenerate}
        disabled={isLoading}
        className={styles.button}
      >
        {isLoading && <span className={styles.loadingSpinner}></span>}
        {isLoading ? "Generating Quiz..." : "Generate Quiz"}
      </button>
    </div>
  );
}
