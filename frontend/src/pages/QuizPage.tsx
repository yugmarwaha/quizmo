import { useState, useEffect } from "react";
import type { Quiz, UserAnswer } from "../types/quiz";

interface QuizPageProps {
  quiz: Quiz;
  onComplete: (answers: UserAnswer[]) => void;
}

export function QuizPage({ quiz, onComplete }: QuizPageProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Track selected options for all questions
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string[]>
  >({});

  // Track time spent on each question
  const [questionStartTimes, setQuestionStartTimes] = useState<
    Record<string, number>
  >({});

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const totalQuestions = quiz.questions.length;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

  // Get the selected options for current question
  const selectedOptionArray = selectedOptions[currentQuestion.id] || [];

  // Initialize start time for current question if not set
  useEffect(() => {
    if (!questionStartTimes[currentQuestion.id]) {
      setQuestionStartTimes({
        ...questionStartTimes,
        [currentQuestion.id]: Date.now(),
      });
    }
  }, [currentQuestionIndex, currentQuestion.id, questionStartTimes]);

  const handleOptionSelect = (option: string) => {
    const currentSelected = selectedOptions[currentQuestion.id] || [];
    if (currentQuestion.type === "mcq_multi") {
      // Toggle for multi-select
      const newSelected = currentSelected.includes(option)
        ? currentSelected.filter((o) => o !== option)
        : [...currentSelected, option];
      setSelectedOptions({
        ...selectedOptions,
        [currentQuestion.id]: newSelected,
      });
    } else {
      // Single select
      setSelectedOptions({
        ...selectedOptions,
        [currentQuestion.id]: [option],
      });
    }
  };

  const handleNext = () => {
    if (isLastQuestion) {
      // Calculate answers for all questions when submitting quiz
      const userAnswers: UserAnswer[] = quiz.questions.map((question) => {
        const selectedAnswer = (selectedOptions[question.id] || []).join(",");
        const startTime = questionStartTimes[question.id] || Date.now();
        const timeSpent = Math.floor((Date.now() - startTime) / 1000);

        let isCorrect = false;
        const selectedOptionArray = selectedOptions[question.id] || [];

        if (selectedOptionArray.length > 0) {
          if (question.type === "mcq_multi") {
            const correctAnswers = Array.isArray(question.answer)
              ? question.answer
              : [question.answer];
            isCorrect =
              selectedOptionArray.length === correctAnswers.length &&
              selectedOptionArray.every((opt) => correctAnswers.includes(opt));
          } else {
            isCorrect = selectedOptionArray[0] === question.answer;
          }
        }

        return {
          questionId: question.id,
          selectedAnswer,
          isCorrect,
          timeSpent,
        };
      });

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
              backgroundColor: "#0066CC",
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
        {currentQuestion.type === "mcq" && currentQuestion.options ? (
          currentQuestion.options.map((option, index) => (
            <div
              key={index}
              onClick={() => handleOptionSelect(option)}
              style={{
                padding: "15px",
                marginBottom: "10px",
                border: "2px solid",
                borderColor: selectedOptionArray.includes(option)
                  ? "#0066CC"
                  : "#dee2e6",
                borderRadius: "8px",
                cursor: "pointer",
                backgroundColor: selectedOptionArray.includes(option)
                  ? "#e7f3ff"
                  : "white",
                color: "#213547",
              }}
            >
              <strong>{String.fromCharCode(65 + index)}.</strong> {option}
            </div>
          ))
        ) : currentQuestion.type === "mcq_multi" && currentQuestion.options ? (
          currentQuestion.options.map((option, index) => (
            <div
              key={index}
              onClick={() => handleOptionSelect(option)}
              style={{
                padding: "15px",
                marginBottom: "10px",
                border: "2px solid",
                borderColor: selectedOptionArray.includes(option)
                  ? "#0066CC"
                  : "#dee2e6",
                borderRadius: "8px",
                cursor: "pointer",
                backgroundColor: selectedOptionArray.includes(option)
                  ? "#e7f3ff"
                  : "white",
                color: "#213547",
              }}
            >
              <strong>{String.fromCharCode(65 + index)}.</strong> {option}
              {selectedOptionArray.includes(option) && (
                <span style={{ marginLeft: "10px", color: "#0066CC" }}>✓</span>
              )}
            </div>
          ))
        ) : currentQuestion.type === "tf" ? (
          ["True", "False"].map((option) => (
            <div
              key={option}
              onClick={() => handleOptionSelect(option)}
              style={{
                padding: "15px",
                marginBottom: "10px",
                border: "2px solid",
                borderColor: selectedOptionArray.includes(option)
                  ? "#0066CC"
                  : "#dee2e6",
                borderRadius: "8px",
                cursor: "pointer",
                backgroundColor: selectedOptionArray.includes(option)
                  ? "#e7f3ff"
                  : "white",
                color: "#213547",
                textAlign: "center",
                fontWeight: "bold",
              }}
            >
              {option}
            </div>
          ))
        ) : (
          <p>Unsupported question type</p>
        )}
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

        <button
          onClick={handleNext}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            backgroundColor: "#0066CC",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          {isLastQuestion ? "Submit Quiz" : "Next"}
        </button>
      </div>
    </div>
  );
}
