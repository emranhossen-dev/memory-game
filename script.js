const iconLibrary = ['🔥', '👾', '🚀', '💎', '🌈', '⚡', '🍀', '🍎', '⚽', '🎸', '🍦', '🚁', '🌋', '🛸', '🛰️', '🪐', '🍄', '🥑', '🧨', '🧿', '🧬', '🛡️', '🔑', '🧪', '🏹', '🎨', '🎬', '🎧', '🔭', '📡', '🔋', '🏆'];

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

// 1. Theme Toggler
document.getElementById('theme-toggle').addEventListener('click', () => {
    const root = document.documentElement;
    const currentTheme = root.getAttribute('data-theme');
    root.setAttribute('data-theme', currentTheme === 'dark' ? 'light' : 'dark');
});

// 2. Initialize Game Based on Level
function initLevel(level) {
    grid.innerHTML = '';
    grid.className = `grid level-${level}`;
    levelDisplay.innerText = level;
    
    let itemCount = level === 1 ? 8 : (level === 2 ? 18 : 32); // Creates 16, 36, 64 tiles
    const selectedIcons = iconLibrary.slice(0, itemCount);
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

// 3. EVENT BUBBLING Logic
grid.addEventListener('click', (e) => {
    const card = e.target.closest('.card');
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
        
        // Check Win Condition
        const totalNeeded = (currentLevel === 1 ? 8 : (currentLevel === 2 ? 18 : 32));
        if (matches === totalNeeded) handleWin();
    } else {
        setTimeout(() => {
            c1.classList.remove('flipped');
            c2.classList.remove('flipped');
            flipped = [];
        }, 800);
    }
}

function handleWin() {
    clearInterval(timerInterval);
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    
    setTimeout(() => {
        document.getElementById('win-modal').style.display = 'flex';
        document.getElementById('final-time').innerText = timerDisplay.innerText;
    }, 1000);
}

document.getElementById('next-level-btn').addEventListener('click', () => {
    document.getElementById('win-modal').style.display = 'none';
    currentLevel = currentLevel < 3 ? currentLevel + 1 : 1;
    initLevel(currentLevel);
});

// Helper Functions
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
    seconds = 0;
    moves = 0;
    matches = 0;
    timerActive = false;
    flipped = [];
    timerDisplay.innerText = "00:00";
    moveDisplay.innerText = "0";
}

initLevel(1);