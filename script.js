const iconLibrary = ['🍎', '🍌', '🍇', '🍓', '🍒', '🍍', '🥝', '🍉', '🥑', '🌽', '🥕', '🍕', '🍔', '🍟', '🌮', '🍣', '🍦', '🍩', '🍫', '🍭'];

const sounds = {
    flip: new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3'),
    match: new Audio('https://assets.mixkit.co/active_storage/sfx/270/270-preview.mp3'),
    win: new Audio('https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3'),
    lose: new Audio('https://assets.mixkit.co/active_storage/sfx/2511/2511-preview.mp3')
};

const levels = {
    1: { pairs: 6, time: 60, grid: 'grid-l1' },
    2: { pairs: 10, time: 120, grid: 'grid-l2' },
    3: { pairs: 12, time: 150, grid: 'grid-l3' },
    4: { pairs: 14, time: 180, grid: 'grid-l4' }
};

let currentLevel = 1, moves = 0, matches = 0, flipped = [], timeLeft = 0, timerInterval, timerActive = false;

const grid = document.getElementById('grid');
const timerDisplay = document.getElementById('timer');
const moveDisplay = document.getElementById('moves');
const pairsDisplay = document.getElementById('pairs-left');
const levelDisplay = document.getElementById('current-level');

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

function checkMatch() {
    const [c1, c2] = flipped;
    if (c1.dataset.val === c2.dataset.val) {
        sounds.match.play().catch(() => {});
        c1.classList.add('matched'); c2.classList.add('matched');
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

function startCountdown() {
    timerActive = true;
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        if (timeLeft <= 10) document.querySelector('.warning-box').classList.add('active');
        if (timeLeft <= 0) endLevel(false);
    }, 1000);
}

function updateTimerDisplay() {
    const m = String(Math.floor(timeLeft / 60)).padStart(2, '0');
    const s = String(timeLeft % 60).padStart(2, '0');
    timerDisplay.innerText = `${m}:${s}`;
}

function endLevel(isWin) {
    clearInterval(timerInterval);
    const modal = document.getElementById('game-modal');
    const title = document.getElementById('modal-title');
    const desc = document.getElementById('modal-desc');
    const icon = document.getElementById('modal-icon');
    const btn = document.getElementById('modal-btn');

    modal.style.display = 'flex';

    if (isWin) {
        sounds.win.play().catch(() => {});
        confetti({ particleCount: 150, spread: 70 });
        title.innerText = currentLevel < 4 ? "Level Complete!" : "👑 GAME MASTER!";
        desc.innerText = `Cleared with ${timeLeft}s left!`;
        icon.innerText = currentLevel < 4 ? "⭐" : "🏆";
        btn.innerText = currentLevel < 4 ? "Next Level" : "Restart Universe";
        if(currentLevel === 4) document.body.classList.add('rainbow-mode');
    } else {
        sounds.lose.play().catch(() => {});
        title.innerText = "Time's Up!";
        desc.innerText = "The clock won this round.";
        icon.innerText = "⏰";
        btn.innerText = "Try Again";
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

function resetStats() {
    clearInterval(timerInterval);
    moves = 0; matches = 0; flipped = []; timerActive = false;
    moveDisplay.innerText = "0";
    document.querySelector('.warning-box').classList.remove('active');
}

document.getElementById('theme-toggle').onclick = () => {
    const root = document.documentElement;
    root.setAttribute('data-theme', root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
};

initLevel(1);