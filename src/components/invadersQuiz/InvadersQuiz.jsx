import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameProvider, useGame } from './contexts/GameContext';
import StartScreen from './StartScreen/StartScreen';
import GameScreen from './GameScreen/GameScreen';
import GameOver from './GameOver/GameOver';
import WinScreen from './WinScreen/WinScreen';
import Loading from './Loading/Loading';
import AudioControls from './AudioControls/AudioControls';
import TVFrame from './assets/TV-game.png'; // Make sure this path is correct
import './InvadersQuiz.css';

// Main game component that renders the appropriate screen based on game state
function GameContent() {
  const { gameState, isLoading } = useGame();
  const [, forceUpdate] = useState();
  
  // Force re-render when gameState changes
  useEffect(() => {
    const timer = setTimeout(() => forceUpdate({}), 100);
    return () => clearTimeout(timer);
  }, [gameState]);
  
  if (isLoading) {
    return <Loading />;
  }
  
  return (
    <div className={`crt-screen ${gameState === 'playing' ? 'game-active' : ''}`}>
      {gameState === 'start' && <StartScreen />}
      {gameState === 'playing' && <GameScreen />}
      {gameState === 'won' && <WinScreen />}
      {gameState === 'lost' && <GameOver />}
    </div>
  );
}

// Main wrapper component with navigation and providers
function InvadersQuiz() {
  const navigate = useNavigate();
  
  const handleBackClick = () => {
    navigate('/quizzes');
  };
  
  return (
    <div className="invaders-quiz-container">
      <div className="back-button" onClick={handleBackClick}>
        ← Back to Quizzes
      </div>
      
      <GameProvider>
        <div className="tv-container">
          <div 
            className="tv-overlay" 
            style={{ backgroundImage: `url(${TVFrame})` }}
          ></div>
          <AudioControls />
          <GameContent />
        </div>
      </GameProvider>
    </div>
  );
}

export default InvadersQuiz;