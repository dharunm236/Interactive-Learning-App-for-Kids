import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Howl } from "howler";
import Lottie from "lottie-react";
import kidAnimation from "./BoyAnimation.json";
import correctSoundFile from "../assets/sounds/correct.mp3";
import "./money.css";

const itemsList = [
  { name: "Toy", price: 2 },
  { name: "Candy", price: 3 },
  { name: "Book", price: 5 },
  { name: "Pencil", price: 1 },
  { name: "Backpack", price: 7 },
];
/*add shuffle*/

const correctSound = new Howl({ src: [correctSoundFile] });

const Game = () => {
  const [items, setItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [message, setMessage] = useState("");
  const [animationStopped, setAnimationStopped] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    shuffleItems();
  }, []);

  const shuffleItems = () => {
    const shuffled = itemsList.sort(() => 0.5 - Math.random()).slice(0, 4);
    setItems(shuffled);
    setSelectedItems([]);
    setMessage("");
    setAnimationStopped(false);
    setAnimationKey((prevKey) => prevKey + 1);
  };

  const totalAmount = selectedItems.reduce((sum, item) => sum + item.price, 0);

  const handleSelect = (item) => {
    if (!selectedItems.includes(item)) {
      setSelectedItems([...selectedItems, item]);
    }
  };

  const handleCheck = () => {
    if (totalAmount <= 10) {
      setMessage("Correct! You can buy these items.");
      correctSound.play();
    } else {
      setMessage("Try Again! You exceeded $10.");
      setSelectedItems([]); 
    }
  };
  

  return (
    <div className="money-game">
      <div className="game-container">
      <h1 className="question-title">What Can You Buy with $10?</h1>

      <motion.div
        key={animationKey}
        className="kid-container"
        initial={{ x: "-100vw" }}
        animate={{ x: "23vw" }}
        transition={{ duration: 3, ease: "easeOut" }}
        onAnimationComplete={() => setAnimationStopped(true)}
      >
        <Lottie animationData={kidAnimation} className="kid-animation" loop={!animationStopped} />
      </motion.div>

      <motion.div
        className="question-container"
        animate={{ opacity: animationStopped ? 1 : 0 }}
        transition={{ duration: 1 }}
      >
        <p>You have $10. Choose your items wisely!</p>
        <div className="items-container">
          {items.map((item) => (
            <motion.div key={item.name} className="item" whileHover={{ scale: 1.1 }} onClick={() => handleSelect(item)}>
              {item.name} - ${item.price}
            </motion.div>
          ))}
        </div>
        <h3>Selected Items: {selectedItems.map((item) => item.name).join(", ")}</h3>
        <h3>Total: ${totalAmount}</h3>
        <button onClick={handleCheck}>Check</button>
        <motion.div className="message" animate={{ opacity: message ? 1 : 0 }}>
          {message}
        </motion.div>
        <button onClick={shuffleItems}>Play Again</button>
      </motion.div>
    </div>
    </div>
  );
};

export default Game;
