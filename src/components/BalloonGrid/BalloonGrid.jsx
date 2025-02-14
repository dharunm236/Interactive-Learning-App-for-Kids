import React, { useState, useEffect, useRef } from "react";
import Balloon from "../Balloon/Balloon";
import Constants from "../../utils/constants";
import getRandomNumber from "../../utils/randomNumber";
import "./BalloonGrid.css";

const BalloonGrid = ({ numberOfBalloons, onBalloonClick, selectedWord, currentLetterIndex }) => {
  const [activeBalloons, setActiveBalloons] = useState([]);
  const [balloonLetters, setBalloonLetters] = useState([]);
  const intervalIdsRef = useRef([]);
  const balloonCountRef = useRef(0);

  useEffect(() => {
    intervalIdsRef.current = [];
    balloonCountRef.current = 0;

    const generateRandomBalloon = () => {
      const randomBalloonId = Math.floor(Math.random() * numberOfBalloons);
      balloonCountRef.current++;

      setActiveBalloons((prevActiveBalloons) => {
        if (prevActiveBalloons.includes(randomBalloonId)) {
          return prevActiveBalloons.filter(
            (activeId) => activeId !== randomBalloonId
          );
        } else {
          return [...prevActiveBalloons, randomBalloonId];
        }
      });

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

    return () => {
      intervalIdsRef.current.forEach((intervalId) => clearInterval(intervalId));
    };
  }, [numberOfBalloons, selectedWord, currentLetterIndex]);

  const getRandomLetter = (excludeLetter) => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('')
      .filter(letter => letter !== excludeLetter);
    return letters[Math.floor(Math.random() * letters.length)];
  };

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
    <div className="balloon-grid-wrapper">
      <p className="balloon-grid-caption">Click a balloon to score</p>
      <div className="balloon-grid">{balloons}</div>
    </div>
  );
};

export default BalloonGrid;
