/**
 * MEMORY PRO - CORE LOGIC
 * Includes: Level System, Countdown Timer, Sound Engine, and Emergency Alert
 */

// 1. Icon Library
const iconLibrary = ['🍎', '🍌', '🍇', '🍓', '🍒', '🍍', '🥝', '🍉', '🥑', '🌽', '🥕', '🍕', '🍔', '🍟', '🌮', '🍣', '🍦', '🍩', '🍫', '🍭'];

// 2. Sound Engine (Update these paths to your custom MP3 files)
const sounds = {
    flip: new Audio('./sounds/flip.mpeg'),      
    match: new Audio('./sounds/match.mpeg'),    
    fail: new Audio('./sounds/mismatch.mpeg'),  
    win: new Audio('./sounds/win.mpeg'),        
    lose: new Audio('./sounds/lose.mpeg'),      
    alert: new Audio('./sounds/alert.mpeg')     // NEW: Emergency alert for last 10 seconds
};

// 3. Level Configurations
const levels = {
    1: { pairs: 6, time: 30, grid: 'grid-l1' },
    2: { pairs: 10, time: 40, grid: 'grid-l2' },
    3: { pairs: 12, time: 50, grid: 'grid-l3' },
    4: { pairs: 14, time: 25, grid: 'grid-l4' }
};

// 4. Game State Variables
let currentLevel = 1, moves = 0, matches = 0, flipped = [], timeLeft = 0, timerInterval, timerActive = false;

// 5. DOM Elements
const grid = document.getElementById('grid');
const timerDisplay = document.getElementById('timer');
const moveDisplay = document.getElementById('moves');
const pairsDisplay = document.getElementById('pairs-left');
const levelDisplay = document.getElementById('current-level');

// 6. Initialize Level
function initLevel(level) {
    grid.innerHTML = '';
    grid.className = `grid ${levels[level].grid}`;
    levelDisplay.innerText = level;
    
    const config = levels[level];
    timeLeft = config.time;
    pairsDisplay.innerText = config.pairs;
    updateTimerDisplay();

    const selectedIcons = iconLibrary.slice(0, config.pairs);
    const gameSet = [...selectedIcons, ...selectedIcons].sort(() => Math.random() - 0.5);

    gameSet.forEach(icon => {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.val = icon;
        card.innerHTML = `<div class="card-inner"><div class="front"></div><div class="back">${icon}</div></div>`;
        grid.appendChild(card);
    });

    resetStats();
}

// 7. Click Handling
grid.addEventListener('click', (e) => {
    const card = e.target.closest('.card');
    if (!card || card.classList.contains('flipped') || flipped.length === 2) return;

    if (!timerActive) startCountdown();

    sounds.flip.currentTime = 0;
    sounds.flip.play().catch(() => {});
    
    card.classList.add('flipped');
    flipped.push(card);

    if (flipped.length === 2) {
        moves++;
        moveDisplay.innerText = moves;
        checkMatch();
    }
});

// 8. Matching Logic
function checkMatch() {
    const [c1, c2] = flipped;
    if (c1.dataset.val === c2.dataset.val) {
        sounds.match.currentTime = 0;
        sounds.match.play().catch(() => {});
        c1.classList.add('matched'); c2.classList.add('matched');
        matches++;
        pairsDisplay.innerText = levels[currentLevel].pairs - matches;
        flipped = [];
        if (matches === levels[currentLevel].pairs) endLevel(true);
    } else {
        sounds.fail.currentTime = 0;
        sounds.fail.play().catch(() => {});
        setTimeout(() => {
            c1.classList.remove('flipped');
            c2.classList.remove('flipped');
            flipped = [];
        }, 800);
    }
}

// 9. Timer Functions (Including Emergency Alert Logic)
function startCountdown() {
    timerActive = true;
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        
        // --- EMERGENCY ALERT LOGIC ---
        if (timeLeft <= 10 && timeLeft > 0) {
            document.querySelector('.warning-box').classList.add('active');
            sounds.alert.currentTime = 0;
            sounds.alert.play().catch(() => {}); 
        }
        
        if (timeLeft <= 0) endLevel(false);
    }, 1000);
}

function updateTimerDisplay() {
    const m = String(Math.floor(timeLeft / 60)).padStart(2, '0');
    const s = String(timeLeft % 60).padStart(2, '0');
    timerDisplay.innerText = `${m}:${s}`;
}

// 10. Win/Loss Logic
function endLevel(isWin) {
    clearInterval(timerInterval);
    stopAlert(); // Ensure alert stops when level ends

    const modal = document.getElementById('game-modal');
    const title = document.getElementById('modal-title');
    const desc = document.getElementById('modal-desc');
    const icon = document.getElementById('modal-icon');
    const btn = document.getElementById('modal-btn');

    modal.style.display = 'flex';

    if (isWin) {
        sounds.win.currentTime = 0;
        sounds.win.play().catch(() => {});
        confetti({ particleCount: 150, spread: 70 });
        
        if (currentLevel < 4) {
            title.innerText = "Level Complete!";
            desc.innerText = `Cleared with ${timeLeft}s left!`;
            icon.innerText = "⭐";
            btn.innerText = "Next Level";
        } else {
            title.innerText = "👑 GRAND MASTER!";
            desc.innerText = "All levels conquered!";
            icon.innerText = "🏆";
            btn.innerText = "Restart Universe";
            document.body.classList.add('rainbow-mode');
        }
    } else {
        sounds.lose.currentTime = 0;
        sounds.lose.play().catch(() => {});
        title.innerText = "Time's Up!";
        desc.innerText = "The clock ran out. Try again?";
        icon.innerText = "💀";
        btn.innerText = "Retry Level";
    }

    btn.onclick = () => {
        modal.style.display = 'none';
        if (isWin) {
            if (currentLevel === 4) {
                currentLevel = 1;
                document.body.classList.remove('rainbow-mode');
            } else {
                currentLevel++;
            }
        }
        initLevel(currentLevel);
    };
}

// 11. Utilities
function stopAlert() {
    sounds.alert.pause();
    sounds.alert.currentTime = 0;
}

function resetStats() {
    clearInterval(timerInterval);
    stopAlert();
    moves = 0; matches = 0; flipped = []; timerActive = false;
    moveDisplay.innerText = "0";
    document.querySelector('.warning-box').classList.remove('active');
}

document.getElementById('theme-toggle').onclick = () => {
    const root = document.documentElement;
    root.setAttribute('data-theme', root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
};

initLevel(1);