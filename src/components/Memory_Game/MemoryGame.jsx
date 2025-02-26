import React, { useState, useEffect } from "react";
import "./MemoryGame.css"; // Add CSS styles for game layout

const icons = ["🍎", "🍌", "🍇", "🍉", "🍒", "🥑", "🥕", "🌽", "🍍", "🍑", "🥭", "🥥"];

const shuffleArray = (array) => [...array].sort(() => Math.random() - 0.5);

const MemoryGame = () => {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    const shuffledIcons = shuffleArray([...icons, ...icons]); // Duplicate icons for pairs
    setCards(shuffledIcons.map((icon, index) => ({ id: index, icon })));
  }, []);

  const handleCardClick = (index) => {
    if (flipped.length === 2 || flipped.includes(index) || matched.includes(index)) return;

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(moves + 1);
      const [first, second] = newFlipped;
      if (cards[first].icon === cards[second].icon) {
        setMatched([...matched, first, second]);
        setFlipped([]);
      } else {
        setTimeout(() => setFlipped([]), 1000);
      }
    }

    if (matched.length + 2 === cards.length) {
      setGameOver(true);
    }
  };

  return (
    <div className="memory-game">
      <h2>Memory Game</h2>
      <p>Moves: {moves}</p>
      <div className="grid">
        {cards.map((card, index) => (
          <div
            key={card.id}
            className={`card ${flipped.includes(index) || matched.includes(index) ? "flipped" : ""}`}
            onClick={() => handleCardClick(index)}
          >
            {flipped.includes(index) || matched.includes(index) ? card.icon : "❓"}
          </div>
        ))}
      </div>
      {gameOver && <p>🎉 Congratulations! You won in {moves} moves! 🎉</p>}
    </div>
  );
};

export default MemoryGame;
