const iconLibrary = ['🍕', '🍔', '🍟', '🍦', '🍩', '🍫', '🍭', '🍓', '🍇', '🍉', '🍌', '🍒', '🍋', '🥑', '🌽', '🍄', '🥕', '🥩', '🥨', '🥐', '🍱', '🍣', '🥟', '🍜', '🍩', '🍪', '🍯', '🍰', '🥧', '🍹'];

let currentLevel = 1;
let moves = 0;
let matches = 0;
let flipped = [];
let seconds = 0;
let timerActive = false;
let timerInterval;

const grid = document.getElementById('grid');
const moveDisplay = document.getElementById('moves');
const timerDisplay = document.getElementById('timer');
const levelDisplay = document.getElementById('current-level');
const targetDisplay = document.getElementById('target-matches');

// Theme Toggle Logic
document.getElementById('theme-toggle').addEventListener('click', () => {
    const root = document.documentElement;
    const isDark = root.getAttribute('data-theme') === 'dark';
    root.setAttribute('data-theme', isDark ? 'light' : 'dark');
});

function initLevel(level) {
    grid.innerHTML = '';
    grid.className = `grid level-${level}`;
    levelDisplay.innerText = level;
    
    // Level 1: 24 cards (12 pairs) | Level 2: 60 cards (30 pairs)
    let pairCount = level === 1 ? 12 : 30; 
    targetDisplay.innerText = pairCount;

    const selectedIcons = iconLibrary.slice(0, pairCount);
    const gameSet = shuffle([...selectedIcons, ...selectedIcons]);

    gameSet.forEach(icon => {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.val = icon;
        card.innerHTML = `
            <div class="card-inner">
                <div class="front"></div>
                <div class="back">${icon}</div>
            </div>
        `;
        grid.appendChild(card);
    });

    resetStats();
}

// EVENT BUBBLING: The core of the project
grid.addEventListener('click', (e) => {
    const card = e.target.closest('.card');
    
    // Safety checks
    if (!card || card.classList.contains('flipped') || flipped.length === 2) return;

    if (!timerActive) startTimer();

    card.classList.add('flipped');
    flipped.push(card);

    if (flipped.length === 2) {
        moves++;
        moveDisplay.innerText = moves;
        checkMatch();
    }
});

function checkMatch() {
    const [c1, c2] = flipped;
    if (c1.dataset.val === c2.dataset.val) {
        c1.classList.add('matched');
        c2.classList.add('matched');
        matches++;
        flipped = [];
        
        let target = currentLevel === 1 ? 12 : 30;
        if (matches === target) handleWin();
    } else {
        setTimeout(() => {
            c1.classList.remove('flipped');
            c2.classList.remove('flipped');
            flipped = [];
        }, 700);
    }
}

function handleWin() {
    clearInterval(timerInterval);
    confetti({ particleCount: 200, spread: 80, origin: { y: 0.6 } });
    
    setTimeout(() => {
        document.getElementById('win-modal').style.display = 'flex';
        document.getElementById('final-time').innerText = timerDisplay.innerText;
        document.getElementById('final-moves').innerText = moves;
    }, 800);
}

document.getElementById('next-level-btn').addEventListener('click', () => {
    document.getElementById('win-modal').style.display = 'none';
    currentLevel = currentLevel === 1 ? 2 : 1; // Toggle between Level 1 and 2
    initLevel(currentLevel);
});

// Helpers
function shuffle(array) { return array.sort(() => Math.random() - 0.5); }

function startTimer() {
    timerActive = true;
    timerInterval = setInterval(() => {
        seconds++;
        const m = String(Math.floor(seconds / 60)).padStart(2, '0');
        const s = String(seconds % 60).padStart(2, '0');
        timerDisplay.innerText = `${m}:${s}`;
    }, 1000);
}

function resetStats() {
    clearInterval(timerInterval);
    seconds = 0; moves = 0; matches = 0;
    timerActive = false;
    flipped = [];
    timerDisplay.innerText = "00:00";
    moveDisplay.innerText = "0";
}

// Start Game
initLevel(1);