import { useState } from "react";
import { Home } from "./pages/Home";
import { QuizPage } from "./pages/QuizPage";
import type { Quiz, UserAnswer } from "./types/quiz";

function App() {
  const [currentPage, setCurrentPage] = useState<"home" | "quiz" | "results">(
    "home"
  );
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [quizResults, setQuizResults] = useState<UserAnswer[]>([]);

  const handleQuizGenerated = (quiz: Quiz) => {
    setCurrentQuiz(quiz);
    setCurrentPage("quiz");
  };

  const handleQuizComplete = (answers: UserAnswer[]) => {
    setQuizResults(answers);
    setCurrentPage("results");
  };

  const handleBackToHome = () => {
    setCurrentPage("home");
    setCurrentQuiz(null);
    setQuizResults([]);
  };

  return (
    <div className="App">
      {currentPage === "home" && <Home onQuizGenerated={handleQuizGenerated} />}

      {currentPage === "quiz" && currentQuiz && (
        <QuizPage quiz={currentQuiz} onComplete={handleQuizComplete} />
      )}

      {currentPage === "results" && (
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
          <h2>Results Page - Coming Soon</h2>
          <p>You answered {quizResults.length} questions</p>
          <p>
            Score: {quizResults.filter((a) => a.isCorrect).length} /{" "}
            {quizResults.length}
          </p>
          <button
            onClick={handleBackToHome}
            style={{
              padding: "10px 20px",
              fontSize: "16px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Back to Home
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
