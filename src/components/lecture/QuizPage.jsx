import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./QuizPage.css";
import { db, auth } from "../../firebaseConfig";
import { doc, getDoc, updateDoc, serverTimestamp, setDoc } from "firebase/firestore";

const SpaceQuizPage = () => {
  const navigate = useNavigate();
  const [score, setScore] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [userId, setUserId] = useState(null);
  const courseId = "space-adventure"; // Match this with CourseContentPage

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUserId(user.uid);
        // Check if user has already attempted the quiz
        const courseRef = doc(db, "user_courses", `${user.uid}_${courseId}`);
        const courseDoc = await getDoc(courseRef);
        
        if (courseDoc.exists()) {
          const data = courseDoc.data();
          // If quiz was already completed, redirect to results with saved score
          if (data.quizCompleted) {
            setScore(data.quizScore);
            setSelectedAnswers(data.quizAnswers || {});
            setShowResults(true);
          }
        } else {
          // Create the course document if it doesn't exist
          try {
            await setDoc(courseRef, {
              userId: user.uid,
              courseId: courseId,
              started: true,
              startedAt: serverTimestamp(),
              completed: false,
              quizCompleted: false,
              lastUpdated: serverTimestamp()
            });
          } catch (error) {
            console.error("Error initializing course document:", error);
          }
        }
      } else {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const questions = [
    { 
      question: "What planet do we live on?", 
      options: ["Earth 🌎", "Mars 🔴", "Moon 🌕"], 
      answer: "Earth 🌎" 
    },
    { 
      question: "What is the big bright star in our sky?", 
      options: ["Moon 🌕", "Sun ☀️", "Star ⭐"], 
      answer: "Sun ☀️" 
    },
    { 
      question: "What do astronauts wear in space?", 
      options: ["Space suit 👨‍🚀", "Swimsuit 🩱", "Pajamas 🛌"], 
      answer: "Space suit 👨‍🚀" 
    },
    { 
      question: "What takes astronauts to space?", 
      options: ["Airplane ✈️", "Rocket 🚀", "Car 🚗"], 
      answer: "Rocket 🚀" 
    },
    { 
      question: "What shape is the planet Saturn?", 
      options: ["Square ⬜", "Triangle 🔺", "Circle ⭕"], 
      answer: "Circle ⭕" 
    },
    { 
      question: "What color is the planet Mars?", 
      options: ["Blue 🔵", "Red 🔴", "Green 🟢"], 
      answer: "Red 🔴" 
    },
    { 
      question: "Which is the biggest planet?", 
      options: ["Jupiter 🪐", "Earth 🌎", "Mars 🔴"], 
      answer: "Jupiter 🪐" 
    },
    { 
      question: "What do we see in the night sky?", 
      options: ["Sun ☀️", "Stars ✨", "Rainbow 🌈"], 
      answer: "Stars ✨" 
    },
    { 
      question: "What is the closest object to Earth in space?", 
      options: ["Sun ☀️", "Moon 🌕", "Mars 🔴"], 
      answer: "Moon 🌕" 
    },
    { 
      question: "What do we call a person who travels to space?", 
      options: ["Astronaut 👨‍🚀", "Pilot ✈️", "Diver 🏊"], 
      answer: "Astronaut 👨‍🚀" 
    }
  ];

  const handleOptionSelect = (questionIndex, option) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionIndex]: option
    });
  };

  const handleSubmit = async () => {
    let correctAnswers = 0;
    
    questions.forEach((q, index) => {
      if (selectedAnswers[index] === q.answer) {
        correctAnswers++;
      }
    });
    
    setScore(correctAnswers);
    setShowResults(true);

    // Save quiz results to Firebase
    if (userId) {
      try {
        const courseRef = doc(db, "user_courses", `${userId}_${courseId}`);
        const isPassing = correctAnswers >= (questions.length / 2);
        
        await updateDoc(courseRef, {
          quizCompleted: true,
          quizCompletedAt: serverTimestamp(),
          quizScore: correctAnswers,
          quizTotalQuestions: questions.length,
          quizPercentage: (correctAnswers / questions.length) * 100,
          quizPassingStatus: isPassing,
          quizAnswers: selectedAnswers,
          // Update course completion status if quiz is passed
          completed: isPassing, 
          completedAt: isPassing ? serverTimestamp() : null,
          lastUpdated: serverTimestamp()
        });
      } catch (error) {
        console.error("Error saving quiz results:", error);
      }
    }
  };

  const allQuestionsAnswered = Object.keys(selectedAnswers).length === questions.length;

  return (
    <div className="space-quiz-container">
      <div className="stars"></div>
      <div className="twinkling"></div>
      
      <div className="space-quiz-header">
        <h1>
          <span className="star-icon">⭐</span> 
          Space Adventure Quiz 
          <span className="star-icon">⭐</span>
        </h1>
        <p className="space-quiz-description">
          Complete this quiz to earn your Space Explorer Badge!
        </p>
      </div>

      {!showResults ? (
        <>
          <div className="space-quiz-content">
            {questions.map((q, index) => (
              <div key={index} className="space-question-card">
                <div className="space-question-number">
                  <span className="rocket-icon">🚀</span> Question {index + 1}
                </div>
                <h3 className="space-question-text">{q.question}</h3>
                <div className="space-options-container">
                  {q.options.map((option, idx) => (
                    <div 
                      key={idx}
                      className={`space-option ${selectedAnswers[index] === option ? 'selected' : ''}`}
                      onClick={() => handleOptionSelect(index, option)}
                    >
                      <span className="space-option-indicator"></span>
                      <span className="space-option-text">{option}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div className="space-quiz-footer">
            <div className="space-quiz-progress">
              <span className="astronaut-icon">👨‍🚀</span>
              {Object.keys(selectedAnswers).length} of {questions.length} questions answered
            </div>
            <button 
              className={`space-submit-button ${!allQuestionsAnswered ? 'disabled' : ''}`}
              onClick={handleSubmit}
              disabled={!allQuestionsAnswered}
            >
              <span className="planet-icon">🪐</span> Submit Quiz <span className="planet-icon">🪐</span>
            </button>
          </div>
        </>
      ) : (
        <div className="space-results-container">
          <div className="space-score-card">
            <div className="space-score-header">
              <h2>Space Mission Results</h2>
            </div>
            <div className="space-score-content">
              <div className="space-score-circle">
                <div className="space-score-number">{score}</div>
                <div className="space-score-total">/{questions.length}</div>
              </div>
              <div className="space-score-text">
                {score === questions.length ? (
                  <p>Amazing! You're a Super Space Explorer! 🌟</p>
                ) : score >= questions.length / 2 ? (
                  <p>Good job, Space Cadet! You're on your way to becoming a Space Explorer! 🚀</p>
                ) : (
                  <p>Keep exploring space! Try again to earn more stars! ✨</p>
                )}
              </div>
              <div className="space-badge-container">
                {score === questions.length && (
                  <div className="space-badge">
                    <span className="badge-icon">🏅</span>
                    <p>Space Explorer Badge Earned!</p>
                  </div>
                )}
                {score >= questions.length / 2 && score < questions.length && (
                  <div className="space-badge">
                    <span className="badge-icon">🥈</span>
                    <p>Space Cadet Badge Earned!</p>
                  </div>
                )}
                {score < questions.length / 2 && (
                  <div className="space-badge">
                    <span className="badge-icon">🔭</span>
                    <p>Space Rookie Badge Earned!</p>
                  </div>
                )}
              </div>
            </div>
            <div className="space-results-footer">
              <button className="space-home-button" onClick={() => navigate("/")}>
                <span className="rocket-icon">🚀</span> Back to Space Station
              </button>
              <button className="space-retry-button" onClick={() => navigate("/lecture/course-content")}>
                <span className="rocket-icon">🔄</span> Review Course
              </button>
            </div>
          </div>
          
          <div className="space-answers-review">
            <h3>Review Your Space Mission</h3>
            {questions.map((q, index) => (
              <div key={index} className={`space-review-item ${selectedAnswers[index] === q.answer ? 'correct' : 'incorrect'}`}>
                <div className="space-review-question">
                  <span className="space-status-indicator"></span>
                  <p>{q.question}</p>
                </div>
                <div className="space-review-answers">
                  <p>
                    <strong>Your answer:</strong> {selectedAnswers[index]}
                    {selectedAnswers[index] !== q.answer && (
                      <span className="space-correct-answer">
                        <strong>Correct answer:</strong> {q.answer}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SpaceQuizPage;