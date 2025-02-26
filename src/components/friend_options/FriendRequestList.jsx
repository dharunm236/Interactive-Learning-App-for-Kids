import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';

function FriendsList() {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFriends() {
      setLoading(true);
      const currentUserId = auth.currentUser?.uid;
      if (!currentUserId) return;

      const friendsDocRef = doc(db, 'friends', currentUserId);
      const friendsDoc = await getDoc(friendsDocRef);

      if (!friendsDoc.exists()) {
        setFriends([]);
        setLoading(false);
        return;
      }

      const friendIds = friendsDoc.data().friends || [];

      // Fetch usernames for each friend ID
      const friendsData = await Promise.all(
        friendIds.map(async (friendId) => {
          const userDoc = await getDoc(doc(db, 'users', friendId));
          return userDoc.exists() ? userDoc.data().username : 'Unknown User';
        })
      );

      setFriends(friendsData);
      setLoading(false);
    }

    fetchFriends();
  }, []);

  return (
    <div>
      <h3>Your Friends</h3>
      {loading && <p>Loading friends...</p>}
      {!loading && friends.length === 0 && <p>No friends added yet.</p>}
      <ul>
        {friends.map((friendUsername, index) => (
          <li key={index}>{friendUsername}</li>
        ))}
      </ul>
    </div>
  );
}

export default FriendsList;
