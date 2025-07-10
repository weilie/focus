const startBtn = document.getElementById("startBtn");
const scene = document.getElementById("scene");
const clock = document.getElementById("clock");
const avatar = document.getElementById("avatar");
const bgm = document.getElementById("bgm");

let timer;
let duration = 30 * 60; // 30 minutes in seconds

function updateClock(secondsLeft) {
  const min = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const sec = String(secondsLeft % 60).padStart(2, '0');
  clock.textContent = `${min}:${sec}`;
}

function startSession() {
  scene.classList.remove("hidden");
  document.documentElement.requestFullscreen();
  bgm.play();

  let remaining = duration;
  updateClock(remaining);

  timer = setInterval(() => {
    remaining--;
    updateClock(remaining);
    if (remaining <= 0) {
      clearInterval(timer);
      endSession();
    }
  }, 1000);
}

function endSession() {
  const productive = confirm("Did you stay focused?");
  if (productive) {
    avatar.src = "assets/avatar_celebrate.png";
  } else {
    avatar.src = "assets/avatar_penalty.png";
    setTimeout(() => {
      avatar.src = "assets/avatar_idle.png";
    }, 30 * 60 * 1000); // 30-minute penalty
  }
}

startBtn.addEventListener("click", startSession);