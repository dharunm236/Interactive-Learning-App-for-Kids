import React, { useState, useEffect } from 'react';
import { auth } from './firebaseConfig';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Homepage from './components/Homepage';
import Login from './components/Login';
import Profile from './components/Profile';
import Game from './components/Game/Game'; // Imported from Balloon Game app
import Constants from './utils/constants'; // Imported from Balloon Game app
import GamesPage from './components/GamesPage';
import ReactDOM from "react-dom";

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
          <Route
            path="/"
            element={
              user ? <Homepage onLogout={handleLogout} /> : <Navigate to="/login" />
            }
          />
          <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
          <Route
            path="/games"
            element={user ? <GamesPage /> : <Navigate to="/login" />}
          />
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
        </Routes>
      </div>
    </Router>
  );
}

export default App;
