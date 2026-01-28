const score = JSON.parse(localStorage.getItem("score")) || {
  wins: 0,
  losses: 0,
  ties: 0,
};

let isAutoPlaying = false;
let intervalId;

updateScore();

document
  .querySelector(".js-rock")
  .addEventListener("click", () => playGame("rock"));
document
  .querySelector(".js-paper")
  .addEventListener("click", () => playGame("paper"));
document
  .querySelector(".js-scissor")
  .addEventListener("click", () => playGame("scissor"));

document.querySelector(".js-reset").addEventListener("click", resetScore);
document.querySelector(".js-auto").addEventListener("click", autoPlay);

document.body.addEventListener("keydown", (event) => {
  if (event.key === "r") playGame("rock");
  if (event.key === "p") playGame("paper");
  if (event.key === "s") playGame("scissor");
});

function playGame(playerMove) {
  const computerMove = pickComputerMove();
  let result = "";

  if (playerMove === computerMove) {
    result = "Tie";
    score.ties++;
  } else if (
    (playerMove === "rock" && computerMove === "scissor") ||
    (playerMove === "paper" && computerMove === "rock") ||
    (playerMove === "scissor" && computerMove === "paper")
  ) {
    result = "You Win!";
    score.wins++;
  } else {
    result = "You Lose!";
    score.losses++;
  }

  localStorage.setItem("score", JSON.stringify(score));
  updateScore();

  document.querySelector(".js-result").innerHTML = result;
  document.querySelector(".js-moves").innerHTML = `
        You <img src="images/${playerMove}-emoji.png" class="emoji">
        -
        <img src="images/${computerMove}-emoji.png" class="emoji"> Computer
      `;
}

function pickComputerMove() {
  const moves = ["rock", "paper", "scissor"];
  return moves[Math.floor(Math.random() * 3)];
}

function updateScore() {
  document.querySelector(".js-score").innerHTML =
    `Wins: ${score.wins} | Losses: ${score.losses} | Ties: ${score.ties}`;
}

function resetScore() {
  score.wins = 0;
  score.losses = 0;
  score.ties = 0;
  localStorage.removeItem("score");
  updateScore();
}

function autoPlay() {
  if (!isAutoPlaying) {
    intervalId = setInterval(() => {
      playGame(pickComputerMove());
    }, 500);
    isAutoPlaying = true;
  } else {
    clearInterval(intervalId);
    isAutoPlaying = false;
  }
}