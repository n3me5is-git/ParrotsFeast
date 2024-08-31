const gameKey = 'knoaofnoewfpowafnp';
const canvas = document.getElementById('interfaceCanvas');
const ctx = canvas.getContext('2d');
const parrot_canvas = document.getElementById('parrotCanvas');
const parrot_ctx = parrot_canvas.getContext('2d');
const elements_canvas = document.getElementById('elementsCanvas');
const elements_ctx = elements_canvas.getContext('2d');
const background_canvas = document.getElementById('backgroundCanvas');
const background_ctx = background_canvas.getContext('2d');

let background; // Variabile globale per l'immagine di sfondo
const canvas_nom_width = 700;
const canvas_nom_height = 400;
const canvas_resolution_multiplier = 5;     // Increase the definition
const parrot_move_xMin = 25;
const parrot_move_xMax = canvas_nom_width-25;
const parrot_move_yMin = 27;
const parrot_move_yMax = canvas_nom_height-50;
const speed_multiplier = 10;
const boost_speed_multiplier = 120;

canvas.height = canvas_nom_height * canvas_resolution_multiplier;
canvas.width = canvas_nom_width * canvas_resolution_multiplier;
parrot_canvas.height = canvas.height;
parrot_canvas.width = canvas.width;
elements_canvas.height = canvas.height;
elements_canvas.width = canvas.width;
background_canvas.height = canvas.height;
background_canvas.width = canvas.width;


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
        difficulty_seed_distance: 0,    // Managed by internal function
        difficulty_seed_time: 0,        // Managed by internal function
        minSeedDistance: 50, // Distanza minima tra semi in pixel
        points: {
            seed1: 18,
            seed2: 14,
            seed3: 10
        },
        probabilities: {
            seed1: 15, 
            seed2: 25, 
            seed3: 60  
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
        speed: 17,   // Velocità default pappagallo
        state: 'default', // Stato iniziale: "default", "power_up", "power_down"
        musicVolume: 0.6
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
        speedMultiplier: 1.6, // Moltiplicatore di velocità durante il Power Up
    },
    powerDown: {
        duration1: 25,  // Durata in secondi per il tipo di biscotto 1
        duration2: 30,  // Durata in secondi per il tipo di biscotto 2
        duration3: 35,  // Durata in secondi per il tipo di biscotto 3
        speedMultiplier: 0.5, // Moltiplicatore di velocità durante il Power Down
    }
};


let settings = { };


const levels = {
    1: {
        background: 'background-level-jungle.png',
        music: 'background-music-jungle.mp3',
        extraLevelCode: '',
        settings: {
            seed: {
                minDuration: 3,
                maxDuration: 30,
                difficulty: 1
            }
        }
    },
    2: {
        background: 'background-level-savana.png',
        music: 'background-music-savana.mp3',
        extraLevelCode: '',
        settings: {
            seed: {
                minDuration: 3,
                maxDuration: 30,
                difficulty: 2
            }
        }
    },
    3: {
        background: 'background-level-arabia.png',
        music: 'background-music-arabia.mp3',
        extraLevelCode: '',
        settings: {
            seed: {
                minDuration: 3,
                maxDuration: 30,
                difficulty: 3
            }
        }
    },
    4: {
        background: 'background-level-pirates.png',
        music: 'background-music-pirates.mp3',
        extraLevelCode: '',
        settings: {
            seed: {
                minDuration: 3,
                maxDuration: 30,
                difficulty: 4
            }
        }
    },
    5: {
        background: 'background-level-cityrio.png',
        music: 'background-music-cityrio.mp3',
        extraLevelCode: '',
        settings: {
            seed: {
                minDuration: 3,
                maxDuration: 30,
                difficulty: 5
            }
        }
    },
    6: {
        background: 'background-level-house80.png',
        music: 'background-music-house80.mp3',
        extraLevelCode: '',
        settings: {
            seed: {
                minDuration: 3,
                maxDuration: 30,
                difficulty: 6
            }
        }
    },
    7: {
        background: 'background-level-armageddon.png',
        music: 'background-music-armageddon.mp3',
        extraLevelCode: '',
        settings: {
            seed: {
                minDuration: 3,
                maxDuration: 30,
                difficulty: 7
            }
        }
    },
    8: {
        background: 'background-level-space.png',
        music: 'background-music-space.mp3',
        extraLevelCode: '',
        settings: {
            seed: {
                minDuration: 3,
                maxDuration: 30,
                difficulty: 8
            }
        }
    },
    9: {
        background: 'background-level-crystalworld.png',
        music: 'background-music-crystalworld.mp3',
        extraLevelCode: '',
        settings: {
            seed: {
                minDuration: 3,
                maxDuration: 30,
                difficulty: 9
            }
        }
    },
    10: {
        background: 'background-level-japanfantasy.png',
        music: 'background-music-japanfantasy.mp3',
        extraLevelCode: '',
        settings: {
            seed: {
                minDuration: 3,
                maxDuration: 30,
                difficulty: 9
            }
        }
    },
    // Aggiungi altri livelli base qui

    // Aggiungi altri livelli Extra qui
};

