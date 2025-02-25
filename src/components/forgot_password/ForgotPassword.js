import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebaseConfig";
import { sendPasswordResetEmail } from "firebase/auth";
import "./Auth.css";
import "./ForgotPassword.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleResetPassword = async () => {
    try {
      await sendPasswordResetEmail(auth, email);
      alert(`Password reset link sent to ${email}`);
      navigate("/check-email");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="auth-container">
      {/* Floating background elements */}
      <div className="floating-shape circle" style={{ top: '10%', left: '20%' }}></div>
      <div className="floating-shape square" style={{ top: '30%', right: '15%' }}></div>
      <div className="floating-shape circle" style={{ bottom: '20%', right: '25%' }}></div>
      
      <div className="auth-box">
        <h2>Reset Password</h2>
        <form onSubmit={(e) => e.preventDefault()}>
          <input
            type="email"
            placeholder="📧 Enter Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="button" onClick={handleResetPassword}>
            🚀 Send Reset Link
          </button>
        </form>
        <p className="links" onClick={() => navigate("/")}>
          Remembered your password? <span>Login</span>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;