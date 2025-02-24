import React from 'react';
import './Celebration.css';
import celebrationSound from '../../assets/sounds/celebration.mp3';

const Celebration = ({ trigger, onComplete }) => {
  const audioRef = React.useRef(new Audio(celebrationSound));

  React.useEffect(() => {
    if (trigger) {
      audioRef.current.play();
      const timer = setTimeout(() => {
        onComplete();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [trigger, onComplete]);

  if (!trigger) return null;

  return (
    <div className="celebration-container">
      <div className="celebration-content">
        <h2>Congratulations! 🎉</h2>
        <p>You found the word!</p>
        <div className="fireworks">
          <div className="firework"></div>
          <div className="firework"></div>
          <div className="firework"></div>
        </div>
      </div>
    </div>
  );
};

export default Celebration;