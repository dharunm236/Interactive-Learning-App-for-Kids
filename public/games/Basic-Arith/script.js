// Game variables
const operators = ['+', '-', 'x', '÷'];
let correctAnswer;
let correctOperator;
let draggedItem = null;
let correctCount = 0;
let incorrectCount = 0;
let currentStreak = 0;
let bestStreak = 0;
let timer;
let timeLeft = 30;
let difficulty = "medium";

// Import Firebase dependencies
// Note: You'll need to add script tags for Firebase in the HTML file

let user = null;
let gameStartTime = null;

// Initialize the game
window.onload = function() {
    // Load stats from localStorage if available
    loadStats();
    
    // Set up the difficulty selector
    const difficultySelect = document.getElementById("difficultySelect");
    difficultySelect.addEventListener("change", function() {
        difficulty = this.value;
        generateProblem();
    });
    
    // Initialize the first problem
    generateProblem();
    
    // Add event listeners for drop zones
    setupDropZones();
    
    // Record game start time
    gameStartTime = new Date();
    
    // Check auth state
    checkAuthState();
};

function loadStats() {
    if (localStorage.getItem("mathGameStats")) {
        const stats = JSON.parse(localStorage.getItem("mathGameStats"));
        correctCount = stats.correct || 0;
        incorrectCount = stats.incorrect || 0;
        bestStreak = stats.bestStreak || 0;
        
        document.getElementById("correctCount").textContent = correctCount;
        document.getElementById("incorrectCount").textContent = incorrectCount;
        document.getElementById("bestStreak").textContent = bestStreak;
    }
}

function saveStats() {
    const stats = {
        correct: correctCount,
        incorrect: incorrectCount,
        bestStreak: bestStreak
    };
    localStorage.setItem("mathGameStats", JSON.stringify(stats));
}

function generateProblem() {
    // Clear any existing timer
    if (timer) clearInterval(timer);
    
    // Reset the message and drop zones
    document.getElementById("message").textContent = "";
    document.getElementById("message").className = "";
    document.getElementById("operatorZone").textContent = "?";
    document.getElementById("answerZone").textContent = "?";
    
    // Generate problem based on difficulty
    let num1, num2;
    
    switch(difficulty) {
        case "easy":
            num1 = Math.floor(Math.random() * 10) + 1;  // 1-10
            num2 = Math.floor(Math.random() * 10) + 1;  // 1-10
            timeLeft = 30;
            break;
        case "medium":
            num1 = Math.floor(Math.random() * 20) + 1;  // 1-20
            num2 = Math.floor(Math.random() * 15) + 1;  // 1-15
            timeLeft = 25;
            break;
        case "hard":
            num1 = Math.floor(Math.random() * 50) + 1;  // 1-50
            num2 = Math.floor(Math.random() * 30) + 1;  // 1-30
            timeLeft = 20;
            break;
    }
    
    // Make sure num1 is the larger number for subtraction and division
    if (num1 < num2) {
        [num1, num2] = [num2, num1];
    }
    
    document.getElementById("num1").textContent = num1;
    document.getElementById("num2").textContent = num2;

    // Randomly select an operator
    correctOperator = operators[Math.floor(Math.random() * operators.length)];
    
    // For division, ensure we have a clean division result
    if (correctOperator === '÷') {
        // Make num1 a multiple of num2 for clean division
        num1 = num2 * Math.floor(Math.random() * 10 + 1);
        document.getElementById("num1").textContent = num1;
    }

    // Calculate the correct answer
    switch (correctOperator) {
        case '+':
            correctAnswer = num1 + num2;
            break;
        case '-':
            correctAnswer = num1 - num2;
            break;
        case 'x':
            correctAnswer = num1 * num2;
            break;
        case '÷':
            correctAnswer = num1 / num2;
            break;
    }

    // Generate option tiles
    generateOptions(correctAnswer, correctOperator);
    
    // Start the timer
    startTimer();
}

function generateOptions(answer, operator) {
    let optionsContainer = document.getElementById("optionsContainer");
    optionsContainer.innerHTML = "";

    let options = [answer, operator];

    // Add wrong options based on difficulty
    const numOptions = difficulty === "easy" ? 6 : (difficulty === "medium" ? 8 : 10);
    
    // Add some wrong options for more challenge
    while (options.length < numOptions) {
        let randNum;
        
        // Generate more appropriate numbers based on difficulty
        if (difficulty === "easy") {
            randNum = Math.floor(Math.random() * 20);
        } else if (difficulty === "medium") {
            randNum = Math.floor(Math.random() * 50);
        } else {
            randNum = Math.floor(Math.random() * 100);
        }
        
        let randOp = operators[Math.floor(Math.random() * operators.length)];
        
        if (!options.includes(randNum) && typeof randNum === "number") {
            options.push(randNum);
        }
        if (!options.includes(randOp)) {
            options.push(randOp);
        }
    }

    // Shuffle options
    options = options.sort(() => Math.random() - 0.5);

    options.forEach(option => {
        let div = document.createElement("div");
        div.className = "option";
        div.textContent = option;
        div.draggable = true;
        div.addEventListener("dragstart", dragStart);
        optionsContainer.appendChild(div);
    });
}

