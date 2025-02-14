import React, { useState, useRef, useEffect } from "react";
import BalloonGrid from "../BalloonGrid/BalloonGrid";
import CoverScreen from "../CoverScreen/CoverScreen";
import ScoreCard from "../ScoreCard/ScoreCard";
import { CSSTransition } from "react-transition-group";
import Constants from "../../utils/constants";
import Toast from "../Toast/Toast";
import Button from "../Button/Button";
import words from "../../utils/words";
import "./Game.css";
import Celebration from "../Celebration/Celebration";

const Game = ({ numberOfBalloons, gameDuration }) => {
  const [gameStarted, setGameStarted] = useState(false);
  const [activeBalloons, setActiveBalloons] = useState([]);
  const [score, setScore] = useState(-1);
  const [timeRemaining, setTimeRemaining] = useState(gameDuration);
  const [gameStopped, setGameStopped] = useState(false);
  const [hit, setHit] = useState(false);
  const [selectedWord, setSelectedWord] = useState("");
  const [currentLetterIndex, setCurrentLetterIndex] = useState(0);
  const [filledGaps, setFilledGaps] = useState([]);
  const [showCelebration, setShowCelebration] = useState(false);

  const timerRef = useRef(null);

  useEffect(() => {
    if (gameStarted && !gameStopped) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prevTimeRemaining) => {
          if (prevTimeRemaining > 0) {
            return prevTimeRemaining - 1;
          } else {
            clearInterval(timerRef.current);
            setGameStarted(false);
            return 0;
          }
        });
      }, 1000);
    }

    return () => {
      clearInterval(timerRef.current);
    };
  }, [gameStarted, gameStopped]);

  const handleBalloonClick = (letter) => {
    if (letter.toLowerCase() === selectedWord[currentLetterIndex].toLowerCase()) {
      setScore((prevScore) => prevScore + 1);
      setHit(true);
      
      // Update filled gaps with the correct letter
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

      setTimeout(() => {
        setHit(false);
      }, Constants.randomnessLimits.lower);
    }
  };

  const handleCelebrationComplete = () => {
    setShowCelebration(false);
    const randomWord = words[Math.floor(Math.random() * words.length)];
    setSelectedWord(randomWord);
    setCurrentLetterIndex(0);
    setFilledGaps([]);
  };

  const startGame = () => {
    const randomWord = words[Math.floor(Math.random() * words.length)];
    setSelectedWord(randomWord);
    setGameStarted(true);
    setScore(0);
    setActiveBalloons([]);
    setTimeRemaining(gameDuration);
    setGameStopped(false);
    setCurrentLetterIndex(0);
    setFilledGaps([]);
  };

  const stopGame = () => {
    setGameStarted(false);
    setGameStopped(true);
  };

  const speakWord = () => {
    const utterance = new SpeechSynthesisUtterance(selectedWord);
    speechSynthesis.speak(utterance);
  };

  return (
    <div className="balloon-game-wrapper"> {/* Add this wrapper */}
      <div className="game-container">
        {(!gameStarted || gameStopped) && (
          <CoverScreen
            score={score}
            onStartGame={startGame}
            duration={Constants.gameDuration}
          />
        )}
        <CSSTransition
          in={gameStarted}
          timeout={250}
          classNames="balloons-screen"
          mountOnEnter
          unmountOnExit
        >
          {(state) => (
            <div className={`balloons-screen balloons-screen--${state}`}>
              <div className="game-nav">
                <h1 className="instructions">Press the 🔊 button to hear the word</h1>
                <Button onClick={speakWord}>🔊</Button>
                <div className="game-settings">
                  <ScoreCard score={score} time={timeRemaining} />
                  <Button type={"alert"} onClick={stopGame}>
                    Stop
                  </Button>
                  
                </div>
              </div>
              <div className="gaps">
                {selectedWord.split("").map((_, index) => (
                  <span key={index} className="gap">
                    {filledGaps[index] || "_"}
                  </span>
                ))}
              </div>
              <BalloonGrid
                numberOfBalloons={numberOfBalloons}
                onBalloonClick={handleBalloonClick}
                selectedWord={selectedWord}
                currentLetterIndex={currentLetterIndex}
              />
            </div>
          )}
        </CSSTransition>
        <Toast message={"+1 hits"} trigger={hit} />
        <Celebration 
          trigger={showCelebration} 
          onComplete={handleCelebrationComplete}
        />
      </div>
    </div>
  );
};

export default Game;
