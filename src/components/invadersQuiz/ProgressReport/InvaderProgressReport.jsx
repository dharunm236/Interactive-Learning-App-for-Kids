import React from 'react';
import { useGame } from '../contexts/GameContext';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './InvaderProgressReport.css';

const InvaderProgressReport = () => {
  const { 
    score, 
    questions = [], 
    answeredQuestions = [], 
    lives 
  } = useGame();

  // Calculate performance metrics
  const totalQuestions = answeredQuestions.length;
  const correctAnswers = questions.filter(q => q.userAnswerIndex === q.correct).length;
  const incorrectAnswers = totalQuestions - correctAnswers;
  const accuracy = totalQuestions > 0 ? ((correctAnswers / totalQuestions) * 100).toFixed(1) : 0;
  const timeStamp = new Date().toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Pie Chart data
  const chartData = [
    { name: 'Correct', value: correctAnswers },
    { name: 'Incorrect', value: incorrectAnswers },
  ];

  // Colors for the Pie Chart
  const COLORS = ['#4CAF50', '#FF5252'];

  // Performance suggestions
  const getSuggestions = () => {
    const percentage = (correctAnswers / totalQuestions) * 100 || 0;
    if (percentage >= 90) {
      return {
        title: "Galactic Mastery! 🌟",
        message: "Perfect performance! Ready for advanced missions!",
        tips: []
      };
    } else if (percentage >= 75) {
      return {
        title: "Orbit Achieved! 🚀",
        message: "Strong performance with room to reach stellar heights.",
        tips: ["Focus on tricky areas below."]
      };
    } else if (percentage >= 50) {
      return {
        title: "Good Launch! 🌍",
        message: "Keep practicing to escape Earth's gravity.",
        tips: ["Review incorrect answers to boost accuracy."]
      };
    }
    return {
      title: "Training Required! 🛠️",
      message: "Focus on core concepts to build rocket-fueled knowledge.",
      tips: ["Review answers carefully.", "Practice fundamental concepts."]
    };
  };

  return (
    <div className="progress-report-container">
      <header className="report-header">
        <h1>Space Mission Debrief</h1>
        <div className="header-meta">
          <span className="report-date">{timeStamp}</span>
          <span className="score">Final Score: {score}</span>
        </div>
      </header>

      <div className="performance-grid">
        <div className="overview-card">
          <h3>Mission Statistics</h3>
          <div className="stats-row">
            <div className="stat-item">
              <div className="stat-value">{accuracy}%</div>
              <div className="stat-label">Accuracy</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{lives}</div>
              <div className="stat-label">Lives Remaining</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{totalQuestions}</div>
              <div className="stat-label">Questions Faced</div>
            </div>
          </div>
        </div>

        <div className="chart-card">
          <h3>Performance Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="detailed-analysis">
        <div className="suggestions-card">
          <h3>Training Recommendations</h3>
          <div className="suggestion-content">
            <div className="suggestion-icon">💡</div>
            <div>
              <h4>{getSuggestions().title}</h4>
              <p>{getSuggestions().message}</p>
              {getSuggestions().tips.length > 0 && (
                <ul>
                  {getSuggestions().tips.map((tip, index) => (
                    <li key={index}>{tip}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className="question-review">
          <h3>Question-by-Question Analysis</h3>
          {questions.map((q, index) => (
            <div 
              key={index} 
              className={`question-item ${q.userAnswerIndex === q.correct ? 'correct' : 'incorrect'}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="question-header">
                <span>Q{index + 1}: {q.question}</span>
                <span className="status-badge">
                  {q.userAnswerIndex === q.correct ? '✓' : '✗'}
                </span>
              </div>
              <div className="answer-comparison">
                <div className="user-answer">
                  <span>Your Answer:</span>
                  <span>{q.answers[q.userAnswerIndex]}</span>
                </div>
                {q.userAnswerIndex !== q.correct && (
                  <div className="correct-answer">
                    <span>Correct Answer:</span>
                    <span>{q.answers[q.correct]}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <footer className="report-footer">
        <p>🌌 Progress saved in Space Command database. Keep training to defend our galaxy!</p>
      </footer>
    </div>
  );
};

export default InvaderProgressReport;