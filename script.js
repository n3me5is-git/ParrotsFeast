const gameKey = 'knoaofnoewfpowafnp';
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let background; // Variabile globale per l'immagine di sfondo
const canvas_nom_width = 700;
const canvas_nom_height = 400;
const canvas_resolution_multiplier = 5;     // Increase the definition
const parrot_move_xMin = 25;
const parrot_move_xMax = canvas_nom_width-25;
const parrot_move_yMin = 27;
const parrot_move_yMax = canvas_nom_height-50;

canvas.height = canvas_nom_height * canvas_resolution_multiplier;
canvas.width = canvas_nom_width * canvas_resolution_multiplier;


// Impostazioni di gioco inglobate direttamente nel codice
const default_settings = {
    seed: {
        maxCount: 5,
        minDuration: 3,
        maxDuration: 30,
        xSeedMin: 50,
        xSeedMax: canvas_nom_width-50,
        ySeedMin: 50,
        ySeedMax: canvas_nom_height-150,
        N: 2000, // Numero di coppie (x, y) da generare
        difficulty: 5, // Valore di difficulty da 1 a 10
        minSeedDistance: 50, // Distanza minima tra semi in pixel
        points: {
            seed1: 16,
            seed2: 14,
            seed3: 10
        }
    },
    points: {
        seedBaseValue: 10
    },
    level: {
        duration: 240
    },
    boost: {
        speed: 20, // Velocità del boost
        cooldown: 30 // Tempo di cooldown del boost
    },
    game: {
        speed: 4,   // Velocità default pappagallo
        state: 'default', // Stato iniziale: "default", "power_up", "power_down"
        musicVolume: 0.5
    },
    fruit: {
        spawnIntervalMin: 20, // Minimo intervallo di tempo per la comparsa della frutta
        spawnIntervalMax: 40, // Massimo intervallo di tempo per la comparsa della frutta
        durationMin: 10, // Minima durata della frutta
        durationMax: 20, // Massima durata della frutta
        points: {
            fruit1: 50,
            fruit2: 50,
            fruit3: 50
        }
    },
    biscuit: {
        spawnIntervalMin: 20,
        spawnIntervalMax: 40,
        durationMin: 10,
        durationMax: 20,
        points: {
            biscuit1: 200,
            biscuit2: 200,
            biscuit3: 200
        }
    },
    powerUp: {
        duration1: 15,  // Durata in secondi per il tipo di frutta 1
        duration2: 20,  // Durata in secondi per il tipo di frutta 2
        duration3: 25,  // Durata in secondi per il tipo di frutta 3
        speedMultiplier: 1.5, // Moltiplicatore di velocità durante il Power Up
    },
    powerDown: {
        duration1: 25,  // Durata in secondi per il tipo di biscotto 1
        duration2: 30,  // Durata in secondi per il tipo di biscotto 2
        duration3: 35,  // Durata in secondi per il tipo di biscotto 3
        speedMultiplier: 0.6, // Moltiplicatore di velocità durante il Power Down
    }
};


let settings = { };


const levels = {
    1: {
        background: 'background-level1.png',
        music: 'background-music1.mp3',
        settings: {
            seed: {
                maxCount: 5,
                minDuration: 3,
                maxDuration: 20,
                difficulty: 5
            },
            boost: {
                speed: 20,
                cooldown: 30
            }
        }
    },
    2: {
        background: 'background-level2.png',
        music: 'background-music2.mp3',
        settings: {
            seed: {
                maxCount: 5,
                minDuration: 3,
                maxDuration: 20,
                difficulty: 5
            },
            boost: {
                speed: 20,
                cooldown: 30
            }
        }
    },
    // Aggiungi altri livelli qui
};


let currentLevelState = {
    levelNumber: 1,
    levelPoints: 0,
    seedsCollected: 0,
    seedsCollectedType1: 0,
    seedsCollectedType2: 0,
    seedsCollectedType3: 0,
    fruitsCollected: 0,
    fruitsCollectedType1: 0,
    fruitsCollectedType2: 0,
    fruitsCollectedType3: 0,
    biscuitsCollected: 0,
    biscuitsCollectedType1: 0,
    biscuitsCollectedType2: 0,
    biscuitsCollectedType3: 0,
    boostsUsed: 0,
    actionStarted: false, // Flag per tracciare se l'azione è iniziata
    // Aggiungeremo altri contatori in futuro
};


const views = {
    startView: {
        name: 'startView',
        background: 'start_background.png',
        loadSound: '',
        buttons: {
            changeName: { x: 277, y: 219, width: 376, height: 38, visible: true, virtual: true },
            back: { x: 310, y: 292, width: 24, height: 24, visible: true, virtual: true },
            forward: { x: 440, y: 292, width: 24, height: 24, visible: true, virtual: true },
            startGame: { x: 498, y: 280, width: 110, height: 50, visible: true, virtual: true },
            // scores: { x: 510, y: 168, width: 110, height: 30, visible: true, virtual: true },
            fullscreen: { x: canvas_nom_width - 40, y: 10, width: 30, height: 30, visible: true, icon: 'expand.svg', virtual: false },
            fullscreen_exit: { x: canvas_nom_width - 40, y: 10, width: 30, height: 30, visible: false, icon: 'compress.svg', virtual: false }
        }
    },
    endLevelView: {
        name: 'endLevelView',
        background: 'end_level_background.png',
        loadSound: '',
        buttons: { 
            replayLevel: { x: 313, y: 130, width: 40, height: 40, visible: true, virtual: true },
            nextLevel: { x: 401, y: 114, width: 54, height: 66, visible: true, virtual: true },
            backToMenu: { x: 639, y: 330, width: 41, height: 34, visible: true, virtual: true },
            fullscreen: { x: canvas_nom_width - 40, y: 10, width: 30, height: 30, visible: true, icon: 'expand.svg', virtual: false },
            fullscreen_exit: { x: canvas_nom_width - 40, y: 10, width: 30, height: 30, visible: false, icon: 'compress.svg', virtual: false }
        }
    },
    endLastLevelView: {
        name: 'endLastLevelView',
        background: 'end_last_level_background.png',
        loadSound: '',
        buttons: { 
            replayLevel: { x: 313, y: 130, width: 40, height: 40, visible: true, virtual: true },
            endGame: { x: 394, y: 110, width: 81, height: 81, visible: true, virtual: true }, 
            fullscreen: { x: canvas_nom_width - 40, y: 10, width: 30, height: 30, visible: true, icon: 'expand.svg', virtual: false },
            fullscreen_exit: { x: canvas_nom_width - 40, y: 10, width: 30, height: 30, visible: false, icon: 'compress.svg', virtual: false }
        }
    },
    endGameView: {
        name: 'endGameView',
        background: 'end_game_background.png',  // Imposta l'immagine di sfondo per i crediti
        loadSound: 'background-music-endgame.mp3',
        buttons: { 
            backToMenu: { x: 630, y: 280, width: 45, height: 40, visible: true, virtual: true }, // Pulsante virtuale
            fullscreen: { x: canvas_nom_width - 40, y: 10, width: 30, height: 30, visible: true, icon: 'expand.svg', virtual: false },
            fullscreen_exit: { x: canvas_nom_width - 40, y: 10, width: 30, height: 30, visible: false, icon: 'compress.svg', virtual: false }
        }
    },
    // Aggiungi qui altre viste come endView, levelSummaryView, ecc.
};

// Variabile vista attuale
let currentView;

// Variabili di gioco, statistiche e altro
let game = {
    playerName: '',
    selectedLevel: 1
};


// Funzione per entrare in modalità fullscreen
function enterFullscreen() {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) { // Firefox
        elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) { // Chrome, Safari, Opera
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { // IE/Edge
        elem.msRequestFullscreen();
    }
}

function exitFullscreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.webkitExitFullscreen) { 
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { 
        document.msExitFullscreen();
    }
    document.body.classList.remove('fullscreen-active');
}



