import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import './homepageCSS/Homepage.css'; // Assuming you place your CSS in this file
import './homepageCSS/dropdown.css';
import { FaUser, FaSignOutAlt, FaBook, FaGamepad, FaChartLine, FaHome } from 'react-icons/fa';
import { GiBouncingSword, GiChemicalDrop, GiAlphabet } from 'react-icons/gi';
import { Link } from 'react-router-dom';



function Homepage({ onLogout, onProfileClick }) {
    const [showDropdown, setShowDropdown] = useState(false);
    const canvasRef = useRef(null); 
    const toggleDropdown = () => {
      setShowDropdown(!showDropdown);
    };

    const handleLogout = () => {
        setShowDropdown(false); // Close the dropdown
        onLogout(); // Actually log the user out
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
            <div className="profile-menu" onClick={toggleDropdown}>
            <div className="profile-preview">
                <img src="https://via.placeholder.com/40?text=U" alt="Profile" />
            </div>
            {showDropdown && (
                <div className="profile-dropdown">
                <div className="dropdown-item" onClick={onProfileClick}>
                    <FaUser className="dropdown-icon" /> Profile
                </div>
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
        </section>
      </main>
    </div>
  );
}

export default Homepage;
