import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import styles from "./StoryPrompt.module.css";
import { useNavigate } from 'react-router-dom';
import { motion } from "framer-motion"; // Add framer-motion for animations

const StoryPrompt = () => {
  const [prompt, setPrompt] = useState("");
  const [story, setStory] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState("english");
  const [isPlaying, setIsPlaying] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const speechSynthesisRef = useRef(null);
  const storyContainerRef = useRef(null);
  const navigate = useNavigate();

  const apiKey = process.env.REACT_APP_OPENROUTER_API_KEY;
  
  const languages = [
    { code: "english", name: "English", voice: "en-US", flag: "🇺🇸" },
    { code: "spanish", name: "Spanish", voice: "es-ES", flag: "🇪🇸" },
    { code: "french", name: "French", voice: "fr-FR", flag: "🇫🇷" },
    { code: "german", name: "German", voice: "de-DE", flag: "🇩🇪" },
    { code: "chinese", name: "Chinese", voice: "zh-CN", flag: "🇨🇳" },
    { code: "hindi", name: "Hindi", voice: "hi-IN", flag: "🇮🇳" },
    { code: "tamil", name: "Tamil", voice: "ta-IN", flag: "🇮🇳" },
    { code: "japanese", name: "Japanese", voice: "ja-JP", flag: "🇯🇵" },
    { code: "russian", name: "Russian", voice: "ru-RU", flag: "🇷🇺" },
  ];

  // Scroll to story when generated
  useEffect(() => {
    if (story && storyContainerRef.current) {
      storyContainerRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [story]);

  // Show confetti effect when story is generated
  useEffect(() => {
    if (story && !loading) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [story, loading]);

  const handleBackClick = () => {
    navigate('/'); 
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setStory("");
    setImage("");
    stopSpeech();

    try {
      // Text Generation using OpenRouter GPT with environment variable
      const textResponse = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "openai/gpt-3.5-turbo",
          messages: [
            { 
              role: "user", 
              content: `Write a short kids story about: ${prompt}. Write it directly in ${language} language only.`
            }
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      const generatedStory = textResponse.data.choices[0].message.content;
      setStory(generatedStory.trim());

    } catch (error) {
      console.error("Error:", error);
      setStory("Failed to generate the story. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const playStory = () => {
    stopSpeech();
    
    if (!story) return;
    
    // Initialize voices first to ensure they're loaded
    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        playStoryWithVoices();
      };
    } else {
      playStoryWithVoices();
    }
  };

  const playStoryWithVoices = () => {
    const utterance = new SpeechSynthesisUtterance(story);
    const voices = window.speechSynthesis.getVoices();
    
    const selectedLanguage = languages.find(lang => lang.code === language);
    const voiceForLanguage = voices.find(voice => voice.lang.includes(selectedLanguage.voice));
    
    if (voiceForLanguage) {
      utterance.voice = voiceForLanguage;
      utterance.lang = selectedLanguage.voice;
    } else {
      // Fallback to a default voice if the desired voice is not available
      utterance.voice = voices.find(voice => voice.lang.includes("en-US")) || voices[0];
      utterance.lang = "en-US";
    }
    
    utterance.rate = 0.9; // Slightly slower for children
    utterance.pitch = 1.1; // Slightly higher pitch for storytelling
    
    utterance.onend = () => {
      setIsPlaying(false);
    };
    
    speechSynthesisRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };
  
  const stopSpeech = () => {
    if (speechSynthesisRef.current) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    }
  };
  
  // Random bright colors for confetti
  const confettiColors = ["#FFC300", "#FF5733", "#C70039", "#900C3F", "#581845", "#2E86C1", "#17A589", "#D4AC0D"];

  return (
    <div className={styles.container}>
      {showConfetti && (
        <div className={styles.confettiContainer}>
          {[...Array(50)].map((_, i) => (
            <div 
              key={i}
              className={styles.confetti}
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                backgroundColor: confettiColors[Math.floor(Math.random() * confettiColors.length)]
              }}
            />
          ))}
        </div>
      )}
      
      <motion.div 
        className={styles.backButtonContainer}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <img
          src="https://cdn-icons-png.flaticon.com/512/93/93634.png"
          alt="Back"
          className={styles.backButtonImage}
          onClick={handleBackClick}
        />
      </motion.div>
      
      <div className={styles.toysWrapper}>
        <motion.img
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ 
            repeat: Infinity, 
            repeatType: "reverse", 
            duration: 2,
          }}
          src="https://cdn-icons-png.flaticon.com/512/5238/5238389.png"
          alt="toy"
          className={styles.toy1}
        />
        <motion.img
          initial={{ y: -10 }}
          animate={{ y: 10 }}
          transition={{ 
            repeat: Infinity, 
            repeatType: "reverse", 
            duration: 3,
          }}
          src="https://cdn-icons-png.flaticon.com/512/5238/5238370.png"
          alt="toy"
          className={styles.toy2}
        />
        <motion.img
          initial={{ y: 0 }}
          animate={{ y: -15 }}
          transition={{ 
            repeat: Infinity, 
            repeatType: "reverse", 
            duration: 2.5,
          }}
          src="https://cdn-icons-png.flaticon.com/512/5238/5238397.png"
          alt="toy"
          className={styles.toy3}
        />

        <motion.div 
          className={styles.contentBox}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.h2 
            className={styles.title}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ 
              duration: 0.5, 
              type: "spring", 
              stiffness: 120 
            }}
          >
            ✨ Create Your Magical Story! ✨
          </motion.h2>
          
          <div className={styles.inputGroup}>
            <motion.input
              whileFocus={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
              type="text"
              className={styles.input}
              placeholder="Enter your story idea..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            
            <div className={styles.languageSelector}>
              <label htmlFor="language">Choose a language: </label>
              <div className={styles.customSelect}>
                <select 
                  id="language" 
                  value={language} 
                  onChange={(e) => setLanguage(e.target.value)}
                  className={styles.languageDropdown}
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.flag} {lang.name}
                    </option>
                  ))}
                </select>
                <div className={styles.selectArrow}>▼</div>
              </div>
            </div>
          </div>
          
          <motion.button
            className={styles.button}
            onClick={handleGenerate}
            disabled={loading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {loading ? (
              <div className={styles.loading}>
                <div className={styles.bounce1}></div>
                <div className={styles.bounce2}></div>
                <div className={styles.bounce3}></div>
              </div>
            ) : (
              <>🎪 Generate Story!</>
            )}
          </motion.button>

          {story && (
            <motion.div 
              className={styles.storyContainer}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              ref={storyContainerRef}
            >
              <div className={styles.storyHeader}>
                <h3 className={styles.storyTitle}>📖 Your Amazing Story:</h3>
                <div className={styles.narrationControls}>
                  <motion.button 
                    className={`${styles.narrationButton} ${isPlaying ? styles.stopButton : styles.playButton}`}
                    onClick={isPlaying ? stopSpeech : playStory}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isPlaying ? (
                      <>🔇 Stop Narration</>
                    ) : (
                      <>🔊 Listen to Story</>
                    )}
                  </motion.button>
                </div>
              </div>
              
              <div className={styles.storyContent}>
                {story.split("\n").map((paragraph, index) => (
                  <motion.p
                    key={index}
                    className={`${styles.storyText} ${styles.visible}`}
                    style={{ color: index % 2 ? "#2a9d8f" : "#e76f51" }}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                  >
                    {paragraph}
                  </motion.p>
                ))}
                {image && (
                  <motion.img
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    src={image}
                    alt="Story Illustration"
                    className={styles.image}
                  />
                )}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default StoryPrompt;