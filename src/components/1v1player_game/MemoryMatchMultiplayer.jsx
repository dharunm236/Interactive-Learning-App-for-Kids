import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, auth } from '../../firebaseConfig';
import { doc, getDoc, updateDoc, onSnapshot, serverTimestamp, deleteDoc } from 'firebase/firestore';
import './MemoryMatchMultiplayer.css';

const MemoryMatchMultiplayer = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [gameSession, setGameSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(auth.currentUser?.uid);
  
  useEffect(() => {
    if (!sessionId || !currentUserId) return;
    
    const sessionRef = doc(db, "gameSessions", sessionId);
    const unsubscribe = onSnapshot(sessionRef, (doc) => {
      if (doc.exists()) {
        setGameSession(doc.data());
      } else {
        console.error("Game session not found");
      }
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [sessionId, currentUserId]);
  
  // Go back to challenges and cancel game if needed
  const handleBack = async () => {
    try {
      // Ask user if they want to end the game
      if (confirm("Do you want to leave this game? This will end the session for both players.")) {
        // End or delete the game session
        await updateDoc(doc(db, "gameSessions", sessionId), {
          status: "cancelled",
          endedAt: serverTimestamp(),
          endedBy: currentUserId
        });
      }
    } catch (error) {
      console.error("Error ending game session:", error);
    }
    navigate("/challenge-friend");
  };
  
  if (loading) {
    return <div className="memory-match-container">Loading game session...</div>;
  }
  
  return (
    <div className="memory-match-container">
      <h2>Memory Match Multiplayer</h2>
      <div className="game-info">
        <p><strong>Player 1:</strong> {gameSession?.player1?.name}</p>
        <p><strong>Player 2:</strong> {gameSession?.player2?.name}</p>
      </div>
      <div className="game-content">
        <p>This multiplayer memory match game is coming soon!</p>
        <img 
          src="https://cdn-icons-png.flaticon.com/512/2222/2222855.png" 
          alt="Memory Match" 
          className="game-image"
        />
      </div>
      <button onClick={handleBack} className="back-button">
        Back to Challenges
      </button>
    </div>
  );
};

export default MemoryMatchMultiplayer;