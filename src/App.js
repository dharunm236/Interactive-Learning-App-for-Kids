import React, { useState, useEffect } from "react";
import { auth } from "./firebaseConfig";
import Login from "./components/Login";
import Profile from "./components/Profile";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
  }, []);

  return (
    <div className="App">
      {user ? (
        <>
          <button onClick={() => setUser(null)}>Logout</button>
          <Profile />
        </>
      ) : (
        <Login />
      )}
    </div>
  );
}

export default App;
