let interval = 0;
let resetTime = 30;
let timer = resetTime * 2;
let race = 7;
let alternateBreak = false;
let player1 = 'Player 1';
let player2 = 'Player 2';
let activePlayer = 1;
let breakedPlayer = 1;
let element;
let audioCtx;

document.body.oncontextmenu = function () {
    return false;
}; // i know this is useless. it was just distracting me ;)

/* get data from cookie if possible */
if (document.cookie.length) {
    var cookies = document.cookie.split('; ').reduce((prev, current) => {
        const [name, ...value] = current.split('=');
        prev[name] = value.join('=');
        return prev;
    }, {});
    resetTime = Number.parseInt(cookies.resetTime) ?? resetTime;
    timer = resetTime * 2;
    updateDisplay();
    race = cookies.race ?? race;
    document.querySelector('.display-race').innerText = race;
    player1 = cookies.player1 ?? player1;
    document.querySelector('#player1 .player-name').innerText = player1;
    player2 = cookies.player2 ?? player2;
    document.querySelector('#player2 .player-name').innerText = player2;
    alternateBreak = cookies.alternateBreak ? (cookies.alternateBreak == 'true') : alternateBreak;
}

document.getElementById('welcome-play').addEventListener('click', toggleWelcome);

// Player
function setPlayer1Name(name) {
    document.querySelector('#player1 .player-name').innerText = name;
    document.cookie = "player1=" + name;
}

document.querySelector('#player1 .player-name').addEventListener('click', function () {
    showPrompt('text', 'Enter name of Player 1:', this.innerText, 'setPlayer1Name');
});

function setPlayer2Name(name) {
    document.querySelector('#player2 .player-name').innerText = name;
    document.cookie = "player2=" + name;
}

document.querySelector('#player2 .player-name').addEventListener('click', function () {
    showPrompt('text', 'Enter name of Player 2:', this.innerText, 'setPlayer2Name');
});

function toggleActivePlayer() {
    document.querySelector('#player' + activePlayer + ' .player-name').classList.remove('active');
    activePlayer = activePlayer == 1 ? 2 : 1;
    document.querySelector('#player' + activePlayer + ' .player-name').classList.add('active');
}

document.querySelectorAll('.player-name').forEach(function (element) {
    onLongPress(element, toggleActivePlayer);
});

function increasePlayerScore() {
    if (interval) {
        toggleTimer();
    }
    timer = resetTime * 2;
    updateDisplay();

    this.innerText = Number.parseInt(this.innerText) + 1;
    if (alternateBreak) {
        breakedPlayer = breakedPlayer == 1 ? 2 : 1;
    } else {
        breakedPlayer = this.dataset.player;
    }
    if (activePlayer != breakedPlayer) {
        toggleActivePlayer();
    }
    document.querySelector('.display-break.active').classList.remove('active');
    document.getElementById("display-break-player" + breakedPlayer).classList.add('active');
}

document.querySelectorAll('td.player-score').forEach(element => element.addEventListener('click', increasePlayerScore));

function setPlayer1Score(score) {
    document.querySelector('#player1 .player-score').innerText = score ? score : 0;
}

element = document.querySelector('#player1 .player-score');
onLongPress(element, () => {
    showPrompt('number', 'Enter score for player 1:', document.querySelector('#player1 .player-score').innerText, 'setPlayer1Score');
});

function setPlayer2Score(score) {
    document.querySelector('#player2 .player-score').innerText = score ? score : 0;
}

element = document.querySelector('#player2 .player-score');
onLongPress(element, () => {
    showPrompt('number', 'Enter score for player 2:', document.querySelector('#player2 .player-score').innerText, 'setPlayer2Score');
});

function playerExtension() {
    timer += resetTime;
    updateDisplay();
    this.classList.remove('active');
}

document.querySelectorAll('.player-extension').forEach(element => element.addEventListener('click', playerExtension));
document.querySelectorAll('.player-extension').forEach(function (element) {
    onLongPress(element, () => element.classList.toggle('active'));
});

// Display
function toggleBreakedPlayer() {
    document.querySelectorAll('.display-break').forEach(element => element.classList.toggle('active'));
    breakedPlayer = breakedPlayer == 1 ? 2 : 1;
}

document.querySelectorAll('.display-break').forEach(function (element) {
    onLongPress(element, () => toggleBreakedPlayer());
});

function resetTimer() {
    timer = resetTime;
    updateDisplay();
}

document.querySelector('.display-timer').addEventListener('click', resetTimer);

function setTimer(newTimer) {
    if (interval) {
        toggleTimer();
    }
    timer = newTimer ? Number.parseInt(newTimer) : timer;
    updateDisplay();
}

element = document.querySelector('.display-timer');
onLongPress(element, () => showPrompt('number', 'Enter time:', timer, 'setTimer'));

// Controls
function toggleTimer() {
    if (timer == 0) {
        return;
    }
    if (!interval) {
        interval = setInterval(runTimer, 1000);
        runTimer();
    } else {
        clearInterval(interval);
        interval = null;
    }
    document.querySelector('#controls-play i').classList.toggle('fa-play');
    document.querySelector('#controls-play i').classList.toggle('fa-pause');
}

document.getElementById('controls-play').addEventListener('click', toggleTimer);

function switchPlayer() {
    resetTimer();
    toggleActivePlayer();
    if (!interval) {
        toggleTimer();
    }
}

