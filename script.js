// Audio setup
const audioFiles = {
    correct: new Audio('./assets/audio/correct.mp3'),
    incorrect: new Audio('./assets/audio/incorrect.mp3'),
    win: new Audio('./assets/audio/win.mp3'),
    lose: new Audio('./assets/audio/lose.mp3'),
    background: new Audio('./assets/audio/background.mp3'),
};

audioFiles.background.loop = true;
audioFiles.background.volume = 0.2;

let word = '';
let hint = '';
let guessedLetters = [];
let wrongGuesses = 0;
const maxGuesses = 6;

// DOM elements
const startButton = document.querySelector('#start-button');
const gameContainer = document.querySelector('.game-container');
const wordDisplay = document.querySelector('#word-display');
const hintDisplay = document.querySelector('#hint-display');
const wrongGuessesDisplay = document.querySelector('#wrong-guesses');
const hangmanImage = document.querySelector('#hangman-image');
const restartButton = document.querySelector('#restart-button');
const keyboardDisplay = document.querySelector('#keyboard');

// Fetch words and hints
async function fetchWords() {
    try {
        const response = await fetch('./data/words.json');
        if (!response.ok) throw new Error('Failed to load words.');
        return await response.json();
    } catch (error) {
        alert('Error loading words. Please try again.');
        console.error(error);
        return [];
    }
}

// Initialize the game
async function initGame() {
    const words = await fetchWords();
    if (words.length === 0) return;

    const randomEntry = words[Math.floor(Math.random() * words.length)];
    word = randomEntry.word.toLowerCase();
    hint = randomEntry.hint;
    guessedLetters = [];
    wrongGuesses = 0;

    hangmanImage.src = './assets/images/hangman-0.png';
    restartButton.style.display = 'none';
    updateDisplay();
    generateKeyboard();

    audioFiles.background.play();
}

// Update the game display
function updateDisplay() {
    wordDisplay.textContent = word
        .split('')
        .map(letter => (guessedLetters.includes(letter) ? letter : '_'))
        .join(' ');

    hintDisplay.textContent = `Hint: ${hint}`;
    wrongGuessesDisplay.textContent = `Wrong guesses: ${wrongGuesses}/${maxGuesses}`;
    hangmanImage.src = `./assets/images/hangman-${wrongGuesses}.png`;

    document.querySelectorAll('.keyboard-button').forEach(button => {
        if (guessedLetters.includes(button.textContent.toLowerCase())) {
            button.disabled = true;
            button.classList.add(word.includes(button.textContent.toLowerCase()) ? 'correct' : 'wrong');
        }
    });

    if (word.split('').every(letter => guessedLetters.includes(letter))) {
        endGame(true);
    } else if (wrongGuesses >= maxGuesses) {
        endGame(false);
    }
}

// Handle guesses
function handleGuess(letter) {
    if (guessedLetters.includes(letter) || wrongGuesses >= maxGuesses) return;

    guessedLetters.push(letter);
    if (word.includes(letter)) {
        audioFiles.correct.play();
    } else {
        wrongGuesses++;
        audioFiles.incorrect.play();
    }
    updateDisplay();
}

// Generate virtual keyboard
function generateKeyboard() {
    keyboardDisplay.innerHTML = '';
    'abcdefghijklmnopqrstuvwxyz'.split('').forEach(letter => {
        const button = document.createElement('button');
        button.textContent = letter.toUpperCase();
        button.className = 'keyboard-button';
        button.addEventListener('click', () => handleGuess(letter));
        keyboardDisplay.appendChild(button);
    });
}

// End the game
function endGame(isWin) {
    document.querySelectorAll('.keyboard-button').forEach(button => (button.disabled = true));
    audioFiles.background.pause();

    if (isWin) {
        hangmanImage.src = './assets/images/hangman-7.png';
        audioFiles.win.play();
        triggerConfetti();
    } else {
        hangmanImage.src = './assets/images/hangman-6.png';
        audioFiles.lose.play();
    }

    restartButton.style.display = 'block';
    restartButton.focus();
}

// Trigger confetti animation
function triggerConfetti() {
    const confettiSettings = { target: 'confetti-canvas', max: 150, size: 1.5 };
    const confetti = new ConfettiGenerator(confettiSettings);
    confetti.render();

    // Stop confetti after 10 seconds
    setTimeout(() => confetti.clear(), 10000);
}

// Event Listeners
startButton.addEventListener('click', () => {
    audioFiles.background.play();
    document.querySelector('.start-container').style.display = 'none';
    gameContainer.style.display = 'block';
    initGame();
});

restartButton.addEventListener('click', () => {
    restartButton.style.display = 'none';
    initGame();
});
