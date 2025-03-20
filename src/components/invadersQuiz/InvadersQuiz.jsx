import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GameProvider } from './contexts/GameContext';
import StartScreen from './StartScreen/StartScreen';
import GameScreen from './GameScreen/GameScreen';
import GameOver from './GameOver/GameOver';
import WinScreen from './WinScreen/WinScreen';
import Loading from './Loading/Loading';
import { useGame } from './contexts/GameContext';
import AudioControls from './AudioControls/AudioControls';
import './InvadersQuiz.css';


// Main game component that renders the appropriate screen based on game state
function GameContent() {
  const { gameState, isLoading } = useGame();
  
  if (isLoading) {
    return <Loading />;
  }
  
  switch (gameState) {
    case 'start':
      return <StartScreen />;
    case 'playing':
      return <GameScreen />;
    case 'won':
      return <WinScreen />;
    case 'lost':
      return <GameOver />;
    default:
      return <StartScreen />;
  }
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
        <AudioControls />
        <GameContent />
      </GameProvider>
    </div>
  );
}

export default InvadersQuiz;  