import React, { useState } from 'react';
import soundService from '../services/soundService';
import '../styles/audio-controls.css';

function AudioControls() {
  const [isMuted, setIsMuted] = useState(false);
  
  const toggleMute = () => {
    const newMuteState = soundService.toggleMute();
    setIsMuted(newMuteState);
  };
  
  return (
    <button className="mute-button" onClick={toggleMute}>
      {isMuted ? '🔇' : '🔊'}
    </button>
  );
}

export default AudioControls;