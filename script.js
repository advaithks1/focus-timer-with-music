/* ================= CONFIG ================= */

let studyTimeMinutes = 1;

const breakTimeMap = {
  1: 1,
  45: 10,
  60: 20
};

const appreciationMap = {
  1: 1,
  45: 2,
  60: 1
};

let breakTimeMinutes = breakTimeMap[studyTimeMinutes];

// MUSIC FILES
const studySong = "music/study.mp3";
const breakSongs = [
  "music/break/Vanakkam Chennai - Osaka Osaka Video _ Shiva, Priya Anand.mp3",
  "music/break/Maragatha Naanayam _ Nee Kavithaigala Song with Lyrics _ Aadhi Nikki Galrani _ Dhibu Ninan Thomas.mp3",
  "music/break/Vikram Vedha Songs _ Pogatha Yennavittu Song with Lyrics _ R.Madhavan, Vijay Sethupathi _ Sam C.S.mp3",
  "music/break/Guru (Tamil) - Aaruyirae Video _ A.R. Rahman.mp3",
  "music/break/Athinthom Video Song _ Chandramukhi Movie Songs _ 4K Full HD _ Rajinikanth _ SP Balasubrahmanyam.mp3",
];

// MOTIVATION MESSAGES
const motivationMessages = [
  "You stayed focused when it mattered.",
  "Consistency quietly builds rank.",
  "This session counts.",
  "Discipline creates results.",
  "Focused work compounds.",
  "That was honest effort.",
  "Momentum is building.",
  "You’re preparing seriously.",
  "Progress stacks quietly.",
  "Well done. Stay steady.",
  "This is real preparation.",
  "Focus like this pays off.",
  "Strong session completed.",
  "You earned this break.",
  "Keep this rhythm.",
  "Another block done.",
  "You didn’t rush. You stayed.",
  "This is discipline.",
  "Results follow effort.",
  "You’re on track."
];

/* ================= STATE ================= */

let isRunning = false;
let isStudyMode = true;
let musicEnabled = true;
let remainingSeconds = studyTimeMinutes * 60;
let timerInterval = null;

let sessionCount = 1;
let currentBreakSongIndex = null;

let appreciationShown = false;
let waitingForStudyContinue = false;
let waitingAfterBreak = false;

/* ================= ELEMENTS ================= */

const timeDisplay = document.getElementById("timeDisplay");
const modeText = document.getElementById("modeText");
const sessionInfo = document.getElementById("sessionInfo");
const motivationText = document.getElementById("motivationText");
const breakInfo = document.getElementById("breakInfo");

const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");
const musicToggleBtn = document.getElementById("musicToggleBtn");
const nextMusicBtn = document.getElementById("nextMusicBtn");

const studyAudio = document.getElementById("studyAudio");
const breakAudio = document.getElementById("breakAudio");
const startSound = document.getElementById("startSound");
const endSound = document.getElementById("endSound");

const toast = document.getElementById("statusToast");
const studyButtons = document.querySelectorAll(".time-btn");

const appreciationOverlay = document.getElementById("appreciationOverlay");
const appreciationText = document.getElementById("appreciationText");
const appreciationTitle = document.getElementById("appreciationTitle");
const continueBreakBtn = document.getElementById("continueBreakBtn");

/* ================= INIT ================= */

studyAudio.src = studySong;
studyAudio.loop = true;        // Study music loops
breakAudio.loop = false;       // Break music does NOT loop

updateBreakInfo();
updateDisplay();
updateUI();

/* ================= TIMER ================= */

function startTimer() {
  if (isRunning || waitingForStudyContinue || waitingAfterBreak) return;

  isRunning = true;
  playStartSound();
  playMusic();

  timerInterval = setInterval(() => {
    remainingSeconds--;
    updateDisplay();

    if (remainingSeconds <= 0) {
      handleSessionEnd();
    }
  }, 1000);
}

function pauseTimer() {
  isRunning = false;
  clearInterval(timerInterval);
  stopMusic();
}

function resetTimer() {
  pauseTimer();

  isStudyMode = true;
  sessionCount = 1;
  remainingSeconds = studyTimeMinutes * 60;

  appreciationShown = false;
  waitingForStudyContinue = false;
  waitingAfterBreak = false;

  currentBreakSongIndex = null;
  nextMusicBtn.classList.add("hidden");
  appreciationOverlay.classList.add("hidden");

  updateUI();
  updateDisplay();
}

/* ================= SESSION END ================= */

