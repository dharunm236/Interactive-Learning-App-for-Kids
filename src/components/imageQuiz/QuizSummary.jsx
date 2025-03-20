import './QuizSummary.css';

function QuizSummary({ questions }) {
    // Filter questions that were answered incorrectly
    const incorrectAnswers = questions.filter(
      (question) => question.userAnswer !== question.answer
    );
  
    return (
      <div id="quiz-summary">
        <ul className="quiz-summary-list">
          {incorrectAnswers.map((question, index) => (
            <li key={index}>
              <p>{question.question}</p>
              <div className="answer-container">
                <span className="red-mark">{question.userAnswer}</span>
                <span className="green-mark">{question.answer}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  }
  
  export default QuizSummary;