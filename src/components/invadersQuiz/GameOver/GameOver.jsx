import React from 'react';
import { useGame } from '../contexts/GameContext';
import soundService from '../services/soundService';
import InvaderProgressReport from '../ProgressReport/InvaderProgressReport';
import './GameOver.css';

function GameOver() {
  const { score, startGame } = useGame();

  const handleTryAgain = () => {
    soundService.play('CORRECT_ANSWER');
    startGame();
  };

  return (
    <div className="end-screen">
      <InvaderProgressReport />
      <div className="game-end-buttons">
        <h1 className="invtitle" style={{ color: 'rgb(255 0 0)' }}>GAME OVER</h1>
        <div className="invstatus">SCORE: {score}</div>
        <button className="invstart-button" onClick={handleTryAgain}>
          TRY AGAIN
        </button>
      </div>
    </div>
  );
}

export default GameOver;