function initGame() {

    let parrotX = canvas_nom_width/2-25;
    let parrotY = canvas_nom_height/2-50;
    let speed = 5;
    let moveDirection = null;
    let isFlipped = false;
    let boostEnabled = true;
    let boostState = 'enabled'; // Valori possibili: 'enabled', 'cooldown', 'disabled'
    let boostCooldown = 0; // Variabile globale per tenere traccia del countdown
    let powerUpActive = false;
    let powerUpEndTime = 0;
    let backgroundMusic;
    let powerDownActive = false;
    let powerDownEndTime = 0;

    
    let score = 0;
    let currentSeeds = []; // Array per tenere traccia dei semi attivi

    const parrotImage = new Image();
    parrotImage.src = 'parrot.png';
    let animationId;

    const seedImages = [
        new Image(),
        new Image(),
        new Image()
    ];
    
    seedImages[0].src = 'seed1.png';
    seedImages[1].src = 'seed2.png';
    seedImages[2].src = 'seed3.png';

    let currentFruits = []; // Coda per tenere traccia dei frutti attivi (visualizzati)
    let currentFruitsProgrammed = []; // Coda per tenere traccia dei frutti programmati
    
    let currentBiscuits = []; // Coda per tenere traccia delle leccornie attive (visualizzate)
    let currentBiscuitsProgrammed = []; // Coda per tenere traccia delle leccornie programmate
    
    
    const fruitImages = [
        new Image(),
        new Image(),
        new Image()
    ];
    
    fruitImages[0].src = 'fruit1.png';
    fruitImages[1].src = 'fruit2.png';
    fruitImages[2].src = 'fruit3.png';
    
    const biscuitImages = [
        new Image(),
        new Image(),
        new Image()
    ];
    
    biscuitImages[0].src = 'biscuit1.png';
    biscuitImages[1].src = 'biscuit2.png';
    biscuitImages[2].src = 'biscuit3.png';
    

    const rocketIcon = new Image();
    rocketIcon.src = 'rocket.svg';

    const buttonSize = 40;
    const iconPadding = 8;
    const buttons_y = canvas_nom_height-80;
    const game_buttons = {
        left: { x: 20, y: buttons_y, iconSrc: 'arrow-left.svg', width: 60, height: 60, visible: true },
        right: { x: 110, y: buttons_y, iconSrc: 'arrow-right.svg', width: 60, height: 60, visible: true },
        up: { x: canvas_nom_width-80, y: buttons_y-80, iconSrc: 'arrow-up.svg', width: 60, height: 60, visible: true },
        down: { x: canvas_nom_width-80, y: buttons_y, iconSrc: 'arrow-down.svg', width: 60, height: 60, visible: true },
        boost: { x: canvas_nom_width-180, y: buttons_y, iconSrc: 'rocket.svg', width: 60, height: 60, visible: true },
        boost_disabled: { x: canvas_nom_width-180, y: buttons_y, iconSrc: 'rocket-disabled.svg', width: 60, height: 60, visible: false },
        fullscreen: { x: canvas_nom_width - 50, y: 35, iconSrc: 'expand.svg', visible: true }, // Aggiunto pulsante fullscreen
        fullscreen_exit: { x: canvas_nom_width - 50, y: 35, iconSrc: 'compress.svg', visible: false } // Pulsante per uscire dal fullscreen
    };    

    // Carica le icone SVG
    for (const key in game_buttons) {
        const button = game_buttons[key];
        button.image = new Image();
        button.image.src = button.iconSrc;
    }


    const powerUpIcon = new Image();
    powerUpIcon.src = 'bolt.svg';
    
    const powerDownIcon = new Image();
    powerDownIcon.src = 'weight-hanging.svg';


    // Funzione per iniziare la generazione dei semi
    function startSeedGeneration() {
        seedGenerationInterval = setInterval(spawnSeed, 100); // Genera un seme ogni 100ms
    }

    // Funzione per fermare la generazione dei semi
    function stopSeedGeneration() {
        clearInterval(seedGenerationInterval);
    }



    function resizeCanvas() {
        if (currentView && currentView != 'game') {
            drawView(currentView);
        } else if (currentView == 'game') {
            drawCanvas();
        }
    }


    function drawCanvas() {
        if (currentView && currentView != 'game') {
            return;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.scale(canvas.width/canvas_nom_width, canvas.height/canvas_nom_height); // Applica la scala a tutto il contenuto
        renderGameInterface();
        renderParrot();
        renderElementsToEat();
        ctx.restore(); // Ripristina la scala originale
    }


    function renderGameInterface() {
        // Disegna lo sfondo (se lo sfondo è un'immagine)
        if (background) {
            ctx.drawImage(background, 0, 0, canvas_nom_width, canvas_nom_height);
        }
        // Disegna la top bar
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas_nom_width, 30);
        // Renderizza il numero del livello
        renderLevel();
        // Renderizza lo score
        renderScore();
        // Renderizza il countdown di gioco
        renderLevelCountdown();
        // Gestisci la visualizzazione dello stato del boost
        renderBoostStatus();  // Chiama sempre questa funzione, che gestirà la condizione correttamente
        // Visualizzazioni power up e power down
        renderPowerUpStatus();  // Chiama la funzione per visualizzare il Power Up
        renderPowerDownStatus();  // Chiama la funzione per visualizzare il Power Down
        // Disegna i pulsanti visibili
        for (const key in game_buttons) {
            const button = game_buttons[key];
            if (button.visible) {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                ctx.fillRect(button.x, button.y, button.width || buttonSize, button.height || buttonSize);

                const iconWidth = (button.width || buttonSize) - iconPadding * 2;
                const iconHeight = (button.height || buttonSize) - iconPadding * 2;

                ctx.drawImage(button.image, button.x + iconPadding, button.y + iconPadding, iconWidth, iconHeight);
            }
        }
    }


    function renderLevel() {
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `bold 16px Arial, sans-serif`;
        ctx.textAlign = 'left';
        const levelText = `LV. ${currentLevelState.levelNumber}${currentLevelState.levelNumber < 10 ? ' ' : ''}`;
        ctx.fillText(levelText, 10, 20);
    }


    function renderScore() {
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `bold 16px Arial, sans-serif`; // Il font viene scalato automaticamente con il contesto
        ctx.textAlign = 'left';
        ctx.fillText(`Tot. Score: ${score}`, 60, 20); // Le coordinate sono relative al contesto scalato
    }

    function renderLevelCountdown() {
        const minutes = Math.floor(currentLevelState.levelTimeRemaining / 60);
        const seconds = currentLevelState.levelTimeRemaining % 60;
        const formattedTime = ` Time Left: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 16px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(formattedTime, canvas_nom_width / 2, 20); // Al centro della top bar
    }

    function renderBoostStatus() {
        ctx.textAlign = 'right';
        ctx.fillStyle = '#FFFFFF'; // Assicura che il testo sia bianco
        ctx.font = `bold 16px Arial, sans-serif`; // Assicura che il testo sia della dimensione corretta
    
        const iconYPosition = 5; // Y-position per l'icona
        const textYPosition = 20; // Y-position per il testo
    
        if (boostState === 'cooldown') {
            // Aggiungi zero iniziale per rendere il countdown a due cifre
            const formattedCooldown = boostCooldown < 10 ? `0${boostCooldown}` : boostCooldown;
    
            ctx.drawImage(rocketIcon, canvas_nom_width - 60, iconYPosition, 20, 20);
            ctx.fillText(`${formattedCooldown}s`, canvas_nom_width - 10, textYPosition);
        } else if (boostState === 'disabled') {
            // Mostra solo l'icona se il boost è disabilitato manualmente
            ctx.drawImage(rocketIcon, canvas_nom_width - 60, iconYPosition, 20, 20);
        }
        // Non disegnare nulla se boostState è 'enabled'
    }

    function renderPowerUpStatus() {
        ctx.textAlign = 'right';
        ctx.fillStyle = '#FFFFFF'; // Testo bianco
        ctx.font = `bold 16px Arial, sans-serif`; // Dimensione del testo
    
        const iconYPosition = 5; // Posizione Y per l'icona
        const textYPosition = 20; // Posizione Y per il testo
    
        if (powerUpActive) {
            const remainingTime = Math.ceil((powerUpEndTime - Date.now()) / 1000);
            const formattedTime = remainingTime < 10 ? `0${remainingTime}` : remainingTime;
    
            ctx.drawImage(powerUpIcon, canvas_nom_width - 120, iconYPosition, 20, 20);
            ctx.fillText(`${formattedTime}s`, canvas_nom_width - 70, textYPosition);
        }
    }


    function renderPowerDownStatus() {
        ctx.textAlign = 'right';
        ctx.fillStyle = '#FFFFFF'; // Testo bianco
        ctx.font = `bold 16px Arial, sans-serif`; // Dimensione del testo
    
        const iconYPosition = 5; // Posizione Y per l'icona
        const textYPosition = 20; // Posizione Y per il testo
    
        if (powerDownActive) {
            const remainingTime = Math.ceil((powerDownEndTime - Date.now()) / 1000);
            const formattedTime = remainingTime < 10 ? `0${remainingTime}` : remainingTime;
    
            ctx.drawImage(powerDownIcon, canvas_nom_width - 120, iconYPosition, 20, 20);
            ctx.fillText(`${formattedTime}s`, canvas_nom_width - 70, textYPosition);
        }
    }


    function renderParrot() {
        // Disegna il pappagallo
        ctx.save(); // Salva lo stato del contesto prima del flip
        if (isFlipped) {
            ctx.scale(-1, 1);
            ctx.drawImage(parrotImage, -parrotX - 50, parrotY, 50, 50);
        } else {
            ctx.drawImage(parrotImage, parrotX, parrotY, 50, 50);
        }
        ctx.restore(); // Ripristina lo stato precedente per evitare di flip altre parti del canvas
    }


    function renderElementsToEat() {
        currentSeeds.forEach(seed => {
            ctx.drawImage(seed.image, seed.x, seed.y, 30, 30); // Disegna l'immagine del seme, scalata a 20x20px
        });

        // Disegna i frutti
        currentFruits.forEach(fruit => {
            ctx.drawImage(fruit.image, fruit.x, fruit.y, 30, 30);
        });

        // Disegna i biscotti
        currentBiscuits.forEach(biscuit => {
            ctx.drawImage(biscuit.image, biscuit.x, biscuit.y, 30, 30);
        });
    }
    

    function playSound(event) {
        const soundMap = {
            'seed_eat': 'eat_seed.wav',
            'fruit_eat': 'eat_fruit.mp3',  // Suono per quando un frutto viene mangiato
            'biscuit_eat': 'eat_biscuit.wav',  // Suono per quando un biscotto viene mangiato
            'clock_tick': 'clock_tick.wav',  // Suono per segnalare il tempo in esaurimento
            'end_level_gong': 'gong.wav',  // Suono per segnalare lo scadere del tempo a fine livello (gong)
            // Puoi aggiungere ulteriori suoni qui se necessario
        };
        const audioFile = soundMap[event];
        // console.log(`Playing sound for event: ${event}, file: ${audioFile}`);  // Aggiunto log per debug
        if (audioFile) {
            const audio = new Audio(audioFile);
            audio.play().catch(error => console.log(`Errore nel riprodurre il suono: ${error}`));
        } else {
            console.log(`Nessun suono associato per l'evento: ${event}. Uso quello di default`);
            const audio = new Audio(soundMap['seed_eat']);
            audio.play().catch(error => console.log(`Errore nel riprodurre il suono: ${error}`));
        }
    }

    
    function checkSeedCollision() {
        // console.log(`Parrot origin: (${parrotX}, ${parrotY})`);
        currentSeeds.forEach((seed, index) => {
            // Modifica per considerare il becco a seconda della direzione del pappagallo
            let parrotCenterX;
            const parrotCenterY = parrotY + 25; // Centro del pappagallo sull'asse Y
    
            if (isFlipped) {
                parrotCenterX = parrotX + 25; 
            } else {
                parrotCenterX = parrotX + 25; 
            }
    
            const seedCenterX = seed.x + 15; // Centro del seme sull'asse X (considerando che il seme ha raggio 10px)
            const seedCenterY = seed.y + 15; // Centro del seme sull'asse Y (considerando che il seme ha raggio 10px)
    
            const distanceX = parrotCenterX - seedCenterX;
            const distanceY = parrotCenterY - seedCenterY;
    
            const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
    
            // Log delle posizioni per debug
            // console.log(`Parrot Center[${index}]: (${parrotCenterX}, ${parrotCenterY})`);
            // console.log(`Seed Center [${index}]: (${seedCenterX}, ${seedCenterY})`);
            // console.log(`Distance [${index}]: ${distance}`);
    
            if (distance < 20) { // Se la distanza tra i centri risulta inferiore a una soglia (somma dei raggi)
                console.log(`Collision Detected at Parrot Center (${parrotCenterX}, ${parrotCenterY}) with Seed Center (${seedCenterX}, ${seedCenterY})`);
                currentSeeds.splice(index, 1); // Rimuovi il seme
                const seedType = seed.image.src.includes('seed1') ? 'seed1' : seed.image.src.includes('seed2') ? 'seed2' : 'seed3';
                const points = calculateSeedPoints(seedType);
                score += points;
                currentLevelState.levelPoints += points;
                // Aggiorna le statistiche di raccolta
                currentLevelState.seedsCollected++;
                if (seedType === 'seed1') currentLevelState.seedsCollectedType1++;
                if (seedType === 'seed2') currentLevelState.seedsCollectedType2++;
                if (seedType === 'seed3') currentLevelState.seedsCollectedType3++;
                console.log(`Seed eaten (+${points}). New Score: ${score}`);
                playSound('seed_eat'); // Gioca il suono associato
            } else {
                // console.log('No collision detected.');
            }
        });

        currentFruits.forEach((fruit, index) => {
            const parrotCenterX = parrotX + 25;
            const parrotCenterY = parrotY + 25;
    
            const fruitCenterX = fruit.x + 15;
            const fruitCenterY = fruit.y + 15;
    
            const distance = Math.sqrt(Math.pow(parrotCenterX - fruitCenterX, 2) + Math.pow(parrotCenterY - fruitCenterY, 2));
    
            if (distance < 20) {
                console.log(`Collision Detected at Parrot Center (${parrotCenterX}, ${parrotCenterY}) with Fruit Center (${fruitCenterX}, ${fruitCenterY})`);
                currentFruits.splice(index, 1);
                const fruitType = fruit.image.src.includes('fruit1') ? 'fruit1' : fruit.image.src.includes('fruit2') ? 'fruit2' : 'fruit3';
                score += settings.fruit.points[fruitType];
                currentLevelState.levelPoints += settings.fruit.points[fruitType];
                // Aggiorna le statistiche di raccolta frutta
                currentLevelState.fruitsCollected++;
                if (fruitType === 'fruit1') currentLevelState.fruitsCollectedType1++;
                if (fruitType === 'fruit2') currentLevelState.fruitsCollectedType2++;
                if (fruitType === 'fruit3') currentLevelState.fruitsCollectedType3++;
                console.log(`Fruit eaten (+${settings.fruit.points[fruitType]}). New Score: ${score}`);
                playSound('fruit_eat');
                activatePowerUp(fruitType);
            }
        });
    
        currentBiscuits.forEach((biscuit, index) => {
            const parrotCenterX = parrotX + 25;
            const parrotCenterY = parrotY + 25;
    
            const biscuitCenterX = biscuit.x + 15;
            const biscuitCenterY = biscuit.y + 15;
    
            const distance = Math.sqrt(Math.pow(parrotCenterX - biscuitCenterX, 2) + Math.pow(parrotCenterY - biscuitCenterY, 2));
    
            if (distance < 20) {
                console.log(`Collision Detected at Parrot Center (${parrotCenterX}, ${parrotCenterY}) with Biscuit Center (${biscuitCenterX}, ${biscuitCenterY})`);
                currentBiscuits.splice(index, 1);
                const biscuitType = biscuit.image.src.includes('biscuit1') ? 'biscuit1' : biscuit.image.src.includes('biscuit2') ? 'biscuit2' : 'biscuit3';
                score += settings.biscuit.points[biscuitType];
                currentLevelState.levelPoints += settings.biscuit.points[biscuitType];
                // Aggiorna le statistiche di raccolta biscotti
                currentLevelState.biscuitsCollected++;
                if (biscuitType === 'biscuit1') currentLevelState.biscuitsCollectedType1++;
                if (biscuitType === 'biscuit2') currentLevelState.biscuitsCollectedType2++;
                if (biscuitType === 'biscuit3') currentLevelState.biscuitsCollectedType3++;
                console.log(`Biscuit eaten (+${settings.biscuit.points[biscuitType]}). New Score: ${score}`);
                playSound('biscuit_eat');
                activatePowerDown(biscuitType);
            }
        });
    }


    function activatePowerUp(fruitType) {
        console.log(`Power Up activated by eating ${fruitType}`);
        
        let powerUpDuration;
        if (fruitType === 'fruit1') {
            powerUpDuration = settings.powerUp.duration1 * 1000;
        } else if (fruitType === 'fruit2') {
            powerUpDuration = settings.powerUp.duration2 * 1000;
        } else if (fruitType === 'fruit3') {
            powerUpDuration = settings.powerUp.duration3 * 1000;
        }
        const speedMultiplier = settings.powerUp.speedMultiplier;
    
        if (powerDownActive) {
            // Se è attivo un Power Down, disattiva il Power Down e torna alle condizioni normali
            deactivatePowerDown();
        } else if (powerUpActive) {
            // Se un Power Up è già attivo, estende la durata del Power Up esistente
            powerUpEndTime += powerUpDuration;
        } else {
            // Altrimenti, avvia un nuovo Power Up
            powerUpActive = true;
            speed =  settings.game.speed * speedMultiplier;
            powerUpEndTime = Date.now() + powerUpDuration;
            startPowerUpCountdown();
        }
    }
    


    function startPowerUpCountdown() {
        const interval = setInterval(() => {
            const remainingTime = Math.ceil((powerUpEndTime - Date.now()) / 1000);
            if (remainingTime <= 0 || powerDownActive) {
                clearInterval(interval);
                deactivatePowerUp();
            }
            drawCanvas();
        }, 1000);
    }


    function deactivatePowerUp() {
        powerUpActive = false;
        speed = settings.game.speed;
        drawCanvas();
    }
    
    function activatePowerDown(biscuitType) {
        console.log(`Power Down activated by eating ${biscuitType}`);
        
        let powerDownDuration;
        if (biscuitType === 'biscuit1') {
            powerDownDuration = settings.powerDown.duration1 * 1000;
        } else if (biscuitType === 'biscuit2') {
            powerDownDuration = settings.powerDown.duration2 * 1000;
        } else if (biscuitType === 'biscuit3') {
            powerDownDuration = settings.powerDown.duration3 * 1000;
        }
        const speedMultiplier = settings.powerDown.speedMultiplier;
    
        if (powerUpActive) {
            // Se è attivo un Power Up, disattiva il Power Up e avvia il Power Down
            deactivatePowerUp();
            powerDownActive = true;
            speed =  settings.game.speed * speedMultiplier;
            powerDownEndTime = Date.now() + powerDownDuration;
            disableBoost('power_down'); // Disabilita il boost solo durante il Power Down
            startPowerDownCountdown();
        } else if (powerDownActive) {
            // Se un Power Down è già attivo, estende la durata del Power Down esistente
            powerDownEndTime += powerDownDuration;
        } else {
            // Altrimenti, avvia un nuovo Power Down
            powerDownActive = true;
            speed =  settings.game.speed * speedMultiplier;
            powerDownEndTime = Date.now() + powerDownDuration;
            disableBoost('power_down'); // Disabilita il boost solo durante il Power Down
            startPowerDownCountdown();
        }
    }


    function startPowerDownCountdown() {
        const interval = setInterval(() => {
            const remainingTime = Math.ceil((powerDownEndTime - Date.now()) / 1000);
            if (remainingTime <= 0 || powerUpActive) {
                clearInterval(interval);
                deactivatePowerDown();
            }
            drawCanvas();
        }, 1000);
    }
    
    function deactivatePowerDown() {
        powerDownActive = false;
        speed = settings.game.speed;
        enableBoost('power_down'); // Riabilita il boost
        drawCanvas();
    }


    function calculateSeedPoints(seedType) {
        let basePoints = settings.seed.points[seedType];
        if (powerUpActive) {
            return basePoints * 2;  // Raddoppia il punteggio durante il Power Up
        } else if (powerDownActive) {
            return Math.ceil(basePoints / 2);  // Dimezza il punteggio durante il Power Down
        }
        return basePoints;
    }


    function updatePosition() {
        if (currentView === 'game') {
            if (moveDirection) {
                switch (moveDirection) {
                    case 'left':
                        parrotX -= speed;
                        if (isFlipped) isFlipped = false;
                        break;
                    case 'right':
                        parrotX += speed;
                        if (!isFlipped) isFlipped = true;
                        break;
                    case 'up':
                        parrotY -= speed;
                        break;
                    case 'down':
                        parrotY += speed;
                        break;
                }

                // Confini del canvas
                if (parrotX < parrot_move_xMin) parrotX = parrot_move_xMin;
                if (parrotX + 50 > parrot_move_xMax) parrotX = parrot_move_xMax - 50;
                if (parrotY < parrot_move_yMin) parrotY = parrot_move_yMin;
                if (parrotY + 50 > parrot_move_yMax) parrotY = parrot_move_yMax - 50;

                checkSeedCollision(); // Controlla la collisione dopo ogni movimento
                drawCanvas();
            }
            animationId = requestAnimationFrame(updatePosition);
        } else {
            cancelAnimationFrame(animationId);
            moveDirection = null;
        }
        
    }

    function startMovement(direction) {
        // playActionStarted(); // Chiama la funzione quando l'utente inizia a toccare lo schermo
        moveDirection = direction;
    }

    function stopMovement() {
        moveDirection = null;
    }

    function handleCanvasClick(event) {
        if (currentView && currentView != 'game') {
            return;
        }
        const container = document.getElementById('gameCanvas');
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        let scaleFactorX = containerWidth / canvas_nom_width;
        let scaleFactorY = containerHeight / canvas_nom_height;
        // Calcolo la dimensione delle barre quando si scala
        const aspectRatio = canvas_nom_width / canvas_nom_height; 
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        let canvasWidth, canvasHeight;
        let barWidth = 0, barHeight = 0;
        let scaleFactor;
        if (windowWidth / windowHeight > aspectRatio) {
            // La finestra è più larga, calcoliamo la larghezza del canvas basata sull'altezza
            canvasHeight = windowHeight;
            canvasWidth = canvasHeight * aspectRatio;
            barWidth = (windowWidth - canvasWidth) / 2;
        } else {
            // La finestra è più alta, calcoliamo l'altezza del canvas basata sulla larghezza
            canvasWidth = windowWidth;
            canvasHeight = canvasWidth / aspectRatio;
            barHeight = (windowHeight - canvasHeight) / 2;
        }
        // Calcolo il fattore di scala da usare 
        if (barHeight > 0) {
            scaleFactor = scaleFactorX;
        } else if (barWidth > 0) {
            scaleFactor = scaleFactorY;
        }
        // Calcola le coordinate del click relative al canvas
        const x = (event.clientX - barWidth) / scaleFactor;
        const y = (event.clientY - barHeight) / scaleFactor;
        // console.log("Bar Width:", barWidth);
        // console.log("Bar Height:", barHeight);
        // console.log("Original click coordinates:", { clientX: event.clientX, clientY: event.clientY });
        // console.log("Scaled click coordinates:", { x: x, y: y });
        // console.log("Scale factors:", {scaleFactorX: scaleFactorX, scaleFactorY: scaleFactorY, scaleFactor: scaleFactor});
        for (const key in game_buttons) {
            const button = game_buttons[key];
            // console.log(`Checking button ${key} at:`, { x: button.x, y: button.y, width: button.width || buttonSize, height: button.height || buttonSize });
            if (x > button.x && x < button.x + (button.width || buttonSize) &&
                y > button.y && y < button.y + (button.height || buttonSize)) {
                console.log(`Button ${key} clicked.`);
                if (key === 'boost' && boostEnabled) {
                    console.log("Boost activated.");
                    boostToFurthestSeed(); // Esegui boost
                } else if (key === 'fullscreen' || key === 'fullscreen_exit') {
                    console.log("Fullscreen toggled.");
                    toggleFullscreen(); // Gestisci il fullscreen
                } else {
                    console.log("Movement started:", key);
                    startMovement(key); // Muovi il pappagallo
                }
                return;
            }
        }
        console.log("No button was clicked.");
    }
    


    function addGameEventListeners() {
        // Event listener per il movimento del pappagallo
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);
        // Event listener per i click e i tap sul canvas
        canvas.addEventListener('mousedown', handleCanvasClick);
        canvas.addEventListener('mouseup', handleCanvasRelease);
        canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
        canvas.addEventListener('touchend', handleCanvasRelease, { passive: true });
    }


    function removeGameEventListeners() {
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('keyup', handleKeyUp);
        canvas.removeEventListener('mousedown', handleCanvasClick);
        canvas.removeEventListener('mouseup', handleCanvasRelease);
        canvas.removeEventListener('touchstart', handleTouchStart);
        canvas.removeEventListener('touchend', handleCanvasRelease);
    }


    function handleTouchStart(event) {
        event.preventDefault(); // Previene il menu contestuale
        handleCanvasClick(event.touches[0]);
        // Aggiunta della chiamata per rilevare il dispositivo e attivare il fullscreen se necessario
        // detectMobileAndFullscreen();
    }


    function handleKeyDown(event) {
        if (currentView && currentView != 'game') {
            return;
        }
        // console.log(`Button ${event.key} clicked.`);
        switch (event.key) {
            case 'ArrowLeft':
                startMovement('left');
                break;
            case 'ArrowRight':
                startMovement('right');
                break;
            case 'ArrowUp':
                startMovement('up');
                break;
            case 'ArrowDown':
                startMovement('down');
                break;
            case ' ':
                if (boostEnabled) boostToFurthestSeed(); // Esegui boost con SPACE
                break;
            case 'F':
                toggleFullscreen();
                break;
        }
    }
    
    function handleKeyUp() {
        // console.log("Movement stopped");
        stopMovement();
    }

    function handleCanvasRelease() {
        // console.log("Movement stopped");
        stopMovement();
    }

    
    function spawnSeed() {
        if (currentView && currentView != 'game') {
            return;
        }
        if (currentSeeds.length >= settings.seed.maxCount) return;
    
        const { x, y } = getRandomPosition(canvas_nom_width, canvas_nom_height);
        const duration = calculateSeedDuration(settings.seed.minDuration, settings.seed.maxDuration, settings.seed.difficulty, { x, y });
    
        // Seleziona una delle immagini di semi in modo casuale
        const randomSeedImage = seedImages[Math.floor(Math.random() * seedImages.length)];
    
        const seed = {
            x,
            y,
            duration,
            startTime: Date.now(),
            image: randomSeedImage // Salva l'immagine selezionata nel seme
        };
    
        currentSeeds.push(seed);
        drawCanvas(); // Ridisegna il canvas ogni volta che viene aggiunto un seme
        setTimeout(() => removeSeed(seed), duration * 1000); // Rimuovi il seme dopo la durata specificata
    }
    
    
    
    function removeSeed(seed) {
        const index = currentSeeds.indexOf(seed);
        if (index > -1) {
            currentSeeds.splice(index, 1);
            drawCanvas(); // Ridisegna il canvas ogni volta che viene rimosso un seme
        }
    }



    function startFruitGeneration() {
        fruitGenerationInterval = setInterval(checkAndProgramFruit, 500); // Polling ogni 500ms
    }
    
    function stopFruitGeneration() {
        clearInterval(fruitGenerationInterval);
    }

    function checkAndProgramFruit() {
        if (currentView && currentView != 'game') {
            return;
        }
        if (currentFruits.length === 0 && currentFruitsProgrammed.length === 0) {
            const interval = getRandomInt(settings.fruit.spawnIntervalMin, settings.fruit.spawnIntervalMax) * 1000;
            const spawnTime = Date.now() + interval;
    
            currentFruitsProgrammed.push(spawnTime);
    
            setTimeout(() => spawnFruit(), interval); // Programma la comparsa del frutto
        }
    }

    function spawnFruit() {
        if (currentView && currentView != 'game') {
            return;
        }
        if (currentFruits.length >= 1) return;
    
        let x, y;
        const minDistance = settings.seed.minSeedDistance;
    
        do {
            const position = getRandomPositionForFruitsAndBiscuits(canvas_nom_width, canvas_nom_height);
            x = position.x;
            y = position.y;
        } while (!isPositionValid(x, y, minDistance)); // Ripeti la generazione se la posizione non è valida
    
        const duration = getRandomInt(settings.fruit.durationMin, settings.fruit.durationMax);
        const randomFruitImage = fruitImages[Math.floor(Math.random() * fruitImages.length)];
    
        const fruit = {
            x,
            y,
            duration,
            startTime: Date.now(),
            image: randomFruitImage
        };
    
        currentFruitsProgrammed.pop();
        currentFruits.push(fruit);
        drawCanvas();
        setTimeout(() => removeFruit(fruit), duration * 1000);
    }


    function removeFruit(fruit) {
        const index = currentFruits.indexOf(fruit);
        if (index > -1) {
            currentFruits.splice(index, 1);
            drawCanvas();
        }
    }


    function startBiscuitGeneration() {
        biscuitGenerationInterval = setInterval(checkAndProgramBiscuit, 500); // Polling ogni 500ms
    }
    
    function stopBiscuitGeneration() {
        clearInterval(biscuitGenerationInterval);
    }
    
    function checkAndProgramBiscuit() {
        if (currentView && currentView != 'game') {
            return;
        }
        if (currentBiscuits.length === 0 && currentBiscuitsProgrammed.length === 0) {
            const interval = getRandomInt(settings.biscuit.spawnIntervalMin, settings.biscuit.spawnIntervalMax) * 1000;
            const spawnTime = Date.now() + interval;
    
            currentBiscuitsProgrammed.push(spawnTime);
    
            setTimeout(() => spawnBiscuit(), interval); // Programma la comparsa del biscotto
        }
    }
    
    function spawnBiscuit() {
        if (currentBiscuits.length >= 1) return;
        if (currentView && currentView != 'game') {
            return;
        }
    
        let x, y;
        const minDistance = settings.seed.minSeedDistance;
    
        do {
            const position = getRandomPositionForFruitsAndBiscuits(canvas_nom_width, canvas_nom_height);
            x = position.x;
            y = position.y;
        } while (!isPositionValid(x, y, minDistance)); // Ripeti la generazione se la posizione non è valida
    
        const duration = getRandomInt(settings.biscuit.durationMin, settings.biscuit.durationMax);
        const randomBiscuitImage = biscuitImages[Math.floor(Math.random() * biscuitImages.length)];
    
        const biscuit = {
            x,
            y,
            duration,
            startTime: Date.now(),
            image: randomBiscuitImage
        };
    
        currentBiscuitsProgrammed.pop();
        currentBiscuits.push(biscuit);
        drawCanvas();
        setTimeout(() => removeBiscuit(biscuit), duration * 1000);
    }
    
    function removeBiscuit(biscuit) {
        const index = currentBiscuits.indexOf(biscuit);
        if (index > -1) {
            currentBiscuits.splice(index, 1);
            drawCanvas();
        }
    }


    function isPositionValid(newX, newY, minDistance) {
        const objects = [...currentSeeds, ...currentFruits, ...currentBiscuits];
    
        for (let obj of objects) {
            const distance = Math.sqrt(Math.pow(newX - obj.x, 2) + Math.pow(newY - obj.y, 2));
            if (distance < minDistance) {
                return false;
            }
        }
    
        return true;
    }
    


    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }


    function getRandomPositionForFruitsAndBiscuits(canvasWidth, canvasHeight) {
        const minX = settings.seed.xSeedMin;
        const maxX = settings.seed.xSeedMax;
        const minY = settings.seed.ySeedMin;
        const maxY = settings.seed.ySeedMax;
    
        const x = Math.random() * (maxX - minX) + minX;
        const y = Math.random() * (maxY - minY) + minY;
    
        return { x, y };
    }
    
    
    function getRandomPosition(canvasWidth, canvasHeight) {
        const minX = settings.seed.xSeedMin;
        const maxX = settings.seed.xSeedMax;
        const minY = settings.seed.ySeedMin;
        const maxY = settings.seed.ySeedMax;
    
        const centerX = parrotX + 25; // Centro del pappagallo sull'asse X
        const centerY = parrotY + 25; // Centro del pappagallo sull'asse Y
    
        let chosenPosition;
        let attempts = 0;
        let currentDifficulty = settings.seed.difficulty; // Usa una variabile locale per la difficulty
    
        do {
            // console.log(`Attempt ${attempts + 1}, Current Difficulty: ${currentDifficulty}`);
    
            // Genera N coppie (x, y) e calcola la distanza dal pappagallo
            let positions = [];
            for (let i = 0; i < settings.seed.N; i++) {
                const x = Math.random() * (maxX - minX) + minX;
                const y = Math.random() * (maxY - minY) + minY;
                const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
                positions.push({ x, y, distance });
            }
    
            // Ordina le posizioni in base alla distanza dal pappagallo
            positions.sort((a, b) => a.distance - b.distance);
    
            // console.log(`Positions generated and sorted: ${positions.length} positions`);
    
            // Determina lo slot di partenza e la finestra in base alla difficulty
            const slotSize = Math.floor(settings.seed.N / 10);
            let start, end;
    
            if (currentDifficulty === 1) {
                start = 0;
                end = 2 * slotSize;
            } else if (currentDifficulty === 2) {
                start = 0;
                end = 3 * slotSize;
            } else if (currentDifficulty === 3) {
                start = 0;
                end = 4 * slotSize;
            } else if (currentDifficulty === 4) {
                start = 1 * slotSize;
                end = 4 * slotSize;
            } else if (currentDifficulty === 5) {
                start = 2 * slotSize;
                end = 5 * slotSize;
            } else if (currentDifficulty === 6) {
                start = 3 * slotSize;
                end = 6 * slotSize;
            } else if (currentDifficulty === 7) {
                start = 4 * slotSize;
                end = 7 * slotSize;
            } else if (currentDifficulty === 8) {
                start = 7 * slotSize;
                end = 10 * slotSize;
            } else if (currentDifficulty === 9) {
                start = 8 * slotSize;
                end = 10 * slotSize;
            } else if (currentDifficulty === 10) {
                start = 9 * slotSize;
                end = 10 * slotSize;
            }
            
    
            // console.log(`Using positions from slot ${start} to ${end}`);
    
            // Crea uno slice dell'array con le posizioni considerate
            const consideredPositions = positions.slice(start, end);
    
            // console.log(`Considered Positions: ${consideredPositions.length}`);
    
            // Seleziona una posizione random tra quelle considerate
            chosenPosition = consideredPositions[Math.floor(Math.random() * consideredPositions.length)];
    
            // console.log(`Chosen Position: (${chosenPosition.x}, ${chosenPosition.y})`);
    
            // Controlla se la posizione è troppo vicina a un seme esistente
            if (currentSeeds.some(seed => {
                const dist = Math.sqrt(Math.pow(seed.x - chosenPosition.x, 2) + Math.pow(seed.y - chosenPosition.y, 2));
                // console.log(`Distance from Seed: ${dist}`);
                return dist < settings.seed.minSeedDistance;
            })) {
                // console.log('Position too close to an existing seed. Retrying...');
                chosenPosition = null; // Annulla la posizione scelta se troppo vicina
                attempts++;
                if (attempts >= 10) {
                    console.log('Increasing difficulty...');
                    currentDifficulty = Math.min(10, currentDifficulty + 1); // Aumenta la difficulty locale
                    attempts = 0; // Resetta il contatore dei tentativi
                }
            } else {
                break; // Esci dal ciclo se una posizione idonea è stata trovata
            }
    
        } while (!chosenPosition);
    
        // console.log(`Final Chosen Position: (${chosenPosition.x}, ${chosenPosition.y})`);
    
        return { x: chosenPosition.x, y: chosenPosition.y };
    }
    
    
    
    function calculateSeedDuration(minDuration, maxDuration, difficulty, seedPosition) {
        const centerX = parrotX + 25;
        const centerY = parrotY + 25;
    
        const distance = Math.sqrt(Math.pow(seedPosition.x - centerX, 2) + Math.pow(seedPosition.y - centerY, 2));
        const maxDistance = Math.sqrt(Math.pow(canvas_nom_width, 2) + Math.pow(canvas_nom_height, 2));
    
        if (distance > (2/3) * maxDistance && difficulty >= 7) {
            difficulty = Math.max(1, difficulty - 1);
        }
    
        let durations = [];
        for (let i = 0; i < settings.seed.N; i++) {
            const duration = Math.random() * (maxDuration - minDuration) + minDuration;
            durations.push(duration);
        }
    
        durations.sort((a, b) => b - a);
    
        const slotSize = Math.floor(settings.seed.N / 10);
        let start, end;
    
        if (difficulty === 1) {
            start = 0;
            end = 2 * slotSize;
        } else if (difficulty === 2) {
            start = 0;
            end = 3 * slotSize;
        } else if (difficulty === 3) {
            start = 0;
            end = 4 * slotSize;
        } else if (difficulty === 4) {
            start = 2 * slotSize;
            end = 5 * slotSize;
        } else if (difficulty === 5) {
            start = 3 * slotSize;
            end = 7 * slotSize;
        } else if (difficulty === 6) {
            start = 4 * slotSize;
            end = 8 * slotSize;
        } else if (difficulty === 7) {
            start = 5 * slotSize;
            end = 9 * slotSize;
        } else if (difficulty === 8) {
            start = 7 * slotSize;
            end = 10 * slotSize;
        } else if (difficulty === 9) {
            start = 8 * slotSize;
            end = 10 * slotSize;
        } else if (difficulty === 10) {
            start = 9 * slotSize;
            end = 10 * slotSize;
        }
    
        const consideredDurations = durations.slice(start, end);
    
        // Log per monitorare cosa sta accadendo
        // console.log(`Difficulty: ${difficulty}, Start Slot: ${start}, End Slot: ${end}, Number of Considered Durations: ${consideredDurations.length}`);
    
        if (consideredDurations.length === 0) {
            // console.log("No durations found in the considered slot range. Using fallback.");
            return maxDuration; // Usa la durata massima come fallback
        }
    
        const chosenDuration = consideredDurations[Math.floor(Math.random() * consideredDurations.length)];
        // console.log(`Chosen Duration: ${chosenDuration} for Seed at (${seedPosition.x}, ${seedPosition.y})`);
    
        return chosenDuration;
    }
    

    function getFurthestSeed() {
        if (currentSeeds.length === 0) return null;
        
        let furthestSeed = currentSeeds[0];
        let maxDistance = 0;
    
        const parrotCenterX = parrotX + 25;
        const parrotCenterY = parrotY + 25;
    
        currentSeeds.forEach(seed => {
            const distance = Math.sqrt(Math.pow(seed.x - parrotCenterX, 2) + Math.pow(seed.y - parrotCenterY, 2));
            if (distance > maxDistance) {
                maxDistance = distance;
                furthestSeed = seed;
            }
        });
    
        return furthestSeed;
    }

    
    function boostToFurthestSeed() {
        // playActionStarted(); // Chiama la funzione quando l'utente inizia a toccare lo schermo
        const furthestSeed = getFurthestSeed();
        if (!furthestSeed) return;

        // Aggiorna il conteggio dei boost utilizzati
        currentLevelState.boostsUsed++;
    
        const boostSpeed = settings.boost.speed; // Velocità del boost impostabile nelle impostazioni
    
        const targetX = furthestSeed.x;
        const targetY = furthestSeed.y;
    
        const dx = targetX - parrotX;
        const dy = targetY - parrotY;
        const distance = Math.sqrt(dx * dx + dy * dy);
    
        const steps = distance / boostSpeed;
        let step = 0;
    
        // Determina se il pappagallo deve essere flippato
        if (dx < 0 && isFlipped) {
            isFlipped = false;
        } else if (dx > 0 && !isFlipped) {
            isFlipped = true;
        }
    
        const boostInterval = setInterval(() => {
            if (step >= steps) {
                clearInterval(boostInterval);
                parrotX = targetX;
                parrotY = targetY;
                checkSeedCollision(); // Il pappagallo mangia il seme una volta raggiunto
                disableBoostTemporarily();
                return;
            }
    
            parrotX += dx / steps;
            parrotY += dy / steps;
            drawCanvas();
    
            step++;
        }, 1000 / 60); // 60 fps
    }
    


    function disableBoostTemporarily() {
        boostEnabled = false;
        boostState = 'cooldown';
        game_buttons.boost.visible = false;
        game_buttons.boost_disabled.visible = true;
    
        boostCooldown = settings.boost.cooldown;
    
        const cooldownInterval = setInterval(() => {
            boostCooldown--;
            drawCanvas(); // Ridisegna il canvas con il countdown aggiornato
    
            if (boostCooldown <= 0) {
                clearInterval(cooldownInterval);
                if (!powerDownActive) {
                    enableBoost(); // Riabilita il boost
                } 
            }
        }, 1000);
    }


    function disableBoost(cause) {
        boostEnabled = false;
        boostState = 'disabled';
        game_buttons.boost.visible = false;
        game_buttons.boost_disabled.visible = true;
        
        if (cause === 'power_down') {
            // Logica aggiuntiva per gestire il power_down se necessario
        }
    
        drawCanvas(); // Ridisegna il canvas per mostrare l'icona senza countdown
    }
    
    function enableBoost() {
        boostEnabled = true;
        boostState = 'enabled';
        game_buttons.boost.visible = true;
        game_buttons.boost_disabled.visible = false;
        drawCanvas();
    }


    // Event listener per la dimensione della finestra
    window.addEventListener('resize', resizeCanvas);
    document.addEventListener('fullscreenchange', resizeCanvas);
    document.addEventListener('webkitfullscreenchange', resizeCanvas);
    document.addEventListener('mozfullscreenchange', resizeCanvas);
    document.addEventListener('MSFullscreenChange', resizeCanvas);

    // Prevenzione del menu contestuale
    canvas.addEventListener('contextmenu', (event) => {
        event.preventDefault();
    });



    function playActionStarted() {
        if (currentLevelState.actionStarted) return; // Evita di eseguire nuovamente se già avviato
        currentLevelState.actionStarted = true;
    
        if (backgroundMusic) {
            backgroundMusic.pause();
            backgroundMusic.currentTime = 0; // Resetta la traccia all'inizio
        }
        // Avvia la musica di sottofondo del livello corrente
        backgroundMusic = new Audio(levels[currentLevelState.levelNumber].music);
        backgroundMusic.loop = true;
        backgroundMusic.volume = settings.game.musicVolume || 0.5;
        backgroundMusic.play().catch(error => console.log(`Errore nel riprodurre la musica: ${error}`));

        // Avvia il conto alla rovescia
        startLevelTimer();

        // Avvia la generazione dei semi, frutti e biscotti
        startSeedGeneration();
        startFruitGeneration()
        startBiscuitGeneration() 
    }


    function startLevelTimer() {
        currentLevelState.levelTimerInterval = setInterval(() => {
            currentLevelState.levelTimeRemaining--;    
            // Aggiorna il countdown sulla top bar
            drawCanvas();
            // Se mancano meno di 10 secondi, riproduci il suono di tick
            if (currentLevelState.levelTimeRemaining <= 10 && currentLevelState.levelTimeRemaining > 0) {
                playSound('clock_tick');
            }
            // Se il tempo è scaduto, termina il livello
            if (currentLevelState.levelTimeRemaining <= 0) {
                clearInterval(currentLevelState.levelTimerInterval); 
                currentLevelState.levelTimeRemaining = 0;
                endLevel();
                playSound('end_level_gong');
                // Carica la schermata di riepilogo dopo 1 secondo
                setTimeout(() => {
                    const isLastLevel = currentLevelState.levelNumber >= Object.keys(levels).length;
                    if (isLastLevel) {
                        loadView('endLastLevelView'); // Carica la schermata di fine livello per l'ultimo livello
                    } else {
                        loadView('endLevelView'); // Carica la schermata di fine livello
                    }
                }, 1000);
            }
        }, 1000);
    }


    function loadLevel(levelNumber) {
        const level = levels[levelNumber];
        currentView = 'game';
        
        if (!level) {
            console.error(`Level ${levelNumber} not found!`);
            return;
        }
        
        // Carica lo sfondo e assegna alla variabile globale `background`
        background = new Image();
        background.src = level.background;
        background.onload = () => {
            drawCanvas(); // Ridisegna il canvas solo dopo che lo sfondo è stato caricato
        };

        parrotImage.onload = () => {
            resizeCanvas();
            updatePosition(); 
        };
        
        // Imposta i settings del livello, usa quelli di default se non presenti
        settings.seed = { ...default_settings.seed, ...level.settings.seed };
        settings.boost = { ...default_settings.boost, ...level.settings.boost };
        settings.game = { ...default_settings.game, ...level.settings.game };
        settings.level = { ...default_settings.level, ...level.settings.level };
        settings.fruit = { ...default_settings.fruit, ...level.settings.fruit };
        settings.biscuit = { ...default_settings.biscuit, ...level.settings.biscuit };
        settings.powerUp = { ...default_settings.powerUp, ...level.settings.powerUp };
        settings.powerDown = { ...default_settings.powerDown, ...level.settings.powerDown };
        
        currentLevelState.levelNumber = levelNumber;
        currentLevelState.levelPoints = 0;
        currentLevelState.seedsCollected = 0;
        currentLevelState.seedsCollectedType1 = 0;
        currentLevelState.seedsCollectedType2 = 0;
        currentLevelState.seedsCollectedType3 = 0;
        currentLevelState.fruitsCollected = 0;
        currentLevelState.fruitsCollectedType1 = 0;
        currentLevelState.fruitsCollectedType2 = 0;
        currentLevelState.fruitsCollectedType3 = 0;
        currentLevelState.biscuitsCollected = 0;
        currentLevelState.biscuitsCollectedType1 = 0;
        currentLevelState.biscuitsCollectedType2 = 0;
        currentLevelState.biscuitsCollectedType3 = 0;
        currentLevelState.boostsUsed = 0;
        currentLevelState.levelDuration = settings.level.duration;
        currentLevelState.levelTimeRemaining = settings.level.duration;
        currentLevelState.actionStarted = false; // Azzera il flag quando si carica un nuovo livello
        speed = settings.game.speed;
        // Aggiungi gli event listener necessari per il gioco
        addGameEventListeners();
        // Resize del canvas
        resizeCanvas();
        // Avvia l'animazione di movimento del pappagallo
        updatePosition(); 
        // Avvia il gioco
        playActionStarted();
   
    }



    function endLevel() {
        // Rimuovi gli event listener
        removeGameEventListeners();
        // Ferma la generazione dei semi, frutti e biscotti
        stopSeedGeneration();
        stopFruitGeneration()
        stopBiscuitGeneration()
        currentView = null;
        currentSeeds = [];
        currentBiscuits = [];
        currentBiscuitsProgrammed = [];
        currentFruits = [];
        currentFruitsProgrammed = [];
        updatePosition();
        moveDirection = null;
        if (backgroundMusic) {
            backgroundMusic.pause();
            backgroundMusic.currentTime = 0; // Resetta la traccia all'inizio
        }
        // Salva il punteggio e le statistiche
        saveScoreToDatabase();
    }



    // Funzione per gestire il click del pulsante fullscreen
    function toggleFullscreen() {
        if (!document.fullscreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
            enterFullscreen();
            game_buttons.fullscreen.visible = false;
            game_buttons.fullscreen_exit.visible = true;
            drawCanvas();
        } else {
            exitFullscreen();
            game_buttons.fullscreen.visible = true;
            game_buttons.fullscreen_exit.visible = false;
            drawCanvas();
        }
    }


    function loadView(viewname) {
        const view = views[viewname];
        if (!view) return;
        // Imposta la vista corrente
        currentView = viewname;
        // Rimuovi eventuali event listener precedenti
        removeViewEventListeners();
        // Aggiungi i nuovi event listener per la vista corrente
        addViewEventListeners();
        // Carica le immagini dei pulsanti non virtuali
        for (const key in view.buttons) {
            const button = view.buttons[key];
            if (!button.virtual) {
                button.image = new Image();
                button.image.src = button.icon;

            }
        }
        // Carica lo sfondo della vista
        background = new Image();
        background.src = view.background;
        background.onload = () => {
            drawView(viewname);
        };
        // Riproduci il suono della vista, se presente
        if (view.loadSound) {
            view.playingaudio = new Audio(view.loadSound);
            view.playingaudio.play().catch(error => console.log(`Errore nel riprodurre il suono: ${error}`));
        }
    }
    
    function addViewEventListeners() {
        canvas.addEventListener('click', handleViewCanvasClick);
        canvas.addEventListener('touchstart', handleViewCanvasTouch, { passive: false });
    }
    
    function removeViewEventListeners() {
        canvas.removeEventListener('click', handleViewCanvasClick);
        canvas.removeEventListener('touchstart', handleViewCanvasTouch);
    }


    function drawView(viewname) {
        const view = views[viewname];
        if (!view) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.scale(canvas.width / canvas_nom_width, canvas.height / canvas_nom_height);
        // Disegna il background
        if (background) {
            ctx.drawImage(background, 0, 0, canvas_nom_width, canvas_nom_height);
        }
        // Disegna i pulsanti non virtuali
        for (const key in view.buttons) {
            const button = view.buttons[key];
            if (!button.virtual && button.visible) {
                if (button.simple) {
                    ctx.drawImage(button.image, button.x, button.y, button.width, button.height);
                } else {
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                    ctx.fillRect(button.x, button.y, button.width || buttonSize, button.height || buttonSize);
                    const iconWidth = (button.width || buttonSize) - iconPadding * 2;
                    const iconHeight = (button.height || buttonSize) - iconPadding * 2;
                    ctx.drawImage(button.image, button.x + iconPadding, button.y + iconPadding, iconWidth, iconHeight);
                }
            }
        }
        // Disegna eventuali altri elementi specifici della vista
        if (viewname === 'startView') {
            drawStartViewSpecificElements();
        } else if (viewname === 'endLevelView') {
            drawEndLevelViewSpecificElements();
        } else if (viewname === 'endLastLevelView') {
            drawEndLevelViewSpecificElements();
        } else if (viewname === 'endGameView') {
            drawEndGameViewSpecificElements();
        }
        // (es. testi dinamici)
        ctx.restore();
    }
    
    
    function handleViewCanvasClick(event) {
        const container = document.getElementById('gameCanvas');
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        let scaleFactorX = containerWidth / canvas_nom_width;
        let scaleFactorY = containerHeight / canvas_nom_height;
        // Calcolo la dimensione delle barre quando si scala
        const aspectRatio = canvas_nom_width / canvas_nom_height; 
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        let canvasWidth, canvasHeight;
        let barWidth = 0, barHeight = 0;
        let scaleFactor;
        if (windowWidth / windowHeight > aspectRatio) {
            // La finestra è più larga, calcoliamo la larghezza del canvas basata sull'altezza
            canvasHeight = windowHeight;
            canvasWidth = canvasHeight * aspectRatio;
            barWidth = (windowWidth - canvasWidth) / 2;
        } else {
            // La finestra è più alta, calcoliamo l'altezza del canvas basata sulla larghezza
            canvasWidth = windowWidth;
            canvasHeight = canvasWidth / aspectRatio;
            barHeight = (windowHeight - canvasHeight) / 2;
        }
        // Calcolo il fattore di scala da usare 
        if (barHeight > 0) {
            scaleFactor = scaleFactorX;
        } else if (barWidth > 0) {
            scaleFactor = scaleFactorY;
        }
        // Calcola le coordinate del click relative al canvas
        const x = (event.clientX - barWidth) / scaleFactor;
        const y = (event.clientY - barHeight) / scaleFactor;
        console.log("Original click coordinates:", { clientX: event.clientX, clientY: event.clientY });
        console.log("Scaled click coordinates:", { x: x, y: y });
        // Check pulsante premuto
        const view = views[currentView];
        if (view) {
            for (const key in view.buttons) {
                const button = view.buttons[key];
                if (button.visible && x > button.x && x < button.x + button.width &&
                    y > button.y && y < button.y + button.height) {
                    console.log(`Button ${key} clicked.`);
                    processViewKeyActions(view.name, key);
                    return;
                }
            }
            console.log("No button was clicked.");
        }
    }


    function handleViewCanvasTouch(event) {
        event.preventDefault(); // Previene il menu contestuale
        handleViewCanvasClick(event.touches[0]);
        // Aggiunta della chiamata per rilevare il dispositivo e attivare il fullscreen se necessario
        // detectMobileAndFullscreen();
    }
    

    function processViewKeyActions(viewname, key) {
        // Gestisce le azioni in base al viewname e al pulsante premuto
        if (viewname === 'startView') {
            processStartViewActions(key);
        } else if (viewname === 'endLevelView') {
            processEndLevelViewActions(key);
        } else if (viewname === 'endLastLevelView') {
            processEndLastLevelViewActions(key);
        } else if (viewname === 'endGameView') {
            processEndGameViewActions(key);
        }
        // Aggiungi qui altre funzioni per altre view
    }


    function endView() {
        removeViewEventListeners(); 
        const view = views[currentView];
        if (view.loadSound) {
            view.playingaudio.pause();
            view.playingaudio.currentTime = 0; // Resetta la traccia all'inizio
        }
        currentView = null;
        // ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Esegui altre eventuali azioni di chiusura
    }


    function processStartViewActions(key) {
        switch (key) {
            case 'changeName':
                // Implementa la logica per cambiare il nome del giocatore
                let playerName = prompt("Inserisci il tuo nome:");
                if (playerName) {
                    game.playerName = playerName;
                    drawView('startView'); // Rerenderizza la schermata con il nuovo nome
                }
                break;
            case 'back':
                if (game.selectedLevel > 1) {
                    game.selectedLevel--;
                    drawView('startView');
                }
                break;
            case 'forward':
                if (game.selectedLevel < Object.keys(levels).length) {
                    game.selectedLevel++;
                    drawView('startView');
                }
                break;
            case 'startGame':
                endView();
                score = 0;
                if (!game.playerName || game.playerName == "") {
                    game.playerName = "Anonymous";
                }
                loadLevel(game.selectedLevel);
                break;
            case 'fullscreen':
                toggleFullscreenView();
                break;
            case 'fullscreen_exit':
                toggleFullscreenView();
                break;
        }
    }


    function processEndLevelViewActions(key) {
        if (key === 'replayLevel') {
            endView();
            score -= currentLevelState.levelPoints;
            loadLevel(currentLevelState.levelNumber); // Rigioca il livello corrente
        } else if (key === 'nextLevel') {
            endView();
            loadLevel(currentLevelState.levelNumber + 1); // Passa al livello successivo
        } else if (key === 'backToMenu') {
            endView();
            loadView('startView'); // Torna al menu iniziale
        } else if (key === 'fullscreen' || key === 'fullscreen_exit') {
            toggleFullscreenView(); // Gestisci il fullscreen
        }
    }
    
    function processEndLastLevelViewActions(key) {
        if (key === 'replayLevel') {
            endView();
            score -= currentLevelState.levelPoints;
            loadLevel(currentLevelState.levelNumber); // Rigioca l'ultimo livello
        } else if (key === 'endGame') {
            endView();
            loadView('endGameView'); 
        } else if (key === 'fullscreen' || key === 'fullscreen_exit') {
            toggleFullscreenView(); // Gestisci il fullscreen
        }
    }


    function processEndGameViewActions(key) {
        if (key === 'backToMenu') {
            endView();
            loadView('startView'); // Torna al menu iniziale
        } else if (key === 'fullscreen' || key === 'fullscreen_exit') {
            toggleFullscreenView(); // Gestisci il fullscreen
        }
    }


    function drawStartViewSpecificElements() {
        // Disegna il nome del giocatore e il livello selezionato
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 22px Bosk, Georgia, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`${game.playerName || 'Insert Your Name'}`, 324, 247);
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 22px Bosk, Georgia, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`LV. ${game.selectedLevel}`, 356, 313);
    }  


    function drawEndGameViewSpecificElements() {
        ctx.fillStyle = '#000000'; // Colore nero    
        ctx.font = 'bold 14px Bosk, Georgia, sans-serif';
        ctx.fillText(`${score} Points`, 111, 169);
        // Verifica se il playerName è definito, altrimenti imposta "- - -"
        let topScore = "- - -";
        let topScoreDate = "- - -";
        if (game.playerName) {
            const playerScoreDetails = getPlayerScoreDetails(game.playerName);
            if (playerScoreDetails) {
                topScore = playerScoreDetails.highestScore || '- - -';
                topScoreDate = formatTimestamp(playerScoreDetails.highestScoreDate) || '- - -';
            }
        } 
        ctx.font = 'bold 14px Bosk, Georgia, sans-serif'; 
        if (topScore === "- - -") {
            ctx.fillText(`${topScore}`, 97, 223);
            topScoreDate = "- - -";
        } else {
            ctx.fillText(`${topScore} Points`, 97, 223);
        }
        ctx.font = 'bold 14px Bosk, Georgia, sans-serif'; 
        ctx.fillText(`${topScoreDate}`, 56, 245);
        ctx.font = 'bold 14px Bosk, Georgia, sans-serif';
        ctx.fillText(`${game.playerName || '- - -'}`, 433, 383);
    }


    function drawEndLevelViewSpecificElements() {
        ctx.fillStyle = '#000000'; // Colore nero    
        // Rendering delle informazioni
        ctx.font = 'bold 22px Bosk, Georgia, sans-serif'; 
        ctx.fillText(`${currentLevelState.levelNumber}`, 117, 30);
        ctx.font = 'bold 20px Bosk, Georgia, sans-serif'; 
        ctx.fillText(`${score} Points`, 150, 130);
        ctx.fillText(`${currentLevelState.levelPoints} Points`, 150, 189);
        ctx.font = 'bold 14px Bosk, Georgia, sans-serif'; 
        ctx.fillText(`${currentLevelState.seedsCollectedType1} Units`, 110, 251);
        ctx.fillText(`${currentLevelState.seedsCollectedType2} Units`, 110, 285);
        ctx.fillText(`${currentLevelState.seedsCollectedType3} Units`, 110, 318);
        ctx.fillText(`${currentLevelState.seedsCollected} Seeds`, 110, 351);
        ctx.fillText(`${currentLevelState.fruitsCollectedType1} Units`, 300, 251);
        ctx.fillText(`${currentLevelState.fruitsCollectedType2} Units`, 300, 285);
        ctx.fillText(`${currentLevelState.fruitsCollectedType3} Units`, 300, 318);

        ctx.fillText(`${currentLevelState.biscuitsCollectedType1} Units`, 498, 251);
        ctx.fillText(`${currentLevelState.biscuitsCollectedType2} Units`, 498, 285);
        ctx.fillText(`${currentLevelState.biscuitsCollectedType3} Units`, 498, 318);

        ctx.fillText(`${currentLevelState.boostsUsed} Boosts`, 338, 370);

        // Verifica se il playerName è definito, altrimenti imposta "- - -"
        let topScore = "- - -";
        let topScoreDate = "- - -";
        if (game.playerName) {
            const playerScoreDetails = getPlayerScoreDetails(game.playerName);
            if (playerScoreDetails) {
                topScore = playerScoreDetails.highestScore || '- - -';
                topScoreDate = formatTimestamp(playerScoreDetails.highestScoreDate) || '- - -';
            }
        } 
        ctx.font = 'bold 20px Bosk, Georgia, sans-serif'; 
        if (topScore === "- - -") {
            topScoreDate = "- - -";
            ctx.fillText(`${topScore}`, 519, 34);
        } else {
            ctx.fillText(`${topScore} Points`, 519, 34);
        }
        ctx.font = 'bold 18px Bosk, Georgia, sans-serif'; 
        ctx.fillText(`${topScoreDate}`, 519, 61);
    }
    
    function formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        const formattedDate = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}-${date.getFullYear()}`;
        const formattedTime = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
        return `${formattedDate} ${formattedTime}`;
    }


    // Funzione per gestire il click del pulsante fullscreen
    function toggleFullscreenView() {
        const view = views[currentView];
        if (!document.fullscreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
            enterFullscreen();
            view.buttons.fullscreen.visible = false;
            view.buttons.fullscreen_exit.visible = true;
            drawView(currentView);
        } else {
            exitFullscreen();
            view.buttons.fullscreen.visible = true;
            view.buttons.fullscreen_exit.visible = false;
            drawView(currentView);
        }
    }
    

    function saveScoreToDatabase() {
        const dataToSave = {
            playerName: game.playerName,
            score: score,
            levelData: { ...currentLevelState },
            date: new Date().toISOString(),
        };
    
        // Recupera i dati esistenti
        let savedData = JSON.parse(localStorage.getItem(gameKey)) || [];
    
        // Verifica se esiste già un record per il giocatore corrente
        let existingRecord = savedData.find(record => record.playerName === game.playerName);
    
        if (existingRecord) {
            // Aggiorna il record esistente
            existingRecord.score = dataToSave.score;
            existingRecord.levelData = dataToSave.levelData;
            existingRecord.date = dataToSave.date;
            if (dataToSave.score > existingRecord.highestScore) {
                existingRecord.highestScore = dataToSave.score;
                existingRecord.highestScoreDate = dataToSave.date;
            }
        } else {
            // Crea un nuovo record
            dataToSave.highestScore = dataToSave.score;
            dataToSave.highestScoreDate = dataToSave.date;
            savedData.push(dataToSave);
        }
    
        // Salva di nuovo nel localStorage
        localStorage.setItem(gameKey, JSON.stringify(savedData));
    }


    function getSortedScores(sortBy) {
        let savedData = JSON.parse(localStorage.getItem(gameKey)) || [];
    
        switch (sortBy) {
            case 'topscore':
                return savedData.sort((a, b) => b.score - a.score);
            case 'highscore':
                return savedData.sort((a, b) => b.highestScore - a.highestScore);
            case 'hightimestamp':
                return savedData.sort((a, b) => new Date(b.highestScoreDate) - new Date(a.highestScoreDate));
            case 'toptimestamp':
                return savedData.sort((a, b) => new Date(b.date) - new Date(a.date));
            default:
                return savedData;
        }
    }


    function getFormattedScores(sortBy) {
        // Ottieni i punteggi ordinati
        const sortedScores = getSortedScores(sortBy);
    
        // Mappa i punteggi ordinati in un array di oggetti formattati
        return sortedScores.map(record => {
            return {
                playerName: record.playerName,
                lastScore: record.score,
                lastScoreDate: record.date,
                highestScore: record.highestScore,
                highestScoreDate: record.highestScoreDate
            };
        });
    }


    function getPlayerScoreDetails(playerName) {
        let savedData = JSON.parse(localStorage.getItem(gameKey)) || [];
    
        const playerData = savedData.find(record => record.playerName === playerName);
        if (!playerData) return null;
    
        return {
            lastScore: playerData.score,
            lastScoreDate: playerData.date,
            highestScore: playerData.highestScore,
            highestScoreDate: playerData.highestScoreDate
        };
    }
    

    loadView('startView');

    // loadLevel(1); // Carica il livello 1 all'inizio del gioco
    

}


// Funzione per il rilevamento del dispositivo mobile e attivazione del fullscreen
function detectMobileAndFullscreen() {
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        enterFullscreen();
    }
}


// Avvio del gioco
initGame();


