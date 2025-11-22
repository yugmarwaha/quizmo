import { useState } from "react";
import type { Quiz, UserAnswer } from "../types/quiz";

interface QuizPageProps {
  quiz: Quiz;
  onComplete: (answers: UserAnswer[]) => void;
}

export function QuizPage({ quiz, onComplete }: QuizPageProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);

  // Track selected options for all questions (including unsubmitted ones)
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >({});

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const totalQuestions = quiz.questions.length;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

  // Get the selected option for current question
  const selectedOption = selectedOptions[currentQuestion.id] || "";

  // Check if current question was already submitted
  const isSubmitted = userAnswers.some(
    (a) => a.questionId === currentQuestion.id
  );

  const handleOptionSelect = (option: string) => {
    if (!isSubmitted) {
      setSelectedOptions({
        ...selectedOptions,
        [currentQuestion.id]: option,
      });
    }
  };

  const handleSubmitAnswer = () => {
    if (!selectedOption) return;

    const isCorrect = selectedOption === currentQuestion.answer;
    const newAnswer: UserAnswer = {
      questionId: currentQuestion.id,
      selectedAnswer: selectedOption,
      isCorrect,
    };

    setUserAnswers([...userAnswers, newAnswer]);
  };

  const handleNext = () => {
    if (isLastQuestion) {
      onComplete(userAnswers);
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
      <div style={{ marginBottom: "20px" }}>
        <h2 style={{ color: "#213547" }}>{quiz.title}</h2>
        <p style={{ color: "#213547" }}>
          Question {currentQuestionIndex + 1} of {totalQuestions}
        </p>
        <div
          style={{
            width: "100%",
            height: "8px",
            backgroundColor: "#e0e0e0",
            borderRadius: "4px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%`,
              height: "100%",
              backgroundColor: "#007bff",
              transition: "width 0.3s ease",
            }}
          />
        </div>
      </div>

      <div
        style={{
          backgroundColor: "#f8f9fa",
          padding: "30px",
          borderRadius: "8px",
          marginBottom: "20px",
        }}
      >
        <h3 style={{ marginBottom: "20px", color: "#213547" }}>
          {currentQuestion.question}
        </h3>
        <span
          style={{
            fontSize: "12px",
            color: "#666",
            textTransform: "uppercase",
          }}
        >
          Difficulty: {currentQuestion.difficulty}
        </span>
      </div>

      <div style={{ marginBottom: "30px" }}>
        {currentQuestion.options.map((option, index) => (
          <div
            key={index}
            onClick={() => handleOptionSelect(option)}
            style={{
              padding: "15px",
              marginBottom: "10px",
              border: "2px solid",
              borderColor: selectedOption === option ? "#007bff" : "#dee2e6",
              borderRadius: "8px",
              cursor: isSubmitted ? "not-allowed" : "pointer",
              backgroundColor: selectedOption === option ? "#e7f3ff" : "white",
              opacity: isSubmitted ? 0.6 : 1,
              color: "#213547",
            }}
          >
            <strong>{String.fromCharCode(65 + index)}.</strong> {option}
          </div>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          gap: "10px",
          justifyContent: "space-between",
        }}
      >
        <button
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            backgroundColor: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: currentQuestionIndex === 0 ? "not-allowed" : "pointer",
            opacity: currentQuestionIndex === 0 ? 0.5 : 1,
          }}
        >
          Previous
        </button>

        <div style={{ display: "flex", gap: "10px" }}>
          {!isSubmitted ? (
            <button
              onClick={handleSubmitAnswer}
              disabled={!selectedOption}
              style={{
                padding: "10px 20px",
                fontSize: "16px",
                backgroundColor: selectedOption ? "#28a745" : "#ccc",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: selectedOption ? "pointer" : "not-allowed",
              }}
            >
              Submit Answer
            </button>
          ) : (
            <button
              onClick={handleNext}
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
              {isLastQuestion ? "Finish Quiz" : "Next Question"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
