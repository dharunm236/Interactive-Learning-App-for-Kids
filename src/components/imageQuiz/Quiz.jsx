import React, { useState, useEffect } from 'react';
import QuizSummary from './QuizSummary';
import ProgressReport from './ProgressReport'; // Import the ProgressReport component
import goodJobImage from './images/good-job.png';
import './Quiz.css';
import { db, auth } from '../../firebaseConfig';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, collection, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const Quiz = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Quiz questions data
  const questions = [
    {
      question: "what is the largest animal in the world?",
      options: ["giraffe", "brown bear", "elephant", "blue whale"],
      answer: "blue whale",
      userAnswer: null
    },
    {
      question: "what is the name of the world´s highest mountain?",
      options: ["alps", "zugspitze", "mount everest", "annapurna"],
      answer: "mount everest",
      userAnswer: null
    },
    {
      question: "how many wings does a butterfly have?",
      options: ["4", "2", "8", "6"],
      answer: "4",
      userAnswer: null
    },
    {
      question: "at what age do you become a teenager?",
      options: ["10", "12", "15", "13"],
      answer: "13",
      userAnswer: null
    },
    {
      question: "what is the capital city of scotland?",
      options: ["edinburgh", "glasgow", "toronto", "london"],
      answer: "edinburgh",
      userAnswer: null
    },
    {
      question: "how many players are there in a fotball team?",
      options: ["8", "10", "11", "12"],
      answer: "11",
      userAnswer: null
    },
    {
      question: "a lobster has how many legs?",
      options: ["8", "20", "12", "10"],
      answer: "10",
      userAnswer: null
    },
    {
      question: "how long is one hour in minutes?",
      options: ["60", "100", "80", "90"],
      answer: "60",
      userAnswer: null
    },
    {
      question: "what date is christmas eve?",
      options: ["21th december", "22th december", "23th december", "24th december"],
      answer: "24th december",
      userAnswer: null
    },
    {
      question: "which country has the largest population in the world",
      options: ["usa", "china", "japan", "india"],
      answer: "china",
      userAnswer: null
    }
  ];

  // State variables
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(null);
  const [isQuizComplete, setIsQuizComplete] = useState(false);
  const [quizData, setQuizData] = useState([]);

  // Fetch questions from Firestore
  const fetchQuestions = async () => {
    try {
      const questionsRef = collection(db, "imagequiz");
      const querySnapshot = await getDocs(questionsRef);
      
      if (!querySnapshot.empty) {
        const fetchedQuestions = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          fetchedQuestions.push({
            id: doc.id,
            question: data.question,
            options: data.options,
            answer: data.answer,
            imageLink: data.imageLink,
            userAnswer: null
          });
        });
        
        // Shuffle questions and pick 10 random ones
        const shuffled = fetchedQuestions.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 10);
        
        setQuestions(selected);
        setQuizData(selected);
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  };

  // Reset image loading state when current question changes
  useEffect(() => {
    setImageLoading(true);
  }, [currentQuestionIndex]);

  // Check authentication and load previous attempt data
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUserId(user.uid);
        
        // First fetch questions from Firestore
        await fetchQuestions();
        
        // Then check if user has previously attempted the quiz
        try {
          const quizRef = doc(db, "imageQuiz", user.uid);
          const quizDoc = await getDoc(quizRef);

          if (quizDoc.exists() && quizDoc.data().completed) {
            // If previous attempt exists, load that data
            const data = quizDoc.data();
            if (data.quizData) {
              setQuizData(data.quizData);
              setScore(data.score || 0);
              setIsQuizComplete(true);
            }
          }
        } catch (error) {
          console.error("Error fetching quiz data:", error);
        }
        
        setLoading(false);
      } else {
        // Redirect unauthenticated users to login
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Check answer when option is selected
  const checkAnswer = async (selectedIndex) => {
    if (isAnswered) return; // Prevent multiple selections

    setIsAnswered(true);
    setSelectedOptionIndex(selectedIndex);

    const currentQuestion = quizData[currentQuestionIndex];
    const updatedQuizData = [...quizData];
    updatedQuizData[currentQuestionIndex].userAnswer = currentQuestion.options[selectedIndex];

    const isCorrect = selectedIndex === currentQuestion.options.indexOf(currentQuestion.answer);

    if (isCorrect) {
      setScore(score + 1);
    }

    setQuizData(updatedQuizData);

    // Move to next question after a short delay
    setTimeout(() => {
      if (currentQuestionIndex < quizData.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setIsAnswered(false);
        setSelectedOptionIndex(null);
      } else {
        setIsQuizComplete(true);
        // Save the final quiz results to Firestore
        saveQuizResults(updatedQuizData, score + (isCorrect ? 1 : 0));
      }
    }, 1500);
  };

  // Handle image loading
  const handleImageLoad = () => {
    setImageLoading(false);
  };

  // Save quiz results to Firestore
  const saveQuizResults = async (quizData, finalScore) => {
    if (!userId) return;

    try {
      const quizRef = doc(db, "imageQuiz", userId);
      const quizDoc = await getDoc(quizRef);

      const quizResultData = {
        userId: userId,
        completed: true,
        completedAt: serverTimestamp(),
        score: finalScore,
        totalQuestions: quizData.length,
        percentage: (finalScore / quizData.length) * 100,
        quizData: quizData,
        lastUpdated: serverTimestamp()
      };

      if (quizDoc.exists()) {
        // Update existing document
        await updateDoc(quizRef, quizResultData);
      } else {
        // Create new document
        await setDoc(quizRef, {
          ...quizResultData,
          firstAttemptAt: serverTimestamp(),
          attempts: 1
        });
      }
    } catch (error) {
      console.error("Error saving quiz results:", error);
    }
  };

  // Handle quiz restart
  const handleRestart = async () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setIsAnswered(false);
    setSelectedOptionIndex(null);
    setIsQuizComplete(false);
    
    // Reset all userAnswers to null
    const resetQuizData = quizData.map(q => ({ ...q, userAnswer: null }));
    setQuizData(resetQuizData);

    if (userId) {
      try {
        const quizRef = doc(db, "imageQuiz", userId);
        const quizDoc = await getDoc(quizRef);

        if (quizDoc.exists()) {
          // Update attempts count
          await updateDoc(quizRef, {
            completed: false,
            attempts: (quizDoc.data().attempts || 1) + 1,
            lastUpdated: serverTimestamp()
          });
        }
      } catch (error) {
        console.error("Error updating quiz attempts:", error);
      }
    }
  };

  // Determine button class based on selection and correctness
  const getButtonClass = (index) => {
    if (!isAnswered || selectedOptionIndex !== index) {
      return "option-button";
    }

    const isCorrect = index === currentQuestion.options.indexOf(currentQuestion.answer);
    return isCorrect ? "option-button option-correct" : "option-button option-incorrect";
  };

  if (loading || quizData.length === 0) {
    return (
      <div className="quiz-page">
        <div className="quiz-container">
          <h1>Loading Quiz...</h1>
        </div>
      </div>
    );
  }

  // Current question to display
  const currentQuestion = quizData[currentQuestionIndex];

  return (
    <div className="quiz-page">
      <div className="quiz-container">
        <h1>Fun quiz for kids</h1>
        <hr />

        {isQuizComplete ? (
          <ProgressReport 
            score={score}
            totalQuestions={questions.length}
            quizData={quizData}
            percentage={(score / questions.length) * 100}
            onRetakeQuiz={handleRestart} 
          />
        ) : (
          <>
            <h2 id="progress">Question {currentQuestionIndex + 1} of {questions.length}</h2>
            <div className="question-content">
              <div className="image-container">
                {imageLoading && (
                  <div className="image-loading-placeholder">
                    <div className="spinner"></div>
                    <p>Loading image...</p>
                  </div>
                )}
                {currentQuestion.imageLink && (
                  <img 
                    src={currentQuestion.imageLink} 
                    alt={currentQuestion.question}
                    className={`question-image ${imageLoading ? 'hidden' : ''}`}
                    style={{ width: '200px', height: '200px', objectFit: 'cover' }}
                    onLoad={handleImageLoad}
                  />
                )}
              </div>
              <p id="question">{currentQuestion.question}</p>
            </div>
            
            <div id="options" className="options-container">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  className={getButtonClass(index)}
                  onClick={() => checkAnswer(index)}
                  disabled={isAnswered}
                >
                  {option}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Quiz;