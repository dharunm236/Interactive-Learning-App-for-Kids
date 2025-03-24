import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Howl } from "howler";
import correctSoundFile from "../assets/sounds/correct.mp3";
import incorrectSoundFile from "../assets/sounds/incorrect.mp3";
import coinSoundFile from "../assets/sounds/coin.mp3";
import confetti from "canvas-confetti";
import { db, auth } from "../../firebaseConfig";
import { doc, updateDoc, arrayUnion, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import "./money.css";

// Enhanced item list with images and categories
const itemsList = [
  { id: 1, name: "Toy Car", price: 2.50, category: "Toys", image: "toy-car.png" },
  { id: 2, name: "Chocolate Bar", price: 1.25, category: "Food", image: "chocolate.png" },
  { id: 3, name: "Storybook", price: 4.99, category: "Books", image: "book.png" },
  { id: 4, name: "Pencil Set", price: 1.99, category: "School", image: "pencil-set.png" },
  { id: 5, name: "Backpack", price: 8.50, category: "School", image: "backpack.png" },
  { id: 6, name: "Ice Cream", price: 2.00, category: "Food", image: "ice-cream.png" },
  { id: 7, name: "Juice Box", price: 0.75, category: "Food", image: "juice.png" },
  { id: 8, name: "Coloring Book", price: 3.25, category: "Books", image: "coloring-book.png" },
  { id: 9, name: "Action Figure", price: 5.99, category: "Toys", image: "action-figure.png" },
  { id: 10, name: "Lunch Box", price: 6.50, category: "School", image: "lunch-box.png" },
  { id: 11, name: "Teddy Bear", price: 7.99, category: "Toys", image: "teddy-bear.png" },
  { id: 12, name: "Puzzle", price: 4.75, category: "Toys", image: "puzzle.png" },
  { id: 13, name: "Fruit Snack", price: 1.50, category: "Food", image: "fruit-snack.png" },
  { id: 14, name: "Notebook", price: 2.25, category: "School", image: "notebook.png" },
  { id: 15, name: "Crayons", price: 3.50, category: "School", image: "crayons.png" },
];

// Sound effects
const sounds = {
  correct: new Howl({ src: [correctSoundFile] }),
  incorrect: new Howl({ src: [incorrectSoundFile] }),
  coin: new Howl({ src: [coinSoundFile] })
};


// Denominations for cash representation
const denominations = [
  { name: "10 Dollar Bill", value: 10, image: "10-dollar.png" },
  { name: "5 Dollar Bill", value: 5, image: "5-dollar.png" },
  { name: "1 Dollar Bill", value: 1, image: "1-dollar.png" },
  { name: "Quarter", value: 0.25, image: "quarter.png" },
  { name: "Dime", value: 0.10, image: "dime.png" },
  { name: "Nickel", value: 0.05, image: "nickel.png" },
  { name: "Penny", value: 0.01, image: "penny.png" }
];

const Game = () => {
  // State variables
  const [items, setItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [message, setMessage] = useState("");
  const [budget, setBudget] = useState(10);
  const [difficulty, setDifficulty] = useState("easy"); // easy, medium, hard
  const [showFeedback, setShowFeedback] = useState(false);
  const [gameMode, setGameMode] = useState("shopping"); // shopping, makeChange
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [showCashDrawer, setShowCashDrawer] = useState(false);
  const [selectedCash, setSelectedCash] = useState([]);
  const [targetAmount, setTargetAmount] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [user, setUser] = useState(null);
  const [highScores, setHighScores] = useState([]);
  const [showHighScores, setShowHighScores] = useState(false);
  const [hints, setHints] = useState(3);
  const [showHint, setShowHint] = useState(false);
  const [gameHistory, setGameHistory] = useState([]);
  const confettiRef = useRef(null);

  // Fetch the authenticated user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        console.log("User authenticated:", currentUser);
        // Store display name in localStorage as backup
        if (currentUser.displayName) {
          localStorage.setItem('username', currentUser.displayName);
        }
        setUser(currentUser);
        fetchHighScores();
        fetchUserGameHistory(currentUser.uid);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Initialize the game
  useEffect(() => {
    shuffleItems();
  }, [difficulty, categoryFilter]);

  // Fisher-Yates shuffle algorithm for truly random shuffling
  const shuffle = (array) => {
    let currentIndex = array.length, randomIndex;
    
    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
    
    return array;
  };

  // Get items based on difficulty and category
  const getFilteredItems = () => {
    let filtered = [...itemsList];
    
    // Apply category filter
    if (categoryFilter !== "All") {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }
    
    // Apply difficulty filter
    switch(difficulty) {
      case "easy":
        filtered = filtered.filter(item => item.price <= 5);
        break;
      case "medium":
        filtered = filtered.filter(item => item.price > 2 && item.price < 8);
        break;
      case "hard":
        filtered = filtered.filter(item => item.price >= 5);
        break;
      default:
        break;
    }
    
    return filtered;
  };

  const shuffleItems = () => {
    const filteredItems = getFilteredItems();
    const shuffled = shuffle([...filteredItems]).slice(0, difficulty === "easy" ? 4 : difficulty === "medium" ? 6 : 8);
    setItems(shuffled);
    setSelectedItems([]);
    setMessage("");
    setShowFeedback(false);
    setShowCashDrawer(false);
    setSelectedCash([]);
    
    // Set target amount for make change mode
    if (gameMode === "makeChange") {
      const randomItem = shuffled[Math.floor(Math.random() * shuffled.length)];
      setTargetAmount(parseFloat(randomItem.price.toFixed(2)));
    }
  };

  // Calculate total of selected items
  const totalAmount = selectedItems.reduce((sum, item) => sum + item.price, 0);
  
  // Calculate total of selected cash
  const totalCash = selectedCash.reduce((sum, cash) => sum + cash.value, 0);

  const handleSelect = (item) => {
    if (!selectedItems.some(selected => selected.id === item.id)) {
      sounds.coin.play();
      setSelectedItems([...selectedItems, item]);
    }
  };

  const handleDeselect = (item) => {
    setSelectedItems(selectedItems.filter(selected => selected.id !== item.id));
  };

  const handleCashSelect = (cash) => {
    sounds.coin.play();
    setSelectedCash([...selectedCash, {...cash, id: Date.now()}]); // Add unique id to track instances
  };

  const handleCashDeselect = (cashId) => {
    setSelectedCash(selectedCash.filter(cash => cash.id !== cashId));
  };

  const showConfetti = () => {
    if (confettiRef.current) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const handleCheck = () => {
    const checkResult = gameMode === "shopping" 
      ? checkShoppingMode() 
      : checkMakeChangeMode();
    
    setMessage(checkResult.feedback);
    setShowFeedback(true);
    
    if (checkResult.isCorrect) {
      sounds.correct.play();
      showConfetti();
      saveGameResult();
      
      // Add to game history
      addToGameHistory();
      
      // Progress to next level
      setTimeout(() => {
        if (checkResult.isCorrect) shuffleItems();
      }, 3000);
    }
  };

  const checkShoppingMode = () => {
    if (totalAmount <= 0) {
      sounds.incorrect.play();
      return {
        isCorrect: false,
        feedback: "Please select at least one item."
      };
    }
    
    if (totalAmount > budget) {
      sounds.incorrect.play();
      return {
        isCorrect: false,
        feedback: `You exceeded your budget of $${budget.toFixed(2)}. Try again!`
      };
    }
    
    // Shopping is correct
    const newLevel = level < 10 ? level + 1 : level;
    setLevel(newLevel);
    
    // Adjust budget based on level
    if (level % 3 === 0) {
      setBudget(budget + 5);
    }
    
    const pointsEarned = 10 * (difficulty === "easy" ? 1 : difficulty === "medium" ? 2 : 3);
    setScore(score + pointsEarned);
    
    return {
      isCorrect: true,
      feedback: `Great job! You spent $${totalAmount.toFixed(2)} out of $${budget.toFixed(2)}. You saved $${(budget - totalAmount).toFixed(2)}.`
    };
  };

  const checkMakeChangeMode = () => {
    const difference = Math.abs(totalCash - targetAmount);
    
    if (difference >= 0.01) { // Account for floating point precision
      sounds.incorrect.play();
      return {
        isCorrect: false,
        feedback: `Not quite right. You need to make $${targetAmount.toFixed(2)}. Your total is $${totalCash.toFixed(2)}.`
      };
    }
    
    // Make change is correct
    setLevel(level + 1);
    const pointsEarned = 15 * (difficulty === "easy" ? 1 : difficulty === "medium" ? 2 : 3);
    setScore(score + pointsEarned);
    
    return {
      isCorrect: true,
      feedback: `Perfect! You made the exact change of $${targetAmount.toFixed(2)}!`
    };
  };

  const addToGameHistory = () => {
    const historyItem = {
      date: new Date(),
      mode: gameMode,
      difficulty,
      score: gameMode === "shopping" 
        ? 10 * (difficulty === "easy" ? 1 : difficulty === "medium" ? 2 : 3) 
        : 15 * (difficulty === "easy" ? 1 : difficulty === "medium" ? 2 : 3),
      items: selectedItems.map(item => item.name)
    };
    
    setGameHistory([historyItem, ...gameHistory]);
  };

  const useHint = () => {
    if (hints > 0) {
      setHints(hints - 1);
      setShowHint(true);
      
      setTimeout(() => {
        setShowHint(false);
      }, 5000);
    }
  };

  const getHint = () => {
    if (gameMode === "shopping") {
      const remaining = budget - totalAmount;
      if (remaining < 0) {
        return `You're over budget by $${Math.abs(remaining).toFixed(2)}. Try removing some items.`;
      } else {
        const affordableItems = items.filter(item => item.price <= remaining && !selectedItems.some(selected => selected.id === item.id));
        if (affordableItems.length > 0) {
          return `You have $${remaining.toFixed(2)} left. You could add ${affordableItems[0].name} for $${affordableItems[0].price.toFixed(2)}.`;
        } else {
          return `You have $${remaining.toFixed(2)} left. None of the remaining items fit your budget.`;
        }
      }
    } else {
      const difference = targetAmount - totalCash;
      if (Math.abs(difference) < 0.01) {
        return "Perfect! Your change is correct.";
      } else if (difference > 0) {
        return `You need to add $${difference.toFixed(2)} more.`;
      } else {
        return `You've added too much by $${Math.abs(difference).toFixed(2)}.`;
      }
    }
  };

  const changeGameMode = (mode) => {
    setGameMode(mode);
    setScore(0);
    setLevel(1);
    setBudget(10);
    shuffleItems();
  };

  const changeDifficulty = (newDifficulty) => {
    setDifficulty(newDifficulty);
    setScore(0);
    setLevel(1);
    setBudget(newDifficulty === "easy" ? 10 : newDifficulty === "medium" ? 15 : 20);
    shuffleItems();
  };

  // Firebase functions
  const saveGameResult = async () => {
    if (!user) return;
    
    // Make sure we have a valid username to save
    const username = user.displayName || localStorage.getItem('username') || "Unknown";
    
    // Log user info for debugging
    console.log("Saving game with user info:", {
      uid: user.uid,
      displayName: user.displayName,
      username: username
    });

    try {
      const gameId = "moneyGame";
      const gameRef = doc(db, "games", gameId);
      const playedGamesRef = doc(db, "played_games", user.uid);
      
      const jsTimestamp = new Date();
      
      // Update the games collection
      const gameSnap = await getDoc(gameRef);
      if (gameSnap.exists()) {
        await updateDoc(gameRef, {
          players: arrayUnion({ 
            userId: user.uid, 
            username: username, // Use the confirmed username
            points: score, 
            difficulty,
            mode: gameMode,
            createdAt: jsTimestamp
          }),
        });
      } else {
        await setDoc(gameRef, {
          players: [{ 
            userId: user.uid, 
            username: username, // Use the confirmed username
            points: score,
            difficulty,
            mode: gameMode,
            createdAt: jsTimestamp
          }],
          lastUpdated: serverTimestamp()
        });
      }
      
      // Update the player's played_games collection
      const playedGamesSnap = await getDoc(playedGamesRef);
      if (playedGamesSnap.exists()) {
        await updateDoc(playedGamesRef, {
          gamesPlayed: arrayUnion({ 
            gameId, 
            points: score,
            difficulty, 
            mode: gameMode,
            createdAt: jsTimestamp
          }),
          lastUpdated: serverTimestamp()
        });
      } else {
        await setDoc(playedGamesRef, {
          gamesPlayed: [{ 
            gameId, 
            points: score,
            difficulty,
            mode: gameMode, 
            createdAt: jsTimestamp
          }],
          lastUpdated: serverTimestamp()
        });
      }
      
      console.log("Game result saved successfully!");
    } catch (error) {
      console.error("Error saving game result:", error);
    }
  };

  const fetchHighScores = async () => {
    try {
      const gameId = "moneyGame";
      const gameRef = doc(db, "games", gameId);
      const gameSnap = await getDoc(gameRef);
      
      if (gameSnap.exists()) {
        const data = gameSnap.data();
        const players = data.players || [];
        
        // Sort by score and take top 5
        const sortedPlayers = players
          .sort((a, b) => b.points - a.points)
          .slice(0, 5);
          
        setHighScores(sortedPlayers);
      }
    } catch (error) {
      console.error("Error fetching high scores:", error);
    }
  };

  const fetchUserGameHistory = async (userId) => {
    try {
      const playedGamesRef = doc(db, "played_games", userId);
      const playedGamesSnap = await getDoc(playedGamesRef);
      
      if (playedGamesSnap.exists()) {
        const data = playedGamesSnap.data();
        const gamesPlayed = data.gamesPlayed || [];
        
        // Filter for money games and sort by date
        const moneyGames = gamesPlayed
          .filter(game => game.gameId === "moneyGame")
          .sort((a, b) => b.createdAt - a.createdAt);
          
        setGameHistory(moneyGames);
      }
    } catch (error) {
      console.error("Error fetching game history:", error);
    }
  };

  // Render functions for cleaner JSX
  const renderGameHeader = () => (
    <div className="game-header">
      <h1 className="question-title">
        {gameMode === "shopping" 
          ? `What Can You Buy with $${budget.toFixed(2)}?` 
          : `Make Change: $${targetAmount.toFixed(2)}`}
      </h1>
      <div className="game-stats">
        <div className="stat">Level: {level}</div>
        <div className="stat">Score: {score}</div>
        <div className="stat">Hints: {hints}</div>
        {user && <div className="stat">Player: {user.displayName || "User"}</div>}
      </div>
    </div>
  );

  const renderGameControls = () => (
    <div className="game-controls">
      <div className="mode-selector">
        <button 
          className={gameMode === "shopping" ? "active" : ""} 
          onClick={() => changeGameMode("shopping")}
        >
          Shopping Mode
        </button>
        <button 
          className={gameMode === "makeChange" ? "active" : ""} 
          onClick={() => changeGameMode("makeChange")}
        >
          Make Change Mode
        </button>
      </div>
      
      <div className="difficulty-selector">
        <button 
          className={difficulty === "easy" ? "active" : ""} 
          onClick={() => changeDifficulty("easy")}
        >
          Easy
        </button>
        <button 
          className={difficulty === "medium" ? "active" : ""} 
          onClick={() => changeDifficulty("medium")}
        >
          Medium
        </button>
        <button 
          className={difficulty === "hard" ? "active" : ""} 
          onClick={() => changeDifficulty("hard")}
        >
          Hard
        </button>
      </div>
      
      {gameMode === "shopping" && (
        <div className="category-filter">
          <select 
            value={categoryFilter} 
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="All">All Categories</option>
            <option value="Toys">Toys</option>
            <option value="Food">Food</option>
            <option value="Books">Books</option>
            <option value="School">School Supplies</option>
          </select>
        </div>
      )}
    </div>
  );

  const renderShoppingMode = () => (
    <div className="shopping-mode">
      <div className="items-container">
        {items.map((item) => (
          <motion.div 
            key={item.id} 
            className={`item ${selectedItems.some(selected => selected.id === item.id) ? 'selected' : ''}`}
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }}
            onClick={() => !selectedItems.some(selected => selected.id === item.id) ? handleSelect(item) : handleDeselect(item)}
          >
            <div className="item-image">
              <img src={`/assets/items/${item.image}`} alt={item.name} onError={(e) => { e.target.src = '/assets/items/placeholder.png' }} />
            </div>
            <div className="item-details">
              <div className="item-name">{item.name}</div>
              <div className="item-price">${item.price.toFixed(2)}</div>
              <div className="item-category">{item.category}</div>
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="selected-items">
        <h3>Shopping Cart</h3>
        {selectedItems.length > 0 ? (
          <div className="cart-items">
            {selectedItems.map((item, index) => (
              <motion.div 
                key={`${item.id}-${index}`} 
                className="cart-item"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => handleDeselect(item)}
              >
                <img src={`/assets/items/${item.image}`} alt={item.name} className="cart-item-image" />
                <span>{item.name}</span>
                <span className="cart-item-price">${item.price.toFixed(2)}</span>
                <button className="remove-btn">✖</button>
              </motion.div>
            ))}
            <div className="cart-total">
              <span>Total:</span>
              <span className={totalAmount > budget ? "over-budget" : ""}>
                ${totalAmount.toFixed(2)} {totalAmount > budget && "(Over budget!)"}
              </span>
            </div>
            <div className="budget-remaining">
              <span>Budget Remaining:</span>
              <span className={budget - totalAmount < 0 ? "negative" : "positive"}>
                ${(budget - totalAmount).toFixed(2)}
              </span>
            </div>
          </div>
        ) : (
          <p className="empty-cart">Your cart is empty. Select items to buy!</p>
        )}
      </div>
    </div>
  );

  const renderMakeChangeMode = () => (
    <div className="make-change-mode">
      <div className="target-amount">
        <h3>Make Change For:</h3>
        <div className="amount">${targetAmount.toFixed(2)}</div>
      </div>
      
      <div className="cash-drawer">
        <h3>Cash Drawer</h3>
        <div className="denominations">
          {denominations.map((denom) => (
            <motion.div 
              key={denom.value} 
              className="denomination"
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCashSelect(denom)}
            >
              <img src={`/assets/money/${denom.image}`} alt={denom.name} />
              <div className="denom-value">${denom.value.toFixed(2)}</div>
            </motion.div>
          ))}
        </div>
      </div>
      
      <div className="selected-cash">
        <h3>Your Change</h3>
        {selectedCash.length > 0 ? (
          <div className="cash-items">
            {selectedCash.map((cash) => (
              <motion.div 
                key={cash.id} 
                className="cash-item"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                onClick={() => handleCashDeselect(cash.id)}
              >
                <img src={`/assets/money/${cash.image}`} alt={cash.name} />
                <span className="cash-value">${cash.value.toFixed(2)}</span>
                <button className="remove-btn">✖</button>
              </motion.div>
            ))}
            <div className="cash-total">
              <span>Total:</span>
              <span className={Math.abs(totalCash - targetAmount) < 0.01 ? "correct" : "incorrect"}>
                ${totalCash.toFixed(2)} {Math.abs(totalCash - targetAmount) < 0.01 && "✓"}
              </span>
            </div>
          </div>
        ) : (
          <p className="empty-cash">Select cash to make change.</p>
        )}
      </div>
    </div>
  );

  const renderGameActions = () => (
    <div className="game-actions">
      <button 
        className="check-button" 
        onClick={handleCheck}
        disabled={
          (gameMode === "shopping" && selectedItems.length === 0) || 
          (gameMode === "makeChange" && selectedCash.length === 0)
        }
      >
        Check Answer
      </button>
      
      <button 
        className="hint-button" 
        onClick={useHint}
        disabled={hints <= 0}
      >
        Use Hint ({hints})
      </button>
      
      <button className="new-game-button" onClick={shuffleItems}>
        New Items
      </button>
      
      {user && (
        <button 
          className="leaderboard-button" 
          onClick={() => setShowHighScores(!showHighScores)}
        >
          {showHighScores ? "Hide Leaderboard" : "Show Leaderboard"}
        </button>
      )}
    </div>
  );

  const renderFeedback = () => (
    <AnimatePresence>
      {showFeedback && (
        <motion.div 
          className={`feedback ${message.includes("Great job") || message.includes("Perfect") ? "success" : "error"}`}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
        >
          {message}
        </motion.div>
      )}
      
      {showHint && (
        <motion.div 
          className="hint-message"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
        >
          <h4>Hint:</h4>
          <p>{getHint()}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const renderHighScores = () => (
    <AnimatePresence>
      {showHighScores && (
        <motion.div 
          className="high-scores"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
        >
          <h3>Leaderboard</h3>
          {highScores.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Name</th>
                  <th>Score</th>
                  <th>Difficulty</th>
                  <th>Mode</th>
                </tr>
              </thead>
              <tbody>
                {highScores.map((player, index) => (
                  <tr key={index} className={player.userId === user?.uid ? "current-user" : ""}>
                    <td>{index + 1}</td>
                    <td>{player.username}</td>
                    <td>{player.points}</td>
                    <td>{player.difficulty || "easy"}</td>
                    <td>{player.mode || "shopping"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No high scores yet. Be the first!</p>
          )}
          <button onClick={() => setShowHighScores(false)}>Close</button>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="game-container" ref={confettiRef}>
      {renderGameHeader()}
      {renderGameControls()}
      
      <AnimatePresence mode="wait">
        <motion.div
          key={`game-content-${gameMode}`}
          className="game-content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="instructions">
            {gameMode === "shopping"
              ? `You have $${budget.toFixed(2)}. Choose items without exceeding your budget!`
              : `Make exact change for $${targetAmount.toFixed(2)} using the available coins and bills.`}
          </p>
          
          {gameMode === "shopping" ? renderShoppingMode() : renderMakeChangeMode()}
          
          {renderGameActions()}
          {renderFeedback()}
          {renderHighScores()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Game;
