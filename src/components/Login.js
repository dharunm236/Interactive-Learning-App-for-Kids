// src/components/Login.js
import React, { useState } from "react";
import { logIn, signUp, logOut } from "../authService";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);

  const handleLogin = async () => {
    try {
      const loggedInUser = await logIn(email, password);
      setUser(loggedInUser);
      console.log("Logged in:", loggedInUser);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleSignUp = async () => {
    try {
      const newUser = await signUp(email, password);
      setUser(newUser);
      console.log("User created:", newUser);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await logOut();
      setUser(null);
      console.log("Logged out");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div>
      <h2>{user ? "Welcome!" : "Login or Sign Up"}</h2>
      {!user ? (
        <>
          <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
          <button onClick={handleLogin}>Login</button>
          <button onClick={handleSignUp}>Sign Up</button>
        </>
      ) : (
        <button onClick={handleLogout}>Log Out</button>
      )}
    </div>
  );
};

export default Login;
