import { useGame } from '../contexts/GameContext';
import Ship from '../Ship/Ship';
import Alien from '../Alien/Alien';
import Laser from '../Laser/Laser';
import QuestionPanel from '../QuestionPanel/QuestionPanel';
import './GameScreen.css';

function GameScreen() {
  const { shipPos, aliens, lasers } = useGame();

  return (
    <div className="game-container">
      <div className="game-area">
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
    </div>
  );
}

export default GameScreen;