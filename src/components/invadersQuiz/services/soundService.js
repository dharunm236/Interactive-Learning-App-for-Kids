import { SOUNDS } from '../config/soundsConfig.js';

class SoundService {
  constructor() {
    this.sounds = {};
    this.bgMusic = null;
    this.isMuted = false;
    this.initialized = false;
  }

  initialize() {
    if (this.initialized) return;
    
    // Preload all sounds
    for (const [key, url] of Object.entries(SOUNDS)) {
      this.sounds[key] = new Audio(url);
      
      // Set background music to loop
      if (key === 'BACKGROUND_MUSIC') {
        this.bgMusic = this.sounds[key];
        this.bgMusic.loop = true;
        this.bgMusic.volume = 0.4; // Lower volume for background music
      }
    }
    
    this.initialized = true;
  }

  play(soundName) {
    if (this.isMuted || !this.initialized) return;
    
    const sound = this.sounds[soundName];
    if (sound) {
      // For one-shot sounds, reset them before playing
      if (soundName !== 'BACKGROUND_MUSIC') {
        sound.currentTime = 0;
      }
      sound.play().catch(error => {
        console.warn(`Error playing sound ${soundName}:`, error);
        // Most browsers require user interaction before playing audio
      });
    }
  }

  stopAll() {
    if (!this.initialized) return;
    
    Object.values(this.sounds).forEach(sound => {
      sound.pause();
      sound.currentTime = 0;
    });
  }

  startBackgroundMusic() {
    if (this.isMuted || !this.initialized) return;
    this.bgMusic?.play().catch(error => {
      console.warn("Background music couldn't autoplay:", error);
    });
  }

  stopBackgroundMusic() {
    this.bgMusic?.pause();
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    
    if (!this.initialized) return;
    
    Object.values(this.sounds).forEach(sound => {
      sound.muted = this.isMuted;
    });
    
    // If unmuting and game is on, restart background music
    if (!this.isMuted && this.bgMusic && !this.bgMusic.paused) {
      this.bgMusic.play().catch(e => console.log("Couldn't resume background music"));
    }
    
    return this.isMuted;
  }
}

// Create a singleton instance
const soundService = new SoundService();
export default soundService;