function setupDropZones() {
    const dropZones = document.querySelectorAll('.drop-zone');
    
    dropZones.forEach(zone => {
        zone.addEventListener('dragover', dragOver);
        zone.addEventListener('dragenter', dragEnter);
        zone.addEventListener('dragleave', dragLeave);
        zone.addEventListener('drop', drop);
    });
}

function dragStart(e) {
    draggedItem = e.target;
    e.dataTransfer.setData('text/plain', e.target.textContent);
    setTimeout(() => {
        e.target.style.opacity = '0.4';
    }, 0);
}

function dragOver(e) {
    e.preventDefault();
}

function dragEnter(e) {
    e.preventDefault();
    e.target.classList.add('over');
}

function dragLeave(e) {
    e.target.classList.remove('over');
}

function drop(e) {
    e.preventDefault();
    e.target.classList.remove('over');
    
    if (e.target.classList.contains('drop-zone')) {
        document.getElementById("dragSound").play();
        e.target.textContent = draggedItem.textContent;
        
        // Check if both zones have been filled
        const operatorZone = document.getElementById('operatorZone');
        const answerZone = document.getElementById('answerZone');
        
        if (operatorZone.textContent !== '?' && answerZone.textContent !== '?') {
            checkAnswer();
        }
    }
    
    draggedItem.style.opacity = '1';
}

function checkAnswer() {
    const operatorZone = document.getElementById('operatorZone');
    const answerZone = document.getElementById('answerZone');
    const message = document.getElementById('message');
    
    const userOperator = operatorZone.textContent;
    const userAnswer = parseInt(answerZone.textContent);
    
    const isCorrect = userOperator === correctOperator && userAnswer === correctAnswer;
    
    if (isCorrect) {
        handleCorrectAnswer(message);
    } else {
        handleIncorrectAnswer(message, userOperator, userAnswer);
    }
    
    // Update stats display
    updateStatsDisplay();
    
    // Save stats
    saveStats();
}

function handleCorrectAnswer(message) {
    // Play sound and show message
    document.getElementById("winSound").play();
    message.textContent = "Correct! Great job!";
    message.className = "correct";
    
    // Update stats
    correctCount++;
    currentStreak++;
    if (currentStreak > bestStreak) {
        bestStreak = currentStreak;
    }
    
    // Award bonus time based on difficulty
    awardBonusTime();
    
    // Generate new problem after a short delay
    setTimeout(() => {
        generateProblem();
    }, 1500);
}

function handleIncorrectAnswer(message, userOperator, userAnswer) {
    // Play error sound
    if (document.getElementById("errorSound")) {
        document.getElementById("errorSound").play();
    }
    
    // Determine error message
    message.textContent = generateErrorMessage(userOperator, userAnswer);
    message.className = "incorrect";
    
    // Update stats
    incorrectCount++;
    currentStreak = 0;
    
    // Penalty time
    timeLeft = Math.max(5, timeLeft - 5);
}

function generateErrorMessage(userOperator, userAnswer) {
    let errorMessage = "Try again! ";
    
    if (userOperator !== correctOperator && userAnswer !== correctAnswer) {
        errorMessage += "Both the operator and answer are incorrect.";
    } else if (userOperator !== correctOperator) {
        errorMessage += "The operator is incorrect.";
    } else {
        errorMessage += "The answer is incorrect.";
    }
    
    return errorMessage;
}

function awardBonusTime() {
    if (difficulty === "easy") {
        timeLeft += 3;
    } else if (difficulty === "medium") {
        timeLeft += 5;
    } else {
        timeLeft += 7;
    }
}

function updateStatsDisplay() {
    document.getElementById("correctCount").textContent = correctCount;
    document.getElementById("incorrectCount").textContent = incorrectCount;
    document.getElementById("currentStreak").textContent = currentStreak;
    document.getElementById("bestStreak").textContent = bestStreak;
}

function startTimer() {
    // Reset timer UI
    document.getElementById("timerValue").textContent = timeLeft;
    document.getElementById("progressFill").style.width = "100%";
    
    // Set up the timer
    if (timer) clearInterval(timer);
    
    const startTime = timeLeft;
    timer = setInterval(() => {
        timeLeft--;
        document.getElementById("timerValue").textContent = timeLeft;
        
        // Update progress bar
        const percentage = (timeLeft / startTime) * 100;
        document.getElementById("progressFill").style.width = percentage + "%";
        
        if (timeLeft <= 5) {
            document.getElementById("timerValue").style.color = "#dc2626";
        } else {
            document.getElementById("timerValue").style.color = "#2563eb";
        }
        
        if (timeLeft <= 0) {
            clearInterval(timer);
            document.getElementById("message").textContent = "Time's up! The correct answer was " + correctOperator + " and " + correctAnswer;
            document.getElementById("message").className = "incorrect";
            
            // Reset streak
            currentStreak = 0;
            document.getElementById("currentStreak").textContent = currentStreak;
            
            // Generate new problem after delay
            setTimeout(() => {
                generateProblem();
            }, 2000);
        }
    }, 1000);
}

