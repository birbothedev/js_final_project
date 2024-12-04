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
    // console.log('Correct answer: ', spellData.name);
}

async function displayRandomQuestion() {
    totalQuestions++
    // console.log('Total Questions: ', totalQuestions);
    if (gameEnded || totalQuestions >= maxQuestions) {
        // console.log('Game ended or reached max questions');
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
            // console.log(`Heart ${index + 1} displayed`);
        } else {
            image.style.visibility = 'hidden'; 
            // console.log(`Heart ${index + 1} hidden`);
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

    setTimeout(() => {
        // Hide game elements
        document.querySelector('.spellGuesser h2').style.display = 'none';
        document.getElementById('spellDescription').style.display = 'none';

        // Show end game container
        document.getElementById('endgameContainer').style.display = 'block';

        // Display reason for game ending
        if (reason === 'outOfHearts') {
            document.getElementById('died').style.display = 'block';
        } else {
            document.getElementById('maxq').style.display = 'block';
        }

        // Display score message based on the number of correct answers
        switch (right) {
            case 10:
                document.getElementById('scoreTwenty-Eight').style.display = 'block';
                break;
            case 9:
                document.getElementById('scoreTwenty-Six').style.display = 'block';
                break;
            case 8:
                document.getElementById('scoreTwenty-Four').style.display = 'block';
                break;
            case 7:
                document.getElementById('scoreTwenty-Two').style.display = 'block';
                break;
            case 6:
                document.getElementById('scoreTwenty').style.display = 'block';
                break;
            case 5:
                document.getElementById('scoreEighteen').style.display = 'block';
                break;
            case 4:
                document.getElementById('scoreSixteen').style.display = 'block';
                break;
            case 3:
                document.getElementById('scoreFourteen').style.display = 'block';
                break;
            case 2:
                document.getElementById('scoreTwelve').style.display = 'block';
                break;
            case 1:
                document.getElementById('scoreTen').style.display = 'block';
                break;
            case 0:
                document.getElementById('scoreNine').style.display = 'block';
                break;
            default:
                console.log('Unexpected score value');
        }
        // Show play again button
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
var aboutBtn = document.getElementById("aboutBtn");
var settingsBtn = document.getElementById("settingsBtn");
var htpBtn = document.getElementById("htpBtn");

var aboutPopup = document.getElementById("aboutPopup");
var settingsPopup = document.getElementById("settingsPopup");
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