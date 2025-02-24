import { useEffect, useRef, useState } from 'react';
import './homepageCSS/Homepage.css';
import './homepageCSS/dropdown.css';
import { FaHome, FaBook, FaGamepad, FaChartLine, FaUser, FaSignOutAlt, FaUserFriends } from "react-icons/fa";
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';

function Homepage({ onLogout, onProfileClick, currentUserId }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleLogout = () => {
    setShowDropdown(false);
    onLogout();
  };

  const sendChallenge = async () => {
    const opponentId = prompt("Enter opponent's user ID:");
    if (!opponentId) return;

    try {
      await addDoc(collection(db, 'challenges'), {
        challengerId: currentUserId,
        opponentId,
        status: 'pending',
        createdAt: new Date(),
      });
      alert('Challenge sent successfully!');
    } catch (error) {
      console.error('Error sending challenge:', error);
      alert('Failed to send challenge.');
    }
  };

  return (
    <div>
      <nav className="navbar">
  <div className="logo">FunLearn 🎓</div>
  <div className="nav-links">
    <a href="#home" className="nav-item">
      <FaHome className="nav-icon" /> Home
    </a>
    <a href="#lessons" className="nav-item">
      <FaBook className="nav-icon" /> Lessons
    </a>
    <Link to="/games" className="nav-item">
      <FaGamepad className="nav-icon" /> Games
    </Link>
    <a href="#progress" className="nav-item">
      <FaChartLine className="nav-icon" /> Progress
    </a>

    {/* Profile Menu */}
    <div className="profile-menu" onClick={toggleDropdown}>
      <div className="profile-preview">
        <img src="https://via.placeholder.com/40?text=U" alt="Profile" />
      </div>
      {showDropdown && (
        <div className="profile-dropdown">
          <div className="dropdown-item" onClick={onProfileClick}>
            <FaUser className="dropdown-icon" /> Profile
          </div>

          {/* ✅ Corrected Friend Request Options */}
          <Link to="/send-friend-request" className="dropdown-item dropdown-link">
            <FaUserFriends className="dropdown-icon" /> Add Friend
          </Link>
          <Link to="/friend-requests" className="dropdown-item dropdown-link">
            <FaUserFriends className="dropdown-icon" /> Pending Requests
          </Link>

          <div className="dropdown-separator"></div>
          <div className="dropdown-item" onClick={handleLogout}>
            <FaSignOutAlt className="dropdown-icon" /> Logout
          </div>
        </div>
      )}
    </div>
  </div>
</nav>


      <main>
        <section className="hero-section" id="home">
          <div className="welcome-message">
            <h1>Welcome to FunLearn! 🚀</h1>
            <p className="subtitle">Learn, Play, and Grow! 🌱</p>
            <button className="cta-button">Start Learning! 🎉</button>
          </div>
          <canvas ref={canvasRef} id="three-canvas"></canvas>
        </section>

        <section className="mascot-section" id="mascots">
          <h1>Meet Our Playful Mascots!</h1>
          <div className="mascot-grid">
            <div className="mascot-card">
              <img src="https://via.placeholder.com/100?text=Bunny" alt="Bouncy Bunny" />
              <h3>Bouncy Bunny</h3>
              <p>Always hopping around to bring smiles!</p>
            </div>
            <div className="mascot-card">
              <img src="https://via.placeholder.com/100?text=Cat" alt="Curious Cat" />
              <h3>Curious Cat</h3>
              <p>Exploring fun and learning every day!</p>
            </div>
            <div className="mascot-card">
              <img src="https://via.placeholder.com/100?text=Hippo" alt="Happy Hippo" />
              <h3>Happy Hippo</h3>
              <p>Loving adventures and fun challenges!</p>
            </div>
          </div>
        </section>

        <section className="activities-grid" id="activities">
          <div className="activity-card">
            <h2>Math Adventures ➕</h2>
            <p>Solve puzzles with friendly monsters!</p>
          </div>
          <div className="activity-card">
            <h2>Alphabet Safari 🔤</h2>
            <p>Explore letters with jungle animals!</p>
          </div>
          <div className="activity-card">
            <h2>Science World 🌍</h2>
            <p>Discover amazing science facts!</p>
          </div>
        </section>

        <section className="fun-zone" id="fun">
          <h2>Fun Zone!</h2>
          <p>Click on the bouncing ball to see magic!</p>
          <div className="bouncing-ball" id="bouncing-ball"></div>

          {/* Challenge Button */}
            
        </section>
      </main>
    </div>
  );
}

export default Homepage;
