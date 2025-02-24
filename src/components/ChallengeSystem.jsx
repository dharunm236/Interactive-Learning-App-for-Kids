import { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc, query, where, onSnapshot, updateDoc, doc, serverTimestamp } from 'firebase/firestore';

const ChallengeSystem = ({ currentUser }) => {
  const [incomingChallenges, setIncomingChallenges] = useState([]);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState([]);

  useEffect(() => {
    if (!currentUser) return;

    // Listen for incoming challenges
    const q = query(collection(db, 'challenges'), where('to', '==', currentUser.uid), where('status', '==', 'pending'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const challenges = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setIncomingChallenges(challenges);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const sendChallenge = async (opponentId) => {
    try {
      await addDoc(collection(db, 'challenges'), {
        from: currentUser.uid,
        to: opponentId,
        status: 'pending',
        quizQuestions: [],
        createdAt: serverTimestamp(),
      });
      alert('Challenge sent!');
    } catch (error) {
      console.error('Challenge Error:', error);
    }
  };

  const acceptChallenge = async (challengeId) => {
    const quiz = generateQuiz(); // Dummy function for now
    setQuizQuestions(quiz);
    setQuizStarted(true);

    await updateDoc(doc(db, 'challenges', challengeId), {
      status: 'accepted',
      quizQuestions: quiz,
    });
  };

  const declineChallenge = async (challengeId) => {
    await updateDoc(doc(db, 'challenges', challengeId), {
      status: 'declined',
    });
  };

  const generateQuiz = () => {
    return [
      { question: '5 + 3', answer: 8 },
      { question: '10 - 7', answer: 3 },
    ];
  };

  return (
    <div>
      <h3>Incoming Challenges:</h3>
      {incomingChallenges.length === 0 ? <p>No challenges.</p> : incomingChallenges.map((challenge) => (
        <div key={challenge.id}>
          <p>Challenge from: {challenge.from}</p>
          <button onClick={() => acceptChallenge(challenge.id)}>Accept</button>
          <button onClick={() => declineChallenge(challenge.id)}>Decline</button>
        </div>
      ))}

      {quizStarted && (
        <div>
          <h3>Quiz Started!</h3>
          {quizQuestions.map((q, index) => (
            <p key={index}>{q.question}</p>
          ))}
        </div>
      )}

      {/* Example usage */}
      <button onClick={() => sendChallenge('opponentUserIdHere')}>Challenge Opponent (TEST)</button>
    </div>
  );
};

export default ChallengeSystem;
