import { useEffect, useRef, useState } from 'react';
import './homepageCSS/Homepage.css';
import './homepageCSS/dropdown.css';
import { FaHome, FaBook, FaGamepad, FaChartLine, FaUser, FaSignOutAlt, FaUserFriends } from "react-icons/fa";
import { Link, useNavigate } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Homepage({ onLogout, currentUserId }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleLogout = () => {
    setShowDropdown(false);
    onLogout();
  };
  const goToStory = () => {
    navigate('/create-story'); 
  };

  const sendChallenge = async () => {
    const opponentId = prompt("Enter opponent's user ID:");
    if (!opponentId) return;

    setIsLoading(true);
    try {
      await addDoc(collection(db, 'challenges'), {
        challengerId: currentUserId,
        opponentId,
        status: 'pending',
        createdAt: new Date(),
      });
      toast.success('Challenge sent successfully!');
    } catch (error) {
      console.error('Error sending challenge:', error);
      toast.error('Failed to send challenge.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <nav className="navbar">
        <div className="logo">FunLearn</div>
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
          <div className="profile-menu" onClick={toggleDropdown} aria-label="Profile Menu">
            <div className="profile-preview">
              <img src="https://cdn-icons-png.flaticon.com/512/5294/5294712.png" alt="User Profile" />
            </div>
            {showDropdown && (
              <div className="profile-dropdown">
                <div className="dropdown-item" onClick={() => navigate("/profile-page")}>
                <FaUser className="dropdown-icon" /> Profile
                </div>
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
            <button className="cta-button" disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Start Learning! 🎉'}
            </button>
          </div>
          {/* Add GIF here */}
          <img
            src="https://i.pinimg.com/originals/37/39/3f/37393f39848461fd160c105ea868dd2a.gif"
            alt="FunLearn GIF"
            className="welcome-gif"
          />
          <canvas ref={canvasRef} id="three-canvas"></canvas>
        </section>
        <section className="mascot-section" id="mascots">
          <h1>Meet Our Playful Mascots!</h1>
          <div className="mascot-grid">
          <div className="mascot-card" onClick={goToStory} style={{ cursor: 'pointer' }}>
            <img src="https://png.pngtree.com/png-vector/20231108/ourmid/pngtree-cute-rabbit-happy-face-character-png-image_10441479.png" alt="Bouncy Bunny" />
            <h2>Story time!</h2>
            <p>Generate your ow story!!</p>
          </div>
            <div className="mascot-card">
              <img src="https://png.pngtree.com/png-vector/20231107/ourmid/pngtree-cute-baby-cat-full-body-png-image_10506933.png" alt="Curious Cat" />
              <h3>Curious Cat</h3>
              <p>Exploring fun and learning every day!</p>
            </div>
            <div className="mascot-card">
              <img src="https://png.pngtree.com/png-vector/20230728/ourmid/pngtree-cartoon-hippo-clipart-cartoon-hippo-with-ears-on-white-background-vector-png-image_6865930.png" alt="Happy Hippo" />
              <h3>Happy Hippo</h3>
              <p>Loving adventures and fun challenges!</p>
            </div>
          </div>
        </section>
        <section className="activities-grid" id="activities">
  <div className="activity-card">
    <img src="https://png.pngtree.com/png-clipart/20240315/original/pngtree-3d-cute-student-character-with-a-math-png-image_14595985.png" alt="Math Adventures" />
    <h2>Math Adventures ➕</h2>
    <p>Solve puzzles with friendly monsters!</p>
  </div>
  
  <div className="activity-card">
    <img src="https://png.pngtree.com/png-clipart/20241004/original/pngtree-cute-cartoon-a-alphabet-character-giving-thumbs-up-colorful-vector-illustration-png-image_16198616.png" alt="Alphabet Safari" />
    <h2>Alphabet Safari 🔤</h2>
    <p>Explore letters with jungle animals!</p>
  </div>
  
  <div className="activity-card">
    <img src="https://png.pngtree.com/png-vector/20230728/ourmid/pngtree-mad-scientist-vector-png-image_6981803.png" alt="Science World" />
    <h2>Science World 🌍</h2>
    <p>Discover amazing science facts!</p>
  </div>
</section>

      </main>
    </div>
  );
}

export default Homepage;