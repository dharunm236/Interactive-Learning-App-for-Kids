import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { db, auth } from '../../firebaseConfig';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import './QuizPage.css';

const LectureProgressReport = () => {
  const navigate = useNavigate();
  const [courseData, setCourseData] = useState({ completedSections: 0, totalSections: 10 });
  const [quizResults, setQuizResults] = useState({ score: 0, totalQuestions: 10 });
  const user = auth.currentUser;
  const courseId = "space-adventure";

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        const courseRef = doc(db, "user_courses", `${user.uid}_${courseId}`);
        const courseDoc = await getDoc(courseRef);
        
        if (courseDoc.exists()) {
          const data = courseDoc.data();
          setCourseData({
            completedSections: data.completedSections || 0,
            totalSections: 10
          });
          
          if (data.quizCompleted) {
            setQuizResults({
              score: data.quizScore || 0,
              totalQuestions: data.quizTotalQuestions || 10
            });
          }
        }
      }
    };
    fetchData();
  }, [user]);

  // Chart data calculations
  const courseProgressData = [
    { name: 'Completed', value: courseData.completedSections },
    { name: 'Remaining', value: courseData.totalSections - courseData.completedSections },
  ];

  const quizChartData = [
    { name: 'Correct', value: quizResults.score },
    { name: 'Incorrect', value: quizResults.totalQuestions - quizResults.score },
  ];

  const getSuggestions = () => {
    const percentage = (quizResults.score / quizResults.totalQuestions) * 100;
    if (percentage >= 90) return "Galactic Master! You've conquered space knowledge! 🚀";
    if (percentage >= 75) return "Space Expert! Keep reaching for the stars! 🌟";
    if (percentage >= 50) return "Stellar Progress! Keep exploring the cosmos! ✨";
    return "Cosmic Learner! Review missions to boost your space knowledge! 🌌";
  };

  return (
    <div className="space-quiz-container">
      <div className="stars"></div>
      <div className="twinkling"></div>
      
      <div className="space-quiz-header">
        <h1>
          <span className="star-icon">📊</span> 
          Space Learning Report 
          <span className="star-icon">📊</span>
        </h1>
      </div>

      <div className="space-results-container">
        <div className="space-score-card">
          <div className="space-score-content">
            <div className="progress-section">
              <h3>Course Progress</h3>
              <div className="progress-chart">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={courseProgressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="progress-stats">
                <p>Completed Missions: {courseData.completedSections}/{courseData.totalSections}</p>
                <p>Progress: {((courseData.completedSections / courseData.totalSections) * 100).toFixed(1)}%</p>
              </div>
            </div>

            <div className="quiz-performance-section">
              <h3>Quiz Performance</h3>
              <div className="quiz-chart">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={quizChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="quiz-stats">
                <p>Score: {quizResults.score}/{quizResults.totalQuestions}</p>
                <p>Accuracy: {((quizResults.score / quizResults.totalQuestions) * 100).toFixed(1)}%</p>
              </div>
            </div>

            <div className="space-suggestion-box">
              <h3>Mission Debrief</h3>
              <p>{getSuggestions()}</p>
            </div>
          </div>

          <div className="space-results-footer">
            <button 
              className="space-home-button" 
              onClick={() => {
                console.log("Back to Missions clicked");
                navigate("/lecture/course-content");
              }}
            >
              📚 Back to Missions
            </button>
            <button 
              className="space-retry-button" 
              onClick={async () => {
                console.log("Retake Quiz clicked");
                if (user) {
                  try {
                    const courseRef = doc(db, "user_courses", `${user.uid}_${courseId}`);
                    await updateDoc(courseRef, {
                      quizCompleted: false,
                      quizScore: 0,
                      quizAnswers: {},
                      lastUpdated: serverTimestamp()
                    });
                    console.log("Quiz data reset successfully");
                  } catch (error) {
                    console.error("Error resetting quiz data:", error);
                  }
                }
                navigate("/lecture/quiz");
              }}
            >
              ✏️ Retake Quiz
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LectureProgressReport;