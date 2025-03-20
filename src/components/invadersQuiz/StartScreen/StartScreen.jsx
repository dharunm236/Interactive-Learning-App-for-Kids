import { useGame } from '../contexts/GameContext';
import soundService from '../services/soundService';
import './StartScreen.css';

function StartScreen() {
  const { startGame, gameState, debug } = useGame();

  console.log("StartScreen rendering, gameState:", gameState);

  const handleStartClick = () => {
    console.log("Start button clicked");
    // Play a sound for button click
    soundService.play('CORRECT_ANSWER');
    startGame();
    console.log("After startGame call");
  };

  return (
    <div className="start-screen">
      <h1 className="title">QUIZ INVADERS</h1>
      <button className="start-button" onClick={handleStartClick}>
        PRESS START
      </button>
      <div className="controller"></div>
    </div>
  );
}

export default StartScreen;