import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db, auth } from "../../firebaseConfig";
import { 
  doc, getDoc, updateDoc, onSnapshot, serverTimestamp, collection, where, query, getDocs
} from "firebase/firestore";
import "./MultiplayerWordBuilder.css";

const MultiplayerWordBuilder = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [letters, setLetters] = useState([]);
  const [word, setWord] = useState("");
  const [validWords, setValidWords] = useState([]);
  const [message, setMessage] = useState("");
  const [gameSession, setGameSession] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isPlayer1, setIsPlayer1] = useState(false);
  const [playerScore, setPlayerScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(auth.currentUser?.uid);
  const [opponentWords, setOpponentWords] = useState([]);

  // Generate random letters
  const generateLetters = () => {
    const vowels = "AEIOU";
    const consonants = "BCDFGHJKLMNPQRSTVWXYZ";
    let result = [];
    
    // Ensure at least 2 vowels
    for (let i = 0; i < 2; i++) {
      result.push(vowels[Math.floor(Math.random() * vowels.length)]);
    }
    
    // Add remaining consonants
    for (let i = 0; i < 5; i++) {
      result.push(consonants[Math.floor(Math.random() * consonants.length)]);
    }
    
    // Shuffle the array
    return result.sort(() => Math.random() - 0.5);
  };

  // Initialize the game
  useEffect(() => {
    const fetchGameSession = async () => {
      try {
        setLoading(true);
        
        // Get the game session
        const sessionRef = doc(db, "gameSessions", sessionId);
        const unsubscribe = onSnapshot(sessionRef, async (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            
            // Check if we need to update player names
            let needsUpdate = false;
            let updatedData = {...data};
            
            // Check if player1 name is a user ID and needs to be updated
            if (data.player1 && data.player1.name && data.player1.name.length > 20 && data.player1.name.indexOf(' ') === -1) {
              try {
                const userDoc = await getDoc(doc(db, "users", data.player1.id));
                if (userDoc.exists() && userDoc.data().displayName) {
                  updatedData.player1.name = userDoc.data().displayName;
                  needsUpdate = true;
                }
              } catch (err) {
                console.error("Error fetching player1 name:", err);
              }
            }
            
            // Check if player2 name is a user ID and needs to be updated
            if (data.player2 && data.player2.name && data.player2.name.length > 20 && data.player2.name.indexOf(' ') === -1) {
              try {
                const userDoc = await getDoc(doc(db, "users", data.player2.id));
                if (userDoc.exists() && userDoc.data().displayName) {
                  updatedData.player2.name = userDoc.data().displayName;
                  needsUpdate = true;
                }
              } catch (err) {
                console.error("Error fetching player2 name:", err);
              }
            }
            
            // Update the session if names needed fixing
            if (needsUpdate) {
              try {
                await updateDoc(sessionRef, updatedData);
              } catch (updateErr) {
                console.error("Error updating player names:", updateErr);
              }
            }
            
            setGameSession(data);
            
            // Check if current user is player1
            const currentUserId = auth.currentUser?.uid;
            const isP1 = data.player1.id === currentUserId;
            setIsPlayer1(isP1);
            setCurrentUserId(currentUserId);
            
            // Set player score
            if (isP1) {
              setPlayerScore(data.player1.score || 0);
              setValidWords(data.player1.words || []);
              setOpponentWords(data.player2.words || []);
            } else {
              setPlayerScore(data.player2.score || 0);
              setValidWords(data.player2.words || []);
              setOpponentWords(data.player1.words || []);
            }
            
            // If letters aren't set yet but exist in game data, use those
            if (letters.length === 0 && data.letters && data.letters.length > 0) {
              setLetters(data.letters);
            }
            
            // Check if game is over
            if (data.status === "completed") {
              setGameOver(true);
            }
            
            // Calculate time left
            if (data.startedAt && data.timeLimit) {
              const startTime = data.startedAt.seconds;
              const endTime = startTime + data.timeLimit;
              const now = Math.floor(Date.now() / 1000);
              const remaining = endTime - now;
              setTimeLeft(remaining > 0 ? remaining : 0);
              
              if (remaining <= 0 && data.status !== "completed") {
                handleGameEnd();
              }
            }
            
            setLoading(false);
          } else {
            console.error("Game session not found");
            setMessage("Game session not found");
            setLoading(false);
            setTimeout(() => navigate("/challenge-friend"), 3000);
          }
        });
        
        // Generate letters once for the game if needed
        const sessionSnap = await getDoc(sessionRef);
        if (sessionSnap.exists()) {
          const data = sessionSnap.data();
          
          // If session doesn't have letters yet, generate and save them
          if (!data.letters || data.letters.length === 0) {
            const newLetters = generateLetters();
            setLetters(newLetters);
            await updateDoc(sessionRef, {
              letters: newLetters,
              lastUpdated: serverTimestamp()
            });
          }
        }
        
        return () => unsubscribe();
      } catch (error) {
        console.error("Error fetching game session:", error);
        setMessage("Error loading game");
        setLoading(false);
      }
    };
    
    fetchGameSession();
  }, [sessionId, navigate]);
  
  // Timer countdown
  useEffect(() => {
    if (!gameSession || gameOver) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          handleGameEnd();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [gameSession, gameOver]);
  
  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Check if the word is valid
  const checkWord = async () => {
    if (!word || word.length < 2) {
      setMessage("Words must be at least 2 letters long!");
      return;
    }
    
    // Make sure word only uses available letters
    const wordLetters = word.toUpperCase().split('');
    const lettersCopy = [...letters];
    
    let valid = true;
    for (const char of wordLetters) {
      const index = lettersCopy.indexOf(char);
      if (index === -1) {
        valid = false;
        break;
      }
      lettersCopy.splice(index, 1);
    }
    
    if (!valid) {
      setMessage("You can only use the provided letters!");
      return;
    }
    
    // Check if word already found
    if (validWords.includes(word.toUpperCase())) {
      setMessage("You already found this word!");
      return;
    }
    
    // Check dictionary API
    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
      
      if (response.ok) {
        // Word is valid
        const newWord = word.toUpperCase();
        const newWords = [...validWords, newWord];
        setValidWords(newWords);
        
        // Calculate score (1 point per letter)
        const wordScore = word.length;
        const newScore = playerScore + wordScore;
        setPlayerScore(newScore);
        setMessage(`+${wordScore} points!`);
        
        // Update score in Firestore
        const sessionRef = doc(db, "gameSessions", sessionId);
        if (isPlayer1) {
          await updateDoc(sessionRef, {
            "player1.score": newScore,
            "player1.words": newWords,
            lastUpdated: serverTimestamp()
          });
        } else {
          await updateDoc(sessionRef, {
            "player2.score": newScore,
            "player2.words": newWords,
            lastUpdated: serverTimestamp()
          });
        }
      } else {
        setMessage("Not a valid word!");
      }
    } catch (error) {
      console.error("Error checking word:", error);
      setMessage("Error checking word");
    }
    
    // Clear input regardless of result
    setWord("");
  };
  
  // Handle game end
  const handleGameEnd = async () => {
    if (gameOver) return;
    
    try {
      setGameOver(true);
      const sessionRef = doc(db, "gameSessions", sessionId);
      const sessionSnap = await getDoc(sessionRef);
      
      if (sessionSnap.exists()) {
        const data = sessionSnap.data();
        let winner = null;
        
        // Determine winner
        if (data.player1.score > data.player2.score) {
          winner = data.player1.id;
        } else if (data.player2.score > data.player1.score) {
          winner = data.player2.id;
        } else {
          winner = "tie";
        }
        
        // Update game session
        await updateDoc(sessionRef, {
          status: "completed",
          endedAt: serverTimestamp(),
          winner: winner
        });
        
        // Save game result to both players' histories
        await saveGameResult(data.player1.id, data.player2.id, winner, data);
      }
    } catch (error) {
      console.error("Error ending game:", error);
    }
  };
  
  // Save game result to both players' histories
  const saveGameResult = async (player1Id, player2Id, winner, data) => {
    try {
      const gameResult = {
        gameId: "wordBuilder",
        gameName: "Word Builder",
        timestamp: serverTimestamp(),
        opponent: isPlayer1 ? {
          id: player2Id,
          name: data.player2.name,
          score: data.player2.score || 0
        } : {
          id: player1Id,
          name: data.player1.name,
          score: data.player1.score || 0
        },
        player: {
          id: currentUserId,
          name: isPlayer1 ? data.player1.name : data.player2.name,
          score: playerScore
        },
        result: winner === currentUserId ? "win" : winner === "tie" ? "tie" : "loss",
        sessionId: sessionId
      };
      
      // Save to user's game history
      const userRef = doc(db, "users", currentUserId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const gameHistory = userData.gameHistory || [];
        
        await updateDoc(userRef, {
          gameHistory: [...gameHistory, gameResult]
        });
      }
    } catch (error) {
      console.error("Error saving game result to history:", error);
    }
  };
  
  // Handle keypress to submit with Enter
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && word) {
      checkWord();
    }
  };
  
  // Go back to challenges
  const handleBack = () => {
    navigate("/challenge-friend");
  };

  if (loading) {
    return <div className="word-builder-container">Loading game...</div>;
  }

  return (
    <div className="word-builder-container">
      <h2>Word Builder Challenge</h2>
      
      <div className="game-header">
        <div className="time-display">Time: {formatTime(timeLeft)}</div>
        <div className="score-display">Your Score: {playerScore}</div>
      </div>
      
      <div className="player-vs">
        <div className={`player ${isPlayer1 ? "current-player" : ""}`}>
          {gameSession?.player1.name || "Player 1"}: {gameSession?.player1.score || 0}
          {isPlayer1 && <span className="you-indicator">(You)</span>}
        </div>
        <div className="vs">VS</div>
        <div className={`player ${!isPlayer1 ? "current-player" : ""}`}>
          {gameSession?.player2.name || "Player 2"}: {gameSession?.player2.score || 0}
          {!isPlayer1 && <span className="you-indicator">(You)</span>}
        </div>
      </div>
      
      <div className="game-status">
        {gameOver ? (
          <div className="game-over">
            <h3>Game Over!</h3>
            {gameSession && (
              <div className="results">
                <p>{gameSession.player1.name}: {gameSession.player1.score || 0} points</p>
                <p>{gameSession.player2.name}: {gameSession.player2.score || 0} points</p>
                <p className="winner">
                  {gameSession.player1.score > gameSession.player2.score
                    ? `${gameSession.player1.name} wins!`
                    : gameSession.player2.score > gameSession.player1.score
                    ? `${gameSession.player2.name} wins!`
                    : "It's a tie!"}
                </p>
              </div>
            )}
            <button onClick={handleBack}>Back to Challenges</button>
          </div>
        ) : (
          <>
            <div className="letters-container">
              {letters.map((letter, index) => (
                <div key={index} className="letter">{letter}</div>
              ))}
            </div>
            
            <div className="word-input">
              <input
                type="text"
                value={word}
                onChange={(e) => setWord(e.target.value.toUpperCase())}
                placeholder="Form a word"
                disabled={gameOver}
                onKeyPress={handleKeyPress}
                autoFocus
              />
              <button onClick={checkWord} disabled={!word || gameOver}>
                Submit
              </button>
            </div>
            
            <p className="message">{message}</p>
            
            <div className="words-found">
              <h3>Your Words ({validWords.length})</h3>
              <div className="words-list">
                {validWords.map((w, index) => (
                  <span key={index} className="word-chip">{w}</span>
                ))}
                {validWords.length === 0 && <p>No words found yet</p>}
              </div>
            </div>
            
            <div className="words-found opponent">
              <h3>Opponent's Words ({opponentWords.length})</h3>
              <div className="words-list">
                {opponentWords.map((w, index) => (
                  <span key={index} className="word-chip opponent">{w}</span>
                ))}
                {opponentWords.length === 0 && <p>No words found yet</p>}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MultiplayerWordBuilder;