import React, { useState, useRef } from "react";
import constants from "../utils/constants";
import classnames from "classnames";
import popSound from "../../assets/sounds/pop.mp3"; // Add your pop sound file
import "./Balloon.css";

const balloonColors = [
  "#FF6B6B", // red
  "#4834D4", // blue
  "#2ED573", // green
  "#BE2EDD", // purple
  "#FF9F43"  // orange
];

const Balloon = ({ id, letter, isActive, onClick }) => {
  const [isPopped, setIsPopped] = useState(false);
  const [isPopping, setIsPopping] = useState(false);
  const audioRef = useRef(new Audio(popSound));
  const balloonColor = balloonColors[id % balloonColors.length]; // Cycle through colors

  const classNames = classnames("balloon balloon--moving", {
    "balloon--active": isActive,
    "balloon--popping": isPopped,
    "balloon--popping-effect": isPopping,
  });

  const clickHandler = () => {
    if (!isPopped) {
      setIsPopped(true);
      setIsPopping(true);
      audioRef.current.play();
      onClick(letter);

      setTimeout(() => {
        setIsPopping(false);
        setIsPopped(false);
      }, constants.randomnessLimits.lower);
    }
  };

  const balloonWidth = constants.balloonWidth;
  const balloonHeight = balloonWidth * 1.17;
  const threadHeight = constants.threadHeight;

  return (
    <div className="balloon-cell" style={{ color: balloonColor }}>
      <div onClick={clickHandler} className={classNames}>
        <svg
          className="balloon-svg"
          xmlns="http://www.w3.org/2000/svg"
          viewBox={`0 0 ${balloonWidth} ${balloonHeight + threadHeight}`}
        >
          <defs>
            <radialGradient
              id={`balloon-gradient-${id}`}
              cx="40%"
              cy="40%"
              r="50%"
              fx="30%"
              fy="30%"
            >
              <stop offset="0%" stopColor="#fff" />
              <stop offset="100%" stopColor="currentColor" />
            </radialGradient>
            <filter
              id={`balloon-shadow-${id}`}
              x="0"
              y="0"
              width="100%"
              height="100%"
            >
              <feMerge>
                <feMergeNode in="offsetBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <rect
            x={balloonWidth / 2}
            y={balloonHeight}
            width="1"
            height={threadHeight}
            fill="currentColor"
          />
          <polygon
            points={`${balloonWidth / 2},${balloonHeight - 3} ${
              balloonWidth / 2 + 8
            },${balloonHeight + 5} ${balloonWidth / 2 - 8},${
              balloonHeight + 5
            }`}
            fill="currentColor"
          />
          <ellipse
            cx={balloonWidth / 2}
            cy={balloonHeight / 2}
            rx={balloonWidth / 2}
            ry={balloonHeight / 2}
            fill={`url(#balloon-gradient-${id})`}
            filter={`url(#balloon-shadow-${id})`}
          />
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dy=".3em"
            fontSize="24"
            fill="#000"
          >
            {letter}
          </text>
        </svg>
      </div>
    </div>
  );
};

export default Balloon;
