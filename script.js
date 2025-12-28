/* ================= CONFIG ================= */

let studyTimeMinutes = 25;

const breakTimeMap = {
  25: 5,
  45: 10,
  60: 20
};

const appreciationMap = {
  25: 3,
  45: 2,
  60: 1
};

let breakTimeMinutes = breakTimeMap[studyTimeMinutes];

// MUSIC FILES
const studySong = "music/study.mp3";

const breakSongs = [
  "music/break/break1.mp3",
  "music/break/break2.mp3",
  "music/break/break3.mp3",
  "music/break/break4.mp3",
  "music/break/break5.mp3"
];

/* ================= STATE ================= */

let isRunning = false;
let isStudyMode = true;
let musicEnabled = true;
let remainingSeconds = studyTimeMinutes * 60;
let timerInterval = null;

let sessionCount = 1;
let currentBreakSongIndex = 0;

let appreciationShown = false;
let waitingForStudyContinue = false;
let waitingAfterBreak = false;

let firstStartDone = false;

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

const studyButtons = document.querySelectorAll(".time-btn");

const appreciationOverlay = document.getElementById("appreciationOverlay");
const appreciationText = document.getElementById("appreciationText");
const appreciationTitle = document.getElementById("appreciationTitle");
const continueBreakBtn = document.getElementById("continueBreakBtn");

/* ================= INIT ================= */

studyAudio.src = studySong;
studyAudio.loop = true;
breakAudio.loop = false;

updateBreakInfo();
updateDisplay();
updateUI();

/* ================= TIMER ================= */

function startTimer() {
  if (isRunning || waitingForStudyContinue || waitingAfterBreak) return;

  isRunning = true;
  playStartSound();

  // Force study music on FIRST start
  if (!firstStartDone && isStudyMode && musicEnabled) {
    firstStartDone = true;
    studyAudio.currentTime = 0;
    studyAudio.volume = 0.8;
    studyAudio.muted = false;

    studyAudio.play()
      .then(() => playMusic())
      .catch(() => {});
  } else {
    playMusic();
  }

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
  firstStartDone = false;

  appreciationShown = false;
  waitingForStudyContinue = false;
  waitingAfterBreak = false;

  currentBreakSongIndex = 0;
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
  currentBreakSongIndex = 0;
  nextMusicBtn.classList.remove("hidden");

  updateUI();
  startTimer();
}

function startStudy() {
  isStudyMode = true;
  sessionCount++;
  remainingSeconds = studyTimeMinutes * 60;
  nextMusicBtn.classList.add("hidden");

  updateUI();
  startTimer();
}

/* ================= MUSIC ================= */

function playMusic() {
  if (!musicEnabled) return;

  if (isStudyMode) {
    breakAudio.pause();
    studyAudio.play().catch(() => {});
  } else {
    playNextBreakSong();
  }
}

function stopMusic() {
  studyAudio.pause();
  breakAudio.pause();
}

function playNextBreakSong() {
  if (!musicEnabled) return;

  breakAudio.src = breakSongs[currentBreakSongIndex];
  breakAudio.currentTime = 0;
  breakAudio.play().catch(() => {});

  currentBreakSongIndex =
    (currentBreakSongIndex + 1) % breakSongs.length;
}

function toggleMusic() {
  musicEnabled = !musicEnabled;
  musicToggleBtn.textContent = musicEnabled ? "🔊 Music ON" : "🔇 Music OFF";
  musicEnabled ? playMusic() : stopMusic();
}

/* ================= UI ================= */

function updateDisplay() {
  const m = Math.floor(remainingSeconds / 60);
  const s = remainingSeconds % 60;
  timeDisplay.textContent =
    `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  sessionInfo.textContent = `Session ${sessionCount}`;
}

function updateUI() {
  document.body.classList.toggle("study-mode", isStudyMode);
  document.body.classList.toggle("break-mode", !isStudyMode);
  modeText.textContent = isStudyMode ? "STUDY MODE" : "BREAK MODE";
}

function updateBreakInfo() {
  breakInfo.textContent = `Break time: ${breakTimeMinutes} minutes`;
}

/* ================= CARDS ================= */

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
  startSound.play().catch(() => {});
}

function playEndSound() {
  endSound.currentTime = 0;
  endSound.play().catch(() => {});
}

/* ================= STUDY SELECTOR ================= */

studyButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    if (isRunning) return;

    studyButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    studyTimeMinutes = parseInt(btn.dataset.time, 10);
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
