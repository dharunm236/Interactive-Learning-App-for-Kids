import { useGame } from '../contexts/GameContext';
import soundService from '../services/soundService';
import './WinScreen.css';

function WinScreen() {
  const { score, startGame } = useGame();

  const handlePlayAgain = () => {
    soundService.play('CORRECT_ANSWER');
    startGame();
  };

  return (
    <div className="end-screen">
      <h1 className="invtitle flash">CONGRATULATIONS</h1>
      <div className="invscore">FINAL SCORE: {score}</div>
      <button className="invstart-button" onClick={handlePlayAgain}>PLAY AGAIN</button>
    </div>
  );
}

export default WinScreen;