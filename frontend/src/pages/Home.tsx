import { useState } from "react";
import { generateQuiz } from "../services/api";
import type { Quiz } from "../types/quiz";
import styles from "./Home.module.css";

interface HomeProps {
  onQuizGenerated: (quiz: Quiz) => void;
  onViewProfile: () => void;
}

const COURSES = [
  { id: "cs540", name: "CS 540 – Intro to AI" },
  { id: "soc125", name: "Sociology 125" },
  { id: "", name: "Custom / Not in list" },
];

export function Home({ onQuizGenerated, onViewProfile }: HomeProps) {
  const [lectureText, setLectureText] = useState("");
  const [numQuestions, setNumQuestions] = useState(10);
  const [courseId, setCourseId] = useState<string>("cs540");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadMode, setUploadMode] = useState<"text" | "file">("text");

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        setError("Please upload a PDF file only");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        // 10MB limit
        setError("File size should be less than 10MB");
        return;
      }
      setSelectedFile(file);
      setLectureText(""); // Clear text area when file is selected
      setError("");
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    const fileInput = document.getElementById("fileInput") as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleModeChange = (mode: "text" | "file") => {
    setUploadMode(mode);
    setError("");
    if (mode === "text") {
      setSelectedFile(null);
    } else {
      setLectureText("");
    }
  };

  const handleGenerate = async () => {
    if (!lectureText.trim() && !selectedFile) {
      setError("Please enter some lecture text or upload a PDF file");
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
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          <h1 className={styles.title}>AI Quiz Generator</h1>
          <button
            onClick={onViewProfile}
            className={styles.profileButton}
            style={{
              padding: "10px 20px",
              fontSize: "14px",
              backgroundColor: "#0066CC",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            My Profile
          </button>
        </div>
        <p className={styles.subtitle}>
          Paste your lecture notes or transcript below
        </p>
      </div>

      {/* Mode Toggle */}
      <div className={styles.modeToggleContainer}>
        <div className={styles.modeToggle}>
          <button
            className={uploadMode === "text" ? styles.activeMode : ""}
            onClick={() => handleModeChange("text")}
            disabled={isLoading}
          >
            Paste Text
          </button>
          <button
            className={uploadMode === "file" ? styles.activeMode : ""}
            onClick={() => handleModeChange("file")}
            disabled={isLoading}
          >
            Upload PDF
          </button>
        </div>
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

      {/* Text Input or File Upload */}
      <div className={styles.formGroup}>
        <label className={styles.label}>
          {uploadMode === "text" ? "Lecture Text" : "Upload PDF File"}
        </label>
        {uploadMode === "text" ? (
          <textarea
            value={lectureText}
            onChange={(e) => setLectureText(e.target.value)}
            placeholder="Paste your lecture text here..."
            rows={12}
            className={styles.textarea}
            disabled={isLoading}
          />
        ) : (
          <div className={styles.fileUploadContainer}>
            <div className={styles.fileUploadArea}>
              <input
                type="file"
                id="fileInput"
                accept=".pdf,application/pdf"
                onChange={handleFileSelect}
                className={styles.fileInput}
                disabled={isLoading}
              />
              <label htmlFor="fileInput" className={styles.fileLabel}>
                <svg
                  className={styles.uploadIcon}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <span className={styles.uploadText}>
                  {selectedFile
                    ? "Change PDF file"
                    : "Click to upload PDF file"}
                </span>
                <span className={styles.uploadHint}>
                  PDF files only (Max 10MB)
                </span>
              </label>
            </div>

            {selectedFile && (
              <div className={styles.fileInfo}>
                <div className={styles.fileDetails}>
                  <svg
                    className={styles.fileIcon}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                  <div>
                    <p className={styles.fileName}>{selectedFile.name}</p>
                    <p className={styles.fileSize}>
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClearFile}
                  className={styles.clearButton}
                  title="Remove file"
                  disabled={isLoading}
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        )}
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
          <p>🤖 AI is analyzing your text and generating questions...</p>
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
