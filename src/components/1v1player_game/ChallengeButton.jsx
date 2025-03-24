import React from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebaseConfig";
import "./ChallengeButton.css";

const ChallengeButton = () => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    if (!auth.currentUser) {
      alert("Please log in to challenge a friend");
      navigate("/login");
      return;
    }
    
    navigate("/challenge-friend");
  };

  return (
    <button className="challenge-button" onClick={handleClick}>
      <span className="icon">🏆</span>
      <span className="text">Challenge a Friend</span>
    </button>
  );
};

export default ChallengeButton;