import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './GamesPage.module.css'; // Import the CSS module
import ChallengeButton from './1v1player_game/ChallengeButton';

const GamesPage = () => {
  const navigate = useNavigate();

  const handlePlayClick_MathsSolving = () => {
    window.location.href = "/games/Basic-Arith/index_B.html";
  };

  const handleBackClick = () => {
    navigate('/'); 
  };
  const handlePlayClick_CarSimulator = () => {
    window.location.href = "/games/Car-Game/T3/index_C.html";
  };

  const handlePlayClick_Memorymatch = () => {
    window.location.href = "/games/Memory-Game/index_M.html";
  };

  return (
    <div className={styles.gamesPage}>
      {/* Header */}
      <header className={styles.gamesHeader}>
        <h1 className={styles.gamesTitle}>FunLearn Games Hub</h1>
        <p className={styles.gamesSubtitle}>Explore exciting games to learn and have fun!</p>
      </header>
      <div className={styles.backButtonContainer}>
        <img
          src="https://cdn-icons-png.flaticon.com/512/93/93634.png"
          alt="Back"
          className={styles.backButtonImage}
          onClick={handleBackClick}
        />
      </div>
      
      {/* Games Grid */}
      <div className={styles.gamesGrid}>
        {/* Balloon Game */}
        <div className={styles.gameCard}>
          <div className={styles.gameCardContent}>
            <img
              src="https://parspng.com/wp-content/uploads/2022/01/balloonpng.parspng.com-2.png"
              alt="Balloon Game"
              className={styles.gameImage}
            />
            <h2 className={styles.gameTitle}>🎈 Balloon Game</h2>
            <p className={styles.gameDescription}>Pop balloons and learn math in this fun game!</p>
            <button onClick={() => navigate('/games/Ballongame')} className={styles.playButton}>
              Play Now
            </button>
          </div>
        </div>

        {/* Memory Match */}
        <div className={styles.gameCard}>
          <div className={styles.gameCardContent}>
            <img
              src="https://png.pngtree.com/png-clipart/20220117/original/pngtree-childhood-games-png-image_7140637.png"
              alt="Memory Match Game"
              className={styles.gameImage}
            />
            <h2 className={styles.gameTitle}>🧠 Memory Match</h2>
            <p className={styles.gameDescription}>Test your memory with this exciting matching game!</p>
            <button onClick={handlePlayClick_Memorymatch} className={styles.playButton}>
              Play Now
            </button>
          </div>
        </div>

        {/* Maths Solving */}
        <div className={styles.gameCard}>
          <div className={styles.gameCardContent}>
            <img
              src="https://png.pngtree.com/template/20220419/ourmid/pngtree-math-game-for-kids-image_1081276.jpg"
              alt="Maths Solving Game"
              className={styles.gameImage}
            />
            <h2 className={styles.gameTitle}>➕ Maths Solving</h2>
            <p className={styles.gameDescription}>Solve math problems and improve your skills!</p>
            <button onClick={handlePlayClick_MathsSolving} className={styles.playButton}>
              Play Now
            </button>
          </div>
        </div>
        
        {/* Money Game */}
        <div className={styles.gameCard}>
          <div className={styles.gameCardContent}>
            <img src= "https://img.freepik.com/free-vector/collection-vector-cartoon-bags-with-banknotes_1441-327.jpg" alt="Money Game" className={styles.gameImage}/>
            <h2 className={styles.gameTitle}>💰 Money Game</h2>
            <p className={styles.gameDescription}>Learn to count and manage money in this game!</p>
            <button onClick={() => navigate('/moneygame')} className={styles.playButton}>
              Play Now
            </button>
          </div>
        </div>

        {/* Coming Soon */}
        <div className={styles.gameCard}>
          <div className={styles.gameCardContent}>
            <img
              src="https://png.pngtree.com/png-clipart/20240428/original/pngtree-sticker-of-a-cartoon-superhero-png-image_14963628.png"
              alt="Coming Soon"
              className={styles.gameImage}
            />
            <h2 className={styles.gameTitle}>🚀 Coming Soon</h2>
            <p className={styles.gameDescription}>More exciting games are on the way!</p>
            <button className={styles.playButton} disabled>
              Coming Soon
            </button>
          </div>
        </div>
      </div>

      {/* Challenge a Friend - Using just the ChallengeButton component */}
      <div className={styles.challengeSection}>
        <ChallengeButton />
      </div>
    </div>
  );
};

export default GamesPage;
