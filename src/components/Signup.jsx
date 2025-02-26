import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signUp } from "../authService";
//import "./Signup.module.css"; // Using a single CSS file for styles

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (event) => {
    event.preventDefault();
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
      {/* Thought box with animation */}
      <div className="thought-box">
        <div className="deco-star" aria-hidden="true">⭐</div>
        <p>🚀 "Learning today, leading tomorrow!" 🌟</p>
      </div>

      {/* Signup Card */}
      <div className="signup-card">
        <div className="card-decoration top" aria-hidden="true">🎨</div>
        <h1>📚 Join the Fun Learning Adventure!</h1>

        <form onSubmit={handleSignup} className="signup-form">
          {/* Email Input */}
          <div className="input-group">
            <div className="input-with-icon">
              <span className="icon" role="img" aria-label="Email">📧</span>
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-field"
                aria-label="Email Address"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="input-group">
            <div className="input-with-icon">
              <span className="icon" role="img" aria-label="Password">🔒</span>
              <input
                type="password"
                placeholder="Create Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input-field"
                aria-label="Create Password"
              />
            </div>
          </div>

          {/* Signup Button */}
          <button type="submit" className="signup-button">
            🚀 Start Learning!
            <div className="button-sparkles" aria-hidden="true">✨✨</div>
          </button>
        </form>

        {/* Login Link */}
        <p className="login-link">
          Already have an account?{" "}
          <span onClick={() => navigate("/")} role="button" tabIndex={0}>
            Login here 🌈
          </span>
        </p>
        <div className="card-decoration bottom" aria-hidden="true">🎉</div>
      </div>

      {/* Floating Decorations */}
      <div className="floating-decorations">
        <div className="float-emoji" aria-hidden="true">✏️</div>
        <div className="float-emoji" aria-hidden="true">📖</div>
        <div className="float-emoji" aria-hidden="true">🎒</div>
      </div>
    </div>
  );
};

export default Signup;
