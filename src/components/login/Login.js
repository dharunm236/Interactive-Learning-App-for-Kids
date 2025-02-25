import React, { useState, useEffect } from "react";
import { logIn, logInWithGoogle, signUp } from "../../authService";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const quotes = [
    "📚 Learning is fun! Let's explore together! 📖",
    "🌟 Every day is a new adventure! 🌈",
    "🎨 Creativity is intelligence having fun! 🎭"
  ];
  const navigate = useNavigate();

  useEffect(() => {
    const quoteInterval = setInterval(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 3000);

    const createParticle = () => {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.cssText = `
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        width: ${Math.random() * 10 + 5}px;
        height: ${Math.random() * 10 + 5}px;
        animation-duration: ${Math.random() * 3 + 2}s;
      `;
      document.querySelector('.login-container').appendChild(particle);
    };

    for (let i = 0; i < 25; i++) createParticle();

    return () => {
      clearInterval(quoteInterval);
      document.querySelectorAll('.particle').forEach(particle => particle.remove());
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsAnimating(false);

    try {
      if (isSignup) {
        await signUp(email, password, username);
        alert("Signup successful! Please login.");
        setIsSignup(false);
        setUsername("");
      } else {
        await logIn(email, password);
        navigate("/");
      }
      setEmail("");
      setPassword("");
    } catch (err) {
      setError(isSignup ? err.message : "Invalid email or password. Please try again.");
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 500);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await logInWithGoogle();
      navigate("/");
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError("Google sign-in failed. Please try again.");
      }
    }
  };

  return (
    <div className="login-container">
      <div className="quote-box">
        {quotes[currentQuoteIndex]}
      </div>

      <div className={`login-box ${isAnimating ? 'error-shake' : ''}`}>
        <h1>
          {isSignup ? "Join the KidsLearn Family!" : "Welcome to KidsLearn!"}
          {isSignup ? (
            <span className="sub-heading">Sign-Up</span>
          ) : (
            <span className="sub-heading">Login</span>
          )}
        </h1>
        {error && <p className="error-message">{error}</p>}

        <form onSubmit={handleSubmit}>
          {isSignup && (
            <div className="input-group">
              <input
                type="text"
                className="input-fieldi"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <i className="fas fa-user"></i>
            </div>
          )}

          <div className="input-group">
            <input
              type="email"
              className="input-fieldi"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <i className="fas fa-envelope"></i>
          </div>

          <div className="input-group">
            <input
              type="password"
              className="input-fieldi"
              placeholder={isSignup ? "Create Password" : "Password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <i className="fas fa-lock"></i>
          </div>

          <button type="submit" className="login-button">
            {isSignup ? "Let's Get Started! 🚀" : "Let's Learn!"}
          </button>
        </form>

        <div className="or-divider">
          <span className="or-line"></span>
          <span className="or-text">OR</span>
          <span className="or-line"></span>
        </div>

        <button
          className="google-round-button"
          onClick={handleGoogleLogin}
          title="Sign in with Google"
        >
          <i className="fab fa-google"></i>
        </button>

        <div className="signup-toggle">
          {isSignup ? (
            <span>
              Already have an account?{" "}
              <button onClick={() => setIsSignup(false)}>Login here</button>
            </span>
          ) : (
            <span>
              New User?{" "}
              <button onClick={() => setIsSignup(true)}>
                Sign Up
              </button>
            </span>
          )}
        </div>

        {!isSignup && (
          <a href="/forgot-password" className="forgot-password">
            Forgot Password?
          </a>
        )}
      </div>
    </div>
  );
};

export default Login;