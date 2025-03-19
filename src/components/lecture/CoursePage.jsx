import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BadgeDisplay from "./BadgeDisplay";
import "./CoursePage.css";

const CoursePage = () => {
    const navigate = useNavigate();
    const [courseCompleted, setCourseCompleted] = useState(false);

    useEffect(() => {
        const isCompleted = localStorage.getItem("courseCompleted") === "true";
        setCourseCompleted(isCompleted);
    }, []);

    const handleStartCourse = () => {
        navigate("/lecture/course-content");
    };

    return (
        <div className="course-page">
            <div className="stars"></div>
            <div className="twinkling"></div>
            
            <h1 className="page-title">Welcome to Interactive Learning</h1>
            

            
            <div className="course-container">
                <div className="course-card react-basics">
                    <div className="course-content">
                        <h2>Space Walk</h2>
                        <p className="course-description">Explore the Solar System!</p>
                        <button onClick={handleStartCourse} className="start-button">
                            <span className="button-text">Start Course</span>
                            <span className="rocket">🚀</span>
                        </button>
                    </div>
                </div>
                
                {/* Dummy Course */}
                <div className="course-card advanced-react upcoming">
                    <div className="course-content">
                        <h2>Jurassic World</h2>
                        <div className="coming-soon-badge">Coming Soon</div>
                    </div>
                </div>

                {/* Dummy Course */}
                <div className="course-card react-games upcoming">
                    <div className="course-content">
                        <h2>Roller Coaster: Thrills and Physics!</h2>
                        <div className="coming-soon-badge">Coming Soon</div>
                    </div>
                </div>
            </div>
            
            <BadgeDisplay earned={courseCompleted} />
        </div>
    );
};

export default CoursePage;