const base_game_end_level = 10;     // Tutti i livelli dopo il 10 sono Extra
let modified_difficulty = 0;


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
            scores: { x: 510, y: 168, width: 110, height: 30, visible: true, virtual: true },
            levelField: { x: 360, y: 293, width: 47, height: 23, visible: true, virtual: true },
            fullscreen: { x: canvas_nom_width - 45, y: 15, width: 35, height: 35, visible: true, icon: 'expand.svg', virtual: false },
            fullscreen_exit: { x: canvas_nom_width - 45, y: 15, width: 35, height: 35, visible: false, icon: 'compress.svg', virtual: false }
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
            fullscreen: { x: canvas_nom_width - 45, y: 15, width: 35, height: 35, visible: true, icon: 'expand.svg', virtual: false },
            fullscreen_exit: { x: canvas_nom_width - 45, y: 15, width: 35, height: 35, visible: false, icon: 'compress.svg', virtual: false }
        }
    },
    endLastLevelView: {
        name: 'endLastLevelView',
        background: 'end_last_level_background.png',
        loadSound: '',
        buttons: { 
            replayLevel: { x: 313, y: 130, width: 40, height: 40, visible: true, virtual: true },
            endGame: { x: 394, y: 110, width: 81, height: 81, visible: true, virtual: true }, 
            fullscreen: { x: canvas_nom_width - 45, y: 15, width: 35, height: 35, visible: true, icon: 'expand.svg', virtual: false },
            fullscreen_exit: { x: canvas_nom_width - 45, y: 15, width: 35, height: 35, visible: false, icon: 'compress.svg', virtual: false }
        }
    },
    endGameView: {
        name: 'endGameView',
        background: 'end_game_background.png',  // Imposta l'immagine di sfondo per i crediti
        loadSound: 'background-music-endgame.mp3',
        buttons: { 
            backToMenu: { x: 630, y: 280, width: 45, height: 40, visible: true, virtual: true }, // Pulsante virtuale
            fullscreen: { x: canvas_nom_width - 45, y: 15, width: 35, height: 35, visible: true, icon: 'expand.svg', virtual: false },
            fullscreen_exit: { x: canvas_nom_width - 45, y: 15, width: 35, height: 35, visible: false, icon: 'compress.svg', virtual: false }
        }
    },
    scoresView: {
        name: 'scoresView',
        background: 'scores_background.png', // Imposta l'immagine di sfondo per i punteggi
        loadSound: 'boxing_bell.wav',
        buttons: { 
            toggleScoreModeTop: { x: 12, y: 16, width: 35, height: 35, visible: true, icon: 'button_top.png', virtual: false, simple: true }, // Mostra Top Scores
            toggleScoreModeLast: { x: 12, y: 16, width: 35, height: 35, visible: false, icon: 'button_last.png', virtual: false, simple: true }, // Mostra Last Scores
            sortByScore: { x: 291, y: 28, width: 20, height: 20, visible: true, virtual: true }, // Ordina per punteggio
            sortByDate: { x: 416, y: 28, width: 20, height: 20, visible: true, virtual: true }, // Ordina per data
            backToMenu: { x: 639, y: 330, width: 41, height: 34, visible: true, virtual: true },
            fullscreen: { x: canvas_nom_width - 45, y: 15, width: 35, height: 35, visible: true, icon: 'expand.svg', virtual: false },
            fullscreen_exit: { x: canvas_nom_width - 45, y: 15, width: 35, height: 35, visible: false, icon: 'compress.svg', virtual: false }
        }
    },
    // Aggiungi qui altre viste come endView, levelSummaryView, ecc.
};

// Variabile vista attuale
let currentView;
let orientationCheckDone = false;
let fullscreenCheckDone = false;
let deferredPrompt;

// Variabili di gioco, statistiche e altro
let game = {
    playerName: '',
    selectedLevel: 1
};


