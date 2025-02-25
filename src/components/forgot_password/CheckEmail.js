import React from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";
import "./ForgotPassword.css";

const CheckEmail = () => {
  const navigate = useNavigate();

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>📨 Check Your Email</h2>
        <p>We've sent a password reset link to your email address.</p>
        <button onClick={() => navigate("/")}>Return to Login</button>
      </div>
    </div>
  );
};

export default CheckEmail;