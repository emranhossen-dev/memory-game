const emojis = ['🎮', '🕹️', '👾', '🚀', '💎', '🔥', '⚡', '🌈'];
const gameGrid = [...emojis, ...emojis]; // 16 items for playable mobile grid
let flipped = [];
let moves = 0;
let matches = 0;
let timerInterval;
let seconds = 0;

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

function startTimer() {
  timerInterval = setInterval(() => {
    seconds++;
    const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');
    document.getElementById('timer').innerText = `${mins}:${secs}`;
  }, 1000);
}

function init() {
  const shuffled = shuffle(gameGrid);
  const container = document.getElementById('grid');
  
  shuffled.forEach((emoji, i) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="card-inner">
        <div class="front"></div>
        <div class="back">${emoji}</div>
      </div>
    `;
    card.dataset.val = emoji;
    container.appendChild(card);
  });
  
  // EVENT BUBBLING: Single listener for all cards
  container.addEventListener('click', handleCardClick);
}

function handleCardClick(e) {
  const card = e.target.closest('.card');
  if (!card || card.classList.contains('flipped') || flipped.length === 2) return;

  if (moves === 0 && flipped.length === 0) startTimer();

  card.classList.add('flipped');
  flipped.push(card);

  if (flipped.length === 2) {
    moves++;
    document.getElementById('moves').innerText = moves;
    checkMatch();
  }
}

function checkMatch() {
  const [c1, c2] = flipped;
  if (c1.dataset.val === c2.dataset.val) {
    c1.classList.add('matched');
    c2.classList.add('matched');
    matches += 2;
    flipped = [];
    if (matches === gameGrid.length) winGame();
  } else {
    setTimeout(() => {
      c1.classList.remove('flipped');
      c2.classList.remove('flipped');
      flipped = [];
    }, 800);
  }
}

function winGame() {
  clearInterval(timerInterval);
  document.getElementById('win-modal').style.display = 'flex';
  document.getElementById('final-time').innerText = document.getElementById('timer').innerText;
  document.getElementById('final-moves').innerText = moves;
}

init();