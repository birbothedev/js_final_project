let correctGuesses = 0;
let incorrectGuesses = 0;
let right = 0;
let wrong = 0;
let skips = 0;
let totalQuestions = 0;
let maxQuestions = 11;
let askedQuestions = [];
let gameEnded = false;
let skipped = false;

async function fetchRandomSpell() {
    const response = await fetch('https://www.dnd5eapi.co/api/spells');
    const data = await response.json();
    const randomSpell = data.results[Math.floor(Math.random() * data.results.length)];
    const spellResponse = await fetch(`https://www.dnd5eapi.co${randomSpell.url}`);
    const spellData = await spellResponse.json();
    return spellData;
}

async function displaySpellDescription(spellData) {
    const spellDescription = spellData.desc[0];
    document.getElementById('spellDescription').innerText = spellDescription;
    localStorage.setItem('correctAnswer', spellData.name);
    console.log('Correct answer: ', spellData.name);
}

async function displayRandomQuestion() {
    totalQuestions++
    if (gameEnded || totalQuestions >= maxQuestions) {
        endGame(totalQuestions >= maxQuestions ? 'maxQuestions' : 'outOfHearts');
        return;
    }
    let questionData;
    let questionAlreadyAsked = true;
    while (questionAlreadyAsked) {
        questionData = await fetchRandomSpell();
        if (!askedQuestions.includes(questionData.name)) {
            questionAlreadyAsked = false;
            askedQuestions.push(questionData.name);
        }
    }
    await displaySpellDescription(questionData);
}

let remainingHearts = 3;
function updateHeartDisplay() {
    const heartImages = document.querySelectorAll('#heart1, #heart2, #heart3');
    heartImages.forEach((image, index) => {
        if (index < remainingHearts) {
            image.style.visibility = 'visible'; 
        } else {
            image.style.visibility = 'hidden'; 
        }
    });
}

