import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { Line, Bar, Radar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, RadialLinearScale, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { 
  FaTrophy, 
  FaGamepad, 
  FaChartLine, 
  FaPuzzlePiece, 
  FaRocket, 
  FaMoneyBill, 
  FaCheckSquare, 
  FaBalanceScale 
} from 'react-icons/fa';
import styles from './ProgressPage.module.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement, RadialLinearScale, ArcElement, Title, Tooltip, Legend
);

const ProgressPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for all progress data
  const [progressData, setProgressData] = useState({
    moneyGame: { history: [], averageScore: 0, totalGames: 0 },
    balloonGame: { history: [], averageScore: 0, totalGames: 0 },
    imageQuiz: { completed: false, score: 0, percentage: 0, attempts: 0 },
    invadersQuiz: { completed: false, score: 0, highestScore: 0, attempts: 0 },
    spaceCourse: { completed: false, quizScore: 0, quizPercentage: 0 },
    overallProgress: { completed: 0, total: 5, percentage: 0 } // 5 components to track
  });

  // Format date for charts
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    
    const date = timestamp instanceof Date 
      ? timestamp 
      : timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  // Load user data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        navigate('/login');
        return;
      }
      
      setUser(currentUser);
      try {
        await fetchAllUserData(currentUser.uid);
      } catch (err) {
        console.error('Error loading progress data:', err);
        setError('Failed to load your progress data. Please try again later.');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Fetch all user data from Firestore
  const fetchAllUserData = async (userId) => {
    const data = { ...progressData };
    
    // 1. Fetch Money Game data
    await fetchGameData(userId, 'moneyGame', data.moneyGame);
    
    // 2. Fetch Balloon Game data
    await fetchGameData(userId, 'balloonGame', data.balloonGame);
    
    // 3. Fetch Image Quiz data
    await fetchQuizData(userId, 'imageQuiz', data.imageQuiz);
    
    // 4. Fetch Invaders Quiz data
    await fetchInvaderQuizData(userId, data.invadersQuiz);
    
    // 5. Fetch Space Course data
    await fetchSpaceCourseData(userId, data.spaceCourse);
    
    // Calculate overall progress
    const completedItems = [
      data.imageQuiz.completed,
      data.invadersQuiz.completed,
      data.spaceCourse.completed,
      data.moneyGame.totalGames > 0,
      data.balloonGame.totalGames > 0
    ].filter(Boolean).length;
    
    data.overallProgress.completed = completedItems;
    data.overallProgress.percentage = (completedItems / data.overallProgress.total) * 100;
    
    setProgressData(data);
  };

  // Fetch game data (Money Game and Balloon Game)
  const fetchGameData = async (userId, gameId, dataObject) => {
    try {
      // Get user's played games
      const playedGamesRef = doc(db, "played_games", userId);
      const playedGamesSnap = await getDoc(playedGamesRef);
      
      if (playedGamesSnap.exists()) {
        const data = playedGamesSnap.data();
        const gamesPlayed = data.gamesPlayed || [];
        
        // Filter games for this specific game
        const filteredGames = gamesPlayed
          .filter(game => game.gameId === gameId)
          .sort((a, b) => {
            // Sort by createdAt timestamp
            const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
            const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
            return dateA - dateB;
          });
        
        dataObject.history = filteredGames;
        dataObject.totalGames = filteredGames.length;
        dataObject.averageScore = filteredGames.length > 0 
          ? filteredGames.reduce((sum, game) => sum + game.points, 0) / filteredGames.length
          : 0;
          
        // Calculate score trend (improvement)
        if (filteredGames.length >= 2) {
          const firstScore = filteredGames[0].points;
          const lastScore = filteredGames[filteredGames.length-1].points;
          dataObject.improvement = ((lastScore - firstScore) / firstScore) * 100;
        }
      }
    } catch (error) {
      console.error(`Error fetching ${gameId} data:`, error);
    }
  };

  // Fetch Image Quiz data
  const fetchQuizData = async (userId, quizId, dataObject) => {
    try {
      const quizRef = doc(db, quizId, userId);
      const quizDoc = await getDoc(quizRef);
      
      if (quizDoc.exists()) {
        const data = quizDoc.data();
        dataObject.completed = data.completed || false;
        dataObject.score = data.score || 0;
        dataObject.totalQuestions = data.totalQuestions || 0;
        dataObject.percentage = data.percentage || 0;
        dataObject.attempts = data.attempts || 0;
        dataObject.completedAt = data.completedAt;
      }
    } catch (error) {
      console.error(`Error fetching ${quizId} data:`, error);
    }
  };

  // Fetch Invaders Quiz data
  const fetchInvaderQuizData = async (userId, dataObject) => {
    try {
      const quizRef = doc(db, "invaderQuizResults", userId);
      const quizDoc = await getDoc(quizRef);
      
      if (quizDoc.exists()) {
        const data = quizDoc.data();
        dataObject.completed = data.completed || false;
        dataObject.score = data.score || 0;
        dataObject.highestScore = data.highestScore || 0;
        dataObject.attempts = data.attempts || 0;
        dataObject.lives = data.lives || 0;
        dataObject.questionsAnswered = data.questionsAnswered || 0;
        dataObject.completedAt = data.completedAt;
      }
    } catch (error) {
      console.error('Error fetching invader quiz data:', error);
    }
  };

  // Fetch Space Course data
  const fetchSpaceCourseData = async (userId, dataObject) => {
    try {
      const courseId = "space-adventure";
      const courseRef = doc(db, "user_courses", `${userId}_${courseId}`);
      const courseDoc = await getDoc(courseRef);
      
      if (courseDoc.exists()) {
        const data = courseDoc.data();
        dataObject.completed = data.completed || false;
        dataObject.quizCompleted = data.quizCompleted || false;
        dataObject.quizScore = data.quizScore || 0;
        dataObject.quizTotalQuestions = data.quizTotalQuestions || 0;
        dataObject.quizPercentage = data.quizPercentage || 0;
        dataObject.quizCompletedAt = data.quizCompletedAt;
      }
    } catch (error) {
      console.error('Error fetching space course data:', error);
    }
  };

  // Handle back button click
  const handleBackClick = () => {
    navigate('/');
  };

  // Prepare Game Score History chart data
  const gameScoreChartData = {
    labels: [...progressData.moneyGame.history.map(g => formatDate(g.createdAt)), ...progressData.balloonGame.history.map(g => formatDate(g.createdAt))].slice(-10),
    datasets: [
      {
        label: 'Money Game',
        data: progressData.moneyGame.history.map(game => game.points).slice(-10),
        fill: false,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        tension: 0.1
      },
      {
        label: 'Balloon Game',
        data: progressData.balloonGame.history.map(game => game.points).slice(-10),
        fill: false,
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        tension: 0.1
      }
    ]
  };

  // Prepare Quiz Scores chart data
  const quizScoreChartData = {
    labels: ['Image Quiz', 'Invaders Quiz', 'Space Quiz'],
    datasets: [
      {
        label: 'Score Percentage',
        data: [
          progressData.imageQuiz.percentage, 
          progressData.invadersQuiz.highestScore ? (progressData.invadersQuiz.highestScore / 500) * 100 : 0, // Estimate based on score
          progressData.spaceCourse.quizPercentage
        ],
        backgroundColor: [
          'rgba(255, 206, 86, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(153, 102, 255, 0.6)'
        ],
        borderColor: [
          'rgba(255, 206, 86, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(153, 102, 255, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

  // Prepare Skills Radar chart data
  const skillsRadarData = {
    labels: ['Money Management', 'Word Recognition', 'General Knowledge', 'Vocabulary', 'Space Knowledge'],
    datasets: [
      {
        label: 'Skills Proficiency',
        data: [
          progressData.moneyGame.averageScore / 10, // Normalized to 0-10 scale
          progressData.balloonGame.averageScore / 5, // Normalized to 0-10 scale
          progressData.invadersQuiz.highestScore ? progressData.invadersQuiz.highestScore / 50 : 0, // Normalized to 0-10 scale
          progressData.imageQuiz.percentage / 10, // Normalized to 0-10 scale
          progressData.spaceCourse.quizPercentage / 10 // Normalized to 0-10 scale
        ],
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1
      }
    ]
  };

  // Prepare Overall Progress Doughnut chart data
  const overallProgressChartData = {
    labels: ['Completed', 'Remaining'],
    datasets: [
      {
        data: [
          progressData.overallProgress.completed,
          progressData.overallProgress.total - progressData.overallProgress.completed
        ],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(201, 203, 207, 0.6)'
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(201, 203, 207, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading your progress data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h2>Oops! Something went wrong</h2>
        <p>{error}</p>
        <button onClick={handleBackClick} className={styles.backButton}>
          Go Back Home
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.backButtonContainer}>
          <img
            src="https://cdn-icons-png.flaticon.com/512/93/93634.png"
            alt="Back"
            className={styles.backButtonImage}
            onClick={handleBackClick}
          />
        </div>
        <h1 className={styles.title}>
          <span className={styles.titleIcon}>📊</span> 
          My Learning Progress
          <span className={styles.titleIcon}>📈</span>
        </h1>
        <p className={styles.welcomeMessage}>
          Welcome back, <span className={styles.userName}>{user?.displayName || 'Learner'}</span>!
          Here's how you're doing across all activities.
        </p>
      </div>

      <div className={styles.overviewContainer}>
        <div className={styles.overviewCard}>
          <div className={styles.overallProgressChart}>
            <h3>Overall Progress</h3>
            <div className={styles.chartContainer}>
              <Doughnut 
                data={overallProgressChartData} 
                options={{
                  plugins: {
                    legend: { position: 'bottom' },
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          return `${context.label}: ${context.parsed}/${progressData.overallProgress.total}`;
                        }
                      }
                    }
                  },
                  cutout: '70%'
                }} 
              />
              <div className={styles.centerText}>
                {Math.round(progressData.overallProgress.percentage)}%
              </div>
            </div>
            <p className={styles.progressMessage}>
              {progressData.overallProgress.completed === progressData.overallProgress.total ? 
                "Amazing! You've completed all learning activities! 🎉" : 
                `You've completed ${progressData.overallProgress.completed} out of ${progressData.overallProgress.total} learning activities.`
              }
            </p>
          </div>
        </div>

        <div className={styles.overviewCard}>
          <div className={styles.skillsChart}>
            <h3>Skills Assessment</h3>
            <Radar 
              data={skillsRadarData} 
              options={{
                scales: {
                  r: {
                    beginAtZero: true,
                    max: 10,
                    ticks: { stepSize: 2 }
                  }
                },
                plugins: {
                  legend: { display: false }
                }
              }} 
            />
            <div className={styles.skillLegend}>
              <div className={styles.skillLevel}>
                <span className={styles.beginnerBox}></span>
                <span>Beginner (0-3)</span>
              </div>
              <div className={styles.skillLevel}>
                <span className={styles.intermediateBox}></span>
                <span>Intermediate (4-7)</span>
              </div>
              <div className={styles.skillLevel}>
                <span className={styles.advancedBox}></span>
                <span>Advanced (8-10)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.sectionTitle}>
        <h2><FaGamepad style={{marginRight: '8px'}}/>Game Progress</h2>
        <p>Track your improvement over time in our fun educational games</p>
      </div>

      <div className={styles.gamesContainer}>
        <div className={styles.chartCard}>
          <h3><FaChartLine /> Score History</h3>
          <div className={styles.chartContainer}>
            <Line 
              data={gameScoreChartData} 
              options={{
                scales: {
                  y: { beginAtZero: true }
                },
                plugins: {
                  legend: { position: 'top' }
                }
              }} 
            />
          </div>
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <p className={styles.statLabel}>Money Game Avg</p>
              <p className={styles.statValue}>{Math.round(progressData.moneyGame.averageScore)}</p>
            </div>
            <div className={styles.statItem}>
              <p className={styles.statLabel}>Money Games</p>
              <p className={styles.statValue}>{progressData.moneyGame.totalGames}</p>
            </div>
            <div className={styles.statItem}>
              <p className={styles.statLabel}>Balloon Game Avg</p>
              <p className={styles.statValue}>{Math.round(progressData.balloonGame.averageScore)}</p>
            </div>
            <div className={styles.statItem}>
              <p className={styles.statLabel}>Balloon Games</p>
              <p className={styles.statValue}>{progressData.balloonGame.totalGames}</p>
            </div>
          </div>
          {(progressData.moneyGame.improvement !== undefined || progressData.balloonGame.improvement !== undefined) && (
            <div className={styles.improvementSection}>
              <h4>Improvement Analysis</h4>
              <div className={styles.improvementStats}>
                {progressData.moneyGame.improvement !== undefined && (
                  <div className={progressData.moneyGame.improvement >= 0 ? styles.positiveImprovement : styles.negativeImprovement}>
                    <p>Money Game: {progressData.moneyGame.improvement > 0 ? '+' : ''}{Math.round(progressData.moneyGame.improvement)}%</p>
                  </div>
                )}
                {progressData.balloonGame.improvement !== undefined && (
                  <div className={progressData.balloonGame.improvement >= 0 ? styles.positiveImprovement : styles.negativeImprovement}>
                    <p>Balloon Game: {progressData.balloonGame.improvement > 0 ? '+' : ''}{Math.round(progressData.balloonGame.improvement)}%</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className={styles.gameDetailsCard}>
          <h3>Money Game Details</h3>
          <div className={styles.gameStats}>
            <div className={styles.gameStatDetail}>
              <span className={styles.statIcon}></span>
              <div>
                <p className={styles.statTitle}>Total Games</p>
                <p className={styles.statNumber}>{progressData.moneyGame.totalGames}</p>
              </div>
            </div>
            <div className={styles.gameStatDetail}>
              <span className={styles.statIcon}></span>
              <div>
                <p className={styles.statTitle}>Best Score</p>
                <p className={styles.statNumber}>
                  {progressData.moneyGame.history.length > 0 ? 
                    Math.max(...progressData.moneyGame.history.map(g => g.points)) : 0}
                </p>
              </div>
            </div>
            <div className={styles.gameStatDetail}>
              <span className={styles.statIcon}></span>
              <div>
                <p className={styles.statTitle}>Average Score</p>
                <p className={styles.statNumber}>{Math.round(progressData.moneyGame.averageScore)}</p>
              </div>
            </div>
            <div className={styles.gameStatDetail}>
              <span className={styles.statIcon}></span>
              <div>
                <p className={styles.statTitle}>Last Game</p>
                <p className={styles.statNumber}>
                  {progressData.moneyGame.history.length > 0 ? 
                    formatDate(progressData.moneyGame.history[progressData.moneyGame.history.length-1].createdAt) : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <h3 className={styles.secondGameTitle}>Balloon Game Details</h3>
          <div className={styles.gameStats}>
            <div className={styles.gameStatDetail}>
              <span className={styles.statIcon}></span>
              <div>
                <p className={styles.statTitle}>Total Games</p>
                <p className={styles.statNumber}>{progressData.balloonGame.totalGames}</p>
              </div>
            </div>
            <div className={styles.gameStatDetail}>
              <span className={styles.statIcon}></span>
              <div>
                <p className={styles.statTitle}>Best Score</p>
                <p className={styles.statNumber}>
                  {progressData.balloonGame.history.length > 0 ? 
                    Math.max(...progressData.balloonGame.history.map(g => g.points)) : 0}
                </p>
              </div>
            </div>
            <div className={styles.gameStatDetail}>
              <span className={styles.statIcon}></span>
              <div>
                <p className={styles.statTitle}>Average Score</p>
                <p className={styles.statNumber}>{Math.round(progressData.balloonGame.averageScore)}</p>
              </div>
            </div>
            <div className={styles.gameStatDetail}>
              <span className={styles.statIcon}></span>
              <div>
                <p className={styles.statTitle}>Last Game</p>
                <p className={styles.statNumber}>
                  {progressData.balloonGame.history.length > 0 ? 
                    formatDate(progressData.balloonGame.history[progressData.balloonGame.history.length-1].createdAt) : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.sectionTitle}>
        <h2>Quiz Results</h2>
        <p>See how you're performing on our educational quizzes</p>
      </div>

      <div className={styles.quizContainer}>
        <div className={styles.chartCard}>
          <h3>Quiz Score Comparison</h3>
          <div className={styles.chartContainer}>
            <Bar 
              data={quizScoreChartData}
              options={{
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: { callback: value => value + '%' }
                  }
                },
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        return context.parsed.y.toFixed(1) + '%';
                      }
                    }
                  }
                }
              }}
            />
          </div>

          <div className={styles.quizComparison}>
            <table className={styles.comparisonTable}>
              <thead>
                <tr>
                  <th>Quiz</th>
                  <th>Completion</th>
                  <th>Score</th>
                  <th>Attempts</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Image Quiz</td>
                  <td>{progressData.imageQuiz.completed ? '✅' : '❌'}</td>
                  <td>{progressData.imageQuiz.percentage.toFixed(1)}%</td>
                  <td>{progressData.imageQuiz.attempts || 0}</td>
                </tr>
                <tr>
                  <td>Invaders Quiz</td>
                  <td>{progressData.invadersQuiz.completed ? '✅' : '❌'}</td>
                  <td>{progressData.invadersQuiz.highestScore || 0}</td>
                  <td>{progressData.invadersQuiz.attempts || 0}</td>
                </tr>
                <tr>
                  <td>Space Quiz</td>
                  <td>{progressData.spaceCourse.quizCompleted ? '✅' : '❌'}</td>
                  <td>{progressData.spaceCourse.quizPercentage.toFixed(1)}%</td>
                  <td>-</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className={styles.recommendationsCard}>
          <h3>Learning Recommendations</h3>
          <div className={styles.recommendationsList}>
            {progressData.moneyGame.totalGames === 0 && (
              <div className={styles.recommendationItem}>
                <span className={styles.recommendIcon}>
                  <FaMoneyBill style={{color: 'white', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'}}/>
                </span>
                <div>
                  <p className={styles.recommendTitle}>Try Money Game</p>
                  <p className={styles.recommendDesc}>Learn about money management with our fun shopping game!</p>
                </div>
              </div>
            )}
            
            {progressData.balloonGame.totalGames === 0 && (
              <div className={styles.recommendationItem}>
                <span className={styles.recommendIcon}>
                  <FaCheckSquare style={{color: 'white', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'}}/>
                </span>
                <div>
                  <p className={styles.recommendTitle}>Play Balloon Game</p>
                  <p className={styles.recommendDesc}>Improve your word recognition skills by popping word balloons!</p>
                </div>
              </div>
            )}
            
            {!progressData.imageQuiz.completed && (
              <div className={styles.recommendationItem}>
                <span className={styles.recommendIcon}>
                  <FaPuzzlePiece style={{color: 'white', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'}}/>
                </span>
                <div>
                  <p className={styles.recommendTitle}>Complete Image Quiz</p>
                  <p className={styles.recommendDesc}>Test your vocabulary with our image recognition quiz!</p>
                </div>
              </div>
            )}
            
            {!progressData.invadersQuiz.completed && (
              <div className={styles.recommendationItem}>
                <span className={styles.recommendIcon}>
                  <FaBalanceScale style={{color: 'white', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'}}/>
                </span>
                <div>
                  <p className={styles.recommendTitle}>Complete Invaders Quiz</p>
                  <p className={styles.recommendDesc}>Improve general knowledge while playing a fun space invaders game!</p>
                </div>
              </div>
            )}
            
            {!progressData.spaceCourse.completed && (
              <div className={styles.recommendationItem}>
                <span className={styles.recommendIcon}>
                  <FaRocket style={{color: 'white', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'}}/>
                </span>
                <div>
                  <p className={styles.recommendTitle}>Complete Space Course</p>
                  <p className={styles.recommendDesc}>Learn about space and earn your Space Explorer badge!</p>
                </div>
              </div>
            )}
            
            {progressData.overallProgress.completed === progressData.overallProgress.total && (
              <div className={styles.recommendationItem}>
                <span className={styles.recommendIcon}>
                  <FaTrophy style={{color: 'white', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'}}/>
                </span>
                <div>
                  <p className={styles.recommendTitle}>Congratulations!</p>
                  <p className={styles.recommendDesc}>You've completed all activities! Try to improve your scores.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={styles.actionButtons}>
        <button onClick={() => navigate('/games')} className={styles.ctaButton}>
          <FaGamepad /> Play More Games
        </button>
        <button onClick={() => navigate('/quizzes')} className={styles.ctaButton}>
          <FaPuzzlePiece /> Try More Quizzes
        </button>
      </div>
    </div>
  );
};

export default ProgressPage;