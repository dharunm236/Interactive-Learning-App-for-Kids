import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signUp } from "../authService";
import "./Signup.css"; // Single CSS file now

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await signUp(email, password);
      alert("Signup Successful! Redirecting to Login.");
      navigate("/");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="signup-container">
      <div className="thought-box">
        <div className="deco-star">⭐</div>
        <p>🚀 "Learning today, leading tomorrow!" 🌟</p>
      </div>
      
      <div className="signup-card">
        <div className="card-decoration top">🎨</div>
        <h1>📚 Join the Fun Learning Adventure!</h1>
        
        <form onSubmit={handleSignup} className="signup-form">
          <div className="input-group">
            <div className="input-with-icon">
              <span className="icon">📧</span>
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-field"
              />
            </div>
          </div>

          <div className="input-group">
            <div className="input-with-icon">
              <span className="icon">🔒</span>
              <input
                type="password"
                placeholder="Create Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input-field"
              />
            </div>
          </div>

          <button type="submit" className="signup-button">
            🚀 Start Learning!
            <div className="button-sparkles">✨✨</div>
          </button>
        </form>

        <p className="login-link">
          Already have an account?{' '}
          <span onClick={() => navigate("/")}>Login here 🌈</span>
        </p>
        <div className="card-decoration bottom">🎉</div>
      </div>

      <div className="floating-decorations">
        <div className="float-emoji">✏️</div>
        <div className="float-emoji">📖</div>
        <div className="float-emoji">🎒</div>
      </div>
    </div>
  );
};

export default Signup;