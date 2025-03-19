import { useEffect, useState } from 'react';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  setDoc,
  onSnapshot 
} from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';
import './FriendRequestList.css';

function FriendRequestList() {
  const [friendRequests, setFriendRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let unsubscribe = () => {}; // Default no-op function
    
    const currentUserId = auth.currentUser?.uid;
    if (!currentUserId) {
      setLoading(false);
      return;
    }

    console.log("Setting up friend requests listener for:", currentUserId);
    
    // Set up real-time listener for friend requests
    const requestsRef = collection(db, 'friendRequests');
    const q = query(
      requestsRef,
      where('receiverId', '==', currentUserId),
      where('status', '==', 'pending')
    );

    unsubscribe = onSnapshot(q, 
      (querySnapshot) => {
        console.log(`Found ${querySnapshot.size} friend requests`);
        const requestsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          senderId: doc.data().senderId,
          senderUsername: doc.data().senderUsername || 'Unknown User',
          createdAt: doc.data().createdAt
        }));
        
        setFriendRequests(requestsData);
        setLoading(false);
      },
      (error) => {
        console.error("Error listening for friend requests:", error);
        setError("Failed to load friend requests: " + error.message);
        setLoading(false);
      }
    );

    // Return the unsubscribe function
    return () => {
      unsubscribe();
    };
  }, []);

  const handleAccept = async (requestId, senderId) => {
    const currentUserId = auth.currentUser?.uid;
    if (!currentUserId) return;

    try {
      // Add to current user's friend list
      const userFriendsRef = doc(db, 'friends', currentUserId);
      const userFriendsDoc = await getDoc(userFriendsRef);
      const userFriends = userFriendsDoc.exists()
        ? userFriendsDoc.data().friends || []
        : [];

      // Add to sender's friend list
      const senderFriendsRef = doc(db, 'friends', senderId);
      const senderFriendsDoc = await getDoc(senderFriendsRef);
      const senderFriends = senderFriendsDoc.exists()
        ? senderFriendsDoc.data().friends || []
        : [];
      
      // Update current user's friends list
      if (userFriendsDoc.exists()) {
        await updateDoc(userFriendsRef, { 
          friends: [...userFriends, senderId] 
        });
      } else {
        await setDoc(userFriendsRef, { 
          friends: [senderId] 
        });
      }
      
      // Update sender's friends list
      if (senderFriendsDoc.exists()) {
        await updateDoc(senderFriendsRef, { 
          friends: [...senderFriends, currentUserId] 
        });
      } else {
        await setDoc(senderFriendsRef, { 
          friends: [currentUserId] 
        });
      }

      // Delete the friend request
      await deleteDoc(doc(db, 'friendRequests', requestId));
      
      // The request will be removed from UI automatically through the onSnapshot listener

      console.log("Friend request accepted!");
    } catch (error) {
      console.error('Error accepting friend request:', error);
      setError("Failed to accept request: " + error.message);
    }
  };

  const handleDecline = async (requestId) => {
    try {
      // Delete the friend request
      await deleteDoc(doc(db, 'friendRequests', requestId));
      
      // The request will be removed from UI automatically through the onSnapshot listener
      
      console.log("Friend request declined!");
    } catch (error) {
      console.error('Error declining friend request:', error);
      setError("Failed to decline request: " + error.message);
    }
  };

  return (
    <div className="container">
      <h3>Friend Requests</h3>
      {error && <p className="error">{error}</p>}
      {loading && <p>Loading friend requests...</p>}
      {!loading && friendRequests.length === 0 && <p>No friend requests.</p>}
      <ul>
        {friendRequests.map(({ id, senderId, senderUsername, createdAt }) => (
          <li key={id}>
            <span>{senderUsername}</span>
            {createdAt && (
              <small className="request-time">
                {new Date(createdAt.toDate()).toLocaleString()}
              </small>
            )}
            <div>
              <button className="accept-btn" onClick={() => handleAccept(id, senderId)}>
                Accept
              </button>
              <button className="decline-btn" onClick={() => handleDecline(id)}>
                Decline
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default FriendRequestList;
