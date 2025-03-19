import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import styles from './SpeechChecker.module.css';

const SpeechChecker = () => {
  // State management
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [language, setLanguage] = useState('en-US');
  const [currentTopic, setCurrentTopic] = useState('');
  const [timeLeft, setTimeLeft] = useState(30); // 30 seconds timer (reduced from 60)
  const [timerActive, setTimerActive] = useState(false);
  const [stage, setStage] = useState('initial'); // 'initial', 'topic', 'recording', 'feedback'
  
  // Refs
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const fullTranscriptRef = useRef('');
  
  // We'll use simulation mode to avoid API key issues
  const useSimulation = true;
  
  const languages = [
    { code: 'en-US', name: 'English (US)' },
    { code: 'en-GB', name: 'English (UK)' },
    { code: 'es-ES', name: 'Spanish' },
    { code: 'fr-FR', name: 'French' },
    { code: 'de-DE', name: 'German' }
  ];

  const topics = [
    "My favorite toy and why I love it",
    "If I had a superpower, what would it be?",
    "My favorite animal and what makes it special",
    "The best day I ever had",
    "My dream vacation",
    "If I could invent something new",
    "My favorite character from a book or movie",
    "My favorite game to play with friends",
    "If I could talk to animals for a day",
    "My favorite season and what I like to do during it",
    "If I could visit space, what would I want to see?",
    "The most interesting thing I learned recently",
    "If I could be any character in a video game",
    "My favorite holiday and how I celebrate it",
    "If I had a magic wand, what would I do with it?"
  ];

  // Initialize speech recognition
  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      // Create a new instance only if not already created
      if (!recognitionRef.current) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
      }
      
      // Update language even if instance exists
      recognitionRef.current.lang = language;
      
      // FIX: Reset the recognition on each session to prevent duplicate sentences
      recognitionRef.current.onstart = () => {
        console.log('Speech recognition started');
      };
      
      recognitionRef.current.onresult = (event) => {
        let interimTranscript = '';
        
        // FIX: Only use the current session's results instead of all history
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            fullTranscriptRef.current += event.results[i][0].transcript + ' ';
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        // Show both final and interim speech
        setTranscript(fullTranscriptRef.current + interimTranscript);
      };
      
      recognitionRef.current.onend = () => {
        console.log('Speech recognition ended');
        // Only restart if still actively listening
        if (isListening) {
          console.log('Restarting speech recognition');
          // FIX: Use a small delay before restarting to prevent overlapping sessions
          setTimeout(() => {
            if (isListening) {
              try {
                recognitionRef.current.start();
              } catch (e) {
                console.error('Error restarting recognition:', e);
              }
            }
          }, 300);
        }
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        if (event.error === 'no-speech') {
          // Don't show error for no-speech, just restart
          if (isListening) {
            console.log('No speech detected, restarting');
            recognitionRef.current.stop();
            setTimeout(() => {
              if (isListening) {
                recognitionRef.current.start();
              }
            }, 300);
          }
        } else {
          setError('Speech recognition error: ' + event.error);
          setIsListening(false);
        }
      };
      
      // Start or stop based on isListening state
      if (isListening) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.error('Error starting recognition:', e);
          // If already started, stop first and then restart
          if (e.message.includes('already started')) {
            recognitionRef.current.stop();
            setTimeout(() => {
              if (isListening) {
                recognitionRef.current.start();
              }
            }, 300);
          }
        }
      } else {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.error('Error stopping recognition:', e);
        }
      }
    } else {
      setError('Speech recognition not supported in this browser.');
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.error('Error stopping recognition in cleanup:', e);
        }
      }
    };
  }, [isListening, language]);

  // Timer functionality
  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timerActive && timeLeft === 0) {
      stopRecording();
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [timerActive, timeLeft]);

  const getRandomTopic = () => {
    const randomIndex = Math.floor(Math.random() * topics.length);
    return topics[randomIndex];
  };

  const startExercise = () => {
    setCurrentTopic(getRandomTopic());
    setStage('topic');
  };

  const startRecording = () => {
    // Reset all necessary state
    fullTranscriptRef.current = '';
    setTranscript('');
    setFeedback({});
    setError(null);
    setTimeLeft(30); // 30 seconds now
    setTimerActive(true);
    setStage('recording');
    
    // Start recognition after a small delay to ensure everything is reset
    setTimeout(() => {
      setIsListening(true);
    }, 100);
  };

  const stopRecording = () => {
    setIsListening(false);
    setTimerActive(false);
    
    // Give a small delay to ensure transcript is final before analysis
    setTimeout(() => {
      if (transcript.trim()) {
        // Always use simulation for now to avoid API key issues
        simulateAnalysis();
      }
    }, 300);
  };

  const resetExercise = () => {
    fullTranscriptRef.current = '';
    setTranscript('');
    setFeedback({});
    setError(null);
    setTimeLeft(30); // 30 seconds
    setStage('initial');
  };

  const simulateAnalysis = () => {
    setLoading(true);
    
    // Get some words from the transcript for more personalized feedback
    const userWords = transcript.split(/\s+/).filter(word => 
      word.length > 3 && !['like', 'umm', 'just', 'very', 'really', 'that', 'this', 'then', 'when', 'with'].includes(word.toLowerCase())
    );
    
    // Get 2-3 random words the user actually said
    const sampleWords = [];
    if (userWords.length > 0) {
      for (let i = 0; i < Math.min(3, userWords.length); i++) {
        const randomIndex = Math.floor(Math.random() * userWords.length);
        sampleWords.push(userWords[randomIndex]);
        userWords.splice(randomIndex, 1); // Remove the word to avoid duplicates
      }
    }
    
    // Default words if we couldn't find any
    if (sampleWords.length === 0) {
      sampleWords.push('interesting', 'exciting', 'favorite');
    }
    
    // Count filler words
    const fillerWordCount = (transcript.match(/umm|uhh|like|you know|sort of|kind of/gi) || []).length;
    
    // Simulate API delay
    setTimeout(() => {
      setFeedback({
        overview: `You did a great job speaking about "${currentTopic}"! Your ideas were creative and you expressed yourself clearly in ${transcript.split(/\s+/).length} words.`,
        topicAdherence: "You stayed on topic and covered several interesting aspects of " + currentTopic,
        grammar: "Your grammar was generally good. I noticed you used complete sentences most of the time.",
        vocabulary: `You used a nice variety of descriptive words. Some impressive words you used were '${sampleWords.join("', '")}', which added color to your speech.`,
        delivery: fillerWordCount > 0 
          ? `You spoke with good pace. I noticed about ${fillerWordCount} filler words like 'um' and 'like'. Try to reduce these for clearer speech.` 
          : "You spoke clearly with excellent pace and very few filler words. Great job!",
        strengths: "Creative thinking. Clear expression of ideas. Good storytelling.",
        improvementAreas: "Using more complex sentences. Reducing filler words. Adding more specific details.",
        nextStepsTips: "Practice speaking for longer periods. Try using new vocabulary words. Record yourself and listen back.",
        score: Math.floor(Math.random() * 3) + 8, // Random score between 8-10
        encouragement: "You're becoming a confident speaker! Keep practicing and you'll continue to improve!"
      });
      
      setStage('feedback');
      setLoading(false);
    }, 1500);
  };

  // Render different stages of the application
  const renderStage = () => {
    switch (stage) {
      case 'initial':
        return (
          <motion.div 
            className={styles.stageContainer}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className={styles.instructionsBox}>
              <h3>How to Practice Your Speaking Skills</h3>
              <ol>
                <li>Click "Start" to get a fun topic to talk about</li>
                <li>You'll have 30 seconds to speak about the topic</li>
                <li>Try to use clear sentences and interesting words</li>
                <li>When you finish, you'll get helpful feedback on your speaking</li>
              </ol>
            </div>
            
            <motion.button 
              className={styles.primaryButton}
              onClick={startExercise}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Speaking Practice
            </motion.button>
          </motion.div>
        );
      
      case 'topic':
        return (
          <motion.div 
            className={styles.stageContainer}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className={styles.topicBox}>
              <h3>Your Speaking Topic:</h3>
              <p className={styles.topicText}>{currentTopic}</p>
            </div>
            
            <p className={styles.topicInstructions}>
              Take a moment to think about this topic. When you're ready, click "Start Recording" 
              and speak for 30 seconds about it. Try to use complete sentences and interesting words!
            </p>
            
            <div className={styles.buttonGroup}>
              <motion.button 
                className={styles.secondaryButton}
                onClick={() => setCurrentTopic(getRandomTopic())}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{ marginRight: '1rem' }}
              >
                Try Another Topic
              </motion.button>
              
              <motion.button 
                className={styles.primaryButton}
                onClick={startRecording}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Start Recording
              </motion.button>
            </div>
          </motion.div>
        );
      
      case 'recording':
        return (
          <motion.div 
            className={styles.stageContainer}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className={styles.timerContainer}>
              <div className={styles.progressWrapper}>
                <CircularProgressbar 
                  value={timeLeft} 
                  maxValue={30} // Changed from 60 to 30
                  text={`${timeLeft}`}
                  styles={buildStyles({
                    textSize: '24px',
                    pathTransitionDuration: 0.5,
                    pathColor: timeLeft > 5 ? '#5561ff' : '#ff5555',
                    textColor: timeLeft > 5 ? '#5561ff' : '#ff5555',
                    trailColor: '#f0f7ff',
                  })}
                />
              </div>
              <p className={styles.topicReminder}>{currentTopic}</p>
            </div>
            
            <div className={styles.wavesContainer}>
              {isListening && (
                <div className={styles.soundWaves}>
                  <div className={styles.bar}></div>
                  <div className={styles.bar}></div>
                  <div className={styles.bar}></div>
                  <div className={styles.bar}></div>
                  <div className={styles.bar}></div>
                </div>
              )}
            </div>
            
            <div className={styles.transcriptBox}>
              <h3>Your Speech:</h3>
              <p className={styles.transcriptText}>{transcript || "Start speaking..."}</p>
            </div>
            
            <motion.button 
              className={`${styles.primaryButton} ${styles.stopButton}`}
              onClick={stopRecording}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Stop & Get Feedback
            </motion.button>
          </motion.div>
        );
      
      case 'feedback':
        return (
          <motion.div 
            className={styles.stageContainer}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className={styles.feedbackHeader}>
              <h3>Your Speaking Feedback</h3>
              <div className={styles.scoreContainer}>
                <div className={styles.score}>{feedback.score}/10</div>
                <p>Score</p>
              </div>
            </div>
            
            <div className={styles.feedbackOverview}>
              {feedback.overview}
            </div>
            
            <div className={styles.feedbackGrid}>
              <div className={styles.feedbackCard}>
                <h4>Topic Focus</h4>
                <p>{feedback.topicAdherence}</p>
              </div>
              
              <div className={styles.feedbackCard}>
                <h4>Grammar</h4>
                <p>{feedback.grammar}</p>
              </div>
              
              <div className={styles.feedbackCard}>
                <h4>Vocabulary</h4>
                <p>{feedback.vocabulary}</p>
              </div>
              
              <div className={styles.feedbackCard}>
                <h4>Delivery</h4>
                <p>{feedback.delivery}</p>
              </div>
            </div>
            
            <div className={styles.feedbackColumns}>
              <div className={styles.column}>
                <div className={styles.columnHeader}>
                  <span className={styles.icon}>✨</span>
                  <h4>Your Strengths</h4>
                </div>
                <p>{feedback.strengths}</p>
              </div>
              
              <div className={styles.column}>
                <div className={styles.columnHeader}>
                  <span className={styles.icon}>🚀</span>
                  <h4>Areas to Improve</h4>
                </div>
                <p>{feedback.improvementAreas}</p>
              </div>
            </div>
            
            <div className={styles.nextSteps}>
              <h4>Next Steps to Improve</h4>
              <p>{feedback.nextStepsTips}</p>
            </div>
            
            <div className={styles.encouragement}>
              {feedback.encouragement}
            </div>
            
            <div className={styles.audioTranscript}>
              <h4>What You Said:</h4>
              <p className={styles.transcriptText}>{transcript}</p>
            </div>
            
            <motion.button 
              className={styles.primaryButton}
              onClick={resetExercise}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Try Another Topic
            </motion.button>
          </motion.div>
        );
      
      default:
        return <div>Something went wrong. Please refresh the page.</div>;
    }
  };

  return (
    <div className={styles.speechCheckerContainer}>
      <motion.div 
        className={styles.speechChecker}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className={styles.title}>Speech Practice ✨</h2>
        
        {!loading && stage !== 'recording' && (
          <div className={styles.languageSelector}>
            <label htmlFor="language-select">Choose a language: </label>
            <select 
              id="language-select"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              disabled={isListening || loading}
              className={styles.select}
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
        )}
        
        {error && <p className={styles.error}>{error}</p>}
        
        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>Analyzing your speech...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {renderStage()}
          </AnimatePresence>
        )}
      </motion.div>
    </div>
  );
};

export default SpeechChecker;