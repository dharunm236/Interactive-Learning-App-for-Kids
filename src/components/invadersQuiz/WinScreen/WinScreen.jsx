import { useGame } from '../contexts/GameContext';
import soundService from '../services/soundService';
import InvaderProgressReport from '../ProgressReport/InvaderProgressReport';
import './WinScreen.css';

function WinScreen() {
  const { score, startGame } = useGame();

  const handlePlayAgain = () => {
    soundService.play('CORRECT_ANSWER');
    startGame();
  };

  return (
    <div className="end-screen">
      <InvaderProgressReport />
      <div className="game-end-buttons">
        <button className="invstart-button" onClick={handlePlayAgain}>
          PLAY AGAIN
        </button>
      </div>
    </div>
  );
}

export default WinScreen;