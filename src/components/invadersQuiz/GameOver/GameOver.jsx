import { useGame } from '../contexts/GameContext';
import soundService from '../services/soundService';
import './GameOver.css';

function GameOver() {
  const { score, startGame } = useGame();
  
  const handleTryAgain = () => {
    soundService.play('CORRECT_ANSWER');
    startGame();
  };

  return (
    <div className="end-screen">
      <h1 className="title">GAME OVER</h1>
      <div className="score">SCORE: {score}</div>
      <button className="start-button" onClick={handleTryAgain}>TRY AGAIN</button>
    </div>
  );
}

export default GameOver;