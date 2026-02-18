// script.js

// --- Elements ---
const circles = document.querySelectorAll(".pad"); // 0: green, 1: red, 2: yellow, 3: blue
const startButton = document.querySelector(".start-button");
const redLight = document.querySelector(".red-light");
const numberDisplay1 = document.querySelector(".number-display1"); // score
const numberDisplay2 = document.querySelector(".number-display2"); // high score
const messageEl = document.querySelector(".message");
const statusTextEl = document.querySelector(".status__text");
const stopButton = document.querySelector(".stop-button");


// --- Audio ---
const colorNames = ["green", "red", "yellow", "blue"];

// Use a separate Audio object per color
const sounds = colorNames.map((name) => {
  const a = new Audio(`audio/${name}.mp3`);
  a.preload = "auto";
  a.addEventListener("error", () => {
    console.warn(`[AUDIO] Failed to load: audio/${name}.mp3 (check path + file)`);
  });
  a.addEventListener("loadeddata", () => {
    // If a file is truly empty/broken, duration often ends up as NaN or 0
    if (!isFinite(a.duration) || a.duration === 0) {
      console.warn(`[AUDIO] Loaded but duration looks invalid/empty: audio/${name}.mp3`);
    }
  });
  return a;
});

// Start sound
const startSound = new Audio("audio/start.mp3");
startSound.preload = "auto";
startSound.addEventListener("error", () => {
  console.warn("[AUDIO] Failed to load: audio/start.mp3 (check path + file)");
});
startSound.addEventListener("loadeddata", () => {
  if (!isFinite(startSound.duration) || startSound.duration === 0) {
    console.warn("[AUDIO] Loaded but duration looks invalid/empty: audio/start.mp3");
  }
});

function playSound(audio) {
  if (!audio) return;
  try {
    audio.currentTime = 0;
    const p = audio.play();
    if (p && typeof p.catch === "function") {
      p.catch((err) => {
        // Most common: user hasn't interacted yet OR file invalid
        console.warn("[AUDIO] play() blocked/failed:", err);
      });
    }
  } catch (e) {
    console.warn("[AUDIO] playSound error:", e);
  }
}

function playSoundByIndex(index) {
  const audio = sounds[index];
  playSound(audio);
}

// --- Game State ---
let sequence = [];
let userSequence = [];
let score = 0;
let highScore = 0;
let sequenceIndex = 0;
let gameStatus = "RED";
let userInputTimeout;
let intervalTime = 1000;
let gameInterval;
let isShowingSequence = false;

// --- Helpers ---
function setMessage(text) {
  if (messageEl) messageEl.textContent = text;
}

function setStatusText(text) {
  if (statusTextEl) statusTextEl.textContent = text;
}

function updateScoreDisplay() {
  numberDisplay1.textContent = score.toString().padStart(2, "0");
  numberDisplay2.textContent = highScore.toString().padStart(2, "0");
}

function toggleGameStatus(status) {
  gameStatus = status;
  redLight.style.backgroundColor = status === "RED" ? "red" : "green";
}

function resetGame() {
  clearInterval(gameInterval);
  clearTimeout(userInputTimeout);

  sequence = [];
  userSequence = [];
  sequenceIndex = 0;
  score = 0;
  intervalTime = 1000;
  isShowingSequence = false;

  toggleGameStatus("RED");
  setStatusText("READY");
  setMessage("Press START to begin.");
  updateScoreDisplay();
}

function startGame() {
  if (gameStatus === "GREEN") return;

  // This user click counts as interaction → audio allowed
  playSound(startSound);

  resetGame();
  toggleGameStatus("GREEN");
  setStatusText("PLAY");
  setMessage("Get ready...");

  setTimeout(() => {
    nextSequence();
  }, 800);
}

function nextSequence() {
  userSequence = [];
  sequenceIndex = 0;
  addToSequence();
  playSequence();
}

function addToSequence() {
  const randomIndex = Math.floor(Math.random() * 4);
  sequence.push(randomIndex);

  if (sequence.length === 5 || sequence.length === 9 || sequence.length === 13) {
    intervalTime = Math.max(250, intervalTime - 100);
  }
}

function flash(circle, soundIndex = null) {
  if (soundIndex !== null) playSoundByIndex(soundIndex);

  circle.classList.add("is-lit");
  setTimeout(() => {
    circle.classList.remove("is-lit");
  }, intervalTime / 2);
}

function playSequence() {
  clearInterval(gameInterval);
  clearTimeout(userInputTimeout);

  isShowingSequence = true;
  setMessage("Watch the sequence...");

  let i = 0;
  gameInterval = setInterval(() => {
    if (i >= sequence.length) {
      clearInterval(gameInterval);
      isShowingSequence = false;

      setMessage("Your turn!");

      userInputTimeout = setTimeout(() => {
        flashAllColors(5);
      }, 5000);

      return;
    }

    const colorIndex = sequence[i];
    flash(circles[colorIndex], colorIndex);
    i++;
  }, intervalTime);
}

function userSequenceHandler(index) {
  if (gameStatus !== "GREEN") return;
  if (isShowingSequence) return;

  // click sound
  playSoundByIndex(index);

  clearTimeout(userInputTimeout);
  userInputTimeout = setTimeout(() => {
    flashAllColors(5);
  }, 5000);

  userSequence.push(index);
  checkUserInput();
}

function checkUserInput() {
  const currentColor = sequence[sequenceIndex];
  const userInputColor = userSequence[userSequence.length - 1];

  if (currentColor !== userInputColor || userSequence.length > sequence.length) {
    flashAllColors(5);
    return;
  }

  setMessage("Correct...");
  sequenceIndex++;

  if (sequenceIndex === sequence.length) {
    score = sequence.length;
    if (score > highScore) highScore = score;
    updateScoreDisplay();

    clearInterval(gameInterval);
    clearTimeout(userInputTimeout);

    setTimeout(() => nextSequence(), 850);
  }
}

function gameOver() {
  setMessage(`Incorrect! Game over. Score: ${score}`);
  setStatusText("OVER");

  if (score > highScore) highScore = score;
  updateScoreDisplay();
  toggleGameStatus("RED");

  alert("Game Over! Your score was: " + score);
  resetGame();
}

function flashAllColors(times) {
  clearInterval(gameInterval);
  clearTimeout(userInputTimeout);

  isShowingSequence = true;
  setMessage("Incorrect!");
  setStatusText("OVER");

  let count = 0;
  const flashInterval = setInterval(() => {
    circles.forEach((circle, idx) => flash(circle, idx));
    count++;

    if (count === times) {
      clearInterval(flashInterval);
      setTimeout(() => {
        isShowingSequence = false;
        gameOver();
      }, intervalTime);
    }
  }, intervalTime);
}

function stopGame() {
    clearInterval(gameInterval);
    clearTimeout(userInputTimeout);
  
    isShowingSequence = false;
    gameStatus = "RED";
  
    setStatusText("STOPPED");
    setMessage("Game stopped.");
    toggleGameStatus("RED");
  
    // Reset current game state but keep high score
    sequence = [];
    userSequence = [];
    sequenceIndex = 0;
    score = 0;
    intervalTime = 1000;
  
    updateScoreDisplay();
  }
  

// --- Event Listeners ---
startButton.addEventListener("click", startGame);
stopButton.addEventListener("click", stopGame);


circles.forEach((circle, index) => {
  circle.addEventListener("click", () => userSequenceHandler(index));
});

// --- Init ---
resetGame();
