let startTime = 30;
let timer = 30;
let race = 9;
let breakPlayer = 1;
let alternateBreak = false;
let cookies;
var audioCtx;
let interval;

// Helpers
const parseCookie = str =>
    str
        .split(';')
        .map(v => v.split('='))
        .reduce((acc, v) => {
            acc[decodeURIComponent(v[0].trim())] = decodeURIComponent(v[1].trim());
            return acc;
        }, {});

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

// init
document.body.oncontextmenu = function () {
    return false;
}; // i know this is useless. it was just distracting me ;)

if (document.cookie.length > 0) {
    cookies = parseCookie(document.cookie);
    startTime = cookies['time'];
    updateTimer(cookies['time']);
    updateRace(cookies['race']);
} else {
    updateTimer(startTime);
    updateRace(race);
}

// Player
function setPlayername() {
    var name = prompt('Enter name:', this.innerText)
    this.innerText = name ? name : this.innerText;
    document.body.requestFullscreen();
}

document.querySelectorAll('.player-name td').forEach(element => element.addEventListener('click', setPlayername));
document.querySelectorAll('.player-name td').forEach(function (element) {
    onLongPress(element, () => document.querySelectorAll('.player-name').forEach(element => element.classList.toggle('active')));
});

function playerScoreIncrease() {
    if (interval) {
        toggleTimer();
    }
    timer = startTime*2;
    setTimer(timer);
    this.innerText = Number.parseInt(this.innerText) + 1;
    var wonPlayer = this.id == 'player-score-1' ? 1 : 2;
    if (alternateBreak || wonPlayer != breakPlayer) {
        toggleDisplayBreakActive();
        document.querySelectorAll('.player-name').forEach(element => element.classList.toggle('active'));
        breakPlayer = wonPlayer
    }
}

document.querySelectorAll('td.player-score').forEach(element => element.addEventListener('click', playerScoreIncrease));

function setPlayerScore(element) {
    var score = prompt('Enter current score:', element.innerText)
    element.innerText = score ? score : element.innerText;
    document.body.requestFullscreen();
}

document.querySelectorAll('td.player-score').forEach(function (element) {
    onLongPress(element, () => setPlayerScore(element));
    breakPlayer = breakPlayer == 1 ? 2 : 1;
});

function playerExtension() {
    timer = Number.parseInt(timer) + Number.parseInt(startTime);
    setTimer(timer);
    this.classList.add('inactive');
}

document.querySelectorAll('.player-extension').forEach(element => element.addEventListener('click', playerExtension));
document.querySelectorAll('.player-extension').forEach(function (element) {
    onLongPress(element, () => element.classList.toggle('inactive'));
});

function toggleDisplayBreakActive() {
    document.querySelectorAll('.display-break').forEach(element => element.classList.toggle('active'));
}

document.querySelectorAll('.display-break').forEach(function (element) {
    onLongPress(element, () => toggleDisplayBreakActive());
});

function setTimerDisplay(element) {
    console.log(element);
    if (interval) {
        toggleTimer();
    }
    var newTimer = prompt('Enter current time:', element.innerText)
    element.innerText = newTimer ? newTimer : element.innerText;
    timer = newTimer ? newTimer : timer;
}
var element = document.getElementById('display-time');
onLongPress(element, () => setTimerDisplay(element));

// settings
function reset() {
    document.querySelectorAll('td.player-score').forEach(function (element) {
        onLongPress(element, () => setPlayerScore(element));
        breakPlayer = breakPlayer == 1 ? 2 : 1;
    });
    if (interval) {
        toggleTimer();
    }
    resetTimer();
    document.querySelectorAll('.player-score td').forEach(element => element.innerText = 0);
    document.querySelectorAll('.player-extension').forEach(element => element.classList.remove('inactive'));
    document.body.requestFullscreen();
    screen.orientation.lock('landscape');
    toggleSettings();
}

document.getElementById('settings-reset').addEventListener('click', reset);

function setFullscreen() {
    document.body.requestFullscreen();
    screen.orientation.lock('landscape');
}

document.getElementById('settings-fullscreen').addEventListener('click', setFullscreen);

function toggleSettings() {
    document.getElementById('main').classList.toggle('invisible');
    document.getElementById('settings').classList.toggle('invisible');
    document.getElementById('settings-time').value = startTime;
}

document.getElementById('controls-settings').addEventListener('click', toggleSettings);
document.getElementById('settings-cancel').addEventListener('click', toggleSettings);

function saveSettings() {
    var inputtime = document.getElementById('settings-time').value;
    if (isNaN(inputtime) || inputtime <= 0) {
        alert("Must input numbers");
        return false;
    }
    startTime = Math.floor(inputtime)
    document.cookie = "time=" + startTime;
    updateTimer(startTime);
    updateRace(document.getElementById('settings-race').value);
    alternateBreak = document.getElementById('settings-alternate').checked;
    toggleSettings();
}

document.getElementById('settings-save').addEventListener('click', saveSettings);

function updateTimer(newTime) {
    timer = startTime;
    document.getElementById('display-time').innerText = newTime;
}

function updateRace(newRace) {
    race = newRace;
    document.getElementById('display-race').innerText = newRace;
    document.getElementById('settings-race').value = newRace;
    document.cookie = "race=" + newRace;
}

function toggleWelcome() {
    document.getElementById('main').classList.toggle('invisible');
    document.getElementById('welcome').classList.toggle('invisible');
    document.body.requestFullscreen();
    screen.orientation.lock('landscape');
}

document.getElementById('welcome-confirm').addEventListener('click', toggleWelcome);

function runTimer() {
    if (timer < 0) {
        toggleTimer();
        return;
    }
    setTimer(timer);
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

function setTimer(targetTime) {
    document.getElementById('display-time').innerText = targetTime;
    var timerPercentage = Math.ceil(100 - (targetTime / startTime) * 300);
    document.getElementById('display-bar').style.background = "linear-gradient(90deg, rgba(0,0,0,1) -200%, rgba(255,0,0,1) " + timerPercentage + "%, rgba(0,241,32,1) 100%)";
}

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

function resetTimer() {
    timer = startTime;
    setTimer(timer);
}

document.getElementById('display-time').addEventListener('click', resetTimer);

function switchPlayer() {
    resetTimer();
    document.querySelectorAll('.player-name').forEach(element => element.classList.toggle('active'));
    if (!interval) {
        toggleTimer();
    }
}

document.getElementById('controls-switch').addEventListener('click', switchPlayer);

/*
var element = document.getElementById('controls-switch');
onLongPress(element, () => {
    console.log('Long pressed', element);
});

function Sleep(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

async function beep2(frequency = 440, type = 'sawtooth', volume, callback) {
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
    while (true) {

        oscillator.frequency.setValueAtTime(Math.floor(Math.random() * 1000), audioCtx.currentTime);
        await Sleep(Math.floor(Math.random() * 100));
    }
};
element = document.getElementById('controls-settings');
onLongPress(element, beep2);
*/
