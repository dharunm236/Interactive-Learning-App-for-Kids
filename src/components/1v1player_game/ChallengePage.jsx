import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../../firebaseConfig";
import { 
  collection, addDoc, query, where, onSnapshot, serverTimestamp, doc, getDoc, updateDoc, deleteDoc, getDocs 
} from "firebase/firestore";
import "./ChallengePage.css"; 
import { onAuthStateChanged } from "firebase/auth";

const ChallengePage = () => {
  const navigate = useNavigate();
  const [currentUserId, setCurrentUserId] = useState(auth.currentUser?.uid);
  const [userName, setUserName] = useState("");
  const [selectedGame, setSelectedGame] = useState("");
  const [friend, setFriend] = useState("");
  const [friends, setFriends] = useState([]);
  const [friendNames, setFriendNames] = useState({});
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingChallenge, setSendingChallenge] = useState(false);

  // Available games with their details
  const games = [
    { id: "wordBuilder", name: "Word Builder", icon: "📝", path: "/word-builder" },
    { id: "mathChallenge", name: "Math Challenge", icon: "🔢", path: "/math-challenge" },
    { id: "memoryMatch", name: "Memory Match", icon: "🧩", path: "/memory-match" },
  ];

  // Monitor authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUserId(user.uid);
        fetchUserName(user.uid);
      } else {
        setCurrentUserId(null);
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Fetch the current user's name
  const fetchUserName = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        setUserName(userDoc.data().displayName || "User");
      }
    } catch (error) {
      console.error("Error fetching user name:", error);
    }
  };

  // Fetch friends list
  useEffect(() => {
    if (!currentUserId) return;

    const fetchFriends = async () => {
      try {
        setLoading(true);
        const userDoc = await getDoc(doc(db, "friends", currentUserId));
        if (userDoc.exists()) {
          const friendsList = userDoc.data().friends || [];
          setFriends(friendsList);
          
          // Fetch display names for all friends
          const namesMap = {};
          for (const friendId of friendsList) {
            const friendDoc = await getDoc(doc(db, "users", friendId));
            if (friendDoc.exists()) {
              namesMap[friendId] = friendDoc.data().displayName || friendId;
            } else {
              namesMap[friendId] = friendId;
            }
          }
          setFriendNames(namesMap);
        }
      } catch (error) {
        console.error("Error fetching friends:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, [currentUserId]);

  // Fetch incoming challenges
  useEffect(() => {
    if (!currentUserId) return;
    
    const q = query(
      collection(db, "challenges"),
      where("receiverId", "==", currentUserId),
      where("status", "==", "pending")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const challengesData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      
      // Fetch sender names for all challenges
      Promise.all(
        challengesData.map(async (challenge) => {
          try {
            const senderDoc = await getDoc(doc(db, "users", challenge.senderId));
            if (senderDoc.exists()) {
              challenge.senderName = senderDoc.data().displayName || challenge.senderId;
            } else {
              challenge.senderName = challenge.senderId;
            }
            return challenge;
          } catch (error) {
            console.error("Error fetching sender name:", error);
            challenge.senderName = challenge.senderId;
            return challenge;
          }
        })
      ).then((enrichedChallenges) => {
        setChallenges(enrichedChallenges);
      });
    });

    return () => unsubscribe();
  }, [currentUserId]);

  // Listen for active game sessions where this user is a participant
  useEffect(() => {
    if (!currentUserId) return;
    
    // Query for active game sessions involving the current user
    const q = query(
      collection(db, "gameSessions"),
      where("status", "==", "active"),
      where("player1.id", "==", currentUserId)
    );

    const q2 = query(
      collection(db, "gameSessions"),
      where("status", "==", "active"),
      where("player2.id", "==", currentUserId)
    );

    // Listen for sessions where user is player1
    const unsubscribe1 = onSnapshot(q, (querySnapshot) => {
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const gameObj = games.find(g => g.id === data.game) || { path: "/word-builder", name: "Word Builder" };
        
        // Navigate to the game
        navigate(`${gameObj.path}/${doc.id}`);
      });
    });

    // Listen for sessions where user is player2
    const unsubscribe2 = onSnapshot(q2, (querySnapshot) => {
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const gameObj = games.find(g => g.id === data.game) || { path: "/word-builder", name: "Word Builder" };
        
        // Navigate to the game
        navigate(`${gameObj.path}/${doc.id}`);
      });
    });

    return () => {
      unsubscribe1();
      unsubscribe2();
    };
  }, [currentUserId, navigate]);

  // Send a challenge
  const handleChallenge = async () => {
    if (!selectedGame || !friend) {
      alert("Please select a game and a friend.");
      return;
    }
    
    try {
      setSendingChallenge(true);
      
      // Get the game details
      const gameObj = games.find(g => g.id === selectedGame);
      
      await addDoc(collection(db, "challenges"), {
        senderId: currentUserId,
        senderName: userName,
        receiverId: friend,
        receiverName: friendNames[friend] || friend,
        game: selectedGame,
        gameName: gameObj?.name || selectedGame,
        status: "pending",
        createdAt: serverTimestamp(),
      });
      
      alert("Challenge sent!");
      setSelectedGame("");
      setFriend("");
    } catch (error) {
      console.error("Error sending challenge:", error);
      alert("Failed to send challenge. Please try again.");
    } finally {
      setSendingChallenge(false);
    }
  };

  // Accept a challenge and start a game session with a timer
  const handleAccept = async (challengeId, senderId, game) => {
    try {
      // Find the sender's name from challenges
      const challenge = challenges.find(c => c.id === challengeId);
      const senderName = challenge?.senderName || "Opponent";
      
      // Update the challenge status
      await updateDoc(doc(db, "challenges", challengeId), {
        status: "accepted",
      });

      // Find the game info
      const gameObj = games.find(g => g.id === game) || { path: "/word-builder", name: "Word Builder" };
      
      // Create a new game session
      const sessionRef = await addDoc(collection(db, "gameSessions"), {
        player1: {
          id: senderId,
          name: senderName,
          score: 0,
          words: []
        },
        player2: {
          id: currentUserId,
          name: userName || "You",
          score: 0,
          words: []
        },
        game,
        gameName: gameObj.name,
        status: "active",
        startedAt: serverTimestamp(),
        timeLimit: 180, // 3 minutes
        winner: null
      });

      // REMOVE the alert that was causing issues
      // Navigate directly to the game
      navigate(`${gameObj.path}/${sessionRef.id}`);

    } catch (error) {
      console.error("Error accepting challenge:", error);
      alert("Failed to accept challenge. Please try again.");
    }
  };

  // Reject a challenge
  const handleReject = async (challengeId) => {
    try {
      await updateDoc(doc(db, "challenges", challengeId), {
        status: "rejected"
      });
      alert("Challenge rejected!");
    } catch (error) {
      console.error("Error rejecting challenge:", error);
      alert("Failed to reject challenge. Please try again.");
    }
  };

  // Get game icon
  const getGameIcon = (gameId) => {
    const game = games.find(g => g.id === gameId);
    return game ? game.icon : "🎮";
  };

  // Go back to games page
  const handleBack = () => {
    navigate("/games");
  };

  if (loading && !currentUserId) {
    return <div className="container">Loading...</div>;
  }

  return (
    <div className="container">
      <h2>Play with Friends</h2>
      <button onClick={handleBack} className="back-btn">← Back to Games</button>
      
      <div className="section">
        <h3>Send a Challenge</h3>
        <div className="form-group">
          <label htmlFor="game-select">Select Game:</label>
          <select 
            id="game-select"
            value={selectedGame} 
            onChange={(e) => setSelectedGame(e.target.value)}
            disabled={sendingChallenge}
          >
            <option value="">-- Select a Game --</option>
            {games.map((game) => (
              <option key={game.id} value={game.id}>
                {game.icon} {game.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="friend-select">Select Friend:</label>
          <select 
            id="friend-select"
            value={friend} 
            onChange={(e) => setFriend(e.target.value)}
            disabled={sendingChallenge}
          >
            <option value="">-- Select a Friend --</option>
            {friends.map((friendId) => (
              <option key={friendId} value={friendId}>
                {friendNames[friendId] || friendId}
              </option>
            ))}
          </select>
        </div>
        
        <button 
          onClick={handleChallenge} 
          disabled={!selectedGame || !friend || sendingChallenge}
          className="challenge-btn"
        >
          {sendingChallenge ? "Sending..." : "Send Challenge"}
        </button>
      </div>

      <div className="section">
        <h3>Incoming Challenges</h3>
        {challenges.length > 0 ? (
          <ul className="challenges-list">
            {challenges.map(({ id, senderId, senderName, game, gameName }) => (
              <li key={id} className="challenge-item">
                <div className="challenge-info">
                  <span className="game-icon">{getGameIcon(game)}</span>
                  <span className="player-name">{senderName}</span> challenged you to 
                  <span className="game-badge">{gameName || game}</span>
                </div>
                <div className="challenge-actions">
                  <button onClick={() => handleAccept(id, senderId, game)} className="accept-btn">
                    Accept
                  </button>
                  <button onClick={() => handleReject(id)} className="reject-btn">
                    Decline
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="no-challenges">No pending challenges</p>
        )}
      </div>
    </div>
  );
};

export default ChallengePage;