import { useState, useEffect } from 'react';
import { db, auth } from '../firebaseConfig';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  doc,
  getDoc,
} from 'firebase/firestore';

function SendFriendRequest() {
  const [username, setUsername] = useState('');
  const [status, setStatus] = useState('');
  const [currentUserData, setCurrentUserData] = useState({ username: '', name: '' });

  const [friends, setFriends] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(true);

  // Fetch current user's data (name and username)
  useEffect(() => {
    const fetchCurrentUserData = async () => {
      if (auth.currentUser) {
        const userDocRef = doc(db, 'users', auth.currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setCurrentUserData(userDoc.data());
        }
      }
    };

    const fetchFriends = async () => {
      if (!auth.currentUser) return;

      setLoadingFriends(true);
      const friendsDocRef = doc(db, 'friends', auth.currentUser.uid);
      const friendsDoc = await getDoc(friendsDocRef);

      if (!friendsDoc.exists()) {
        setFriends([]);
        setLoadingFriends(false);
        return;
      }

      const friendIds = friendsDoc.data().friends || [];

      const friendsData = await Promise.all(
        friendIds.map(async (friendId) => {
          const userDoc = await getDoc(doc(db, 'users', friendId));
          return userDoc.exists() ? userDoc.data().username : 'Unknown User';
        })
      );

      setFriends(friendsData);
      setLoadingFriends(false);
    };

    fetchCurrentUserData();
    fetchFriends();
  }, []);

  const handleSendRequest = async () => {
    if (!username) {
      setStatus('Please enter a username.');
      return;
    }

    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('username', '==', username));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setStatus('User not found.');
        return;
      }

      const receiverDoc = querySnapshot.docs[0];
      const receiverId = receiverDoc.id;

      if (receiverId === auth.currentUser.uid) {
        setStatus('You cannot send a request to yourself.');
        return;
      }

      // Check if the request already exists
      const requestRef = collection(db, 'friendRequests');
      const existingQuery = query(
        requestRef,
        where('senderId', '==', auth.currentUser.uid),
        where('receiverId', '==', receiverId)
      );
      const existingSnapshot = await getDocs(existingQuery);

      if (!existingSnapshot.empty) {
        setStatus('Friend request already sent.');
        return;
      }

      // Send friend request with additional user details
      await addDoc(collection(db, 'friendRequests'), {
        senderId: auth.currentUser.uid,
        senderUsername: currentUserData.username,
        senderName: currentUserData.name || 'N/A',
        receiverId: receiverId,
        status: 'pending',
        timestamp: new Date(),
      });

      setStatus('Friend request sent!');
    } catch (error) {
      console.error('Error sending friend request:', error);
      setStatus('Failed to send request.');
    }
  };

  return (
    <div>
      <h3>Send Friend Request</h3>
      <input
        type="text"
        placeholder="Enter friend's username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <button onClick={handleSendRequest}>Send Request</button>
      {status && <p>{status}</p>}

      <hr />

      <h3>Your Friends</h3>
      {loadingFriends && <p>Loading friends...</p>}
      {!loadingFriends && friends.length === 0 && <p>No friends added yet.</p>}
      <ul>
        {friends.map((friendUsername, index) => (
          <li key={index}>{friendUsername}</li>
        ))}
      </ul>
    </div>
  );
}

export default SendFriendRequest;
