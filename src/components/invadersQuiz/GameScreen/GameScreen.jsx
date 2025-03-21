import { useGame } from '../contexts/GameContext';
import Ship from '../Ship/Ship';
import Alien from '../Alien/Alien';
import Laser from '../Laser/Laser';
import QuestionPanel from '../QuestionPanel/QuestionPanel';
import soundService from '../services/soundService';
import { useEffect } from 'react';
import './GameScreen.css';
import MobileControls from '../MobileControls/MobileControls';

function GameScreen() {
  const { shipPos, aliens, lasers } = useGame();

  // This will run when component unmounts (user navigates away)
  useEffect(() => {
    return () => {
      soundService.stopBackgroundMusic();
    };
  }, []);

  return (
    <div className="invgame-container">
      <div className="invgame-area">
        {/* Aliens */}
        {aliens.map(alien => alien.alive && (
          <Alien 
            key={alien.id}
            x={alien.x}
            y={alien.y}
          />
        ))}

        {/* Lasers */}
        {lasers.map((laser, i) => (
          <Laser
            key={i}
            x={laser.x}
            y={laser.y}
          />
        ))}

        {/* Player ship */}
        <Ship position={shipPos} />
      </div>

      <QuestionPanel />
      <MobileControls />
    </div>
  );
}

export default GameScreen;