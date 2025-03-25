import React, { useState, useEffect, useRef } from "react";
import Balloon from "../Balloon/Balloon";
import Constants from "../utils/constants";
import getRandomNumber from "../utils/randomNumber";
import "./BalloonGrid.css";

// Secure random number generator
const getSecureRandom = (max) => {
  const array = new Uint32Array(1);
  window.crypto.getRandomValues(array);
  return array[0] % max;
};

// Helper function for getting random letters
const getRandomLetter = (excludeLetter) => {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('')
    .filter(letter => letter !== excludeLetter);
  return letters[getSecureRandom(letters.length)];
};

const BalloonGrid = ({ numberOfBalloons, onBalloonClick, selectedWord, currentLetterIndex }) => {
  const [activeBalloons, setActiveBalloons] = useState([]);
  const [balloonLetters, setBalloonLetters] = useState([]);
  const intervalIdsRef = useRef([]);
  const balloonCountRef = useRef(0);

  // Function to update active balloons
  const updateActiveBalloons = (randomBalloonId) => {
    setActiveBalloons((prevActiveBalloons) => {
      if (prevActiveBalloons.includes(randomBalloonId)) {
        return prevActiveBalloons.filter(
          (activeId) => activeId !== randomBalloonId
        );
      } else {
        return [...prevActiveBalloons, randomBalloonId];
      }
    });
  };

  // Function to update balloon letters
  const updateBalloonLetters = (randomBalloonId) => {
    setBalloonLetters((prevLetters) => {
      const newLetters = [...prevLetters];
      // Every 4th balloon should contain the correct letter
      if (balloonCountRef.current % 4 === 0 && selectedWord && currentLetterIndex < selectedWord.length) {
        newLetters[randomBalloonId] = selectedWord[currentLetterIndex];
      } else {
        newLetters[randomBalloonId] = getRandomLetter(selectedWord[currentLetterIndex]);
      }
      return newLetters;
    });
  };

  // Function to generate a random balloon
  const generateRandomBalloon = () => {
    const randomBalloonId = getSecureRandom(numberOfBalloons);
    balloonCountRef.current++;
    
    updateActiveBalloons(randomBalloonId);
    updateBalloonLetters(randomBalloonId);
  };

  useEffect(() => {
    intervalIdsRef.current = [];
    balloonCountRef.current = 0;

    // Setup intervals for balloon generation
    for (let i = 0; i < numberOfBalloons; i++) {
      const intervalId = setInterval(
        generateRandomBalloon,
        getRandomNumber(
          Constants.randomnessLimits.lower,
          Constants.randomnessLimits.upper
        )
      );
      intervalIdsRef.current.push(intervalId);
    }

    // Cleanup intervals on unmount
    return () => {
      intervalIdsRef.current.forEach((intervalId) => clearInterval(intervalId));
    };
  }, [numberOfBalloons, selectedWord, currentLetterIndex]);

  const balloons = [];

  for (let i = 0; i < numberOfBalloons; i++) {
    balloons.push(
      <Balloon
        key={i}
        id={i}
        letter={balloonLetters[i] || getRandomLetter(selectedWord[currentLetterIndex])}
        isActive={activeBalloons.includes(i)}
        onClick={onBalloonClick}
      />
    );
  }

  return (
    <div className="balloon-game-wrapper">
      <div className="balloon-grid-wrapper">
        <p className="balloon-grid-caption">Click a balloon to score</p>
        <div className="balloon-grid">{balloons}</div>
      </div>
    </div>
  );
};

export default BalloonGrid;