function checkGuess() {
    const guessInput = document.getElementById('guessInput');
    const guess = guessInput.value.trim().toLowerCase().replace(/'/g, ''); 
    const correctAnswer = localStorage.getItem('correctAnswer').toLowerCase().replace(/'/g, '').trim();

    if (guess === correctAnswer) {
        correctGuesses++;
        right++;
        showCorrectAnswer();
        guessInput.classList.add('flash-jiggleGreen');
        setTimeout(() => {
            guessInput.classList.remove('flash-jiggleGreen');
            moveToNextQuestion();
        }, 2000);

        if (remainingHearts < 3) {
            remainingHearts++;
            updateHeartDisplay();
        }
    } else if (skipped) {
        incorrectGuesses++;
        wrong++;
        guessInput.classList.add('flash-jiggleRed');

        setTimeout(() => {
            guessInput.classList.remove('flash-jiggleRed');
        }, 2000);

    } else {
        incorrectGuesses++;
        wrong++;
        guessInput.classList.add('flash-jiggleRed');

        if (remainingHearts > 0) {
            remainingHearts--;
            updateHeartDisplay();
        }

        setTimeout(() => {
            guessInput.classList.remove('flash-jiggleRed');
        }, 2000);

        if (remainingHearts === 0) {
            endGame('outOfHearts');
        }
    }
}

function endGame(reason) {
    gameEnded = true;
    let finalScoreBlock = document.getElementById("scoreText");
    let finalMessageBlock = document.getElementById("scoreMessage");
    let endMessage = document.getElementById('endMessage');
    const scoreMap = {	10: { score: "INT 28 (+9)", finalMessage: "I'm scared of you" },
    9: { score: "INT 26 (+8)", finalMessage: "This is why you fail all your strength checks" },
    8: { score: "INT 24 (+7)", finalMessage: "...When was the last time you went outside?" },
    7: { score: "INT 22 (+6)", finalMessage:"They say knowledge is power, and you've got it in spades!", },
    6: { score: "INT 20 (+5)", finalMessage:"Genius on the battlefield and in the library!", },
    5: { score: "INT 18 (+4)", finalMessage:"Impressive! You're becoming quite the scholar!", },
    4: { score: "INT 16 (+3)", finalMessage:"Brains and brawn, you've got it all!", },
    3: { score: "INT 14 (+2)", finalMessage:"Now you're not just swinging wildly. You're strategizing!", },
    2: { score: "INT 12 (+1)", finalMessage:"Looks like you've got the basics down... almost.", },
    1: { score: "INT 10 (+0)", finalMessage:"A little slow on the uptake, but you'll get there", },
    0: { score: "INT 9 (-1)", finalMessage:"Who needs to know stuff when you can just hit things", }};

    setTimeout(() => {
        document.querySelector('.spellGuesser h2').style.display = 'none';
        document.getElementById('spellDescription').style.display = 'none';
        document.getElementById('endgameContainer').style.display = 'block';

        if (reason === 'outOfHearts') {
            endMessage.textContent = "YOU DIED!"
            
        } else {
            endMessage.textContent = "YIPEE!"
        }

        finalScoreBlock.textContent = scoreMap[right].score;
        finalMessageBlock.textContent = scoreMap[right].finalMessage;

        document.getElementById('playAgain').style.display = 'block';
    }, 2000);
}


function playAgain() {
    const playButton = document.getElementById('playAgain');
    playButton.disabled = true;

    setTimeout(() => {
        playButton.disabled = false; 
    }, 500);

    playButton.removeEventListener('click', playAgainHandler); 
    playButton.addEventListener('click', playAgainHandler); 
}

function playAgainHandler() {
    const playButton = document.getElementById('playAgain');
    playButton.style.display = 'none';

    setTimeout(() => {
        location.reload();
    }, 1000);
}


const skipButton = document.getElementById('skipButton');
skipButton.addEventListener('click', function() {
    if (!gameEnded) {
        skipped = true;
        skips++;
        checkGuess();
        showCorrectAnswer();
        skipButton.disabled = true;
        setTimeout(() => {
            moveToNextQuestion();
            skipButton.disabled = false;
            skipped = false;
        }, 2000);
    }
});

const guessButton = document.getElementById('guessButton');
guessButton.addEventListener('click', function() {
    if (!gameEnded) {
        checkGuess();
        guessButton.disabled = true;
        setTimeout(() => {
            guessButton.disabled = false;
        }, 2000);
    }
});

function showCorrectAnswer() {
    const displayAnswer = document.getElementById('displayAnswer');
    const correctAnswer = localStorage.getItem('correctAnswer');
    displayAnswer.innerText = correctAnswer;
    displayAnswer.style.display = 'block';
}

function moveToNextQuestion() {
    const correctMessage = document.querySelector('.spellGuesser h3');
    correctMessage.style.display = 'none';

    const guessInput = document.getElementById('guessInput');
    guessInput.value = ''; 

    const spellDescription = document.getElementById('spellDescription');
    spellDescription.innerText = '';
    spellDescription.style.display = 'block';

    document.getElementById('displayAnswer').style.display = 'none';
    displayRandomQuestion();
    guessInput.focus();
}

document.addEventListener('DOMContentLoaded', function() {
    playAgain();
    displayRandomQuestion();
    updateHeartDisplay();
    document.getElementById('guessInput').focus();
});

// BUTTONS
var htpBtn = document.getElementById("htpBtn");
var htpPopup = document.getElementById("htpPopup");
var closeBtns = document.querySelectorAll(".close");

function togglePopup(popup) {
    popup.classList.toggle("show");
}
htpBtn.addEventListener("click", function() {
    togglePopup(htpPopup);
});
closeBtns.forEach(function(btn) {
    btn.addEventListener("click", function() {
        var popup = btn.parentElement.parentElement;
        togglePopup(popup);
    });
});