import React, { useState } from "react";
import { logIn, signUp } from "../authService";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState(""); // Add username state

  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await logIn(email, password);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleSignUp = async () => {
    try {
      await signUp(email, password, username); // Pass username
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div>
      <h2>Login or Sign Up</h2>
      <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
      <input type="text" placeholder="Username" onChange={(e) => setUsername(e.target.value)} /> {/* Add username */}
      <button onClick={handleLogin}>Login</button>
      <button onClick={handleSignUp}>Sign Up</button>
    </div>
  );
};

export default Login;
