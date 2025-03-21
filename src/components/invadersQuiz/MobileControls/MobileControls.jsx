import React from 'react';
import { useGame } from '../contexts/GameContext';
import './MobileControls.css';

function MobileControls() {
  const { gameState, shipPos } = useGame();
  
  // Don't show controls unless the game is playing
  if (gameState !== 'playing') return null;
  
  const handleMoveLeft = () => {
    // Dispatch a custom event to simulate keydown
    const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
    window.dispatchEvent(event);
  };
  
  const handleMoveRight = () => {
    // Dispatch a custom event to simulate keydown
    const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
    window.dispatchEvent(event);
  };
  
  
  return (
    <div className="mobile-controls">
      <button 
        className="control-btn left-btn" 
        onTouchStart={handleMoveLeft}
        aria-label="Move Left"
      >
        <span>◀</span>
      </button>
      
      <button 
        className="control-btn right-btn"
        onTouchStart={handleMoveRight}
        aria-label="Move Right"
      >
        <span>▶</span>
      </button>
    </div>
  );
}

export default MobileControls;