import { doc, updateDoc, arrayUnion, deleteDoc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

async function acceptFriendRequest(requestId, senderId, receiverId) {
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
    await setDoc(senderFriendsRef, {
      friends: Array.from(new Set([...senderFriends, receiverId])),
    }, { merge: true });

    // Update receiver's friends list
    await setDoc(receiverFriendsRef, {
      friends: Array.from(new Set([...receiverFriends, senderId])),
    }, { merge: true });

    // Delete the friend request
    await deleteDoc(requestDocRef);

    console.log('Friend request accepted and friends list updated!');
  } catch (error) {
    console.error('Error accepting friend request:', error);
  }
}

export default acceptFriendRequest;
