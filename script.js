const iconLibrary = ['🍎', '🍌', '🍇', '🍓', '🍒', '🍍', '🥝', '🍉', '🥑', '🌽', '🥕', '🍕', '🍔', '🍟', '🌮', '🍣', '🍦', '🍩', '🍫', '🍭'];

// Sound Engine using Mixkit Public Assets
const sounds = {
    flip: new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3'),
    match: new Audio('https://assets.mixkit.co/active_storage/sfx/270/270-preview.mp3'),
    win: new Audio('https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3'),
    lose: new Audio('https://assets.mixkit.co/active_storage/sfx/2511/2511-preview.mp3')
};

// Level Configuration
const levels = {
    1: { pairs: 6, time: 30, name: "grid-l1" },
    2: { pairs: 10, time: 60, name: "grid-l2" },
    3: { pairs: 12, time: 100, name: "grid-l3" },
    4: { pairs: 14, time: 110, name: "grid-l4" }
};

let currentLevel = 1;
let moves = 0;
let matches = 0;
let flipped = [];
let timeLeft = 0;
let timerInterval;
let timerActive = false;

const grid = document.getElementById('grid');
const timerDisplay = document.getElementById('timer');
const moveDisplay = document.getElementById('moves');
const pairsDisplay = document.getElementById('pairs-left');
const levelDisplay = document.getElementById('current-level');

// 1. Initialize Game
function initLevel(level) {
    grid.innerHTML = '';
    grid.className = `grid ${levels[level].name}`;
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

// 2. Event Bubbling Logic
grid.addEventListener('click', (e) => {
    const card = e.target.closest('.card');
    
    // Safety Checks
    if (!card || card.classList.contains('flipped') || flipped.length === 2) return;

    // Start timer on first click
    if (!timerActive) startCountdown();

    // Play Flip Sound
    sounds.flip.currentTime = 0;
    sounds.flip.play().catch(() => console.log("Audio requires user interaction"));

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
        sounds.match.play();
        c1.classList.add('matched');
        c2.classList.add('matched');
        matches++;
        pairsDisplay.innerText = levels[currentLevel].pairs - matches;
        flipped = [];
        
        if (matches === levels[currentLevel].pairs) endLevel(true);
    } else {
        setTimeout(() => {
            c1.classList.remove('flipped');
            c2.classList.remove('flipped');
            flipped = [];
        }, 800);
    }
}

// 3. Timer Logic
function startCountdown() {
    timerActive = true;
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();

        if (timeLeft <= 10) {
            document.querySelector('.warning-box').classList.add('active');
        }

        if (timeLeft <= 0) {
            endLevel(false);
        }
    }, 1000);
}

function updateTimerDisplay() {
    const m = String(Math.floor(timeLeft / 60)).padStart(2, '0');
    const s = String(timeLeft % 60).padStart(2, '0');
    timerDisplay.innerText = `${m}:${s}`;
}

// 4. Game Over / Win Logic
function endLevel(isWin) {
    clearInterval(timerInterval);
    const modal = document.getElementById('game-modal');
    const title = document.getElementById('modal-title');
    const desc = document.getElementById('modal-desc');
    const icon = document.getElementById('modal-icon');
    const btn = document.getElementById('modal-btn');

    modal.style.display = 'flex';

    if (isWin) {
        sounds.win.play();
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        
        if (currentLevel < 4) {
            title.innerText = "Level Cleared!";
            desc.innerText = `Matched in ${moves} moves with ${timeLeft}s remaining!`;
            icon.innerText = "⭐";
            btn.innerText = "Next Level";
        } else {
            // Final Reward
            title.innerText = "GRAND MASTER!";
            desc.innerText = "You have conquered all 4 levels! You are a memory god.";
            icon.innerText = "👑";
            btn.innerText = "Reset Universe";
            document.body.classList.add('rainbow-mode');
        }
    } else {
        sounds.lose.play();
        title.innerText = "Time's Up!";
        desc.innerText = "The clock beat you this time. Ready to try again?";
        icon.innerText = "💀";
        btn.innerText = "Restart Level";
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

// 5. Utilities
function resetStats() {
    clearInterval(timerInterval);
    moves = 0;
    matches = 0;
    flipped = [];
    timerActive = false;
    moveDisplay.innerText = "0";
    document.querySelector('.warning-box').classList.remove('active');
}

document.getElementById('theme-toggle').onclick = () => {
    const root = document.documentElement;
    const isDark = root.getAttribute('data-theme') === 'dark';
    root.setAttribute('data-theme', isDark ? 'light' : 'dark');
};

// Initialize First Level
initLevel(1);