import React, { useState, useEffect } from "react";
import { auth } from "./firebaseConfig";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./components/Homepage";
import Login from "./components/Login";
import Profile from "./components/Profile";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    auth.signOut();
    setUser(null);
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Show Login only if user is NOT logged in */}
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />

          {/* Show Homepage only if user is logged in */}
          <Route path="/" element={user ? <Home /> : <Navigate to="/login" />} />

          {/* Profile route (Optional) */}
          <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
        </Routes>

        {user && <button onClick={handleLogout}>Logout</button>}
      </div>
    </Router>
  );
}

export default App;
