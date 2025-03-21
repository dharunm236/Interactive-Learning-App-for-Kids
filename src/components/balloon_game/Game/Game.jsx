import React, { useState, useRef, useEffect } from "react";
import BalloonGrid from "../BalloonGrid/BalloonGrid";
import CoverScreen from "../CoverScreen/CoverScreen";
import ScoreCard from "../ScoreCard/ScoreCard";
import { CSSTransition } from "react-transition-group";
import Constants from "../utils/constants";
import Toast from "../Toast/Toast";
import Button from "../Button/Button";
import words from "../utils/words";
import "./Game.css";
import SpButton from "./spButton";
import { db, auth } from "../../../firebaseConfig";
import { doc, updateDoc, arrayUnion, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import Celebration from "../Celebration/Celebration";
import { onAuthStateChanged } from "firebase/auth";

const getSecureRandom = (max) => {
  const array = new Uint32Array(1);
  window.crypto.getRandomValues(array);
  return array[0] % max;
};

const Game = ({ numberOfBalloons, gameDuration }) => {
  const [gameStarted, setGameStarted] = useState(false);
  const [activeBalloons, setActiveBalloons] = useState([]);
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(gameDuration);
  const [gameStopped, setGameStopped] = useState(false);
  const [hit, setHit] = useState(false);
  const [selectedWord, setSelectedWord] = useState("");
  const [currentLetterIndex, setCurrentLetterIndex] = useState(0);
  const [filledGaps, setFilledGaps] = useState([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [user, setUser] = useState(null);
  const [justCompleted, setJustCompleted] = useState(false); // new state

  const timerRef = useRef(null);

  // Fetch the authenticated user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Game Timer Logic
  useEffect(() => {
    if (gameStarted && !gameStopped) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prevTimeRemaining) => {
          if (prevTimeRemaining > 1) {
            return prevTimeRemaining - 1;
          } else {
            clearInterval(timerRef.current);
            setGameStarted(false);
            setGameStopped(true);
            return 0;
          }
        });
      }, 1000);
    }

    return () => clearInterval(timerRef.current);
  }, [gameStarted, gameStopped]);

  //  Save Game Result to Firebase

  const saveGameResult = async (userId, username, finalScore) => {
    console.log("Saving game result...");
    console.log("UserID:", userId, "Username:", username, "Score:", finalScore);
  
    if (!userId) {
      console.error("Cannot save game result: userId is null or undefined");
      return;
    }
  
    const gameId = "balloonGame";
    const gameRef = doc(db, "games", gameId);
    const playedGamesRef = doc(db, "played_games", userId);
  
    try {
      // Use a regular JavaScript Date for arrayUnion operations
      // This will be converted to a Firestore timestamp when stored
      const jsTimestamp = new Date();
      
      const gameSnap = await getDoc(gameRef);
      if (gameSnap.exists()) {
        console.log("Game document exists. Updating...");
        await updateDoc(gameRef, {
          players: arrayUnion({ 
            userId, 
            username, 
            points: finalScore, 
            createdAt: jsTimestamp  // Use JavaScript Date instead of serverTimestamp()
          }),
        });
        console.log("Game document updated successfully");
      } else {
        console.log("Game document does not exist. Creating new...");
        // For set operations, we can use serverTimestamp()
        await setDoc(gameRef, {
          players: [{ 
            userId, 
            username, 
            points: finalScore, 
            createdAt: jsTimestamp  // Use JavaScript Date instead of serverTimestamp()
          }],
          lastUpdated: serverTimestamp()  // We can use serverTimestamp() directly here
        });
        console.log("Game document created successfully");
      }
  
      const playedGamesSnap = await getDoc(playedGamesRef);
      if (playedGamesSnap.exists()) {
        console.log("Played games document exists. Updating...");
        await updateDoc(playedGamesRef, {
          gamesPlayed: arrayUnion({ 
            gameId, 
            points: finalScore, 
            createdAt: jsTimestamp  // Use JavaScript Date instead of serverTimestamp()
          }),
          lastUpdated: serverTimestamp()  // We can use serverTimestamp() directly here
        });
        console.log("User played games document updated successfully");
      } else {
        console.log("Played games document does not exist. Creating new...");
        await setDoc(playedGamesRef, {
          gamesPlayed: [{ 
            gameId, 
            points: finalScore, 
            createdAt: jsTimestamp  // Use JavaScript Date instead of serverTimestamp()
          }],
          lastUpdated: serverTimestamp()  // We can use serverTimestamp() directly here
        });
        console.log("User played games document created successfully");
      }
  
      console.log("Game result saved successfully!");
    } catch (error) {
      console.error("Error saving game result:", error);
      console.error("Error details:", error.code, error.message);
    }
  };
  
  

  //  Handle Balloon Click
  const handleBalloonClick = (letter) => {
    if (letter.toLowerCase() === selectedWord[currentLetterIndex].toLowerCase()) {
      setScore((prevScore) => prevScore + 1);
      setHit(true);

      setFilledGaps((prevGaps) => {
        const newGaps = [...prevGaps];
        newGaps[currentLetterIndex] = selectedWord[currentLetterIndex];
        return newGaps;
      });

      setCurrentLetterIndex((prevIndex) => {
        const newIndex = prevIndex + 1;
        if (newIndex === selectedWord.length) {
          setShowCelebration(true);
        }
        return newIndex;
      });

      setTimeout(() => setHit(false), Constants.randomnessLimits.lower);
    }
  };

  const handleCelebrationComplete = () => {
    setShowCelebration(false);
    const randomWord = words[getSecureRandom(words.length)];
    setSelectedWord(randomWord);
    setCurrentLetterIndex(0);
    setFilledGaps([]);
  };

  //Start the game
  const startGame = () => {
    const randomWord = words[getSecureRandom(words.length)];
    setSelectedWord(randomWord);
    setGameStarted(true);
    setScore(0);
    setTimeRemaining(gameDuration);
    setGameStopped(false);
    setCurrentLetterIndex(0);
    setFilledGaps([]);
    setJustCompleted(false); // Reset justCompleted when starting a new game
  };

  //Stop the game and save score
  const stopGame = () => {
    // Add more obvious console logs
    console.log("%c STOPPING GAME", "background: red; color: white; font-size: 20px");
    console.log("%c User object:", "background: yellow; color: black", user);
    
    setGameStarted(false);
    setGameStopped(true);
    setJustCompleted(true); // Set justCompleted to true when the game stops
  
    // Force the function to run after state updates
    setTimeout(() => {
      if (user && user.uid) {
        console.log("%c Attempting to save score", "background: green; color: white", {
          uid: user.uid,
          displayName: user.displayName,
          score: score
        });
        
        try {
          saveGameResult(user.uid, user.displayName || "Unknown", score);
        } catch (error) {
          console.error("Error in stopGame function:", error);
        }
      } else {
        console.error("%c User is not logged in or missing uid", "background: red; color: white", user);
      }
    }, 100);
  };

  //S peak the word
  const speakWord = () => {
    const utterance = new SpeechSynthesisUtterance(selectedWord);
    speechSynthesis.speak(utterance);
  };

  // Add an effect to log when the game ends due to timer
  useEffect(() => {
    if (timeRemaining === 0 && !gameStarted && gameStopped) {
      console.log("%c Game ended due to timer", "background: orange; color: black");
      
      // Set justCompleted to true when the game ends due to timer
      setJustCompleted(true);
      
      if (user && user.uid) {
        console.log("%c Auto-saving score after timer end", "background: green; color: white");
        try {
          saveGameResult(user.uid, user.displayName || "Unknown", score);
        } catch (error) {
          console.error("Error auto-saving score:", error);
        }
      }
    }
  }, [timeRemaining, gameStarted, gameStopped]);

  return (
    <div className="balloon-game">
      <div className="balloon-game-container">
        {(!gameStarted || gameStopped) && (
          <CoverScreen score={score} onStartGame={startGame} duration={Constants.gameDuration} justCompleted={justCompleted} /> // Pass the justCompleted state
        )}
        <CSSTransition in={gameStarted} timeout={250} classNames="balloons-screen" mountOnEnter unmountOnExit>
          {(state) => (
            <div className={`balloons-screen balloons-screen--${state}`}>
              <div className="game-nav">
                <div className="balinstructions-container">
                  <h1 className="balinstructions">Press the 🔊 button to hear the word</h1>
                  <SpButton onClick={speakWord} />
                </div>
                <div className="game-settings">
                  <ScoreCard score={score} time={timeRemaining} />
                  <Button type="alert" onClick={stopGame}>Stop</Button>
                </div>
              </div>
              <div className="gaps">
                {selectedWord.split("").map((_, index) => (
                  <span key={index} className="gap">{filledGaps[index] || "_"}</span>
                ))}
              </div>
              <BalloonGrid numberOfBalloons={numberOfBalloons} onBalloonClick={handleBalloonClick} selectedWord={selectedWord} currentLetterIndex={currentLetterIndex} />
            </div>
          )}
        </CSSTransition>
        <Toast message={"+1 hits"} trigger={hit} />
        <Celebration trigger={showCelebration} onComplete={handleCelebrationComplete} />
      </div>
    </div>
  );
};

export default Game;
