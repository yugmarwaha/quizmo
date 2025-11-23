import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { Quiz, UserAnswer } from "../types/quiz";

interface AnalyticsProps {
  quiz: Quiz;
  userAnswers: UserAnswer[];
}

export function Analytics({ quiz, userAnswers }: AnalyticsProps) {
  const correctAnswers = userAnswers.filter((a) => a.isCorrect).length;
  const incorrectAnswers = userAnswers.length - correctAnswers;

  // Data for Pie Chart (Correct vs Incorrect)
  const pieData = [
    { name: "Correct", value: correctAnswers, color: "#28a745" },
    { name: "Incorrect", value: incorrectAnswers, color: "#dc3545" },
  ];

  // Data for Bar Chart (Performance by Difficulty)
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

  const barData = Object.entries(performanceByDifficulty).map(
    ([difficulty, stats]) => ({
      difficulty: difficulty.charAt(0).toUpperCase() + difficulty.slice(1),
      correct: stats.correct,
      incorrect: stats.total - stats.correct,
      percentage:
        stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
    })
  );

  return (
    <div style={{ marginBottom: "40px" }}>
      <h2
        style={{ color: "#213547", marginBottom: "30px", textAlign: "center" }}
      >
        Visual Analytics
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
          gap: "30px",
        }}
      >
        {/* Pie Chart */}
        <div
          style={{
            backgroundColor: "#f8f9fa",
            padding: "20px",
            borderRadius: "8px",
          }}
        >
          <h3
            style={{
              textAlign: "center",
              color: "#213547",
              marginBottom: "20px",
            }}
          >
            Overall Performance
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => [`${value} questions`, name]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div
          style={{
            backgroundColor: "#f8f9fa",
            padding: "20px",
            borderRadius: "8px",
          }}
        >
          <h3
            style={{
              textAlign: "center",
              color: "#213547",
              marginBottom: "20px",
            }}
          >
            Performance by Difficulty
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="difficulty" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="correct" fill="#28a745" name="Correct" />
              <Bar dataKey="incorrect" fill="#dc3545" name="Incorrect" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary Text */}
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <p style={{ color: "#213547", fontSize: "16px" }}>
          <strong>Summary:</strong> {correctAnswers} correct, {incorrectAnswers}{" "}
          incorrect out of {quiz.questions.length} questions
        </p>
      </div>
    </div>
  );
}