document.getElementById('controls-switch').addEventListener('click', switchPlayer);
element = document.getElementById('controls-switch');
onLongPress(element, () => {
    switchPlayer();
    timer = resetTime * 2;
    updateDisplay();
});

function toggleSettings() {
    document.getElementById('main').classList.toggle('invisible');
    document.getElementById('settings').classList.toggle('invisible');
    document.getElementById('settings-time').value = resetTime;
    document.getElementById('settings-race').value = race;
    document.getElementById('settings-alternate').checked = alternateBreak;
}

document.getElementById('controls-settings').addEventListener('click', toggleSettings);

// Modals
// Welcome screen
function toggleWelcome() {
    document.getElementById('main').classList.toggle('invisible');
    document.getElementById('welcome').classList.toggle('invisible');
    document.body.requestFullscreen();
    screen.orientation.lock('landscape');
}

// settings
function resetGame() {
    document.querySelectorAll('.player-score').forEach(element => element.innerText = 0);
    if (activePlayer == 2) {
        toggleActivePlayer();
    }
    if (breakedPlayer == 2) {
        toggleBreakedPlayer();
    }
    if (interval) {
        toggleTimer();
    }
    timer = resetTime * 2;
    updateDisplay();
    document.querySelectorAll('.player-extension').forEach(element => element.classList.add('active'));
    document.body.requestFullscreen();
    screen.orientation.lock('landscape');
    toggleSettings();
}

document.getElementById('settings-reset').addEventListener('click', resetGame);

function setFullscreen() {
    document.body.requestFullscreen();
    screen.orientation.lock('landscape');
}

document.getElementById('settings-fullscreen').addEventListener('click', setFullscreen);

function toggleAbout() {
    document.getElementById('about').classList.toggle('invisible');
    document.getElementById('settings').classList.toggle('invisible');
}

document.getElementById('settings-about').addEventListener('click', toggleAbout);
document.getElementById('about-cancel').addEventListener('click', toggleAbout);

document.getElementById('settings-cancel').addEventListener('click', toggleSettings);

function saveSettings() {
    var inputtime = document.getElementById('settings-time').value;
    if (isNaN(inputtime) || inputtime <= 0) {
        alert("Must input numbers > 0");
        return false;
    }
    resetTime = Math.floor(inputtime)
    document.cookie = "resetTime=" + resetTime;
    resetTimer();
    var newRace = document.getElementById('settings-race').value;
    race = newRace ? newRace : race;
    document.cookie = "race=" + race;
    document.querySelector('.display-race').innerText = race;
    alternateBreak = document.getElementById('settings-alternate').checked;
    document.cookie = "alternateBreak=" + alternateBreak;
    toggleSettings();
}

document.getElementById('settings-save').addEventListener('click', saveSettings);

// update timer + bar concurrently
function updateDisplay() {
    document.querySelector('.display-timer').innerText = timer;
    document.querySelector('.display-bar').style.background = "linear-gradient(90deg, rgba(0,0,0,1) -200%, rgba(255,0,0,1) " + (Math.ceil(100 - (timer / resetTime) * 300)) + "%, rgba(0,241,32,1) 100%)";
}

function runTimer() {
    if (timer < 0) {
        toggleTimer();
        return;
    }
    updateDisplay();
    timer--;

    if (timer < 0) {
        beep(1000, 1212);
        toggleTimer();
        return;
    }

    if (timer < 5) {
        beep(100, 606);
    }
}

function showPrompt(type, label, value, callback) {
    document.getElementById('prompt').classList.remove('invisible');
    document.getElementById('prompt').classList.remove('active');
    document.querySelectorAll('.prompt-input').forEach(element => element.classList.add('invisible'));
    document.querySelectorAll('.prompt-input.prompt-' + type).forEach(function(element) {
        element.classList.remove('invisible');
        element.classList.add('active');
    });
    document.querySelector('.prompt-input.prompt-' + type + ' label').innerText = label;
    document.querySelector('.prompt-input.prompt-' + type + ' input').value = value;
    document.querySelector('#prompt-save').dataset.callback = callback;
}

document.getElementById('prompt-cancel').addEventListener('click', () => document.getElementById('prompt').classList.add('invisible'));

function savePrompt() {
    window[this.dataset.callback](document.querySelector('.prompt-input.active input').value);
    document.getElementById('prompt').classList.add('invisible');
}
document.getElementById('prompt-save').addEventListener('click', savePrompt);

// Helpers
function onLongPress(element, callback) {
    let timer;

    element.addEventListener('touchstart', () => {
        timer = setTimeout(() => {
            timer = null;
            callback();
        }, 500);
    });

    function cancel() {
        clearTimeout(timer);
    }

    element.addEventListener('touchend', cancel);
    element.addEventListener('touchmove', cancel);
}

//duration of the tone in milliseconds. Default is 500
//frequency of the tone in hertz. default is 440
//volume of the tone. Default is 1, off is 0.
//type of tone. Possible values are sine, square, sawtooth, triangle, and custom. Default is sine.
//callback to use on end of tone
function beep(duration, frequency, volume, type, callback) {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext || window.audioContext);
    }
    var oscillator = audioCtx.createOscillator();
    var gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    if (volume) {
        gainNode.gain.value = volume;
    }
    if (frequency) {
        oscillator.frequency.value = frequency;
    }
    if (type) {
        oscillator.type = type;
    }
    if (callback) {
        oscillator.onended = callback;
    }

    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + ((duration || 500) / 1000));
};

