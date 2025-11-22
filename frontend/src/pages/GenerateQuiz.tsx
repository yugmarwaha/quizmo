import { useState } from "react";
import { generateQuiz } from "../services/api";
import type { Quiz, Question } from "../types/quiz";

export function GenerateQuiz() {
  const [lectureText, setLectureText] = useState("");
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!lectureText.trim()) return;
    setLoading(true);
    try {
      const response = await generateQuiz(lectureText);
      setQuiz(response.data);
    } catch (error) {
      console.error("Error generating quiz:", error);
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
      <h1>📝 Generate Quiz</h1>
      <textarea
        value={lectureText}
        onChange={(e) => setLectureText(e.target.value)}
        placeholder="Paste lecture text here..."
        rows={10}
        style={{ width: "100%", padding: "10px", fontSize: "14px" }}
      />
      <button
        onClick={handleGenerate}
        disabled={loading}
        style={{
          marginTop: "10px",
          padding: "10px 20px",
          fontSize: "16px",
          cursor: "pointer",
        }}
      >
        {loading ? "Generating..." : "Generate Quiz"}
      </button>

      {quiz && (
        <div style={{ marginTop: "20px" }}>
          <h2>Quiz: {quiz.quizId}</h2>
          {quiz.questions.map((q: Question) => (
            <div
              key={q.id}
              style={{
                border: "1px solid #ccc",
                padding: "10px",
                marginBottom: "10px",
              }}
            >
              <p>
                <strong>{q.question}</strong>
              </p>
              <p>Options: {q.options.join(", ")}</p>
              <p>Answer: {q.answer}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
