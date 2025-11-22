import { useState } from "react";
import { Home } from "./pages/Home";
import { QuizPage } from "./pages/QuizPage";
import { ResultsPage } from "./pages/ResultsPage";
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

      {currentPage === "results" && currentQuiz && (
        <ResultsPage
          quiz={currentQuiz}
          userAnswers={quizResults}
          onBackToHome={handleBackToHome}
        />
      )}
    </div>
  );
}

export default App;
