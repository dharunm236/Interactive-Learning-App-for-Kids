import { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { CONFIG } from '../config/gameConfig';
import soundService from '../services/soundService';
import { db, auth } from '../../../firebaseConfig';
import { collection, getDocs, doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

const GameContext = createContext();

export function GameProvider({ children }) {
  const [gameState, setGameState] = useState('start');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(CONFIG.LIVES);
  const [shipPos, setShipPos] = useState(50);
  const [lasers, setLasers] = useState([]);
  const [aliens, setAliens] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [alienDirection, setAlienDirection] = useState(1);
  const [debug, setDebug] = useState('');
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [answeredQuestions, setAnsweredQuestions] = useState([]);
  
  // Check authentication
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUserId(user.uid);
        // You could load previous game data here if needed
      }
    });
    
    return () => unsubscribe();
  }, []);

  // Fetch questions from Firestore
  const fetchQuestions = async () => {
    try {
      setIsLoading(true);
      setDebug('Fetching questions from Firestore...');
      
      const questionsRef = collection(db, 'invaderquiz');
      const querySnapshot = await getDocs(questionsRef);
      
      if (querySnapshot.empty) {
        console.error('No questions found in Firestore');
        setDebug('No questions found in database. Using fallback questions.');
        // Use fallback questions if none are found
        return [
          {
            question: "What's 2 + 2?",
            answers: ["3", "4", "5"],
            correct: 1
          },
          {
            question: "Capital of France?",
            answers: ["London", "Berlin", "Paris"],
            correct: 2
          }
        ];
      }
      
      // Convert Firestore data to array of question objects
      const allQuestions = [];
      querySnapshot.forEach(doc => {
        const data = doc.data();
        allQuestions.push({
          id: doc.id,
          question: data.question,
          answers: data.answers,
          correct: data.correct
        });
      });
      
      // Shuffle and get 5 random questions
      const shuffled = allQuestions.sort(() => 0.5 - Math.random());
      const selectedQuestions = shuffled.slice(0, 5);
      
      setDebug(`Loaded ${selectedQuestions.length} questions from Firestore`);
      return selectedQuestions;
      
    } catch (error) {
      console.error('Error fetching questions:', error);
      setDebug(`Error fetching questions: ${error.message}`);
      // Return fallback questions on error
      return [
        {
          question: "What's 2 + 2?",
          answers: ["3", "4", "5"],
          correct: 1
        },
        {
          question: "Capital of France?",
          answers: ["London", "Berlin", "Paris"],
          correct: 2
        }
      ];
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize sound system and fetch questions
  useEffect(() => {
    soundService.initialize();
    fetchQuestions().then(fetchedQuestions => {
      setQuestions(fetchedQuestions);
    });
  }, []);

  // Initialize aliens grid
  function initializeAliens() {
    const newAliens = [];
    
    // Change from grid to single row of 5 aliens
    const ALIEN_COUNT = 5;
    
    for (let i = 0; i < ALIEN_COUNT; i++) {
      // Position aliens evenly across the top portion of the screen
      // First alien at 15%, last at 85%, evenly spaced between
      const xPos = 15 + (i * (70 / (ALIEN_COUNT - 1)));
      
      newAliens.push({
        id: i,
        alive: true,
        x: xPos, // Evenly distribute horizontally
        y: 15    // Fixed height for single row
      });
    }
    
    return newAliens;
  }

  // Fire laser function
  const fireLaser = () => {
    soundService.play('LASER_SHOOT');
    setLasers(prev => [...prev, { x: shipPos, y: 90 }]);
  };

  // Handle keyboard controls
  const handleKeyDown = useCallback((e) => {
    if (gameState !== 'playing') return;
    
    if (e.key === 'ArrowLeft') {
      setShipPos(p => Math.max(0, p - CONFIG.SHIP_SPEED));
    } else if (e.key === 'ArrowRight') {
      setShipPos(p => Math.min(90, p + CONFIG.SHIP_SPEED));
    } else if (e.key === ' ') {
      // Only spacebar will fire manually, Enter key is removed
      fireLaser();
    }
  }, [gameState, shipPos]);

  // Handle laser movement
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const moveLasers = () => {
      setLasers(prev => 
        prev.filter(laser => laser.y > 0)
          .map(laser => ({ ...laser, y: laser.y - CONFIG.LASER_SPEED }))
      );
    };

    const interval = setInterval(moveLasers, 16);
    return () => clearInterval(interval);
  }, [gameState]);

  // Check collisions
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    lasers.forEach(laser => {
      const hitAlien = aliens.find(a => 
        a.alive && 
        Math.abs(a.x - laser.x) < 10 && 
        Math.abs(a.y - laser.y) < 10    
      );

      if (hitAlien) {
        setAliens(prev => 
          prev.map(a => 
            a.id === hitAlien.id ? { ...a, alive: false } : a
          )
        );
        soundService.play('EXPLOSION');
        setScore(s => s + 100);
        setLasers(prev => prev.filter(l => l !== laser));
      }
    });
  }, [lasers, aliens, gameState]);

  // Handle game state changes
  useEffect(() => {
    if (lives <= 0) {
      soundService.play('GAME_OVER');
      soundService.stopBackgroundMusic();
      setGameState('lost');
      saveGameResults('failed');
    }
    if (aliens.length > 0 && aliens.every(a => !a.alive)) {
      soundService.play('LEVEL_COMPLETE');
      soundService.stopBackgroundMusic();
      setGameState('won');
      saveGameResults('completed');
    }
  }, [lives, aliens]);

  // Save game results to Firestore
  const saveGameResults = async (status) => {
    if (!userId) return;
    
    try {
      const gameRef = doc(db, "invaderQuizResults", userId);
      const gameDoc = await getDoc(gameRef);
      
      // Gather data about answered questions
      const answeredQuestionsData = answeredQuestions.map(idx => {
        const q = questions[idx % questions.length];
        return {
          question: q.question,
          userAnswerIndex: q.userAnswerIndex,
          correctAnswerIndex: q.correct,
          isCorrect: q.userAnswerIndex === q.correct
        };
      });
      
      const gameResultData = {
        userId: userId,
        completed: status === 'completed',
        completedAt: serverTimestamp(),
        score: score,
        lives: lives,
        status: status,
        questionsAnswered: answeredQuestions.length,
        answeredQuestions: answeredQuestionsData,
        lastUpdated: serverTimestamp()
      };
      
      if (gameDoc.exists()) {
        // Update existing document
        const prevAttempts = gameDoc.data().attempts || 1;
        await updateDoc(gameRef, {
          ...gameResultData,
          attempts: prevAttempts + 1,
          highestScore: Math.max(gameDoc.data().highestScore || 0, score)
        });
      } else {
        // Create new document
        await setDoc(gameRef, {
          ...gameResultData,
          firstAttemptAt: serverTimestamp(),
          attempts: 1,
          highestScore: score
        });
      }
    } catch (error) {
      console.error("Error saving game results:", error);
    }
  };

  // Event listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Refresh questions for new game
  const refreshQuestions = async () => {
    const newQuestions = await fetchQuestions();
    setQuestions(newQuestions);
    return newQuestions;
  };

  // Game functions
  const startGame = async () => {
    console.log("Starting game...");
    
    // Refresh questions for new game
    const gameQuestions = await refreshQuestions();
    
    // Reset answered questions tracking
    setAnsweredQuestions([]);
    
    // Force state updates in a single callback to ensure they happen together
    setGameState('playing');
    
    // Use setTimeout to ensure the state change happens before other updates
    setTimeout(() => {
      setLives(CONFIG.LIVES);
      setAliens(initializeAliens());
      setScore(0);
      setShipPos(50);
      setLasers([]);
      setAlienDirection(1);
      setCurrentQuestion(0);
      setDebug('Game started at ' + new Date().toISOString());
      
      // Start background music
      soundService.stopAll();
      soundService.startBackgroundMusic();
      
      console.log("State updates completed");
    }, 0);
  };

  const handleAnswer = (answerIndex) => {
    if (!questions || questions.length === 0) {
      console.error('No questions available');
      return;
    }
    
    // Update the question with user's answer
    const updatedQuestions = [...questions];
    updatedQuestions[currentQuestion % questions.length].userAnswerIndex = answerIndex;
    setQuestions(updatedQuestions);
    
    // Track which questions have been answered
    setAnsweredQuestions(prev => [...prev, currentQuestion % questions.length]);
    
    if (questions[currentQuestion % questions.length].correct === answerIndex) {
      soundService.play('CORRECT_ANSWER');
      fireLaser();
    } else {
      soundService.play('WRONG_ANSWER');
      setLives(l => l - 1);
    }
    setCurrentQuestion((prev) => (prev + 1) % questions.length);
  };

  const value = {
    gameState,
    score,
    lives,
    shipPos,
    lasers,
    aliens,
    currentQuestion,
    startGame,
    handleAnswer,
    questions,
    isLoading,
    debug
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  return useContext(GameContext);
}