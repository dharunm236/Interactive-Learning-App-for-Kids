import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CourseContentPage.css";

const SpaceCourseContentPage = () => {
  const navigate = useNavigate();
  const [completedSections, setCompletedSections] = useState([]);
  const [activeSection, setActiveSection] = useState(1);

  const sections = [
    { 
      id: 1, 
      title: "Meet the Planets", 
      videoUrl: "https://www.youtube.com/embed/IBwE4baZyh0", 
      icon: "🪐"
    },
    { 
      id: 2, 
      title: "Stars and the Sun", 
      videoUrl: "https://www.youtube.com/embed/sePqPIXMsAc",
      icon: "⭐" 
    },
    { 
      id: 3, 
      title: "Spaceships and Rockets", 
      videoUrl: "https://www.youtube.com/embed/o2FFtPPM3iY",
      icon: "🚀" 
    },
    { 
      id: 4, 
      title: "Astronauts in Space", 
      videoUrl: "https://www.youtube.com/embed/nnCM_ar9Zig",
      icon: "👨‍🚀" 
    },
    { 
      id: 5, 
      title: "Exploring Mars", 
      videoUrl: "https://www.youtube.com/embed/oupKhIPIh7g",
      icon: "🔴" 
    },
    { 
      id: 6, 
      title: "Saturn and Its Rings", 
      videoUrl: "https://www.youtube.com/embed/BxY8v4lNltM",
      icon: "⭕" 
    },
    { 
      id: 7, 
      title: "Jupiter: The Giant Planet", 
      videoUrl: "https://www.youtube.com/embed/E4k-QBikhvc",
      icon: "🪐" 
    },
    { 
      id: 8, 
      title: "The Moon: Earth's Companion", 
      videoUrl: "https://www.youtube.com/embed/rzg3-D2Ru8c",
      icon: "🌕" 
    },
    { 
      id: 9, 
      title: "The Night Sky and Stars", 
      videoUrl: "https://www.youtube.com/embed/lSuAPFMXcYM",
      icon: "✨" 
    },
    { 
      id: 10, 
      title: "Life as an Astronaut", 
      videoUrl: "https://www.youtube.com/embed/jhD8GFwy734",
      icon: "👨‍🚀" 
    }
  ];

  const markCompleted = (id) => {
    if (!completedSections.includes(id)) {
      setCompletedSections([...completedSections, id]);
    }
  };

  const handleSectionClick = (id) => {
    setActiveSection(id);
  };

  const allCompleted = completedSections.length === sections.length;

  return (
    <div className="space-content-page">
      <div className="stars"></div>
      <div className="twinkling"></div>
      
      <div className="space-content-header">
        <h1>
          <span className="rocket-icon">🚀</span> 
          Space Adventure 
          <span className="planet-icon">🪐</span>
        </h1>
        <div className="space-progress-container">
          <div className="space-progress-text">
            <span className="astronaut-icon">👨‍🚀</span>
            {completedSections.length}/{sections.length} missions completed
          </div>
          <div className="space-progress-bar">
            <div 
              className="space-progress-fill" 
              style={{ width: `${(completedSections.length / sections.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="space-course-layout">
        <div className="space-sidebar">
          <h3>Space Missions</h3>
          <ul className="space-section-list">
            {sections.map((section) => (
              <li 
                key={section.id} 
                className={`space-section-item ${activeSection === section.id ? 'active' : ''} ${completedSections.includes(section.id) ? 'completed' : ''}`}
                onClick={() => handleSectionClick(section.id)}
              >
                <div className="space-section-content">
                  <span className="space-section-icon">{section.icon}</span>
                  <span className="space-section-title">{section.title}</span>
                  {completedSections.includes(section.id) && <span className="space-tick">✓</span>}
                </div>
              </li>
            ))}
          </ul>
          {allCompleted && (
            <button 
              onClick={() => navigate("/lecture/quiz")} 
              className="space-quiz-btn"
            >
              <span className="star-icon">⭐</span> Space Quiz <span className="star-icon">⭐</span>
            </button>
          )}
        </div>

        <div className="space-main-content">
          {sections
            .filter(section => section.id === activeSection)
            .map((section) => (
              <div key={section.id} className="space-video-section">
                <h2>
                  <span className="space-section-icon">{section.icon}</span>
                  {section.title}
                </h2>
                <div className="space-video-container">
                  <iframe 
                    src={section.videoUrl} 
                    title={section.title} 
                    allowFullScreen
                  ></iframe>
                </div>
                <div className="space-section-controls">
                  <button 
                    onClick={() => markCompleted(section.id)}
                    className={`space-complete-btn ${completedSections.includes(section.id) ? 'completed' : ''}`}
                  >
                    {completedSections.includes(section.id) ? 'Mission Completed! 🌟' : 'Complete Mission! 🌟'}
                  </button>
                  <div className="space-section-navigation">
                    {section.id > 1 && (
                      <button className="space-nav-btn space-prev" onClick={() => setActiveSection(section.id - 1)}>
                        ◀ Previous Mission
                      </button>
                    )}
                    {section.id < sections.length && (
                      <button className="space-nav-btn space-next" onClick={() => setActiveSection(section.id + 1)}>
                        Next Mission ▶
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default SpaceCourseContentPage;