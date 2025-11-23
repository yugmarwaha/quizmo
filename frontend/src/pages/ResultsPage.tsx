import type { Quiz, UserAnswer } from "../types/quiz";
import { Analytics } from "../components/Analytics";

interface ResultsPageProps {
  quiz: Quiz;
  userAnswers: UserAnswer[];
  onBackToHome: () => void;
}

export function ResultsPage({
  quiz,
  userAnswers,
  onBackToHome,
}: ResultsPageProps) {
  const totalQuestions = quiz.questions.length;
  const correctAnswers = userAnswers.filter((a) => a.isCorrect).length;
  const scorePercentage = Math.round((correctAnswers / totalQuestions) * 100);

  // Calculate performance by difficulty
  const performanceByDifficulty = {
    easy: { correct: 0, total: 0 },
    medium: { correct: 0, total: 0 },
    hard: { correct: 0, total: 0 },
  };

  quiz.questions.forEach((question) => {
    const userAnswer = userAnswers.find((a) => a.questionId === question.id);
    if (userAnswer) {
      performanceByDifficulty[question.difficulty].total++;
      if (userAnswer.isCorrect) {
        performanceByDifficulty[question.difficulty].correct++;
      }
    }
  });

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "20px" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <h1 style={{ color: "#213547", marginBottom: "10px" }}>
          Quiz Complete! 🎉
        </h1>
        <div
          style={{
            fontSize: "48px",
            fontWeight: "bold",
            color:
              scorePercentage >= 70
                ? "#28a745"
                : scorePercentage >= 50
                ? "#ffc107"
                : "#dc3545",
            marginBottom: "10px",
          }}
        >
          {scorePercentage}%
        </div>
        <p style={{ fontSize: "18px", color: "#666" }}>
          You got {correctAnswers} out of {totalQuestions} questions correct
        </p>
      </div>

      {/* Analytics Charts */}
      <Analytics quiz={quiz} userAnswers={userAnswers} />

      {/* Performance by Difficulty */}
      <div style={{ marginBottom: "40px" }}>
        <h2 style={{ color: "#213547", marginBottom: "20px" }}>
          Performance by Difficulty
        </h2>
        <div
          style={{
            display: "flex",
            gap: "20px",
            justifyContent: "space-around",
          }}
        >
          {(
            Object.keys(performanceByDifficulty) as Array<
              keyof typeof performanceByDifficulty
            >
          ).map((difficulty) => {
            const { correct, total } = performanceByDifficulty[difficulty];
            const percentage =
              total > 0 ? Math.round((correct / total) * 100) : 0;

            return (
              <div
                key={difficulty}
                style={{
                  flex: 1,
                  padding: "20px",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "8px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: "12px",
                    textTransform: "uppercase",
                    color: "#666",
                    marginBottom: "10px",
                  }}
                >
                  {difficulty}
                </div>
                <div
                  style={{
                    fontSize: "32px",
                    fontWeight: "bold",
                    color: "#213547",
                  }}
                >
                  {correct}/{total}
                </div>
                <div
                  style={{ fontSize: "14px", color: "#666", marginTop: "5px" }}
                >
                  {percentage}%
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Question Review */}
      <div style={{ marginBottom: "40px" }}>
        <h2 style={{ color: "#213547", marginBottom: "20px" }}>
          Question Review
        </h2>
        {quiz.questions.map((question, index) => {
          const userAnswer = userAnswers.find(
            (a) => a.questionId === question.id
          );
          const isCorrect = userAnswer?.isCorrect || false;

          return (
            <div
              key={question.id}
              style={{
                marginBottom: "20px",
                padding: "20px",
                backgroundColor: "#f8f9fa",
                borderRadius: "8px",
                borderLeft: `4px solid ${isCorrect ? "#28a745" : "#dc3545"}`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "10px",
                }}
              >
                <span
                  style={{
                    fontSize: "20px",
                    marginRight: "10px",
                  }}
                >
                  {isCorrect ? "✓" : "✗"}
                </span>
                <h3 style={{ margin: 0, color: "#213547" }}>
                  Question {index + 1}
                </h3>
                <span
                  style={{
                    marginLeft: "auto",
                    fontSize: "12px",
                    textTransform: "uppercase",
                    color: "#666",
                  }}
                >
                  {question.difficulty}
                </span>
              </div>

              <p style={{ color: "#213547", marginBottom: "15px" }}>
                {question.question}
              </p>

              <div style={{ marginBottom: "10px" }}>
                <strong style={{ color: "#666" }}>Your answer: </strong>
                <span
                  style={{
                    color: isCorrect ? "#28a745" : "#dc3545",
                    fontWeight: "500",
                  }}
                >
                  {userAnswer?.selectedAnswer || "Not answered"}
                </span>
              </div>

              {!isCorrect && (
                <div>
                  <strong style={{ color: "#666" }}>Correct answer: </strong>
                  <span style={{ color: "#28a745", fontWeight: "500" }}>
                    {Array.isArray(question.answer)
                      ? question.answer.join(", ")
                      : question.answer}
                  </span>
                </div>
              )}

              {question.explanation && (
                <div style={{ marginTop: "10px" }}>
                  <strong style={{ color: "#666" }}>Explanation: </strong>
                  <span style={{ color: "#213547" }}>
                    {question.explanation}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div style={{ textAlign: "center" }}>
        <button
          onClick={onBackToHome}
          style={{
            padding: "12px 24px",
            fontSize: "16px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Take Another Quiz
        </button>
      </div>
    </div>
  );
}
