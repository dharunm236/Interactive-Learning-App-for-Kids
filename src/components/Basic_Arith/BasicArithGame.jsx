import React, { useState, useEffect } from "react";
import "./BasicArithGame.css";

const operators = ["+", "-", "*"];

const BasicArithGame = () => {
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [correctOperator, setCorrectOperator] = useState("");
  const [options, setOptions] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    generateProblem();
  }, []);

  const calculate = (num1, operator, num2) => {
    switch (operator) {
      case "+":
        return num1 + num2;
      case "-":
        return num1 - num2;
      case "*":
        return num1 * num2;
      default:
        throw new Error("Invalid operator");
    }
  };

  const generateProblem = () => {
    const newNum1 = Math.floor(Math.random() * 10) + 1;
    const newNum2 = Math.floor(Math.random() * 10) + 1;
    const randomOp = operators[Math.floor(Math.random() * operators.length)];

    setNum1(newNum1);
    setNum2(newNum2);
    setCorrectOperator(randomOp);
    setCorrectAnswer(calculate(newNum1, randomOp, newNum2));

    generateOptions(calculate(newNum1, randomOp, newNum2), randomOp);
    setMessage("");
  };

  const generateOptions = (answer, operator) => {
    let optionsList = [answer, operator];

    while (optionsList.length < 6) {
      let randNum = Math.floor(Math.random() * 20) - 5;
      let randOp = operators[Math.floor(Math.random() * operators.length)];

      if (!optionsList.includes(randNum) && typeof randNum === "number") {
        optionsList.push(randNum);
      }
      if (!optionsList.includes(randOp)) {
        optionsList.push(randOp);
      }
    }

    setOptions(optionsList.sort(() => Math.random() - 0.5));
  };

  const handleDragStart = (event, value) => {
    event.dataTransfer.setData("text", value);
    // Play drag sound (if you have an audio element)
    const dragSound = document.getElementById("dragSound");
    if (dragSound) dragSound.play();
  };

  const handleDrop = (event, zone) => {
    event.preventDefault();
    const droppedValue = event.dataTransfer.getData("text");

    if (
      (zone === "answer" && droppedValue == correctAnswer) ||
      (zone === "operator" && droppedValue === correctOperator)
    ) {
      event.target.textContent = droppedValue;
      event.target.classList.add("dropped");
      // Play win sound (if you have an audio element)
      const winSound = document.getElementById("winSound");
      if (winSound) winSound.play();
      setMessage("✅ Correct!");
    } else {
      setMessage("❌ Try Again!");
    }
  };

  return (
    <div className="arith-game">
      <h1>Math Drag & Drop Game</h1>
      <div className="game-container">
        <div className="problem">
          <span>{num1}</span>
          <div
            id="operatorZone"
            className="drop-zone"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, "operator")}
          >
            ?
          </div>
          <span>{num2}</span>
          <span>=</span>
          <div
            id="answerZone"
            className="drop-zone"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, "answer")}
          >
            ?
          </div>
        </div>

        <div id="optionsContainer" className="options">
          {options.map((option, index) => (
            <div
              key={index}
              className="option"
              draggable
              onDragStart={(e) => handleDragStart(e, option)}
            >
              {option}
            </div>
          ))}
        </div>
        <button onClick={generateProblem}>New Problem</button>
      </div>

      <p>{message}</p>

      {/* Audio elements for sounds */}
      <audio id="dragSound" src="/sounds/match.wav" preload="auto"></audio>
      <audio id="winSound" src="/sounds/win.wav" preload="auto"></audio>
    </div>
  );
};

export default BasicArithGame;