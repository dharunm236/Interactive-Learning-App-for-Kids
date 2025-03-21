import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, auth } from '../../firebaseConfig';
import { doc, getDoc, updateDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import './MathChallenge.css';

const MathChallenge = () => {
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
  
  // Go back to challenges
  const handleBack = () => {
    navigate("/challenge-friend");
  };
  
  if (loading) {
    return <div className="math-challenge-container">Loading game session...</div>;
  }
  
  return (
    <div className="math-challenge-container">
      <h2>Math Challenge Multiplayer</h2>
      <div className="game-info">
        <p><strong>Player 1:</strong> {gameSession?.player1?.name}</p>
        <p><strong>Player 2:</strong> {gameSession?.player2?.name}</p>
      </div>
      <div className="game-content">
        <p>This game is under development. Check back soon!</p>
        <img 
          src="https://cdn-icons-png.flaticon.com/512/3588/3588592.png" 
          alt="Math Challenge" 
          className="game-image"
        />
      </div>
      <button onClick={handleBack} className="back-button">
        Back to Challenges
      </button>
    </div>
  );
};

export default MathChallenge;