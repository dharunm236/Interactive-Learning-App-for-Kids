import React from 'react';
import './ProgressReport.css';
import QuizSummary from './QuizSummary';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ProgressReport = ({ score, totalQuestions, quizData, percentage, onRetakeQuiz }) => {
  // Calculate performance metrics
  const incorrectAnswers = quizData.filter(q => q.userAnswer !== q.answer);
  const correctAnswers = totalQuestions - incorrectAnswers.length;
  const accuracy = ((correctAnswers / totalQuestions) * 100).toFixed(1);
  const timeStamp = new Date().toLocaleDateString();

  // Chart data
  const chartData = [
    { name: 'Correct', value: correctAnswers },
    { name: 'Incorrect', value: incorrectAnswers.length },
  ];

  // Performance suggestions
  const getSuggestions = () => {
    if (percentage >= 90) {
      return "Outstanding performance! Your child has mastered these concepts. Encourage them to explore advanced topics!";
    } else if (percentage >= 75) {
      return "Great job! Your child is doing well. Focus on weaker areas to achieve excellence.";
    } else if (percentage >= 50) {
      return "Good effort! Your child is making progress. Dedicate more time to these topics for improvement.";
    }
    return "Keep practicing! Your child should focus on fundamental concepts and review the material carefully.";
  };

  // Handle Print Report
  const handlePrintReport = () => {
    window.print();
  };

  // Handle Retake Quiz
  const handleRetakeQuiz = () => {
    onRetakeQuiz();
  };

  return (
    <div className="progress-report">
      <header className="report-header">
        <div>
          <h1>Student Performance Report</h1>
          <p className="school-tagline">Knowledge ∙ Growth ∙ Excellence</p>
        </div>
        <div className="header-meta">
          <div className="meta-item">
            <span className="meta-label">Student:</span>
            <span className="meta-value">Emily Johnson</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Grade Level:</span>
            <span className="meta-value">Grade 5</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Date:</span>
            <span className="meta-value">{timeStamp}</span>
          </div>
        </div>
      </header>

      <div className="performance-overview">
        <div className="overview-card primary">
          <h3>Overall Score</h3>
          <div className="score-display">
            <span className="score-number">{score}</span>
            <span className="score-total">/{totalQuestions}</span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
          <span className="percentage">{percentage}%</span>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <h4>Accuracy Rate</h4>
            <div className="stat-value">{accuracy}%</div>
            <div className="stat-comparison">(+5% from last attempt)</div>
          </div>
          <div className="stat-card">
            <h4>Strongest Area</h4>
            <div className="stat-value">General Knowledge</div>
            <div className="stat-comparison">92% correct</div>
          </div>
          <div className="stat-card">
            <h4>Weakest Area</h4>
            <div className="stat-value">Science</div>
            <div className="stat-comparison">68% correct</div>
          </div>
        </div>
      </div>

      <section className="analysis-section">
        <h2>Performance Analysis</h2>
        <div className="suggestion-box">
          <div className="suggestion-icon">💡</div>
          <p>{getSuggestions()}</p>
        </div>

        <div className="comparison-chart">
          <h3>Score Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#4CAF50" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="detailed-review">
        <h2>Incorrect Answers Review</h2>
        <QuizSummary questions={quizData} />
      </section>

      <footer className="report-footer">
        <p>🔒 Your child's progress is automatically saved. Retake the quiz anytime to improve their score!</p>
        <div className="footer-actions">
          <button className="print-btn" onClick={handlePrintReport}>Print Report</button>
          <button className="retake-btn" onClick={handleRetakeQuiz}>Retake Quiz</button>
        </div>
      </footer>
    </div>
  );
};

export default ProgressReport;