import { useEffect, useRef, useState } from 'react';
import './homepageCSS/Homepage.css';
import './homepageCSS/dropdown.css';
import { FaHome, FaBook, FaGamepad, FaChartLine, FaUser, FaSignOutAlt, FaUserFriends, FaStar, FaMagic } from "react-icons/fa";
import { Link, useNavigate } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion } from 'framer-motion'; // You'll need to install framer-motion

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
    <div className="homepage-container">
      <nav className="navbar">
        <div className="logo">
          <span className="logo-text">FunLearn</span>
          <span className="logo-stars">
            <FaStar className="star-icon" />
            <FaStar className="star-icon" />
          </span>
        </div>
        <div className="nav-links">
          <a href="#home" className="nav-item">
            <FaHome className="nav-icon" /> <span>Home</span>
          </a>
          <Link to="/lecture" className="nav-item">
            <FaGamepad className="nav-icon" /> <span>Lessons</span>
          </Link>
          <Link to="/games" className="nav-item">
            <FaGamepad className="nav-icon" /> <span>Games</span>
          </Link>
          <a href="#progress" className="nav-item">
            <FaChartLine className="nav-icon" /> <span>Progress</span>
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
                <div className="dropdown-item logout-item" onClick={handleLogout}>
                  <FaSignOutAlt className="dropdown-icon" /> Logout
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main>
        <section className="hero-section" id="home">
          <div className="hero-content">
            <motion.div 
              className="welcome-message"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="hero-title">Welcome to <span className="highlight">FunLearn!</span> <span className="emoji">🚀</span></h1>
              <p className="subtitle">Where Learning Becomes a Magical Adventure <span className="emoji">✨</span></p>
              <div className="hero-features">
                <div className="feature">
                  <FaStar className="feature-icon" />
                  <span>Interactive Games</span>
                </div>
                <div className="feature">
                  <FaMagic className="feature-icon" />
                  <span>Personalized Learning</span>
                </div>
              </div>
              <button className="cta-button" disabled={isLoading}>
                {isLoading ? 'Loading...' : 'Start Your Adventure! 🎉'}
              </button>
            </motion.div>
            <motion.div 
              className="hero-image-container"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <img
                src="https://i.pinimg.com/originals/37/39/3f/37393f39848461fd160c105ea868dd2a.gif"
                alt="FunLearn GIF"
                className="welcome-gif"
              />
              <div className="floating-elements">
                <div className="floating-element element-1">🧩</div>
                <div className="floating-element element-2">📚</div>
                <div className="floating-element element-3">🔍</div>
                <div className="floating-element element-4">🎨</div>
              </div>
            </motion.div>
          </div>
          <canvas ref={canvasRef} id="three-canvas"></canvas>
        </section>

        <section className="mascot-section" id="mascots">
          <div className="section-header">
            <h1>Meet Our Playful Mascots!</h1>
            <p className="section-subtitle">Your friendly companions on this learning journey</p>
          </div>
          <div className="mascot-grid">
            <motion.div 
              className="mascot-card"
              onClick={goToStory}
              whileHover={{ y: -10, boxShadow: "0 15px 30px rgba(0, 0, 0, 0.2)" }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="mascot-image-container">
                <img src="https://png.pngtree.com/png-vector/20231108/ourmid/pngtree-cute-rabbit-happy-face-character-png-image_10441479.png" alt="Bouncy Bunny" />
              </div>
              <div className="mascot-content">
                <h2>Story Time!</h2>
                <p>Create your own magical stories with our AI storyteller!</p>
                <span className="mascot-action">Let's write! →</span>
              </div>
            </motion.div>
            
            <motion.div 
                className="mascot-card"
                whileHover={{ y: -10, boxShadow: "0 15px 30px rgba(0, 0, 0, 0.2)" }}
                transition={{ type: "spring", stiffness: 300 }}
                onClick={() => window.location.href = 'http://127.0.0.1:5000/'}
                style={{ cursor: 'pointer' }}
              >
                <div className="mascot-image-container">
                 <img src="/images/guru.png" alt="Spiritual Guide" />                
                 </div>
                <div className="mascot-content">
                  <h2>Try thiss!!</h2>
                  <p>Join us to learn the values from sacred texts!</p>
                  <span className="mascot-action">Explore! →</span>
                </div>
            </motion.div>
            
            <motion.div 
              className="mascot-card"
              whileHover={{ y: -10, boxShadow: "0 15px 30px rgba(0, 0, 0, 0.2)" }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="mascot-image-container">
                <img src="https://png.pngtree.com/png-vector/20230728/ourmid/pngtree-cartoon-hippo-clipart-cartoon-hippo-with-ears-on-white-background-vector-png-image_6865930.png" alt="Happy Hippo" />
              </div>
              <div className="mascot-content">
                <h2>Happy Hippo</h2>
                <p>Master challenges and solve problems with Hippo's help!</p>
                <span className="mascot-action">Let's go! →</span>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="activities-section" id="activities">
          <div className="section-header">
            <h1>Learning Adventures</h1>
            <p className="section-subtitle">Exciting educational activities to explore</p>
          </div>
          
          <div className="activities-grid">
            <motion.div 
              className="activity-card"
              whileHover={{ y: -10, boxShadow: "0 15px 30px rgba(0, 0, 0, 0.2)" }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="activity-icon">
                <img src="https://png.pngtree.com/png-clipart/20240315/original/pngtree-3d-cute-student-character-with-a-math-png-image_14595985.png" alt="Math Adventures" />
              </div>
              <div className="activity-content">
                <h2>Math Adventures <span className="emoji">➕</span></h2>
                <p>Solve puzzles with friendly monsters and become a math wizard!</p>
                <button className="activity-button">Start Learning</button>
              </div>
            </motion.div>
            
            <motion.div 
              className="activity-card"
              whileHover={{ y: -10, boxShadow: "0 15px 30px rgba(0, 0, 0, 0.2)" }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="activity-icon">
                <img src="https://png.pngtree.com/png-clipart/20241004/original/pngtree-cute-cartoon-a-alphabet-character-giving-thumbs-up-colorful-vector-illustration-png-image_16198616.png" alt="Alphabet Safari" />
              </div>
              <div className="activity-content">
                <h2>Alphabet Safari <span className="emoji">🔤</span></h2>
                <p>Explore letters and words with fun jungle animals!</p>
                <button className="activity-button">Start Learning</button>
              </div>
            </motion.div>
            
            <motion.div 
              className="activity-card"
              whileHover={{ y: -10, boxShadow: "0 15px 30px rgba(0, 0, 0, 0.2)" }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="activity-icon">
                <img src="https://png.pngtree.com/png-vector/20230728/ourmid/pngtree-mad-scientist-vector-png-image_6981803.png" alt="Science World" />
              </div>
              <div className="activity-content">
                <h2>Science World <span className="emoji">🌍</span></h2>
                <p>Discover amazing science facts and conduct fun experiments!</p>
                <button className="activity-button">Start Learning</button>
              </div>
            </motion.div>

            <motion.div 
              className="activity-card"
              whileHover={{ y: -10, boxShadow: "0 15px 30px rgba(0, 0, 0, 0.2)" }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Link to="/speech-checker" className="activity-link">
                <div className="activity-icon">
                  <img src="images/speech.png" alt="Speech Practice" />
                </div>
                <div className="activity-content">
                  <h2>Speech Practice <span className="emoji">🗣️</span></h2>
                  <p>Practice speaking and pronunciation with friendly feedback!</p>
                  <button className="activity-button">Start Practice</button>
                </div>
              </Link>
            </motion.div>
          </div>
        </section>

        <section className="features-section">
          <div className="section-header">
            <h1>Why Choose FunLearn?</h1>
            <p className="section-subtitle">Learning that grows with your child</p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🔍</div>
              <h3>Personalized Learning</h3>
              <p>Adapts to your child's unique learning style and pace</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🏆</div>
              <h3>Gamified Rewards</h3>
              <p>Earn badges and rewards to stay motivated</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">👨‍👩‍👧‍👦</div>
              <h3>Parent Dashboard</h3>
              <p>Track progress and achievements</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🛡️</div>
              <h3>Kid-Safe Environment</h3>
              <p>100% safe and ad-free learning experience</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-logo">
            <div className="logo">FunLearn</div>
            <p>Where learning becomes an adventure</p>
          </div>
          <div className="footer-links">
            <div className="footer-column">
              <h3>Explore</h3>
              <a href="#home">Home</a>
              <a href="#lessons">Lessons</a>
              <a href="/games">Games</a>
              <a href="#progress">Progress</a>
            </div>
            <div className="footer-column">
              <h3>Support</h3>
              <a href="#">Help Center</a>
              <a href="#">Contact Us</a>
              <a href="#">FAQ</a>
            </div>
            <div className="footer-column">
              <h3>Legal</h3>
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 FunLearn. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default Homepage;