import React, { useState, useEffect } from 'react';
import { auth } from './firebaseConfig';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Homepage from './components/Homepage';
import Game from './components/balloon_game/Game/Game';
import Constants from './components/balloon_game/utils/constants';
import GamesPage from './components/GamesPage';
import Login from "./components/login/Login";
import ForgotPassword from "./components/forgot_password/ForgotPassword";
import ResetPassword from "./components/forgot_password/ResetPassword";
import CheckEmail from "./components/forgot_password/CheckEmail";
import SendFriendRequest from "./components/friend_options/SendFriendRequest";
import FriendRequestNotifications from "./components/friend_options/FriendRequestNotifications";
import ProfilePage from './components/ProfilePage.jsx';
import MoneyGame from './components/moneygame/money'; 
import StoryPrompt from './components/Story/StoryPrompt';
import SpeechChecker from './components/SpeechChecker/SpeechChecker';
import CoursePage from "./components/lecture/CoursePage";
import CourseContentPage from "./components/lecture/CourseContentPage";
import QuizPage from "./components/lecture/QuizPage";
import QuizBoard from './components/QuizBoard.jsx';
import InvadersQuiz from './components/invadersQuiz/InvadersQuiz';
import ImageQuiz from  './components/imageQuiz/Quiz.jsx';
import ProgressPage  from './components/progress/ProgressPage';
// Import challenge system components
import ChallengePage from './components/1v1player_game/ChallengePage';
import MultiplayerWordBuilder from './components/1v1player_game/MultiplayerWordBuilder';
// Placeholder imports for other multiplayer games (create these files as needed)
import MathChallenge from './components/1v1player_game/MathChallenge';
import MemoryMatchMultiplayer from './components/1v1player_game/MemoryMatchMultiplayer';
import LectureProgressReport from './components/lecture/LectureProgressReport'; // Import the new component

function App() {
  const [user, setUser] = useState(null);
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setAuthInitialized(true);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    auth.signOut();
    setUser(null);
  };

  if (!authInitialized) {
     return <div>Loading...</div>;
  }

  // Helper function to create protected routes
  const protectedRoute = (Component, props = {}) => 
    user ? <Component {...props} /> : <Navigate to="/login" />;

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Authentication Routes */}
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/check-email" element={<CheckEmail />} />

          {/* Core Routes */}
          <Route path="/" element={protectedRoute(Homepage, { onLogout: handleLogout })} />
          <Route path="/profile-page" element={protectedRoute(ProfilePage)} />
          
          {/* Game Routes */}
          <Route path="/games" element={protectedRoute(GamesPage)} />
          <Route path="/moneygame" element={protectedRoute(MoneyGame)} />
          <Route path="/games/Ballongame" element={protectedRoute(Game, {
            numberOfBalloons: Constants.gameCells,
            gameDuration: Constants.gameDuration
          })} />
          
          {/* Social Routes */}
          <Route path="/send-friend-request" element={protectedRoute(SendFriendRequest)} />
          <Route path="/friend-requests" element={protectedRoute(FriendRequestNotifications)} />
          <Route path="/create-story" element={protectedRoute(StoryPrompt)} />
          <Route path="/speech-checker" element={protectedRoute(SpeechChecker)} />
          
          {/* Quiz Routes */}
          <Route path="/quizzes" element={protectedRoute(QuizBoard)} />
          <Route path="/quizzes/invaders" element={protectedRoute(InvadersQuiz)} />
          <Route path="/quizzes/imageQuiz" element={protectedRoute(ImageQuiz)} />
          <Route path="/progress" element={protectedRoute(ProgressPage)} />
          
          {/* Challenge System Routes */}
          <Route path="/challenge-friend" element={protectedRoute(ChallengePage)} />
          <Route path="/word-builder/:sessionId" element={protectedRoute(MultiplayerWordBuilder)} />
          <Route path="/math-challenge/:sessionId" element={protectedRoute(MathChallenge)} />
          <Route path="/memory-match/:sessionId" element={protectedRoute(MemoryMatchMultiplayer)} />
          
          {/* Lecture Module Routes */}
          <Route path="/lecture" element={protectedRoute(CoursePage)} />
          <Route path="/lecture/course-content" element={protectedRoute(CourseContentPage)} />
          <Route path="/lecture/quiz" element={protectedRoute(QuizPage)} />
          <Route path="/lecture/progress-report" element={protectedRoute(LectureProgressReport)} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;