// Funzione per entrare in modalità fullscreen
function enterFullscreen() {
    const elem = document.documentElement;
    try {
        if (elem.requestFullscreen) {
            elem.requestFullscreen().catch((err) => {
                console.warn('Unable to enter fullscreen mode:', err);
            });
        } else if (elem.mozRequestFullScreen) { // Firefox
            elem.mozRequestFullScreen().catch((err) => {
                console.warn('Unable to enter fullscreen mode:', err);
            });
        } else if (elem.webkitRequestFullscreen) { // Chrome, Safari, Opera
            elem.webkitRequestFullscreen().catch((err) => {
                console.warn('Unable to enter fullscreen mode:', err);
            });
        } else if (elem.msRequestFullscreen) { // IE/Edge
            elem.msRequestFullscreen().catch((err) => {
                console.warn('Unable to enter fullscreen mode:', err);
            });
        }
    } catch (err) {
        console.warn('Error while trying to enter fullscreen mode:', err);
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
    let speed = 4;
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
    let scoresViewScoreMode = 'top';
    let scoresViewOrderMode = 'points';

    const parrotImage = new Image();
    parrotImage.src = 'parrot.png';
    const parrotImageFlipped = new Image();
    parrotImageFlipped.src = 'parrot_flipped.png';
    let animationId;
    let animation_fps = 120;
    let fpsInterval, now, then, elapsed;

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
        seedGenerationInterval = setInterval(spawnSeed, 300); // Genera un seme ogni 100ms
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
        if (!currentLevelState.actionStarted) {
            renderGameBackground();
            renderParrot();
        }
        renderElementsToEat();
        renderGameInterface();
    }


    function renderGameBackground() {
        if (currentView && currentView != 'game') {
            return;
        }
        background_ctx.clearRect(0, 0, background_canvas.width, background_canvas.height);
        background_ctx.save();
        background_ctx.scale(background_canvas.width/canvas_nom_width, background_canvas.height/canvas_nom_height); // Applica la 
        // Disegna lo sfondo (se lo sfondo è un'immagine)
        if (background) {
            background_ctx.drawImage(background, 0, 0, canvas_nom_width, canvas_nom_height);
        }
        background_ctx.restore(); // Ripristina la scala originale
    }


    function renderGameInterface() {
        if (currentView && currentView != 'game') {
            return;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.scale(canvas.width/canvas_nom_width, canvas.height/canvas_nom_height); // Applica la 
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
        setFullscreenButtonsbyState();
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
        ctx.restore(); // Ripristina la scala originale
    }


    function renderLevel() {
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `bold 16px Arial, sans-serif`;
        ctx.textAlign = 'left';
        let levelText;
        if (currentLevelState.levelNumber <= base_game_end_level) {
            levels[game.selectedLevel].extraLevelCode
            levelText = `LV. ${currentLevelState.levelNumber}${currentLevelState.levelNumber < 10 ? ' ' : ''}`;
        } else {
            let game_level = levels[currentLevelState.levelNumber].extraLevelCode;
            levelText = `LV. ${game_level}${game_level < 10 ? ' ' : ''}`;
        }
        ctx.fillText(levelText, 10, 20);
    }


    function renderScore() {
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `bold 16px Arial, sans-serif`; // Il font viene scalato automaticamente con il contesto
        ctx.textAlign = 'left';
        ctx.fillText(`Tot. Score: ${score}`, 100, 20); // Le coordinate sono relative al contesto scalato
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
        if (currentView && currentView != 'game') {
            return;
        }  
        parrot_ctx.clearRect(0, 0, parrot_canvas.width, parrot_canvas.height);
        parrot_ctx.save();
        parrot_ctx.scale(canvas.width/canvas_nom_width, canvas.height/canvas_nom_height);  
        if (isFlipped) {
            // Flipping manuale invertendo le coordinate di disegno
            parrot_ctx.drawImage(parrotImageFlipped, parrotX + 50, parrotY, -50, 50);
        } else {
            parrot_ctx.drawImage(parrotImage, parrotX, parrotY, 50, 50);
        }
        parrot_ctx.restore();   // Ritorna alla precedente scala (originaria)
    }


    function renderElementsToEat() {
        if (currentView && currentView != 'game') {
            return;
        }
        elements_ctx.clearRect(0, 0, elements_canvas.width, elements_canvas.height);
        elements_ctx.save();
        elements_ctx.scale(canvas.width/canvas_nom_width, canvas.height/canvas_nom_height); 
        currentSeeds.forEach(seed => {
            elements_ctx.drawImage(seed.image, seed.x, seed.y, 30, 30); // Disegna l'immagine del seme, scalata a 20x20px
        });

        // Disegna i frutti
        currentFruits.forEach(fruit => {
            elements_ctx.drawImage(fruit.image, fruit.x, fruit.y, 30, 30);
        });

        // Disegna i biscotti
        currentBiscuits.forEach(biscuit => {
            elements_ctx.drawImage(biscuit.image, biscuit.x, biscuit.y, 30, 30);
        });
        elements_ctx.restore();
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
            audio.play();
        } else {
            console.log(`Nessun suono associato per l'evento: ${event}. Uso quello di default`);
            const audio = new Audio(soundMap['seed_eat']);
            audio.play();
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
        drawCanvas();
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
            renderGameInterface();
        }, 1000);
    }


    function deactivatePowerUp() {
        powerUpActive = false;
        speed = settings.game.speed;
        renderGameInterface();
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
            renderGameInterface();
        }, 1000);
    }
    
    function deactivatePowerDown() {
        powerDownActive = false;
        speed = settings.game.speed;
        enableBoost('power_down'); // Riabilita il boost
        renderGameInterface();
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
    
            now = performance.now();
            elapsed = now - then; // tempo trascorso dall'ultimo frame
    
            if (moveDirection) {
                // Calcola la distanza percorsa basata sul tempo
                var distance = speed * speed_multiplier * (elapsed / 1000); // distanza = velocità * tempo
    
                switch (moveDirection) {
                    case 'left':
                        parrotX -= distance;
                        if (isFlipped) isFlipped = false;
                        break;
                    case 'right':
                        parrotX += distance;
                        if (!isFlipped) isFlipped = true;
                        break;
                    case 'up':
                        parrotY -= distance;
                        break;
                    case 'down':
                        parrotY += distance;
                        break;
                }
    
                // Confini del canvas
                if (parrotX < parrot_move_xMin) parrotX = parrot_move_xMin;
                if (parrotX + 50 > parrot_move_xMax) parrotX = parrot_move_xMax - 50;
                if (parrotY < parrot_move_yMin) parrotY = parrot_move_yMin;
                if (parrotY + 50 > parrot_move_yMax) parrotY = parrot_move_yMax - 50;
                checkSeedCollision(); // Controlla la collisione dopo ogni movimento
            }
            // Renderizza solo se è trascorso abbastanza tempo per il prossimo frame
            // if (elapsed > fpsInterval) {
            //     renderParrot();
            //     then = now - (elapsed % fpsInterval);
            // }
            // Renderizza al massimo frame rate possibile
            renderParrot();
            then = performance.now();
            animationId = requestAnimationFrame(updatePosition);
        } else {
            cancelAnimationFrame(animationId);
            moveDirection = null;
        }
    }

    function startMovement(direction) {
        moveDirection = direction;
    }

    function stopMovement() {
        moveDirection = null;
    }

    function handleCanvasClick(event) {
        if (currentView && currentView != 'game') {
            return;
        }
        const container = canvas;
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
            case 'a':
                startMovement('left');
                break;
            case 'd':
            case 'ArrowRight':
                startMovement('right');
                break;
            case 'w':
            case 'ArrowUp':
                startMovement('up');
                break;
            case 's':
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
    
        const { x, y } = getRandomPosition();
        const duration = calculateSeedDuration();

        // Genera un numero casuale da 1 a 100 per determinare quale seme generare
        const randomNum = Math.floor(Math.random() * 100) + 1;
        let seedImageIndex;
        if (randomNum <= settings.seed.probabilities.seed1) {
            seedImageIndex = 0; // seed1
        } else if (randomNum <= settings.seed.probabilities.seed1 + settings.seed.probabilities.seed2) {
            seedImageIndex = 1; // seed2
        } else {
            seedImageIndex = 2; // seed3
        }
        const randomSeedImage = seedImages[seedImageIndex];
    
        const seed = {
            x,
            y,
            duration,
            startTime: Date.now(),
            image: randomSeedImage // Salva l'immagine selezionata nel seme
        };
    
        currentSeeds.push(seed);
        renderElementsToEat();
        setTimeout(() => removeSeed(seed), duration * 1000); // Rimuovi il seme dopo la durata specificata
    }
    
    
    
    function removeSeed(seed) {
        const index = currentSeeds.indexOf(seed);
        if (index > -1) {
            currentSeeds.splice(index, 1);
            renderElementsToEat();
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
        renderElementsToEat();
        setTimeout(() => removeFruit(fruit), duration * 1000);
    }


    function removeFruit(fruit) {
        const index = currentFruits.indexOf(fruit);
        if (index > -1) {
            currentFruits.splice(index, 1);
            renderElementsToEat();
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
        renderElementsToEat();
        setTimeout(() => removeBiscuit(biscuit), duration * 1000);
    }
    
    function removeBiscuit(biscuit) {
        const index = currentBiscuits.indexOf(biscuit);
        if (index > -1) {
            currentBiscuits.splice(index, 1);
            renderElementsToEat();
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


    function getRandomPosition() {
        const minX = settings.seed.xSeedMin;
        const maxX = settings.seed.xSeedMax;
        const minY = settings.seed.ySeedMin;
        const maxY = settings.seed.ySeedMax;
        const centerX = parrotX + 25;
        const centerY = parrotY + 25;
        const { probabilities, PDmin, PDmax } = getPositionProbabilitiesFromDifficulty(settings.seed.difficulty_seed_distance);
        // console.log("Position Parameters: \n", probabilities, "\n", PDmin, "\n", PDmax);
        const maxDistance = Math.max(
            Math.sqrt(Math.pow(minX - centerX, 2) + Math.pow(minY - centerY, 2)),
            Math.sqrt(Math.pow(maxX - centerX, 2) + Math.pow(minY - centerY, 2)),
            Math.sqrt(Math.pow(minX - centerX, 2) + Math.pow(maxY - centerY, 2)),
            Math.sqrt(Math.pow(maxX - centerX, 2) + Math.pow(maxY - centerY, 2))
        );
        // console.log("Max Distance: ", maxDistance);
        const angle_step_unit = 5;
        const angleSteps = Array.from({ length: 360 / angle_step_unit }, (_, i) => i * angle_step_unit);
        let chosenPosition;
        let attempts = 0;
        let lastSlot;
        while (!chosenPosition && attempts < 11) {
            const randomNum = Math.floor(Math.random() * 1000) + 1;
            let slotIndex;
            let cumulativeProbability = 0;
            for (let i = 0; i < probabilities.length; i++) {
                cumulativeProbability += probabilities[i];
                if (randomNum <= cumulativeProbability) {
                    slotIndex = i;
                    break;
                }
            }
            let Dmin = (PDmin[slotIndex] / 100) * maxDistance;
            Dmin = Math.max(Dmin, settings.seed.minSeedDistance);
            let Dmax = (PDmax[slotIndex] / 100) * maxDistance;
            Dmax = Math.max(Dmax, settings.seed.minSeedDistance);
            if (Dmax <= Dmin) {
                Dmax = maxDistance;
            }
            for (let first_attempts = 0; first_attempts < 3; first_attempts++) {
                const Dr = Math.random() * (Dmax - Dmin) + Dmin;
                for (let i = angleSteps.length - 1; i >= 0; i--) {
                    const angle = angleSteps.splice(Math.floor(Math.random() * angleSteps.length), 1)[0];
                    const rad = angle * (Math.PI / 180);
                    const x = centerX + Dr * Math.cos(rad);
                    const y = centerY + Dr * Math.sin(rad);
                    if (x >= minX && x <= maxX && y >= minY && y <= maxY && isPositionValid(x, y, settings.seed.minSeedDistance)) {
                        chosenPosition = { x, y };
                        // console.log("Random numeber ", randomNum, " - Slot: ", slotIndex, " - Dmin: ", Dmin, " - Dmax: ", Dmax, " - Dr: ", Dr, " - Angle: ", angle, " - (x,y): ", chosenPosition);
                        break;
                    }
                }
                if (chosenPosition) {
                    break;
                }
            }
            if (!chosenPosition) {
                attempts++;
                lastSlot = slotIndex;
                if (attempts % 2 === 0 && slotIndex == lastSlot) {
                    // Aumenta PDmax e diminuisci PDmin se i tentativi falliscono
                    PDmax[slotIndex] = Math.min(100, PDmax[slotIndex] + 10);
                    PDmin[slotIndex] = Math.max(0, PDmin[slotIndex] - 10);
                }
            }
        }
        if (!chosenPosition) {
            // Usa una posizione di fallback se tutti i tentativi falliscono
            const fallbackX = Math.random() * (maxX - minX) + minX;
            const fallbackY = Math.random() * (maxY - minY) + minY;
            return { x: fallbackX, y: fallbackY };
        }
        return chosenPosition;
    }


    function getPositionProbabilitiesFromDifficulty(difficulty) {
        // Assicurati che la difficoltà sia compresa tra 1 e 10
        if (difficulty < 1) difficulty = 1;
        if (difficulty > 10) difficulty = 10;
        let probabilities, PDmin, PDmax;
        switch(difficulty) {
            case 1:
                probabilities = [150, 250, 350, 150, 100]; // Più probabilità per il "vicino"
                PDmin = [0, 5, 10, 20, 20];
                PDmax = [10, 15, 25, 40, 50];
                break;
            case 2:
                probabilities = [120, 230, 320, 200, 130];
                PDmin = [5, 10, 15, 25, 30];
                PDmax = [15, 20, 30, 45, 55];
                break;
            case 3:
                probabilities = [100, 200, 300, 250, 150];
                PDmin = [10, 15, 20, 30, 35];
                PDmax = [20, 25, 35, 50, 60];
                break;
            case 4:
                probabilities = [90, 180, 280, 250, 200];
                PDmin = [15, 20, 25, 35, 40];
                PDmax = [25, 30, 40, 55, 65];
                break;
            case 5:
                probabilities = [80, 160, 250, 250, 260];
                PDmin = [20, 30, 35, 40, 45];
                PDmax = [30, 40, 55, 60, 75];
                break;
            case 6:
                probabilities = [70, 140, 200, 280, 310];
                PDmin = [30, 35, 40, 45, 50];
                PDmax = [50, 50, 50, 65, 80];
                break;
            case 7:
                probabilities = [50, 120, 180, 300, 350];
                PDmin = [35, 40, 45, 55, 55];
                PDmax = [60, 60, 65, 80, 85];
                break;
            case 8:
                probabilities = [30, 100, 150, 350, 370];
                PDmin = [40, 50, 60, 60, 70];
                PDmax = [70, 70, 80, 90, 90];
                break;
            case 9:
                probabilities = [20, 80, 130, 400, 370];
                PDmin = [40, 50, 60, 75, 70];
                PDmax = [80, 80, 90, 100, 100];
                break;
            case 10:
                probabilities = [5, 50, 200, 400, 345]; // Maggiore probabilità per il "lontano"
                PDmin = [40, 60, 75, 80, 90];
                PDmax = [80, 90, 95, 100, 100];
                break;
        }
        return { probabilities, PDmin, PDmax };
    }


    function calculateSeedDuration() {
        const { probabilities, PDmin, PDmax } = getDurationProbabilitiesFromDifficulty(settings.seed.difficulty_seed_time);
        // console.log(" Speed Parameters: \n", probabilities, "\n", PDmin, "\n", PDmax);
        // Determina il range di durata
        const minDuration = settings.seed.minDuration;
        const maxDuration = settings.seed.maxDuration;
        const rangeDuration = maxDuration - minDuration;
        // Genera un intero random tra 1 e 1000 per determinare lo slot
        const randomValue = Math.floor(Math.random() * 1000) + 1;
        // Identifica lo slot di probabilità in base al numero random generato
        let cumulativeProbability = 0;
        let selectedSlot = 0;
        for (let i = 0; i < probabilities.length; i++) {
            cumulativeProbability += probabilities[i];
            if (randomValue <= cumulativeProbability) {
                selectedSlot = i;
                break;
            }
        }
        // Calcola la durata basata su PDmin e PDmax del relativo slot
        const Dmin = (rangeDuration / 100) * PDmin[selectedSlot] + minDuration;
        const Dmax = (rangeDuration / 100) * PDmax[selectedSlot] + minDuration;
        const randomDuration = Math.floor(Math.random() * (Dmax - Dmin + 1)) + Dmin;
        // console.log("Random numeber ", randomValue, " - Slot: ", selectedSlot, " - Dmin: ", minDuration, " - Dmax: ", maxDuration, " - Rduration ", randomDuration);
        // Restituisce una durata random tra Dmin e Dmax
        return randomDuration;
    }


    function getDurationProbabilitiesFromDifficulty(difficulty) {
        // Assicurati che la difficoltà sia compresa tra 1 e 10
        if (difficulty < 1) difficulty = 1;
        if (difficulty > 10) difficulty = 10;
        let probabilities, PDmin, PDmax;
        switch(difficulty) {
            case 1:
                probabilities = [400, 300, 200, 100]; // Maggiore probabilità per durate lunghe
                PDmin = [90, 80, 50, 40];
                PDmax = [100, 100, 100, 80];
                break;
            case 2:
                probabilities = [350, 300, 250, 100];
                PDmin = [80, 70, 50, 40];
                PDmax = [100, 100, 80, 80];
                break;
            case 3:
                probabilities = [300, 300, 250, 150];
                PDmin = [70, 60, 40, 35];
                PDmax = [90, 90, 80, 80];
                break;
            case 4:
                probabilities = [250, 300, 250, 200];
                PDmin = [70, 50, 30, 30];
                PDmax = [90, 80, 70, 60];
                break;
            case 5:
                probabilities = [200, 300, 300, 200];
                PDmin = [60, 50, 30, 15];
                PDmax = [90, 70, 50, 40];
                break;
            case 6:
                probabilities = [150, 250, 300, 300];
                PDmin = [50, 35, 20, 10];
                PDmax = [80, 60, 50, 30];
                break;
            case 7:
                probabilities = [100, 200, 350, 350];
                PDmin = [30, 25, 20, 10];
                PDmax = [70, 50, 45, 25];
                break;
            case 8:
                probabilities = [50, 150, 400, 400];
                PDmin = [20, 10, 5, 0];
                PDmax = [70, 40, 30, 10];
                break;
            case 9:
                probabilities = [30, 120, 350, 500]; // Maggiore probabilità per durate brevi
                PDmin = [20, 10, 0, 0];
                PDmax = [60, 40, 25, 10];
                break;
            case 10:
                probabilities = [10, 100, 350, 540]; // Quasi solo durate molto brevi
                PDmin = [20, 5, 0, 0];
                PDmax = [55, 35, 20, 10];
                break;
        }
        return { probabilities, PDmin, PDmax };
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
        const furthestSeed = getFurthestSeed();
        if (!furthestSeed) return;
    
        // Aggiorna il conteggio dei boost utilizzati
        currentLevelState.boostsUsed++;
    
        const boostSpeed = settings.boost.speed * boost_speed_multiplier; // Velocità del boost impostabile nelle impostazioni
    
        const targetX = furthestSeed.x;
        const targetY = furthestSeed.y;
    
        const dx = targetX - parrotX;
        const dy = targetY - parrotY;
        const distance = Math.sqrt(dx * dx + dy * dy);
    
        const duration = distance / boostSpeed; // Durata totale dell'animazione in secondi
        const startX = parrotX;
        const startY = parrotY;
        const startTime = performance.now();
    
        // Determina se il pappagallo deve essere flippato
        if (dx < 0 && isFlipped) {
            isFlipped = false;
        } else if (dx > 0 && !isFlipped) {
            isFlipped = true;
        }
    
        function animateBoost() {
            const currentTime = performance.now();
            const elapsedTime = (currentTime - startTime) / 1000; // Tempo trascorso in secondi
    
            // Calcola la frazione di animazione completata
            const progress = Math.min(elapsedTime / duration, 1);
    
            // Aggiorna la posizione del pappagallo in base alla progressione lineare
            parrotX = startX + dx * progress;
            parrotY = startY + dy * progress;
    
            renderParrot();
    
            if (progress < 1) {
                requestAnimationFrame(animateBoost);
            } else {
                // L'animazione è completata, assicurati che il pappagallo sia esattamente sul seme
                parrotX = targetX;
                parrotY = targetY;
                checkSeedCollision(); // Il pappagallo mangia il seme una volta raggiunto
                disableBoostTemporarily();
            }
        }
    
        // Avvia l'animazione
        requestAnimationFrame(animateBoost);
    }
    


    function disableBoostTemporarily() {
        boostEnabled = false;
        boostState = 'cooldown';
        game_buttons.boost.visible = false;
        game_buttons.boost_disabled.visible = true;
    
        boostCooldown = settings.boost.cooldown;
    
        const cooldownInterval = setInterval(() => {
            boostCooldown--;
            renderGameInterface(); // Ridisegna il canvas con il countdown aggiornato
    
            if (boostCooldown <= 0 || currentView != 'game') {
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
    
        renderGameInterface(); // Ridisegna il canvas per mostrare l'icona senza countdown
    }
    
    function enableBoost() {
        boostEnabled = true;
        boostState = 'enabled';
        game_buttons.boost.visible = true;
        game_buttons.boost_disabled.visible = false;
        renderGameInterface();
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
        backgroundMusic.play();

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
            renderGameInterface();
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
                    const isLastLevel = currentLevelState.levelNumber == Math.min(Object.keys(levels).length, base_game_end_level);
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
        if (currentLevelState.levelNumber > base_game_end_level) {
            score = 0;
        }
        if (modified_difficulty > 0) {
            settings.seed.difficulty = modified_difficulty;
        }
        console.log("Difficulty loaded: ", settings.seed.difficulty);
        setLevelDifficulty();
        // Aggiungi gli event listener necessari per il gioco
        addGameEventListeners();
        // Carica lo sfondo e assegna alla variabile globale `background`
        background = new Image();
        background.src = level.background;
        background.onload = () => {
            renderGameBackground(); // Ridisegna il canvas solo dopo che lo sfondo è stato caricato
        };
        parrotImage.onload = () => {
            renderParrot();
        };
        parrotImageFlipped.onload = () => {
            renderParrot();
        };
        // Resize e draw iniziale del canvas
        resizeCanvas();
        // Avvia l'animazione di movimento del pappagallo
        fpsInterval = 1000 / animation_fps;
        then = performance.now();
        updatePosition(); 
        // Avvia il gioco
        playActionStarted();
    }



    function endLevel() {
        // Rimuovi gli event listener
        removeGameEventListeners();
        // Ferma la generazione dei semi, frutti e biscotti
        stopSeedGeneration();
        stopFruitGeneration();
        stopBiscuitGeneration();
        currentView = null;
        currentSeeds = [];
        currentBiscuits = [];
        currentBiscuitsProgrammed = [];
        currentFruits = [];
        currentFruitsProgrammed = [];
        deactivatePowerDown();
        deactivatePowerUp();
        enableBoost();
        updatePosition();
        moveDirection = null;
        if (backgroundMusic) {
            backgroundMusic.pause();
            backgroundMusic.currentTime = 0; // Resetta la traccia all'inizio
        }
        // Salva il punteggio e le statistiche solo per i livelli standard e quando non è stata modificata la difficulty di default
        if (currentLevelState.levelNumber <= base_game_end_level && modified_difficulty == 0) {
            saveScoreToDatabase();
        }
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


    function setFullscreenButtonsbyState() {
        if (!document.fullscreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
            game_buttons.fullscreen.visible = true;
            game_buttons.fullscreen_exit.visible = false;
        } else {
            game_buttons.fullscreen.visible = false;
            game_buttons.fullscreen_exit.visible = true;
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
            view.playingaudio.play();
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
        background_ctx.clearRect(0, 0, background_canvas.width, background_canvas.height);
        elements_ctx.clearRect(0, 0, elements_canvas.width, elements_canvas.height);
        parrot_ctx.clearRect(0, 0, parrot_canvas.width, parrot_canvas.height);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.scale(canvas.width / canvas_nom_width, canvas.height / canvas_nom_height);
        // Disegna il background
        if (background) {
            ctx.drawImage(background, 0, 0, canvas_nom_width, canvas_nom_height);
        }
        // Disegna i pulsanti non virtuali
        setFullscreenButtonsbyStateView();
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
        } else if (viewname === 'scoresView') {
            drawScoresViewSpecificElements();
        }
        // (es. testi dinamici)
        ctx.restore();
    }
    
    
    function handleViewCanvasClick(event) {
        const container = canvas;
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
        // Check versione mobile: orizzontale e fullscreen
        if (!checkOrientationAndActivateFullscreen()) {
            return;
        };
        drawView(currentView);
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
            if (!checkActivateFullscreen()) {
                return;
            };
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
        } else if (viewname === 'scoresView') {
            processScoresViewActions(key);
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
        // Esegui altre eventuali azioni di chiusura
    }


    function processStartViewActions(key) {
        switch (key) {
            case 'changeName':
                // Imposta il massimo numero di caratteri permessi
                const maxNameLength = 20; 
                const view = views[currentView];
                let not_in_fullscreen = !document.fullscreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement;
                // Implementa la logica per cambiare il nome del giocatore
                let playerName = prompt("Insert your name:");
                if (playerName) {
                    // Trunca il nome se supera la lunghezza massima
                    if (playerName.length > maxNameLength) {
                        playerName = playerName.substring(0, maxNameLength);
                        alert(`Name too long. It has been truncated to: ${playerName}`);
                    }
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
            case 'levelField':
                askChangeDifficulty();
                break;
            case 'startGame':
                endView();
                score = 0;
                if (!game.playerName || game.playerName == "") {
                    game.playerName = "Anonymous";
                }
                loadLevel(game.selectedLevel);
                break;
            case 'scores':
                endView();
                loadView('scoresView');
                break;
            case 'fullscreen':
                toggleFullscreenView();
                break;
            case 'fullscreen_exit':
                toggleFullscreenView();
                break;
        }
        if (key != "changeName") {
            if (!checkActivateFullscreen()) {
                return;
            };
        }
    }


    function askChangeDifficulty() {
        let difficulty;
        difficulty = prompt("Enter the difficulty level from 1 to 10. Enter 0 to return to the default difficulty:");
        if (difficulty === null) {
            return;  // Uscita in caso di annullamento
        }
        difficulty = parseInt(difficulty, 10);
        if (isNaN(difficulty) || difficulty < 0 || difficulty > 10) {
            alert("Error: allowed values are 0 to 10. Using default difficulty...");
            difficulty = 0;
        }
        if (difficulty === 0) {
            modified_difficulty = 0;  // Usa la difficoltà di default
        } else {
            modified_difficulty = difficulty;  // Usa la difficoltà inserita dall'utente
        }
        console.log(`Difficulty changed to: ${modified_difficulty}`);
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
            modified_difficulty = 0;
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
            modified_difficulty = 0;
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


    function processScoresViewActions(key) {
        switch (key) {
            case 'toggleScoreModeTop':
                scoresViewScoreMode = 'last';
                views['scoresView'].buttons['toggleScoreModeTop'].visible = false;
                views['scoresView'].buttons['toggleScoreModeLast'].visible = true;
                drawView('scoresView');
                break;
            case 'toggleScoreModeLast':
                scoresViewScoreMode = 'top';
                views['scoresView'].buttons['toggleScoreModeTop'].visible = true;
                views['scoresView'].buttons['toggleScoreModeLast'].visible = false;
                drawView('scoresView');
                break;
            case 'sortByScore':
                scoresViewOrderMode = 'points';
                drawView('scoresView');
                break;
            case 'sortByDate':
                scoresViewOrderMode = 'date';
                drawView('scoresView');
                break;
            case 'backToMenu':
                endView();
                loadView('startView');
                break;
            case 'fullscreen':
                toggleFullscreenView();
                break;
            case 'fullscreen_exit':
                toggleFullscreenView();
                break;
        }
    }


    function drawStartViewSpecificElements() {
        // Disegna il nome del giocatore e il livello selezionato
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 22px Bosk, Georgia, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`${game.playerName || 'Insert Your Name'}`, 324, 247);
        ctx.fillStyle = '#000000';
        ctx.textAlign = 'left';
        if (game.selectedLevel <= base_game_end_level) {
            ctx.font = 'bold 18px Bosk, Georgia, sans-serif';
            ctx.fillText(`LV. ${game.selectedLevel}`, 353, 313);
        } else {
            ctx.font = 'bold 14px Bosk, Georgia, sans-serif';
            ctx.fillText(`EL. ${levels[game.selectedLevel].extraLevelCode}`, 353, 310);
        }
        
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


    function drawScoresViewSpecificElements() {
        ctx.fillStyle = '#000000';
        ctx.textAlign = 'left';
    
        // Verifica se il playerName è definito, altrimenti utilizza "Anonymous"
        let playerName = game.playerName || 'Anonymous';
        let playerDetails = getPlayerScoreDetails(playerName);
        let topScore = playerDetails ? playerDetails.highestScore : '- - -';
        let topScoreDate = playerDetails ? formatTimestamp(playerDetails.highestScoreDate) : '- - -';
        let lastScore = playerDetails ? playerDetails.lastScore : '- - -';
        let lastScoreDate = playerDetails ? formatTimestamp(playerDetails.lastScoreDate) : '- - -';
    
        ctx.font = `bold 14px Bosk, Arial, sans-serif`;
        ctx.fillText(`${playerName}`, 485, 75);
        ctx.fillText(`${topScore}`, 558, 197);
        ctx.fillText(`${topScoreDate}`, 558, 212);
        ctx.fillText(`${lastScore}`, 558, 242);
        ctx.fillText(`${lastScoreDate}`, 558, 259);
    
        // Carica i punteggi in base alla modalità corrente
        const increment = 33;
        const text_x = {
            col1: 61,
            col2: 230,
            col3: 326
        }
        const text_y_start = 78;
        const font_columns = {
            col1: `bold 10px Bosk, Arial, sans-serif`,
            col2: `bold 14px Bosk, Arial, sans-serif`,
            col3: `bold 12px Bosk, Arial, sans-serif`
        }
        if (scoresViewScoreMode === 'top' && scoresViewOrderMode === 'points') {
            const user_scores = getFormattedScores('topscore');
            for (let i = 0; i < 10; i++) {
                const entry = user_scores[i];
                if (entry) {
                    ctx.font = font_columns.col1;
                    ctx.fillText(`${entry.playerName}`, text_x.col1, text_y_start + i * increment);
                    ctx.font = font_columns.col2;
                    ctx.fillText(`${entry.highestScore}`, text_x.col2, text_y_start + i * increment);
                    ctx.font = font_columns.col3;
                    ctx.fillText(`${formatTimestamp(entry.highestScoreDate)}`, text_x.col3, text_y_start + i * increment);
                } 
            }
        } else if (scoresViewScoreMode === 'top' && scoresViewOrderMode === 'date') {
            const user_scores = getFormattedScores('toptimestamp');
            for (let i = 0; i < 10; i++) {
                const entry = user_scores[i];
                if (entry) {
                    ctx.font = font_columns.col1;
                    ctx.fillText(`${entry.playerName}`, text_x.col1, text_y_start + i * increment);
                    ctx.font = font_columns.col2;
                    ctx.fillText(`${entry.highestScore}`, text_x.col2, text_y_start + i * increment);
                    ctx.font = font_columns.col3;
                    ctx.fillText(`${formatTimestamp(entry.highestScoreDate)}`, text_x.col3, text_y_start + i * increment);
                } 
            }
        } else if (scoresViewScoreMode === 'last' && scoresViewOrderMode === 'points') {
            const user_scores = getFormattedScores('lastscore');
            for (let i = 0; i < 10; i++) {
                const entry = user_scores[i];
                if (entry) {
                    ctx.font = font_columns.col1;
                    ctx.fillText(`${entry.playerName}`, text_x.col1, text_y_start + i * increment);
                    ctx.font = font_columns.col2;
                    ctx.fillText(`${entry.lastScore}`, text_x.col2, text_y_start + i * increment);
                    ctx.font = font_columns.col3;
                    ctx.fillText(`${formatTimestamp(entry.lastScoreDate)}`, text_x.col3, text_y_start + i * increment);
                } 
            }
        } else if (scoresViewScoreMode === 'last' && scoresViewOrderMode === 'date') {
            const user_scores = getFormattedScores('lasttimestamp');
            for (let i = 0; i < 10; i++) {
                const entry = user_scores[i];
                if (entry) {
                    ctx.font = font_columns.col1;
                    ctx.fillText(`${entry.playerName}`, text_x.col1, text_y_start + i * increment);
                    ctx.font = font_columns.col2;
                    ctx.fillText(`${entry.lastScore}`, text_x.col2, text_y_start + i * increment);
                    ctx.font = font_columns.col3;
                    ctx.fillText(`${formatTimestamp(entry.lastScoreDate)}`, text_x.col3, text_y_start + i * increment);
                } 
            }
        }
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


    function setFullscreenButtonsbyStateView() {
        const view = views[currentView];
        if (!document.fullscreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
            view.buttons.fullscreen.visible = true;
            view.buttons.fullscreen_exit.visible = false;
        } else {
            view.buttons.fullscreen.visible = false;
            view.buttons.fullscreen_exit.visible = true;
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
            case 'lastscore':
                return savedData.sort((a, b) => b.score - a.score);
            case 'topscore':
                return savedData.sort((a, b) => b.highestScore - a.highestScore);
            case 'toptimestamp':
                return savedData.sort((a, b) => new Date(b.highestScoreDate) - new Date(a.highestScoreDate));
            case 'lasttimestamp':
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


    function checkOrientationAndActivateFullscreen() {
        if (orientationCheckDone) return true; // Se il check è già stato fatto, esce dalla funzione
        orientationCheckDone = true; // Imposta il flag per evitare che la funzione venga eseguita di nuovo
        // Verifica se il dispositivo è mobile
        const isMobile = /Mobi|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        // Se il dispositivo è mobile e l'orientamento è verticale
        if (isMobile) {
            if (window.innerHeight > window.innerWidth) {
                alert("For a better gaming experience, rotate your device to landscape mode and enter fullscreen.");
            }
        }
        return false;
    }


    function checkActivateFullscreen() {
        // if (fullscreenCheckDone) return true; // Se il check è già stato fatto, esce dalla funzione
        // fullscreenCheckDone = true; // Imposta il flag per evitare che la funzione venga eseguita di nuovo
        // Verifica se il dispositivo è mobile
        const isMobile = /Mobi|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        // Se il dispositivo è mobile e l'orientamento è verticale
        if (isMobile) {
            const view = views[currentView];
            enterFullscreen();
            view.buttons.fullscreen.visible = false;
            view.buttons.fullscreen_exit.visible = true;
            drawView(view.name);
        }
        return true;
    }


    function setLevelDifficulty() {
        const loaded_difficulty = settings.seed.difficulty || 5;
        // Definizione dei preset di difficoltà
        const DifficultyPresets = {
            1: { time: 1, distance: 1 },
            2: { time: 2, distance: 2 },
            3: { time: 3, distance: 3 },
            4: { time: 4, distance: 4 },
            5: { time: 5, distance: 5 },
            6: { time: 6, distance: 6 },
            7: { time: 7, distance: 7 },
            8: { time: 8, distance: 8 },
            9: { time: 9, distance: 9 },
            10: { time: 10, distance: 10 }
            // Aggiungi altri preset se necessario
        };
        // Verifica se esiste un preset, altrimenti usa la difficoltà di default per entrambi
        const preset = DifficultyPresets[loaded_difficulty] || { time: loaded_difficulty, distance: loaded_difficulty };
        if (preset.distance > 10 || preset.time > 10) {
            preset = { time: 5, distance: 5 };
        }
        // Imposta le difficoltà solo se sono a 0
        if (settings.seed.difficulty_seed_time === 0) {
            settings.seed.difficulty_seed_time = preset.time;
        }
        if (settings.seed.difficulty_seed_distance === 0) {
            settings.seed.difficulty_seed_distance = preset.distance;
        }
    }
    

    loadView('startView');
    

}



if(typeof console === "undefined"){
    console = {};
}




window.addEventListener('beforeinstallprompt', (e) => {
    console.log("Before Installation Executed");
    e.preventDefault();
    deferredPrompt = e;
    // Mostra l'overlay di installazione
    const installOverlay = document.getElementById('install-overlay');
    installOverlay.style.display = 'flex';
    const installButton = document.getElementById('install-button');
    const onlineButton = document.getElementById('online-button');
    installButton.addEventListener('click', () => {
        installOverlay.style.display = 'none';
        // Mostra il prompt di installazione
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the installation');
            } else {
                console.log('User dismissed the installation');
            }
            deferredPrompt = null;
        });
    });
    // Gestisci la chiusura della card quando si preme "Online" o si clicca fuori dalla card
    onlineButton.addEventListener('click', () => {
        installOverlay.style.display = 'none';
    });
    installOverlay.addEventListener('click', (event) => {
        if (event.target === installOverlay) {
            installOverlay.style.display = 'none';
        }
    });
});




// Avvio del gioco
initGame();


