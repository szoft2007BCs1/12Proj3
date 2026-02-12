const gameContainer = document.querySelector('.game');
const scoreBoard = document.querySelector('.score');
let holes = []; 
let lastHole;
let timeUp = false;
let score = 0;
let moleTimer;

// --- IDE ÍRD A KÉPEID NEVEIT ---
// Fontos: A képek legyenek a html fájl mellett.
const skins = [
    'viktorba.png',      // Az alap képed
    'karina.png', // Pl. mérges verzió
    'adel.png'  // Pl. boldog verzió
    // Ha nincsenek még képeid, tölts le párat, vagy használd ugyanazt többször tesztnek
];

function createHole() {
    const holeDiv = document.createElement('div');
    holeDiv.classList.add('hole');

    const moleDiv = document.createElement('div');
    moleDiv.classList.add('mole');
    
    holeDiv.appendChild(moleDiv);
    gameContainer.appendChild(holeDiv);
    
    // Hozzáadjuk a listánkhoz
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
    // Ha nincs kép a listában, ne omoljon össze
    if (skins.length === 0) return '';
    const idx = Math.floor(Math.random() * skins.length);
    return skins[idx];
}

function peep() {
    const time = randomTime(400, 1000); 
    const hole = randomHole(holes);
    
    // --- SKIN BEÁLLÍTÁSA ---
    const mole = hole.querySelector('.mole');
    const skin = randomSkin();
    
    // Itt állítjuk be a háttérképet dinamikusan
    if (skin) {
        mole.style.backgroundImage = `url('${skin}')`;
    }

    hole.classList.add('up');

    moleTimer = setTimeout(() => {
        hole.classList.remove('up');
        if (!timeUp) peep();
    }, time);
}

function startGame() {
    scoreBoard.textContent = 0;
    score = 0;
    timeUp = false;
    
    // Töröljük a pályát és a listát
    gameContainer.innerHTML = '';
    holes = [];

    // START: 3 lyukkal kezdünk
    for(let i = 0; i < 3; i++) {
        createHole();
    }

    peep();

    setTimeout(() => {
        timeUp = true;
        alert('Játék vége! Végső pontszám: ' + score);
    }, 20000);
}

// Eseményfigyelő a kattintásokra
gameContainer.addEventListener('click', function(e) {
    // Csak akkor ér, ha a mole-ra kattintott
    if(!e.target.matches('.mole')) return; 
    if(!e.isTrusted) return; 

    score++;
    
    // Levesszük az up osztályt (eltűnik)
    e.target.parentNode.classList.remove('up');
    scoreBoard.textContent = score;

    // --- BŐVÍTÉS ---
    // Minden 10. pont után +1 lyuk
    if (score > 0 && score % 10 === 0) {
        createHole();
        // Opcionális: Hanghatás vagy effekt itt
        console.log("Pálya bővítve!");
    }
});
