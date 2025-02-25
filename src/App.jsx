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
    // Render a loading state until the Firebase auth state is determined
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/check-email" element={<CheckEmail />} />
          <Route path="/" element={user ? <Homepage onLogout={handleLogout} /> : <Navigate to="/login" />}/>
          <Route path="/games" element={user ? <GamesPage /> : <Navigate to="/login" />}/>
          <Route
            path="/Ballongame"
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
        </Routes>
      </div>
    </Router>
  );
}

export default App;
