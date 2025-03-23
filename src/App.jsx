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

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Authentication Routes */}
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/check-email" element={<CheckEmail />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={user ? <Homepage onLogout={handleLogout} /> : <Navigate to="/login" />}
          />
          <Route path="/profile-page" element={user ? <ProfilePage /> : <Navigate to="/login" />} />
          <Route path="/games" element={user ? <GamesPage /> : <Navigate to="/login" />} />
          <Route path="/moneygame" element={user ? <MoneyGame /> : <Navigate to="/login" />} />
          <Route
            path="/games/Ballongame"
            element={
              user ? (
                <Game numberOfBalloons={Constants.gameCells} gameDuration={Constants.gameDuration} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route path="/send-friend-request" element={user ? <SendFriendRequest /> : <Navigate to="/login" />} />
          <Route path="/friend-requests" element={user ? <FriendRequestNotifications /> : <Navigate to="/login" />} />
          <Route path="/create-story" element={user ? <StoryPrompt /> : <Navigate to="/login" />} />
          <Route path="/speech-checker" element={user ? <SpeechChecker /> : <Navigate to="/login" />} />
          <Route path="/quizzes" element={user ? <QuizBoard /> : <Navigate to="/login" />} />
          <Route path="/quizzes/invaders" element={user ? <InvadersQuiz /> : <Navigate to="/login" />} />
          <Route path="/quizzes/imageQuiz" element={user ? <ImageQuiz /> : <Navigate to="/login" />} />
          <Route path="/progress" element={user ? <ProgressPage /> : <Navigate to="/login" />} />

          {/* Lecture Module Routes */}
          <Route path="/lecture" element={user ? <CoursePage /> : <Navigate to="/login" />} />
          <Route path="/lecture/course-content" element={user ? <CourseContentPage /> : <Navigate to="/login" />} />
          <Route path="/lecture/quiz" element={user ? <QuizPage /> : <Navigate to="/login" />} />
          <Route 
            path="/lecture/progress-report" 
            element={user ? <LectureProgressReport /> : <Navigate to="/login" />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;