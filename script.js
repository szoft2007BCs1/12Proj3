const gameContainer = document.querySelector('.game');
const scoreBoard = document.querySelector('.score');
const bankBoard = document.querySelector('.bank'); 
const startButton = document.getElementById('startButton');
let holes = []; 
let lastHole;
let timeUp = false;
let bank = 3;
let score = 0;
let moleTimer;
let hozzad = 0; // A gyorsító változó

// A videó elemek kiválasztása
const videoOverlay = document.getElementById('videoOverlay');
const adVideo = document.getElementById('adVideo');
const closeAdBtn = document.getElementById('closeAdBtn'); 

// SOUND EFFECT-EK
const hitSound = new Audio('bg_musics/hit_sound_effect.mp3'); 

//Hangok hangereje
let volumeValue = localStorage.getItem('volume');
let musicvolumeValue = localStorage.getItem('musicvolume');

if(volumeValue == null) volumeValue = 1;
if(musicvolumeValue == null) musicvolumeValue = 0.5;

// IDE ÍRD A VIDEÓK NEVEIT/ÚTVONALAIT!
const adVideos = [
    'vid/fluimucil.mp4',
    'vid/cba.mp4',
    'vid/agi.mp4',
    'vid/alza.mp4'
];

// --- 1. PÁLYA BEÁLLÍTÁSOK ---
const levels = {
    '1': {
        background: '#8FBC8F', 
        skins: ['img/default.png'],
        cursor: 'img/cursor.png',
        music: 'bg_musics/aranka.mp3'
    },
    '2': {
        background: 'url("img/halas.gif")', 
        skins: ['img/viktorba.png', 'img/karina.png'],
        cursor: 'img/cursor.png',
        music: 'bg_musics/aranka.mp3'
    },
    '3': {
        background: 'url("img/erdo.gif")', 
        skins: ['img/adel.png'],
        cursor: 'img/cursor.png',
        music: 'bg_musics/aranka.mp3'
    }
};

// --- PÁLYA KIVÁLASZTÁSA AZ URL ALAPJÁN ---
const urlParams = new URLSearchParams(window.location.search);
const currentLevel = urlParams.get('level') || '1'; 
const currentConfig = levels[currentLevel];

// Háttér beállítása
document.body.style.background = currentConfig.background;
document.body.style.backgroundSize = "cover"; 
document.body.style.backgroundPosition = "center";
document.body.style.backgroundAttachment = "fixed";

// --- ÚJ: KURZOR BEÁLLÍTÁSA ---
if (currentConfig.cursor) {
    // A '16 16' a kép közepe (találati pont), a ', auto' pedig KÖTELEZŐ!
    document.body.style.cursor = `url('${currentConfig.cursor}') 16 16, auto`;
}

const bgMusic = document.getElementById('bgMusic');
if (currentConfig.music && bgMusic) {
    bgMusic.src = currentConfig.music;
    bgMusic.volume = musicvolumeValue; // Opcionális: 0.5 = 50% hangerő (0.0 és 1.0 között)
    
    // Biztosítjuk, hogy elinduljon
    bgMusic.play().catch(error => {
        console.log("A böngésző blokkolta az automatikus zenelejátszást:", error);
    });
}

const skins = currentConfig.skins;

function createHole() {
    const holeDiv = document.createElement('div');
    holeDiv.classList.add('hole');

    const moleDiv = document.createElement('div');
    moleDiv.classList.add('mole');
    
    holeDiv.appendChild(moleDiv);
    gameContainer.appendChild(holeDiv);
    
    holes.push(holeDiv);
}

function randomTime(min, max) {
    return Math.round(Math.random() * (max - min) + min);
}

function randomHole(holes) {
    const idx = Math.floor(Math.random() * holes.length);
    const hole = holes[idx];
    if (hole === lastHole) {
        return randomHole(holes);
    }
    lastHole = hole;
    return hole;
}

function randomSkin() {
    if (skins.length === 0) return '';
    const idx = Math.floor(Math.random() * skins.length);
    return skins[idx];
}

