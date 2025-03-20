import { useState } from 'react';
import soundService from '../services/soundService';
import '../styles/audio-controls.css';

function MuteButton() {
  const [isMuted, setIsMuted] = useState(false);

  const handleToggleMute = () => {
    const newMuteState = soundService.toggleMute();
    setIsMuted(newMuteState);
  };

  return (
    <button 
      className="mute-button" 
      onClick={handleToggleMute} 
      aria-label={isMuted ? 'Unmute' : 'Mute'}
    >
      {isMuted ? '🔇' : '🔊'}
    </button>
  );
}

export default MuteButton;