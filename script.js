// ===== SCORE STATE =====
const score = JSON.parse(localStorage.getItem("score")) || {
  wins: 0,
  losses: 0,
  ties: 0,
};

let isAutoPlaying = false;
let intervalId;

// ===== DOM REFS =====
const arenaEl = document.querySelector(".js-arena");
const resultEl = document.querySelector(".js-result");
const movesEl = document.querySelector(".js-moves");
const winsEl = document.querySelector(".js-wins");
const lossesEl = document.querySelector(".js-losses");
const tiesEl = document.querySelector(".js-ties");
const autoBtn = document.querySelector(".js-auto");

// ===== PARTICLE ENGINE =====
const canvas = document.getElementById("particles-canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

let particles = [];

class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
    const angle = Math.random() * Math.PI * 2;
    const speed = 3 + Math.random() * 8;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed - 4;
    this.gravity = 0.25;
    this.life = 1;
    this.decay = 0.018 + Math.random() * 0.015;
    this.size = 4 + Math.random() * 6;
    this.shape = Math.random() > 0.5 ? "circle" : "star";
    this.rotation = Math.random() * Math.PI * 2;
    this.rotSpeed = (Math.random() - 0.5) * 0.15;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += this.gravity;
    this.vx *= 0.98;
    this.life -= this.decay;
    this.rotation += this.rotSpeed;
  }
  draw() {
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.life);
    ctx.fillStyle = this.color;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    if (this.shape === "circle") {
      ctx.beginPath();
      ctx.arc(0, 0, this.size, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // 4-pointed star
      ctx.beginPath();
      const s = this.size;
      for (let i = 0; i < 8; i++) {
        const r = i % 2 === 0 ? s : s * 0.4;
        const a = (i / 8) * Math.PI * 2;
        if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
        else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }
}

function burstParticles(x, y, colors, count = 60) {
  for (let i = 0; i < count; i++) {
    const color = colors[Math.floor(Math.random() * colors.length)];
    particles.push(new Particle(x, y, color));
  }
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles = particles.filter(p => p.life > 0);
  particles.forEach(p => { p.update(); p.draw(); });
  requestAnimationFrame(animateParticles);
}
animateParticles();

// ===== GAME LOGIC =====
updateScore();

document.querySelector(".js-rock").addEventListener("click", () => playGame("rock"));
document.querySelector(".js-paper").addEventListener("click", () => playGame("paper"));
document.querySelector(".js-scissor").addEventListener("click", () => playGame("scissor"));
document.querySelector(".js-reset").addEventListener("click", resetScore);
autoBtn.addEventListener("click", toggleAutoPlay);

document.body.addEventListener("keydown", (event) => {
  if (event.key === "r" || event.key === "R") playGame("rock");
  if (event.key === "p" || event.key === "P") playGame("paper");
  if (event.key === "s" || event.key === "S") playGame("scissor");
});

function playGame(playerMove) {
  const computerMove = pickComputerMove();
  let result = "";
  let outcome = "";

  if (playerMove === computerMove) {
    result = "TIE!";
    outcome = "tie";
    score.ties++;
  } else if (
    (playerMove === "rock" && computerMove === "scissor") ||
    (playerMove === "paper" && computerMove === "rock") ||
    (playerMove === "scissor" && computerMove === "paper")
  ) {
    result = "YOU WIN!";
    outcome = "win";
    score.wins++;
  } else {
    result = "YOU LOSE!";
    outcome = "lose";
    score.losses++;
  }

  localStorage.setItem("score", JSON.stringify(score));
  updateScore(outcome);
  updateArena(playerMove, computerMove, result, outcome);
  highlightChosenButton(playerMove);
  triggerParticles(outcome);
}

function pickComputerMove() {
  const moves = ["rock", "paper", "scissor"];
  return moves[Math.floor(Math.random() * 3)];
}

function updateScore(outcome) {
  winsEl.textContent = score.wins;
  lossesEl.textContent = score.losses;
  tiesEl.textContent = score.ties;

  // Pop animation on the relevant counter
  if (outcome === "win") popElement(winsEl);
  if (outcome === "lose") popElement(lossesEl);
  if (outcome === "tie") popElement(tiesEl);
}

function popElement(el) {
  el.classList.remove("pop");
  void el.offsetWidth; // reflow
  el.classList.add("pop");
  el.addEventListener("animationend", () => el.classList.remove("pop"), { once: true });
}

function updateArena(playerMove, computerMove, result, outcome) {
  // Clear old outcome classes
  arenaEl.classList.remove("win", "lose", "tie", "shake");
  resultEl.classList.remove("win", "lose", "tie");
  void arenaEl.offsetWidth; // reflow for re-animation

  // Apply outcome state
  arenaEl.classList.add(outcome === "win" ? "win" : outcome === "lose" ? "lose" : "tie");
  if (outcome === "lose") arenaEl.classList.add("shake");

  resultEl.classList.add(outcome === "win" ? "win" : outcome === "lose" ? "lose" : "tie");
  resultEl.textContent = result;

  movesEl.innerHTML = `
    <div class="move-side">
      <span class="move-tag">You</span>
      <img src="images/${playerMove}-emoji.png" class="emoji" alt="${playerMove}" />
    </div>
    <div class="vs-badge">VS</div>
    <div class="move-side">
      <span class="move-tag">CPU</span>
      <img src="images/${computerMove}-emoji.png" class="emoji" alt="${computerMove}" />
    </div>
  `;
}

function highlightChosenButton(move) {
  const map = { rock: ".js-rock", paper: ".js-paper", scissor: ".js-scissor" };
  const btn = document.querySelector(map[move]);
  btn.classList.remove("chosen");
  void btn.offsetWidth;
  btn.classList.add("chosen");
  btn.addEventListener("animationend", () => btn.classList.remove("chosen"), { once: true });
}

function triggerParticles(outcome) {
  // Burst from center of screen
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;

  const colorMap = {
    win: ["#00ff96", "#00e87a", "#7fff00", "#ffffff", "#aaffcc"],
    lose: ["#ff4040", "#ff0000", "#ff9900", "#ffffff", "#ff6666"],
    tie: ["#ffd700", "#ffaa00", "#fff200", "#ffffff", "#ffcc44"],
  };

  const count = outcome === "win" ? 100 : outcome === "lose" ? 50 : 70;
  burstParticles(cx, cy, colorMap[outcome], count);
}

function resetScore() {
  score.wins = 0;
  score.losses = 0;
  score.ties = 0;
  localStorage.removeItem("score");
  updateScore();

  arenaEl.classList.remove("win", "lose", "tie", "shake");
  resultEl.classList.remove("win", "lose", "tie");
  resultEl.textContent = "Pick a move to begin!";
  movesEl.innerHTML = "";
}

function toggleAutoPlay() {
  if (!isAutoPlaying) {
    intervalId = setInterval(() => {
      playGame(pickComputerMove());
    }, 800);
    isAutoPlaying = true;
    autoBtn.textContent = "⏹ Stop Auto";
    autoBtn.classList.add("active");
  } else {
    clearInterval(intervalId);
    isAutoPlaying = false;
    autoBtn.textContent = "▶ Auto Play";
    autoBtn.classList.remove("active");
  }
}