function handleSessionEnd() {
  pauseTimer();
  playEndSound();

  if (isStudyMode) {
    const threshold = appreciationMap[studyTimeMinutes];

    if (!appreciationShown && sessionCount % threshold === 0) {
      appreciationShown = true;
      waitingForStudyContinue = true;
      showStudyCard();
      return;
    }

    startBreak();
  } else {
    waitingAfterBreak = true;
    showBreakCard();
  }
}

/* ================= MODE HANDLERS ================= */

function startBreak() {
  isStudyMode = false;
  remainingSeconds = breakTimeMinutes * 60;
  currentBreakSongIndex = null; // reset playlist
  nextMusicBtn.classList.remove("hidden");

  updateUI();
  startTimer();
}

function startStudy() {
  isStudyMode = true;
  sessionCount++;
  remainingSeconds = studyTimeMinutes * 60;

  appreciationShown = false;
  nextMusicBtn.classList.add("hidden");

  updateUI();
  startTimer();
}

/* ================= MUSIC ================= */

function playMusic() {
  if (!musicEnabled || waitingForStudyContinue || waitingAfterBreak) return;

  if (isStudyMode) {
    breakAudio.pause();
    studyAudio.play();
  } else {
    if (currentBreakSongIndex === null) {
      playNextBreakSong();
    } else {
      breakAudio.play();
    }
  }
}

function stopMusic() {
  studyAudio.pause();
  breakAudio.pause();
}

/* 🔁 SEQUENTIAL BREAK MUSIC */
function playNextBreakSong() {
  if (!musicEnabled || breakSongs.length === 0) return;

  if (currentBreakSongIndex === null) {
    currentBreakSongIndex = 0;
  } else {
    currentBreakSongIndex++;
    if (currentBreakSongIndex >= breakSongs.length) {
      currentBreakSongIndex = 0; // loop back
    }
  }

  breakAudio.src = breakSongs[currentBreakSongIndex];
  breakAudio.currentTime = 0;
  breakAudio.play();
}

function toggleMusic() {
  musicEnabled = !musicEnabled;
  musicToggleBtn.textContent = musicEnabled ? "🔊 Music ON" : "🔇 Music OFF";

  if (!musicEnabled) {
    stopMusic();
  } else {
    playMusic();
  }
}

/* ================= UI ================= */

function updateDisplay() {
  const m = Math.floor(remainingSeconds / 60);
  const s = remainingSeconds % 60;
  timeDisplay.textContent = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  sessionInfo.textContent = `Session ${sessionCount}`;
}

function updateUI() {
  document.body.classList.toggle("study-mode", isStudyMode);
  document.body.classList.toggle("break-mode", !isStudyMode);

  modeText.textContent = isStudyMode ? "STUDY MODE" : "BREAK MODE";
  motivationText.textContent = isStudyMode
    ? "Stay focused. Consistency beats talent."
    : "Rest is part of success. Reset calmly.";
}

function updateBreakInfo() {
  breakInfo.textContent = `Break time: ${breakTimeMinutes} minutes`;
}

/* ================= CARDS ================= */

function showStudyCard() {
  appreciationTitle.textContent = "Great work";
  appreciationText.textContent =
    motivationMessages[Math.floor(Math.random() * motivationMessages.length)];

  continueBreakBtn.textContent = "Continue to Break";
  continueBreakBtn.onclick = () => {
    appreciationOverlay.classList.add("hidden");
    waitingForStudyContinue = false;
    startBreak();
  };

  appreciationOverlay.classList.remove("hidden");
}

function showBreakCard() {
  appreciationTitle.textContent = "Break complete";
  appreciationText.textContent = "Ready to resume focused study?";

  continueBreakBtn.textContent = "Start Study";
  continueBreakBtn.onclick = () => {
    appreciationOverlay.classList.add("hidden");
    waitingAfterBreak = false;
    startStudy();
  };

  appreciationOverlay.classList.remove("hidden");
}

/* ================= SOUND ================= */

function playStartSound() {
  startSound.currentTime = 0;
  startSound.play();
}

function playEndSound() {
  endSound.currentTime = 0;
  endSound.play();
}

/* ================= STUDY SELECTOR ================= */

studyButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    if (isRunning) return;

    studyButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    studyTimeMinutes = parseInt(btn.dataset.time);
    breakTimeMinutes = breakTimeMap[studyTimeMinutes];

    remainingSeconds = studyTimeMinutes * 60;
    updateBreakInfo();
    updateDisplay();
  });
});

/* ================= EVENTS ================= */

startBtn.addEventListener("click", startTimer);
pauseBtn.addEventListener("click", pauseTimer);
resetBtn.addEventListener("click", resetTimer);
musicToggleBtn.addEventListener("click", toggleMusic);
nextMusicBtn.addEventListener("click", playNextBreakSong);
