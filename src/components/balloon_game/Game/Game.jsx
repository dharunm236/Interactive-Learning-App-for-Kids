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
import { db, auth } from "../../../firebaseConfig";
import { doc, updateDoc, arrayUnion, setDoc, getDoc } from "firebase/firestore";
import Celebration from "../Celebration/Celebration";
import { onAuthStateChanged } from "firebase/auth";

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
  
    const gameId = "balloonGame";
    const gameRef = doc(db, "games", gameId);
    const playedGamesRef = doc(db, "played_games", userId);
  
    try {
      const gameSnap = await getDoc(gameRef);
      if (gameSnap.exists()) {
        console.log("Game document exists. Updating...");
        await updateDoc(gameRef, {
          players: arrayUnion({ userId, username, points: finalScore }),
        });
      } else {
        console.log("Game document does not exist. Creating new...");
        await setDoc(gameRef, {
          players: [{ userId, username, points: finalScore }],
        });
      }
  
      const playedGamesSnap = await getDoc(playedGamesRef);
      if (playedGamesSnap.exists()) {
        console.log("Played games document exists. Updating...");
        await updateDoc(playedGamesRef, {
          gamesPlayed: arrayUnion({ gameId, points: finalScore }),
        });
      } else {
        console.log("Played games document does not exist. Creating new...");
        await setDoc(playedGamesRef, {
          gamesPlayed: [{ gameId, points: finalScore }],
        });
      }
  
      console.log("Game result saved successfully!");
    } catch (error) {
      console.error("Error saving game result:", error);
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
    const randomWord = words[Math.floor(Math.random() * words.length)];
    setSelectedWord(randomWord);
    setCurrentLetterIndex(0);
    setFilledGaps([]);
  };

  //Start the game
  const startGame = () => {
    const randomWord = words[Math.floor(Math.random() * words.length)];
    setSelectedWord(randomWord);
    setGameStarted(true);
    setScore(0);
    setTimeRemaining(gameDuration);
    setGameStopped(false);
    setCurrentLetterIndex(0);
    setFilledGaps([]);
  };

  //Stop the game and save score
  const stopGame = () => {
    console.log("Stopping game...");
    console.log("User:", user);
  
    setGameStarted(false);
    setGameStopped(true);
  
    if (user) {
      console.log("Saving score for user:", user.uid, "Score:", score);
      saveGameResult(user.uid, user.displayName || "Unknown", score);
    } else {
      console.log("User is not logged in!");
    }
  };
  

  //S peak the word
  const speakWord = () => {
    const utterance = new SpeechSynthesisUtterance(selectedWord);
    speechSynthesis.speak(utterance);
  };

  return (
    <div className="balloon-game-wrapper">
      <div className="game-container">
        {(!gameStarted || gameStopped) && (
          <CoverScreen score={score} onStartGame={startGame} duration={Constants.gameDuration} />
        )}
        <CSSTransition in={gameStarted} timeout={250} classNames="balloons-screen" mountOnEnter unmountOnExit>
          {(state) => (
            <div className={`balloons-screen balloons-screen--${state}`}>
              <div className="game-nav">
                <h1 className="instructions">Press the 🔊 button to hear the word</h1>
                <Button onClick={speakWord}>🔊</Button>
                <div className="game-settings">
                  <ScoreCard score={score} time={timeRemaining} />
                  <Button type={"alert"} onClick={stopGame}>Stop</Button>
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
