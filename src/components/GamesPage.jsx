import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './GamesPage.module.css'; // Import the CSS module

const GamesPage = () => {
  const navigate = useNavigate();

  const handlePlayClick_MathsSolving = () => {
    window.location.href = "/games/Basic-Arith/index_B.html";
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

        {/* Car Simulator */}
        <div className={styles.gameCard}>
          <div className={styles.gameCardContent}>
            <img
              src="https://png.pngtree.com/png-clipart/20230821/original/pngtree-african-american-man-playing-video-game-with-gaming-wheel-picture-image_8127244.png"
              alt="Car Simulator"
              className={styles.gameImage}
            />
            <h2 className={styles.gameTitle}>🚗 Car Simulator</h2>
            <p className={styles.gameDescription}>Drive and learn about road safety! and improve your driving skills in a fun way!</p>
            <button onClick={handlePlayClick_CarSimulator} className={styles.playButton}>
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
            <img
              src="https://png.pngtree.com/png-clipart/20220128/original/pngtree-money-game-icon-png-image_7263806.png"
              alt="Money Game"
              className={styles.gameImage}
            />
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

      {/* Challenge a Friend */}
      <div className={styles.challengeSection}>
        <button onClick={() => navigate('/challenge-friend')} className={styles.ctaButton}>
          Challenge a Friend 🏆
        </button>
      </div>
    </div>
  );
};

export default GamesPage;
