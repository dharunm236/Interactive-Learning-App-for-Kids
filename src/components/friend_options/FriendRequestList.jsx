import { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';
import './FriendRequestList.css';

function FriendRequestList() {
  const [friendRequests, setFriendRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFriendRequests() {
      setLoading(true);
      const currentUserId = auth.currentUser?.uid;
      if (!currentUserId) return;

      const friendRequestsDocRef = doc(db, 'friendRequests', currentUserId);
      const friendRequestsDoc = await getDoc(friendRequestsDocRef);

      if (!friendRequestsDoc.exists()) {
        setFriendRequests([]);
        setLoading(false);
        return;
      }

      const requestIds = friendRequestsDoc.data().requests || [];

      // Fetch usernames for each request ID
      const requestsData = await Promise.all(
        requestIds.map(async (requestId) => {
          const userDoc = await getDoc(doc(db, 'users', requestId));
          return userDoc.exists()
            ? { id: requestId, username: userDoc.data().username }
            : { id: requestId, username: 'Unknown User' };
        })
      );

      setFriendRequests(requestsData);
      setLoading(false);
    }

    fetchFriendRequests();
  }, []);

  const handleAccept = async (friendId) => {
    const currentUserId = auth.currentUser?.uid;
    if (!currentUserId) return;

    try {
      // Add friend to user's friend list
      const userFriendsRef = doc(db, 'friends', currentUserId);
      const userFriendsDoc = await getDoc(userFriendsRef);
      const userFriends = userFriendsDoc.exists()
        ? userFriendsDoc.data().friends || []
        : [];

      await updateDoc(userFriendsRef, { friends: [...userFriends, friendId] });

      // Remove the friend request
      const updatedRequests = friendRequests.filter(
        (request) => request.id !== friendId
      );
      setFriendRequests(updatedRequests);
    } catch (error) {
      console.error('Error accepting friend request:', error);
    }
  };

  const handleDecline = (friendId) => {
    const updatedRequests = friendRequests.filter(
      (request) => request.id !== friendId
    );
    setFriendRequests(updatedRequests);
  };

  return (
    <div className="container">
      <h3>Friend Requests</h3>
      {loading && <p>Loading friend requests...</p>}
      {!loading && friendRequests.length === 0 && <p>No friend requests.</p>}
      <ul>
        {friendRequests.map(({ id, username }) => (
          <li key={id}>
            <span>{username}</span>
            <div>
              <button className="accept-btn" onClick={() => handleAccept(id)}>
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