// --- JÁTÉK VÉGE LOGIKA ---
function gameOver() {
    timeUp = true;
    startButton.hidden = false;
    scoreBoard.textContent = "VÉGE! Pont: " + score;

    // --- ÚJ: Pontszám elmentése a memóriába ---
    localStorage.setItem('lastScore', score);    

    // --- ÚJ: HÁTTÉRZENE LEÁLLÍTÁSA ---
    if (bgMusic) {
        bgMusic.pause();
    }

    // Videó reklám indulása
    if (typeof adVideos !== 'undefined' && adVideos.length > 0) {
        const randomVid = adVideos[Math.floor(Math.random() * adVideos.length)];
        adVideo.src = randomVid;
        
        closeAdBtn.classList.add('hidden');
        videoOverlay.classList.remove('hidden');
        adVideo.play();

        // Gomb megjelenítése 6.5 mp után
        setTimeout(() => {
            closeAdBtn.classList.remove('hidden');
        }, 6500);

        // Automatikus visszadobás
        adVideo.onended = function() {
            window.location.href = 'menu.html';
        };
    } else {
        alert('Játék vége! Végső pontszám: ' + score);
    }
}

// --- VAKOND FELBUKKANÁSA ---
function peep() {
    // --- ÚJ: GYORSÍTÁS KISZÁMÍTÁSA ---
    hozzad = score * 0.005; // Minden pont 1%-ot ad a sebességhez
    const baseTime = randomTime(600, 1000); 
    // Az alapidőt elosztjuk (1 + hozzad)-al. 100 pontnál (1+1) = 2-vel osztjuk, így fele annyi idő lesz!
    const time = Math.round(baseTime / (1 + hozzad)); 
    
    const hole = randomHole(holes);
    
    const mole = hole.querySelector('.mole');
    const skin = randomSkin();
    if (skin) {
        mole.style.backgroundImage = `url('${skin}')`;
    }

    hole.classList.add('up');
    
    // Megjelöljük, hogy a vakond még "érintetlen"
    hole.dataset.hit = "false"; 

    moleTimer = setTimeout(() => {
        // HA lejárt az idő, a vakond kint van, és NEM ütöttek rá: Kihagyás!
        if (hole.classList.contains('up') && hole.dataset.hit === "false") {
            bank = bank - 2; 
            bankBoard.textContent = bank;
            
            // Ha elérte a 0-t, JÁTÉK VÉGE
            if (bank <= 0) {
                hole.classList.remove('up');
                gameOver(); 
                return; 
            }
        }
        
        hole.classList.remove('up');
        if (!timeUp) peep();
    }, time); // Itt már az új, felgyorsított időt (time) használjuk!
}

// --- JÁTÉK INDÍTÁSA ---
function startGame() {
    // Alapértékek visszaállítása
    score = 0;
    bank = 3; 
    hozzad = 0; // ÚJ: Kezdéskor visszaállítjuk a gyorsítót is!
    
    scoreBoard.textContent = score;
    bankBoard.textContent = bank; 
    timeUp = false;
    startButton.hidden = true;

    gameContainer.innerHTML = '';
    holes = [];

    // Kezdés 3 lyukkal
    for(let i = 0; i < 3; i++) {
        createHole();
    }

    peep();
}

// --- KATTINTÁS (ÜTÉS) ESEMÉNY ---
gameContainer.addEventListener('click', function(e) {
    if(!e.target.matches('.mole')) return; 
    if(!e.isTrusted) return; 

    const hole = e.target.parentNode;

    // Csak akkor ér, ha a vakond éppen kint van
    if (hole.classList.contains('up')) {
        hole.dataset.hit = "true"; // Megjelöljük, hogy leütötték
        hole.classList.remove('up');

        // --- ÚJ: Ütés hang lejátszása ---
        hitSound.volume = volumeValue;
        hitSound.currentTime = 0; // Visszatekerjük az elejére (ha gyorsan kattintasz)
        hitSound.play().catch(e => console.log("Hang hiba:", e));
        
        score++;
        bank++; 
        
        scoreBoard.textContent = score;
        bankBoard.textContent = bank;

        // Minden 10. pont után bővül a pálya
        if (score > 0 && score % 10 === 0) {
            createHole();
            console.log("Pálya bővítve!");
        }
    }
});