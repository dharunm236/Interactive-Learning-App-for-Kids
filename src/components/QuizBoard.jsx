import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './QuizBoard.module.css'; // We'll create this CSS module next

const QuizBoard = () => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate('/'); 
  };

  return (
    <div className={styles.quizPage}>
      {/* Header */}
      <header className={styles.quizHeader}>
        <h1 className={styles.quizTitle}>FunLearn Quiz Hub</h1>
        <p className={styles.quizSubtitle}>Test your knowledge with these exciting quizzes!</p>
      </header>
      <div className={styles.backButtonContainer}>
        <img
          src="https://cdn-icons-png.flaticon.com/512/93/93634.png"
          alt="Back"
          className={styles.backButtonImage}
          onClick={handleBackClick}
        />
      </div>
      {/* Quiz Grid */}
      <div className={styles.quizGrid}>
        {/* Math Quiz */}
        <div className={styles.quizCard}>
          <div className={styles.quizCardContent}>
            <img
              src="https://png.pngtree.com/png-clipart/20230821/original/pngtree-math-time-clock-cartoon-calculator-picture-image_8127309.png"
              alt="Math Quiz"
              className={styles.quizImage}
            />
            <h2 className={styles.quizTitle}>🔢Invaders Quiz</h2>
            <p className={styles.quizDescription}>Test your General knowledge skills with fun questions!</p>
            <button onClick={() => navigate('/quizzes/invaders')} className={styles.playButton}>
              Start Quiz
            </button>
          </div>
        </div>

        {/* Vocabulary Quiz */}
        <div className={styles.quizCard}>
          <div className={styles.quizCardContent}>
            <img
              src="https://png.pngtree.com/png-clipart/20230914/original/pngtree-abc-block-cartoon-alphabet-picture-image_8149965.png"
              alt="Image Quiz"
              className={styles.quizImage}
            />
            <h2 className={styles.quizTitle}>📚 Image Quiz</h2>
            <p className={styles.quizDescription}>Expand your word knowledge with this fun Image quiz!</p>
            <button onClick={() => navigate('/quizzes/imageQuiz')} className={styles.playButton}>
              Start Quiz
            </button>
          </div>
        </div>

        {/* Science Quiz */}
        <div className={styles.quizCard}>
          <div className={styles.quizCardContent}>
            <img
              src="https://png.pngtree.com/png-clipart/20230927/original/pngtree-science-lab-equipment-cartoon-picture-image_8189038.png"
              alt="Science Quiz"
              className={styles.quizImage}
            />
            <h2 className={styles.quizTitle}>🔬 Science Quiz</h2>
            <p className={styles.quizDescription}>Discover the wonders of science with this quiz!</p>
            <button onClick={() => navigate('/quizzes/science')} className={styles.playButton}>
              Start Quiz
            </button>
          </div>
        </div>

        {/* Coming Soon */}
        <div className={styles.quizCard}>
          <div className={styles.quizCardContent}>
            <img
              src="https://png.pngtree.com/png-clipart/20240428/original/pngtree-sticker-of-a-cartoon-superhero-png-image_14963628.png"
              alt="Coming Soon"
              className={styles.quizImage}
            />
            <h2 className={styles.quizTitle}>🚀 Coming Soon</h2>
            <p className={styles.quizDescription}>More exciting quizzes are on the way!</p>
            <button className={styles.playButton} disabled>
              Coming Soon
            </button>
          </div>
        </div>
      </div>

      {/* Challenge a Friend */}
      <div className={styles.challengeSection}>
        <button onClick={() => navigate('/quiz-challenge-friend')} className={styles.ctaButton}>
          Challenge a Friend to a Quiz 🏆
        </button>
      </div>
    </div>
  );
};

export default QuizBoard;