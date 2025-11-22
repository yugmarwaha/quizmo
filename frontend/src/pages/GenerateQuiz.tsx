import { useState } from "react";
import type { Question } from "../types/quiz";

interface HostViewProps {
  quizId: string;
  questions: Question[];
}

export function HostView({ quizId, questions }: HostViewProps) {
  const [sessionId] = useState(
    "session-" + Math.random().toString(36).substr(2, 9)
  );
  const [sessionStarted, setSessionStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const handleStartSession = () => {
    setSessionStarted(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  if (!sessionStarted) {
    return (
      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
        <h2>Host View</h2>
        <p>Quiz ID: {quizId}</p>
        <button
          onClick={handleStartSession}
          style={{ padding: "10px 20px", fontSize: "16px" }}
        >
          Start Session
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
      <h2>Session: {sessionId}</h2>
      <p>
        Question {currentQuestionIndex + 1} of {questions.length}
      </p>
      <h3>{currentQuestion.question}</h3>
      <div>
        {currentQuestion.options.map((option, idx) => (
          <div
            key={idx}
            style={{
              padding: "10px",
              border: "1px solid #ccc",
              marginBottom: "10px",
            }}
          >
            {option}
          </div>
        ))}
      </div>
      <button
        onClick={handleNextQuestion}
        disabled={currentQuestionIndex === questions.length - 1}
      >
        Next Question
      </button>
    </div>
  );
}

export default HostView; 