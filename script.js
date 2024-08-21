const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let parrotX = 100;
let parrotY = 100;
const speed = 5;
let moveDirection = null;
let isFlipped = false;
let scaleFactor = 1;
let canvas_nom_width = 600;
let canvas_nom_height = 400;


// Impostazioni di gioco inglobate direttamente nel codice
const default_settings = {
    seed: {
        maxCount: 5,
        minDuration: 3,
        maxDuration: 30,
        xSeedMin: 50,
        xSeedMax: 550,
        ySeedMin: 50,
        ySeedMax: 270,
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

let background; // Variabile globale per l'immagine di sfondo


function initGame() {

    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    let parrotX = 280;
    let parrotY = 150;
    const speed = 5;
    let moveDirection = null;
    let isFlipped = false;
    let scaleFactor = 1;
    let boostEnabled = true;
    let boostState = 'enabled'; // Valori possibili: 'enabled', 'cooldown', 'disabled'
    let boostCooldown = 0; // Variabile globale per tenere traccia del countdown

    
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
    const buttons = {
        left: { x: 30, y: 320+20, iconSrc: 'arrow-left.svg', visible: true },
        right: { x: 90, y: 320+20, iconSrc: 'arrow-right.svg', visible: true },
        up: { x: 510, y: 280+10, iconSrc: 'arrow-up.svg', visible: true },
        down: { x: 510, y: 320+20, iconSrc: 'arrow-down.svg', visible: true },
        boost: { x: 280, y: 320+20, iconSrc: 'rocket.svg', visible: true },
        boost_disabled: { x: 280, y: 320+20, iconSrc: 'rocket-disabled.svg', visible: false }
    };    

    // Carica le icone SVG
    for (const key in buttons) {
        const button = buttons[key];
        button.image = new Image();
        button.image.src = button.iconSrc;
    }




    // Chiamata a loadLevel per iniziare il gioco
    loadLevel(1);

    // Funzione per iniziare la generazione dei semi
    function startSeedGeneration() {
        seedGenerationInterval = setInterval(spawnSeed, 100); // Genera un seme ogni 100ms
    }

    // Funzione per fermare la generazione dei semi
    function stopSeedGeneration() {
        clearInterval(seedGenerationInterval);
    }




    function resizeCanvas() {
        const container = document.getElementById('game-container');
        const aspectRatio = 3 / 2;

        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;

        if (containerWidth / containerHeight > aspectRatio) {
            canvas.height = containerHeight;
            canvas.width = containerHeight * aspectRatio;
        } else {
            canvas.width = containerWidth;
            canvas.height = containerWidth / aspectRatio;
        }

        scaleFactor = canvas.width / 600;

        drawCanvas();
    }

    function drawCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    
        ctx.save();
        ctx.scale(scaleFactor, scaleFactor); // Applica la scala a tutto il contenuto

        // Disegna lo sfondo (se lo sfondo è un'immagine)
        if (background) {
            ctx.drawImage(background, 0, 0, canvas_nom_width, canvas_nom_height);
        }
    
        // Disegna il pappagallo
        ctx.save(); // Salva lo stato del contesto prima del flip
        if (isFlipped) {
            ctx.scale(-1, 1);
            ctx.drawImage(parrotImage, -parrotX - 50, parrotY, 50, 50);
        } else {
            ctx.drawImage(parrotImage, parrotX, parrotY, 50, 50);
        }
        ctx.restore(); // Ripristina lo stato precedente per evitare di flip altre parti del canvas
    
        // Disegna la top bar
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas_nom_width, 30);

        // Renderizza il numero del livello
        renderLevel();

        // Renderizza lo score
        renderScore();

        // Gestisci la visualizzazione dello stato del boost
        renderBoostStatus();  // Chiama sempre questa funzione, che gestirà la condizione correttamente

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
        
        ctx.restore(); // Ripristina la scala originale

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
            ctx.drawImage(rocketIcon, canvas_nom_height - 60, iconYPosition, 20, 20);
        }
        // Non disegnare nulla se boostState è 'enabled'
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
        // Aggiungi qui la logica del Power Up
    }
    
    function activatePowerDown(biscuitType) {
        console.log(`Power Down activated by eating ${biscuitType}`);
        // Aggiungi qui la logica del Power Down
    }


    function calculateSeedPoints(seedType) {
        let basePoints = settings.seed.points[seedType];
        const gameState = settings.game.state;
    
        if (gameState === 'power_up') {
            return basePoints * 2;
        } else if (gameState === 'power_down') {
            return Math.floor(basePoints / 2);
        } else {
            return basePoints;
        }
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
            if (parrotX < 0) parrotX = 0;
            if (parrotX + 50 > 600) parrotX = 600 - 50;
            if (parrotY < 0) parrotY = 0;
            if (parrotY + 50 > 400) parrotY = 400 - 50;

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
        const rect = canvas.getBoundingClientRect();
        const x = (event.clientX - rect.left) / scaleFactor;
        const y = (event.clientY - rect.top) / scaleFactor;
    
        // Verifica se il click è su uno dei pulsanti di movimento o boost
        for (const key in buttons) {
            const button = buttons[key];
            if (x > button.x && x < button.x + (button.width || buttonSize) &&
                y > button.y && y < button.y + (button.height || buttonSize)) {
                if (key === 'boost') {
                    if (boostEnabled) boostToFurthestSeed(); // Esegui boost
                } else {
                    startMovement(key); // Muovi il pappagallo
                }
                return;
            }
        }
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

    window.addEventListener('resize', resizeCanvas);


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
        
        currentLevelState.levelNumber = levelNumber;
        currentLevelState.levelPoints = 0;
        currentLevelState.seedsCollected = 0;
        currentLevelState.actionStarted = false; // Azzera il flag quando si carica un nuovo livello
    
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
    

    loadLevel(1); // Carica il livello 1 all'inizio del gioco
    

}








// Avvio del gioco
initGame();

