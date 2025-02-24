import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const ChallengeFriend = () => {
  const [friends, setFriends] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFriends = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const friendsCollection = collection(db, `users/${user.uid}/friends`);
      const friendsSnapshot = await getDocs(friendsCollection);
      const friendsList = friendsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setFriends(friendsList);
    };

    fetchFriends();
  }, []);

  const handleChallenge = (friendId) => {
    alert(`Challenge sent to friend: ${friendId}`);
    navigate('/'); // Go back to homepage or wherever you want
  };

  return (
    <div>
      <h2>Challenge a Friend</h2>
      <ul>
        {friends.map((friend) => (
          <li key={friend.id}>
            {friend.username} - <button onClick={() => handleChallenge(friend.id)}>Challenge</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChallengeFriend;
