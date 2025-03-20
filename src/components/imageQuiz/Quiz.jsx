import React, { useState, useEffect } from 'react';
import QuizSummary from './QuizSummary';
import goodJobImage from './images/good-job.png';
import './Quiz.css';
import { db, auth } from '../../firebaseConfig';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, collection, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const Quiz = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  
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
    
    const isCorrect = currentQuestion.options[selectedIndex] === currentQuestion.answer;
    
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
    
    const currentQuestion = quizData[currentQuestionIndex];
    const isCorrect = currentQuestion.options[index] === currentQuestion.answer;
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
          <>
            <div id="quiz-completed-container">
              <img src={goodJobImage} alt="A star containing the text 'good job'" />
              <h2>Quiz Complete!</h2>
              <h3>Your Score: <span id="score">{score} out of {quizData.length}</span></h3>
              
              {score === quizData.length ? (
                <h3 className="perfect-score">Perfect Score! Great job! 🎉</h3>
              ) : (
                <>
                  <h3>Questions you answered incorrectly:</h3>
                  <QuizSummary questions={quizData} />
                </>
              )}
            </div>
            
            <div className="refresh-container">
              <button id="refresh-button" onClick={handleRestart}>Try Again?</button>
            </div>
          </>
        ) : (
          <>
            <h2 id="progress">Question {currentQuestionIndex + 1} of {quizData.length}</h2>
            <div className="question-content">
              {currentQuestion.imageLink && (
                <img 
                  src={currentQuestion.imageLink} 
                  alt={currentQuestion.question}
                  className="question-image"
                  style={{ width: '200px', height: '200px', objectFit: 'cover' }}
                />
              )}
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