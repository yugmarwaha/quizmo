import { useState } from "react";
import { Home } from "./pages/Home";
import { QuizPage } from "./pages/QuizPage";
import { ResultsPage } from "./pages/ResultsPage";
import { ProfilePage } from "./pages/ProfilePage";
import type { Quiz, UserAnswer } from "./types/quiz";

function App() {
  const [currentPage, setCurrentPage] = useState<
    "home" | "quiz" | "results" | "profile"
  >("home");
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

  const handleViewProfile = () => {
    setCurrentPage("profile");
  };

  return (
    <div className="App">
      {currentPage === "home" && (
        <Home
          onQuizGenerated={handleQuizGenerated}
          onViewProfile={handleViewProfile}
        />
      )}

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

      {currentPage === "profile" && (
        <ProfilePage onBackToHome={handleBackToHome} />
      )}
    </div>
  );
}

export default App;
