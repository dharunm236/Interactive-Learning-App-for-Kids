const icons = ["🍎", "🍌", "🍇", "🍉", "🍒", "🥑", "🥕", "🌽", "🍍", "🍑", "🥭", "🥥"];
let level = 1;
let rows, cols, timeLimit, timer, moves;
let cardsArray = [];
let gameBoard = document.getElementById("gameBoard");
let gameContainer = document.getElementById("gameContainer");
let levelScreen = document.getElementById("levelScreen");
let message = document.getElementById("message");
let nextLevelButton = document.getElementById("nextLevel");
let backButton = document.getElementById("backButton");
let timerDisplay = document.getElementById("timer");
let movesDisplay = document.getElementById("moves");
let leaderboardList = document.getElementById("leaderboard");
let flippedCards = [];
let matchedPairs = 0;

// Load sound effects
const flipSound = new Audio("sounds/flip.mp3");
const matchSound = new Audio("sounds/match.wav");
const winSound = new Audio("sounds/win.wav");
const failSound = new Audio("sounds/fail.mp3");

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function startGame(r, c, t) {
    rows = r;
    cols = c;
    timeLimit = t;
    moves = 0;
    matchedPairs = 0;
    levelScreen.style.display = "none";
    gameContainer.style.display = "flex";
    message.innerText = "";
    nextLevelButton.style.display = "none";
    backButton.style.display = "block";
    timerDisplay.innerText = timeLimit;
    movesDisplay.innerText = moves;

    let numPairs = (rows * cols) / 2;
    cardsArray = [...icons.slice(0, numPairs), ...icons.slice(0, numPairs)];
    createBoard();
    startTimer();
}

function createBoard() {
    shuffle(cardsArray);
    gameBoard.innerHTML = "";
    gameBoard.style.gridTemplateColumns = `repeat(${cols}, 100px)`;
    gameBoard.style.gridTemplateRows = `repeat(${rows}, 100px)`;

    cardsArray.forEach((emoji, index) => {
        let card = document.createElement("div");
        card.classList.add("card");
        card.dataset.index = index;
        card.dataset.emoji = emoji;
        card.innerHTML = "?";
        card.addEventListener("click", flipCard);
        gameBoard.appendChild(card);
    });
}

function flipCard() {
    if (flippedCards.length < 2 && !this.classList.contains("flipped")) {
        flipSound.play(); // Play flip sound
        this.classList.add("flipped");
        this.innerHTML = this.dataset.emoji;
        flippedCards.push(this);

        if (flippedCards.length === 2) {
            moves++;
            movesDisplay.innerText = moves;
            setTimeout(checkMatch, 500);
        }
    }
}

function checkMatch() {
    let [card1, card2] = flippedCards;
    if (card1.dataset.emoji === card2.dataset.emoji) {
        matchSound.play(); // Play match sound
        card1.classList.add("matched");
        card2.classList.add("matched");
        matchedPairs++;

        if (matchedPairs === cardsArray.length / 2) {
            winSound.play(); // Play win sound
            clearInterval(timer);
            saveScore();
            message.innerText = `Level ${level} Completed! Moves: ${moves}`;
            nextLevelButton.style.display = "block";
        }
    } else {
        card1.classList.add("shake");
        card2.classList.add("shake");
        setTimeout(() => {
            card1.classList.remove("flipped", "shake");
            card2.classList.remove("flipped", "shake");
            card1.innerHTML = "?";
            card2.innerHTML = "?";
        }, 500);
    }
    flippedCards = [];
}

function goBack() {
    clearInterval(timer);
    levelScreen.style.display = "block";
    gameContainer.style.display = "none";
    backButton.style.display = "none";
}

displayLeaderboard();
