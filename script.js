const grid = document.getElementById('game-grid');
const icons = ['🚀', '🚀', '💻', '💻', '⚡', '⚡', '🎨', '🎨', '🔥', '🔥', '🌈', '🌈', '💎', '💎', '🍎', '🍎'];
let flippedCards = [];
let matchedCount = 0;

// 1. Initialize Game
function initGame() {
  grid.innerHTML = '';
  const shuffled = icons.sort(() => Math.random() - 0.5);
  
  shuffled.forEach((icon, index) => {
    const card = document.createElement('div');
    card.classList.add('card');
    card.dataset.icon = icon;
    card.innerHTML = `
      <div class="card-inner">
        <div class="card-front">?</div>
        <div class="card-back">${icon}</div>
      </div>
    `;
    grid.appendChild(card);
  });
}

// 2. The EVENT BUBBLING Logic
grid.addEventListener('click', (e) => {
  // Find the closest card parent from the click target
  const clickedCard = e.target.closest('.card');

  // Guard clauses: Ignore if not a card, already flipped, or checking 2 cards
  if (!clickedCard || 
      clickedCard.classList.contains('flipped') || 
      flippedCards.length === 2) return;

  clickedCard.classList.add('flipped');
  flippedCards.push(clickedCard);

  if (flippedCards.length === 2) {
    checkMatch();
  }
});

function checkMatch() {
  const [card1, card2] = flippedCards;
  
  if (card1.dataset.icon === card2.dataset.icon) {
    matchedCount += 2;
    flippedCards = [];
    if (matchedCount === icons.length) alert('You Won!');
  } else {
    // Flip back after a delay
    setTimeout(() => {
      card1.classList.remove('flipped');
      card2.classList.remove('flipped');
      flippedCards = [];
    }, 1000);
  }
}

initGame();