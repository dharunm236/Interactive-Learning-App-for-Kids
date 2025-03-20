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
    <div className="invend-screen">
      <h1 className="invtitle" style={{color : 'rgb(255 0 0)'}}>GAME OVER</h1>
      <div className="invstatus">SCORE: {score}</div>
      <button className="invstart-button" onClick={handleTryAgain}>TRY AGAIN</button>
    </div>
  );
}

export default GameOver;