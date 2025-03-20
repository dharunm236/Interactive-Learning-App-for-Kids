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
        {/* Invader Quiz */}
        <div className={styles.quizCard}>
          <div className={styles.quizCardContent}>
            <img
              src="https://img.freepik.com/free-vector/space-game-location_1284-57883.jpg?t=st=1742499587~exp=1742503187~hmac=74f55d6596c67dc46e3712cf95c9ab86fd85156af79091370e19d8eec255f007&w=1380"
              alt="Invader Quiz"
              className={styles.quizImage}
            />
            <h2 className={styles.quizTitle}>🔢Invaders Quiz</h2>
            <p className={styles.quizDescription}>Test your General knowledge skills with fun questions!</p>
            <button onClick={() => navigate('/quizzes/invaders')} className={styles.playButton}>
              Start Quiz
            </button>
          </div>
        </div>

        {/* Image Quiz */}
        <div className={styles.quizCard}>
          <div className={styles.quizCardContent}>
            <img
              src="https://d1ymz67w5raq8g.cloudfront.net/Pictures/2000xAny/6/5/5/509655_shutterstock_1506580442_769367.jpg"
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
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRUGB_h_HLfZ_U9sx_LmmX91s2Nb_wXCXt7Xg&s"
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