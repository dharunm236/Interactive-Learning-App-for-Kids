import React from "react";
import "./BadgeDisplay.css";

const BadgeDisplay = ({ earned }) => {
  return (
    <div className="badge-container">
      {earned ? (
        <div className="badge-earned">
          <div className="badge-circle shine">
            <div className="badge-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 15l-2-2h4l-2 2z" fill="currentColor" />
                <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
          </div>
          <div className="badge-info">
            <h2 className="congrats">🎉 Congratulations!</h2>
            <p>You've successfully completed the course and earned your badge.</p>
            <div className="badge-actions">
              {/* Removed Share and Download buttons */}
            </div>
          </div>
        </div>
      ) : (
        <div className="badge-locked">
          <div className="badge-circle locked">
            <div className="badge-icon faded">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 15l-2-2h4l-2 2z" fill="currentColor" />
                <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
              </svg>
              <div className="badge-lock">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
            </div>
          </div>
          <div className="badge-info">
            <h2 className="locked-text">🔒 Badge Locked</h2>
            <p>Complete the course and pass the final assessment to earn this badge.</p>
            <div className="badge-requirements">
              <div className="requirement">
                <span className="requirement-icon">📚</span>
                <span>Complete all lessons</span>
              </div>
              <div className="requirement">
                <span className="requirement-icon">✅</span>
                <span>Pass the final quiz</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BadgeDisplay;