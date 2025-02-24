import { useEffect, useState } from 'react';
import { db, auth } from '../../firebaseConfig';
import { collection, query, where, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { setDoc, getDoc } from 'firebase/firestore';

function FriendRequestNotifications() {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        const requestRef = collection(db, 'friendRequests');
        const q = query(
          requestRef,
          where('receiverId', '==', currentUser.uid),
          where('status', '==', 'pending')
        );

        const querySnapshot = await getDocs(q);
        const requestsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setRequests(requestsData);
      } catch (error) {
        console.error('Error fetching friend requests:', error);
      }
    };

    fetchRequests();
  }, []);

  const handleAccept = async (requestId, senderId, receiverId) => {
    try {
      const senderFriendsRef = doc(db, 'friends', senderId);
      const receiverFriendsRef = doc(db, 'friends', receiverId);
      const requestDocRef = doc(db, 'friendRequests', requestId);

      // Fetch sender's friends list
      const senderDoc = await getDoc(senderFriendsRef);
      const senderFriends = senderDoc.exists() ? senderDoc.data().friends || [] : [];

      // Fetch receiver's friends list
      const receiverDoc = await getDoc(receiverFriendsRef);
      const receiverFriends = receiverDoc.exists() ? receiverDoc.data().friends || [] : [];

      // Update sender's friends list
      await setDoc(
        senderFriendsRef,
        { friends: Array.from(new Set([...senderFriends, receiverId])) },
        { merge: true }
      );

      // Update receiver's friends list
      await setDoc(
        receiverFriendsRef,
        { friends: Array.from(new Set([...receiverFriends, senderId])) },
        { merge: true }
      );

      // Delete the friend request document
      await deleteDoc(requestDocRef);

      // Remove from state
      setRequests((prevRequests) => prevRequests.filter((req) => req.id !== requestId));

      console.log('Friend request accepted and friends list updated!');
    } catch (error) {
      console.error('Error accepting friend request:', error);
    }
  };

  const handleReject = async (requestId) => {
    try {
      await deleteDoc(doc(db, 'friendRequests', requestId));
      setRequests((prevRequests) => prevRequests.filter((req) => req.id !== requestId));
      console.log('Friend request rejected!');
    } catch (error) {
      console.error('Error rejecting request:', error);
    }
  };

  return (
    <div>
      <h3>Friend Requests</h3>
      {requests.length > 0 ? (
        requests.map((req) => (
          <div key={req.id}>
            <p>
              Friend request from: <strong>{req.senderUsername || req.senderId}</strong>
            </p>
            <button onClick={() => handleAccept(req.id, req.senderId, req.receiverId)}>Accept</button>
            <button onClick={() => handleReject(req.id)}>Reject</button>
          </div>
        ))
      ) : (
        <p>No pending requests</p>
      )}
    </div>
  );
}

export default FriendRequestNotifications;
