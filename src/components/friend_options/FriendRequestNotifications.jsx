import { useEffect, useState } from 'react';
import { db, auth } from '../../firebaseConfig';
import {
  collection,
  query,
  where,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import './FriendRequestNotifications.css';

function FriendRequestNotifications() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let unsubscribe = () => {}; // Default no-op function
    
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.log("No authenticated user");
      setLoading(false);
      return;
    }

    console.log("Setting up listener for user:", currentUser.uid);
    
    try {
      // Set up real-time listener for friend requests
      const requestRef = collection(db, 'friendRequests');
      
      // Only query for pending requests
      const q = query(
        requestRef,
        where('receiverId', '==', currentUser.uid),
        where('status', '==', 'pending')
      );

      unsubscribe = onSnapshot(q, 
        (querySnapshot) => {
          console.log(`Got ${querySnapshot.size} friend requests`);
          const requestsData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setRequests(requestsData);
          setLoading(false);
        },
        (error) => {
          console.error("Error in friend request listener:", error);
          setError("Failed to load friend requests: " + error.message);
          setLoading(false);
        }
      );
    } catch (error) {
      console.error("Error in friend request setup:", error);
      setError(error.message);
      setLoading(false);
    }
    
    // Cleanup function
    return () => {
      unsubscribe();
    };
  }, []);

  const handleAccept = async (requestId, senderId, receiverId) => {
    try {
      // Add to sender's friend list
      const senderFriendsRef = doc(db, 'friends', senderId);
      const senderFriendsSnap = await getDoc(senderFriendsRef);
      const senderFriends = senderFriendsSnap.exists() 
        ? senderFriendsSnap.data().friends || []
        : [];
      
      // Add to receiver's friend list
      const receiverFriendsRef = doc(db, 'friends', receiverId);
      const receiverFriendsSnap = await getDoc(receiverFriendsRef);
      const receiverFriends = receiverFriendsSnap.exists()
        ? receiverFriendsSnap.data().friends || []
        : [];
      
      // Update both friends lists
      if (senderFriendsSnap.exists()) {
        await updateDoc(senderFriendsRef, { 
          friends: [...senderFriends, receiverId] 
        });
      } else {
        await setDoc(senderFriendsRef, { 
          friends: [receiverId] 
        });
      }
      
      if (receiverFriendsSnap.exists()) {
        await updateDoc(receiverFriendsRef, { 
          friends: [...receiverFriends, senderId] 
        });
      } else {
        await setDoc(receiverFriendsRef, { 
          friends: [senderId] 
        });
      }
      
      // Update the friend request status instead of deleting
      const requestRef = doc(db, 'friendRequests', requestId);
      await updateDoc(requestRef, {
        status: 'accepted',
        actionDate: Timestamp.now()
      });
      
      // Remove from local state so it doesn't display anymore
      setRequests((prevRequests) => prevRequests.filter((req) => req.id !== requestId));

      console.log('Friend request accepted and friends list updated!');
    } catch (error) {
      console.error('Error accepting friend request:', error);
    }
  };

  const handleReject = async (requestId) => {
    try {
      // Update the friend request status instead of deleting
      const requestRef = doc(db, 'friendRequests', requestId);
      await updateDoc(requestRef, {
        status: 'rejected',
        actionDate: Timestamp.now()
      });
      
      // Remove from local state so it doesn't display anymore
      setRequests((prevRequests) => prevRequests.filter((req) => req.id !== requestId));
      
      console.log('Friend request rejected!');
    } catch (error) {
      console.error('Error rejecting request:', error);
    }
  };

  return (
    <div className="notifications-container">
      <h3>Friend Requests</h3>
      {error && <p className="error-message">Error loading requests: {error}</p>}
      {loading ? (
        <p>Loading requests...</p>
      ) : requests.length > 0 ? (
        requests.map((req) => (
          <div key={req.id} className="request-card">
            <p>
              Friend request from: <strong>{req.senderUsername || req.senderId}</strong>
              {req.createdAt && (
                <span className="request-time">
                  {new Date(req.createdAt.toDate()).toLocaleString()}
                </span>
              )}
            </p>
            <button className="accept-btn" onClick={() => handleAccept(req.id, req.senderId, req.receiverId)}>
              Accept
            </button>
            <button className="reject-btn" onClick={() => handleReject(req.id)}>
              Reject
            </button>
          </div>
        ))
      ) : (
        <p className="no-requests">No pending requests</p>
      )}
    </div>
  );
}

export default FriendRequestNotifications;
