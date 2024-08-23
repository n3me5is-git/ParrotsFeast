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
        duration: 300
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
    // Aggiungi altri livelli qui
};


let currentLevelState = {
    levelNumber: 1,
    levelPoints: 0,
    seedsCollected: 0,
    actionStarted: false, // Flag per tracciare se l'azione è iniziata
    // Aggiungeremo altri contatori in futuro
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
    
    let powerDownActive = false;
    let powerDownEndTime = 0;

    
    let score = 0;
    let currentSeeds = []; // Array per tenere traccia dei semi attivi

    const parrotImage = new Image();
    parrotImage.src = 'parrot.png';

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
    const buttons = {
        left: { x: 60, y: buttons_y, iconSrc: 'arrow-left.svg', width: 60, height: 60, visible: true },
        right: { x: 160, y: buttons_y, iconSrc: 'arrow-right.svg', width: 60, height: 60, visible: true },
        up: { x: canvas_nom_width-90, y: buttons_y-90, iconSrc: 'arrow-up.svg', width: 60, height: 60, visible: true },
        down: { x: canvas_nom_width-90, y: buttons_y, iconSrc: 'arrow-down.svg', width: 60, height: 60, visible: true },
        boost: { x: canvas_nom_width/2-20, y: buttons_y, iconSrc: 'rocket.svg', width: 60, height: 60, visible: true },
        boost_disabled: { x: canvas_nom_width/2-20, y: buttons_y, iconSrc: 'rocket-disabled.svg', width: 60, height: 60, visible: false },
        fullscreen: { x: canvas_nom_width - 50, y: 35, iconSrc: 'expand.svg', visible: true }, // Aggiunto pulsante fullscreen
        fullscreen_exit: { x: canvas_nom_width - 50, y: 35, iconSrc: 'compress.svg', visible: false } // Pulsante per uscire dal fullscreen
    };    

    // Carica le icone SVG
    for (const key in buttons) {
        const button = buttons[key];
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
        drawCanvas();
    }

    function drawCanvas() {
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
        // Gestisci la visualizzazione dello stato del boost
        renderBoostStatus();  // Chiama sempre questa funzione, che gestirà la condizione correttamente
        // Visualizzazioni power up e power down
        renderPowerUpStatus();  // Chiama la funzione per visualizzare il Power Up
        renderPowerDownStatus();  // Chiama la funzione per visualizzare il Power Down
        // Disegna i pulsanti visibili
        for (const key in buttons) {
            const button = buttons[key];
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
        ctx.font = `16px Arial`;
        ctx.textAlign = 'left';
        const levelText = `LV. ${currentLevelState.levelNumber}${currentLevelState.levelNumber < 10 ? ' ' : ''}`;
        ctx.fillText(levelText, 10, 20);
    }


    function renderScore() {
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `16px Arial`; // Il font viene scalato automaticamente con il contesto
        ctx.textAlign = 'left';
        ctx.fillText(`Tot. Score: ${score}`, 60, 20); // Le coordinate sono relative al contesto scalato
    }

    function renderBoostStatus() {
        ctx.textAlign = 'right';
        ctx.fillStyle = '#FFFFFF'; // Assicura che il testo sia bianco
        ctx.font = `16px Arial`; // Assicura che il testo sia della dimensione corretta
    
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
        ctx.font = `16px Arial`; // Dimensione del testo
    
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
        ctx.font = `16px Arial`; // Dimensione del testo
    
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
        requestAnimationFrame(updatePosition);
    }

    function startMovement(direction) {
        playActionStarted(); // Chiama la funzione quando l'utente inizia a toccare lo schermo
        moveDirection = direction;
    }

    function stopMovement() {
        moveDirection = null;
    }

    function handleCanvasClick(event) {
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
        for (const key in buttons) {
            const button = buttons[key];
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
        stopMovement();
    }

    function handleCanvasRelease() {
        stopMovement();
    }

    
    function spawnSeed() {
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
        if (currentFruits.length === 0 && currentFruitsProgrammed.length === 0) {
            const interval = getRandomInt(settings.fruit.spawnIntervalMin, settings.fruit.spawnIntervalMax) * 1000;
            const spawnTime = Date.now() + interval;
    
            currentFruitsProgrammed.push(spawnTime);
    
            setTimeout(() => spawnFruit(), interval); // Programma la comparsa del frutto
        }
    }

    function spawnFruit() {
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
        if (currentBiscuits.length === 0 && currentBiscuitsProgrammed.length === 0) {
            const interval = getRandomInt(settings.biscuit.spawnIntervalMin, settings.biscuit.spawnIntervalMax) * 1000;
            const spawnTime = Date.now() + interval;
    
            currentBiscuitsProgrammed.push(spawnTime);
    
            setTimeout(() => spawnBiscuit(), interval); // Programma la comparsa del biscotto
        }
    }
    
    function spawnBiscuit() {
        if (currentBiscuits.length >= 1) return;
    
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
        playActionStarted(); // Chiama la funzione quando l'utente inizia a toccare lo schermo
        const furthestSeed = getFurthestSeed();
        if (!furthestSeed) return;
    
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
        buttons.boost.visible = false;
        buttons.boost_disabled.visible = true;
    
        boostCooldown = settings.boost.cooldown;
    
        const cooldownInterval = setInterval(() => {
            boostCooldown--;
            drawCanvas(); // Ridisegna il canvas con il countdown aggiornato
    
            if (boostCooldown <= 0) {
                clearInterval(cooldownInterval);
                enableBoost(); // Riabilita il boost
            }
        }, 1000);
    }


    function disableBoost(cause) {
        boostEnabled = false;
        boostState = 'disabled';
        buttons.boost.visible = false;
        buttons.boost_disabled.visible = true;
        
        if (cause === 'power_down') {
            // Logica aggiuntiva per gestire il power_down se necessario
        }
    
        drawCanvas(); // Ridisegna il canvas per mostrare l'icona senza countdown
    }
    
    function enableBoost() {
        boostEnabled = true;
        boostState = 'enabled';
        buttons.boost.visible = true;
        buttons.boost_disabled.visible = false;
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
    
        // Avvia la musica di sottofondo del livello corrente
        const backgroundMusic = new Audio(levels[currentLevelState.levelNumber].music);
        backgroundMusic.loop = true;
        backgroundMusic.volume = settings.game.musicVolume || 0.5;
        backgroundMusic.play().catch(error => console.log(`Errore nel riprodurre la musica: ${error}`));
    
        // Avvia la generazione dei semi, frutti e biscotti
        startSeedGeneration();
        startFruitGeneration()
        startBiscuitGeneration()
    }


    function loadLevel(levelNumber) {
        const level = levels[levelNumber];
        
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
        currentLevelState.actionStarted = false; // Azzera il flag quando si carica un nuovo livello

        speed = settings.game.speed;
    
        // Aggiungi gli event listener necessari per il gioco
        addGameEventListeners();

        resizeCanvas();
    }



    function endLevel() {
        // Rimuovi gli event listener
        removeGameEventListeners();
    
        // Ferma la generazione dei semi, frutti e biscotti
        stopSeedGeneration();
        stopFruitGeneration()
        stopBiscuitGeneration()
    
        // Altre operazioni di fine livello se necessarie
       
    }



    // Funzione per gestire il click del pulsante fullscreen
    function toggleFullscreen() {
        if (!document.fullscreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
            enterFullscreen();
            buttons.fullscreen.visible = false;
            buttons.fullscreen_exit.visible = true;
            drawCanvas();
        } else {
            exitFullscreen();
            buttons.fullscreen.visible = true;
            buttons.fullscreen_exit.visible = false;
            drawCanvas();
        }
    }
    

    loadLevel(1); // Carica il livello 1 all'inizio del gioco
    

}


// Funzione per il rilevamento del dispositivo mobile e attivazione del fullscreen
function detectMobileAndFullscreen() {
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        enterFullscreen();
    }
}


// Avvio del gioco
initGame();


