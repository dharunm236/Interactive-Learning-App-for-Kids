import { useGame } from '../contexts/GameContext';
import './QuestionPanel.css';

function QuestionPanel() {
  const { questions, currentQuestion, handleAnswer, lives, score, isLoading } = useGame();
  
  // Show loading state if questions are still being fetched
  if (isLoading || !questions || questions.length === 0) {
    return (
      <div className="question-panel">
        <div className="question">Loading questions...</div>
      </div>
    );
  }
  
  const question = questions[currentQuestion % questions.length];

  return (
    <div className="question-panel">
      <div className="question">{question.question}</div>
      <div className="answers">
        {question.answers.map((answer, i) => (
          <button
            key={i}
            className="answer-button"
            onClick={() => handleAnswer(i)}
          >
            {answer}
          </button>
        ))}
      </div>
      <div className="status">
        <div className="lives">
          {Array(lives).fill().map((_, i) => (
            <span key={i} className="heart">♥</span>
          ))}
        </div>
        <div className="qscore">SCORE: {score}</div>
      </div>
    </div>
  );
}

export default QuestionPanel;