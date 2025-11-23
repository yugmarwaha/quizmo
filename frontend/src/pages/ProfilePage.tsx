import { useState, useEffect } from "react";
import type { SavedQuiz } from "../types/quiz";

interface ProfilePageProps {
  onBackToHome: () => void;
}

export function ProfilePage({ onBackToHome }: ProfilePageProps) {
  const [savedQuizzes, setSavedQuizzes] = useState<SavedQuiz[]>([]);

  useEffect(() => {
    // Load saved quizzes from localStorage
    const saved = localStorage.getItem("savedQuizzes");
    if (saved) {
      setSavedQuizzes(JSON.parse(saved));
    }
  }, []);

  const handleDelete = (quizId: string) => {
    const updatedQuizzes = savedQuizzes.filter((q) => q.id !== quizId);
    setSavedQuizzes(updatedQuizzes);
    localStorage.setItem("savedQuizzes", JSON.stringify(updatedQuizzes));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "20px" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
        }}
      >
        <h1 style={{ color: "#213547", margin: 0 }}>My Profile</h1>
        <button
          onClick={onBackToHome}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            backgroundColor: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Back to Home
        </button>
      </div>

      {/* Saved Quizzes */}
      <div>
        <h2 style={{ color: "#213547", marginBottom: "20px" }}>
          Saved Quizzes ({savedQuizzes.length})
        </h2>

        {savedQuizzes.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              backgroundColor: "#f8f9fa",
              borderRadius: "8px",
            }}
          >
            <p
              style={{ fontSize: "18px", color: "#666", marginBottom: "10px" }}
            >
              No saved quizzes yet
            </p>
            <p style={{ color: "#999" }}>
              Complete a quiz and save it to see it here
            </p>
          </div>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "20px" }}
          >
            {savedQuizzes.map((savedQuiz) => (
              <div
                key={savedQuiz.id}
                style={{
                  backgroundColor: "#f8f9fa",
                  padding: "20px",
                  borderRadius: "8px",
                  border: "1px solid #dee2e6",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "start",
                    marginBottom: "15px",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <h3 style={{ color: "#213547", margin: "0 0 10px 0" }}>
                      {savedQuiz.quiz.title}
                    </h3>
                    <p style={{ color: "#666", fontSize: "14px", margin: 0 }}>
                      Taken on {formatDate(savedQuiz.dateTaken)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(savedQuiz.id)}
                    style={{
                      padding: "8px 16px",
                      fontSize: "14px",
                      backgroundColor: "#dc3545",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Delete
                  </button>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                    gap: "15px",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#666",
                        textTransform: "uppercase",
                        marginBottom: "5px",
                      }}
                    >
                      Score
                    </div>
                    <div
                      style={{
                        fontSize: "24px",
                        fontWeight: "bold",
                        color:
                          savedQuiz.scorePercentage >= 70
                            ? "#28a745"
                            : savedQuiz.scorePercentage >= 50
                            ? "#ffc107"
                            : "#dc3545",
                      }}
                    >
                      {savedQuiz.scorePercentage}%
                    </div>
                  </div>

                  <div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#666",
                        textTransform: "uppercase",
                        marginBottom: "5px",
                      }}
                    >
                      Questions
                    </div>
                    <div
                      style={{
                        fontSize: "24px",
                        fontWeight: "bold",
                        color: "#213547",
                      }}
                    >
                      {savedQuiz.quiz.questions.length}
                    </div>
                  </div>

                  <div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#666",
                        textTransform: "uppercase",
                        marginBottom: "5px",
                      }}
                    >
                      Correct Answers
                    </div>
                    <div
                      style={{
                        fontSize: "24px",
                        fontWeight: "bold",
                        color: "#213547",
                      }}
                    >
                      {savedQuiz.userAnswers.filter((a) => a.isCorrect).length}
                    </div>
                  </div>

                  <div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#666",
                        textTransform: "uppercase",
                        marginBottom: "5px",
                      }}
                    >
                      Time Taken
                    </div>
                    <div
                      style={{
                        fontSize: "24px",
                        fontWeight: "bold",
                        color: "#213547",
                      }}
                    >
                      {formatTime(savedQuiz.totalTime)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