// Check authentication state
function checkAuthState() {
    // First check if Firebase auth is available
    if (typeof firebase !== 'undefined' && firebase.auth) {
        firebase.auth().onAuthStateChanged((currentUser) => {
            if (currentUser) {
                user = currentUser;
                console.log("User is logged in:", user.uid);
            } else {
                console.log("User is not logged in");
            }
        });
    } else {
        console.log("Firebase auth not available, running in standalone mode");
    }
}

// Finish the current game and show summary
function finishGame() {
    // Clear any existing timer
    if (timer) clearInterval(timer);
    
    // Calculate game duration
    const gameDuration = Math.floor((new Date() - gameStartTime) / 1000); // in seconds
    
    // Create and show the summary screen
    showGameSummary(gameDuration);
    
    // Save game result to Firebase if user is logged in
    if (user && user.uid) {
        saveGameToFirebase(gameDuration);
    } else {
        console.log("Not saving to Firebase: User not logged in");
    }
}

// Save game results to Firebase
function saveGameToFirebase(gameDuration) {
    // Check if Firebase is available
    if (typeof firebase === 'undefined' || !firebase.firestore) {
        console.log("Firebase not available, skipping save");
        return;
    }
    
    const db = firebase.firestore();
    const gameId = "basicArith";
    const playedGamesRef = db.doc(`played_games/${user.uid}`);
    
    // JavaScript timestamp (for arrayUnion operations)
    const jsTimestamp = new Date();
    
    playedGamesRef.get().then((doc) => {
        if (doc.exists) {
            // Update existing document
            return playedGamesRef.update({
                gamesPlayed: firebase.firestore.FieldValue.arrayUnion({
                    gameId: gameId,
                    difficulty: difficulty,
                    points: correctCount,
                    correctAnswers: correctCount,
                    wrongAnswers: incorrectCount,
                    bestStreak: bestStreak,
                    duration: gameDuration,
                    createdAt: jsTimestamp
                }),
                lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
            });
        } else {
            // Create new document
            return playedGamesRef.set({
                gamesPlayed: [{
                    gameId: gameId,
                    difficulty: difficulty,
                    points: correctCount,
                    correctAnswers: correctCount,
                    wrongAnswers: incorrectCount,
                    bestStreak: bestStreak,
                    duration: gameDuration,
                    createdAt: jsTimestamp
                }],
                lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
    }).then(() => {
        console.log("Game result saved to Firebase successfully!");
    }).catch((error) => {
        console.error("Error saving game result to Firebase:", error);
    });
}

// Show game summary screen
function showGameSummary(gameDuration) {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    document.body.appendChild(overlay);
    
    // Create summary container
    const summary = document.createElement('div');
    summary.className = 'game-summary';
    
    // Format duration as minutes and seconds
    const minutes = Math.floor(gameDuration / 60);
    const seconds = gameDuration % 60;
    const formattedDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    // Calculate accuracy
    const totalAttempts = correctCount + incorrectCount;
    const accuracy = totalAttempts > 0 ? Math.round((correctCount / totalAttempts) * 100) : 0;
    
    summary.innerHTML = `
        <h2>Game Summary</h2>
        <div class="summary-stat">
            <span class="summary-stat-label">Difficulty:</span>
            <span class="summary-stat-value">${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</span>
        </div>
        <div class="summary-stat">
            <span class="summary-stat-label">Correct Answers:</span>
            <span class="summary-stat-value">${correctCount}</span>
        </div>
        <div class="summary-stat">
            <span class="summary-stat-label">Wrong Answers:</span>
            <span class="summary-stat-value">${incorrectCount}</span>
        </div>
        <div class="summary-stat">
            <span class="summary-stat-label">Best Streak:</span>
            <span class="summary-stat-value">${bestStreak}</span>
        </div>
        <div class="summary-stat">
            <span class="summary-stat-label">Accuracy:</span>
            <span class="summary-stat-value">${accuracy}%</span>
        </div>
        <div class="summary-stat">
            <span class="summary-stat-label">Time Played:</span>
            <span class="summary-stat-value">${formattedDuration}</span>
        </div>
        <div class="summary-buttons">
            <button class="summary-button play-again" onclick="playAgain()">Play Again</button>
            <button class="summary-button go-home" onclick="goHome()">Go Home</button>
        </div>
    `;
    
    document.body.appendChild(summary);
}

// Play again - restart the game
function playAgain() {
    // Remove summary and overlay
    document.querySelector('.game-summary').remove();
    document.querySelector('.overlay').remove();
    
    // Reset stats for a new game
    correctCount = 0;
    incorrectCount = 0;
    currentStreak = 0;
    
    // Update display
    document.getElementById("correctCount").textContent = correctCount;
    document.getElementById("incorrectCount").textContent = incorrectCount;
    document.getElementById("currentStreak").textContent = currentStreak;
    
    // Reset game start time
    gameStartTime = new Date();
    
    // Generate new problem
    generateProblem();
}

// Go back to homepage
function goHome() {
    // Navigate to the homepage
    window.location.href = '/';
}
